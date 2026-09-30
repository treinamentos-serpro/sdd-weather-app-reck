import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeatherApp } from '../../../src/hooks/useWeatherApp';
import { fetchForecast, searchCities } from '../../../src/services/openMeteoService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/openMeteoService', () => ({
  fetchForecast: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.5,
  longitude: -46.6,
};

const weatherData: WeatherData = {
  city,
  timezone: 'America/Sao_Paulo',
  fetchedAt: '2026-09-30T12:00:00.000Z',
  current: {
    observedAt: '2026-09-30T09:00',
    temperatureC: 18,
    apparentTemperatureC: 18,
    weatherCode: 3,
    relativeHumidity: 70,
    windSpeedKmh: 5,
  },
  forecast: [
    {
      localDate: '2026-09-30',
      weatherCode: 3,
      temperatureMinC: 15,
      temperatureMaxC: 23,
      precipitationProbabilityMax: 10,
    },
    {
      localDate: '2026-10-01',
      weatherCode: 3,
      temperatureMinC: 15,
      temperatureMaxC: 23,
      precipitationProbabilityMax: 10,
    },
    {
      localDate: '2026-10-02',
      weatherCode: 3,
      temperatureMinC: 15,
      temperatureMaxC: 23,
      precipitationProbabilityMax: 10,
    },
    {
      localDate: '2026-10-03',
      weatherCode: 3,
      temperatureMinC: 15,
      temperatureMaxC: 23,
      precipitationProbabilityMax: 10,
    },
    {
      localDate: '2026-10-04',
      weatherCode: 3,
      temperatureMinC: 15,
      temperatureMaxC: 23,
      precipitationProbabilityMax: 10,
    },
  ],
  isPartial: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeatherApp', () => {
  it('inicia em idle e rejeita consulta vazia sem chamar geocoding', async () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.search).toEqual({ status: 'idle' });
    expect(result.current.weather).toEqual({ status: 'idle' });
    expect(result.current.unit).toBe('celsius');

    act(() => result.current.setQuery('   '));
    await act(async () => result.current.submitSearch());

    expect(result.current.queryError).toBe('empty');
    expect(result.current.search).toEqual({ status: 'idle' });
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('mapeia lista vazia e seleção de cidade para estados esperados', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]).mockResolvedValueOnce([city]);
    vi.mocked(fetchForecast).mockResolvedValueOnce({ ...weatherData, isPartial: true });
    const { result } = renderHook(() => useWeatherApp());

    act(() => result.current.setQuery('Cidade inexistente'));
    await act(async () => result.current.submitSearch());
    expect(result.current.search).toEqual({ status: 'empty' });

    act(() => result.current.setQuery('São Paulo'));
    await act(async () => result.current.submitSearch());
    expect(result.current.search).toEqual({ status: 'success', data: [city] });

    await act(async () => result.current.selectCity(city));
    expect(result.current.selectedCity).toEqual(city);
    expect(result.current.weather).toEqual({
      status: 'success',
      data: { ...weatherData, isPartial: true },
    });
  });

  it('preserva o clima durante busca nova e descarta resposta obsoleta', async () => {
    let resolveFirstSearch: (cities: City[]) => void = () => undefined;
    vi.mocked(searchCities)
      .mockResolvedValueOnce([city])
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstSearch = resolve;
          }),
      )
      .mockResolvedValueOnce([]);
    vi.mocked(fetchForecast).mockResolvedValueOnce(weatherData);
    const { result } = renderHook(() => useWeatherApp());

    act(() => result.current.setQuery('São Paulo'));
    await act(async () => result.current.submitSearch());
    await act(async () => result.current.selectCity(city));

    act(() => result.current.setQuery('Consulta antiga'));
    expect(result.current.weather).toEqual({ status: 'success', data: weatherData });

    let firstRequest: Promise<void> = Promise.resolve();
    act(() => {
      firstRequest = result.current.submitSearch();
    });
    act(() => result.current.setQuery('Consulta recente'));
    await act(async () => result.current.submitSearch());
    resolveFirstSearch([city]);
    await act(async () => firstRequest);

    expect(result.current.search).toEqual({ status: 'empty' });
    expect(result.current.weather).toEqual({ status: 'success', data: weatherData });
  });
});
