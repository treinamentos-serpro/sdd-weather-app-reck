import { useEffect, useReducer, useRef } from 'react';
import { type CityQueryError, normalizeCityQuery } from '../lib/normalizeCityQuery';
import { fetchForecast, searchCities } from '../services/openMeteoService';
import type {
  AsyncState,
  City,
  RequestError,
  RequestErrorKind,
  Unit,
  WeatherData,
} from '../types/weather';

export interface WeatherAppState {
  query: string;
  queryError: CityQueryError | null;
  search: AsyncState<City[]>;
  selectedCity: City | null;
  weather: AsyncState<WeatherData>;
  unit: Unit;
}

interface WeatherAppActions {
  setQuery: (query: string) => void;
  submitSearch: () => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retrySearch: () => Promise<void>;
  retryForecast: () => Promise<void>;
  setUnit: (unit: Unit) => void;
}

type WeatherAppAction =
  | { type: 'queryChanged'; query: string }
  | { type: 'queryInvalid'; reason: CityQueryError }
  | { type: 'searchStarted' }
  | { type: 'searchSucceeded'; cities: City[] }
  | { type: 'searchFailed'; error: RequestError }
  | { type: 'weatherStarted'; city: City }
  | { type: 'weatherSucceeded'; data: WeatherData }
  | { type: 'weatherFailed'; error: RequestError }
  | { type: 'unitChanged'; unit: Unit };

const initialState: WeatherAppState = {
  query: '',
  queryError: null,
  search: { status: 'idle' },
  selectedCity: null,
  weather: { status: 'idle' },
  unit: 'celsius',
};

function weatherAppReducer(state: WeatherAppState, action: WeatherAppAction): WeatherAppState {
  switch (action.type) {
    case 'queryChanged':
      return { ...state, query: action.query, queryError: null };
    case 'queryInvalid':
      return { ...state, queryError: action.reason, search: { status: 'idle' } };
    case 'searchStarted':
      return { ...state, queryError: null, search: { status: 'loading' } };
    case 'searchSucceeded':
      return {
        ...state,
        search:
          action.cities.length === 0
            ? { status: 'empty' }
            : { status: 'success', data: action.cities },
      };
    case 'searchFailed':
      return { ...state, search: { status: 'error', error: action.error } };
    case 'weatherStarted':
      return {
        ...state,
        queryError: null,
        selectedCity: action.city,
        weather: { status: 'loading' },
      };
    case 'weatherSucceeded':
      return { ...state, weather: { status: 'success', data: action.data } };
    case 'weatherFailed':
      return { ...state, weather: { status: 'error', error: action.error } };
    case 'unitChanged':
      return { ...state, unit: action.unit };
  }
}

function toRequestError(error: unknown): RequestError {
  if (typeof error !== 'object' || error === null || !('kind' in error)) {
    return { kind: 'network' };
  }

  const kind = error.kind;
  const knownKinds: RequestErrorKind[] = ['network', 'http', 'timeout', 'invalid-response'];

  if (typeof kind !== 'string' || !knownKinds.includes(kind as RequestErrorKind)) {
    return { kind: 'network' };
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return { kind: kind as RequestErrorKind, statusCode: error.statusCode };
  }

  return { kind: kind as RequestErrorKind };
}

export function useWeatherApp(): WeatherAppState & WeatherAppActions {
  const [state, dispatch] = useReducer(weatherAppReducer, initialState);
  const searchController = useRef<AbortController | null>(null);
  const weatherController = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      searchController.current?.abort();
      weatherController.current?.abort();
    },
    [],
  );

  async function submitSearch(): Promise<void> {
    searchController.current?.abort();
    searchController.current = null;

    const normalizedQuery = normalizeCityQuery(state.query);

    if (normalizedQuery.status === 'invalid') {
      dispatch({ type: 'queryInvalid', reason: normalizedQuery.reason });
      return;
    }

    const controller = new AbortController();
    searchController.current = controller;
    dispatch({ type: 'searchStarted' });

    try {
      const cities = await searchCities(normalizedQuery.value, controller.signal);

      if (!controller.signal.aborted) {
        dispatch({ type: 'searchSucceeded', cities });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        dispatch({ type: 'searchFailed', error: toRequestError(error) });
      }
    } finally {
      if (searchController.current === controller) {
        searchController.current = null;
      }
    }
  }

  async function selectCity(city: City): Promise<void> {
    weatherController.current?.abort();

    const controller = new AbortController();
    weatherController.current = controller;
    dispatch({ type: 'weatherStarted', city });

    try {
      const data = await fetchForecast(city, controller.signal);

      if (!controller.signal.aborted) {
        dispatch({ type: 'weatherSucceeded', data });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        dispatch({ type: 'weatherFailed', error: toRequestError(error) });
      }
    } finally {
      if (weatherController.current === controller) {
        weatherController.current = null;
      }
    }
  }

  async function retryForecast(): Promise<void> {
    if (state.selectedCity !== null) {
      await selectCity(state.selectedCity);
    }
  }

  return {
    ...state,
    setQuery: (query) => dispatch({ type: 'queryChanged', query }),
    submitSearch,
    selectCity,
    retrySearch: submitSearch,
    retryForecast,
    setUnit: (unit) => dispatch({ type: 'unitChanged', unit }),
  };
}
