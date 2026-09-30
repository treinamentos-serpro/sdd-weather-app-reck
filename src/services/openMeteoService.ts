import { parseForecastResponse } from '../lib/parseForecastResponse';
import { parseGeocodingResponse } from '../lib/parseGeocodingResponse';
import type { City, RequestError, RequestErrorKind, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8_000;

function createRequestError(kind: RequestErrorKind, statusCode?: number): RequestError {
  return statusCode === undefined ? { kind } : { kind, statusCode };
}

function isRequestError(value: unknown): value is RequestError {
  if (typeof value !== 'object' || value === null || !('kind' in value)) {
    return false;
  }

  return ['network', 'http', 'timeout', 'invalid-response'].includes(String(value.kind));
}

async function fetchJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  let timeoutExpired = false;
  const onCallerAbort = (): void => controller.abort(signal?.reason);

  if (signal?.aborted) {
    onCallerAbort();
  } else {
    signal?.addEventListener('abort', onCallerAbort, { once: true });
  }

  const timeoutId = setTimeout(() => {
    timeoutExpired = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw createRequestError('http', response.status);
    }

    try {
      return await response.json();
    } catch {
      throw createRequestError('invalid-response');
    }
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    if (timeoutExpired) {
      throw createRequestError('timeout');
    }

    if (isRequestError(error)) {
      throw error;
    }

    throw createRequestError('network');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: query,
    count: '10',
    language: 'pt',
    format: 'json',
  }).toString();

  const response = await fetchJson(url, signal);

  try {
    return parseGeocodingResponse(response);
  } catch {
    throw createRequestError('invalid-response');
  }
}

export async function fetchForecast(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  }).toString();

  const response = await fetchJson(url, signal);

  try {
    return parseForecastResponse(response, city, new Date().toISOString());
  } catch {
    throw createRequestError('invalid-response');
  }
}
