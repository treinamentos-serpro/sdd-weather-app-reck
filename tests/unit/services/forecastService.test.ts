import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchForecast } from '../../../src/services/openMeteoService';
import type { City } from '../../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.5,
  longitude: -46.6,
};

const forecastDates = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];

function forecastResponse(): Record<string, unknown> {
  return {
    timezone: 'America/Sao_Paulo',
    current_units: {
      temperature_2m: '°C',
      apparent_temperature: '°C',
      relative_humidity_2m: '%',
      wind_speed_10m: 'km/h',
    },
    current: {
      time: '2026-09-30T09:00',
      temperature_2m: 18,
      apparent_temperature: 18,
      weather_code: 3,
      relative_humidity_2m: 70,
      wind_speed_10m: 5,
    },
    daily_units: {
      temperature_2m_min: '°C',
      temperature_2m_max: '°C',
      precipitation_probability_max: '%',
    },
    daily: {
      time: forecastDates,
      weather_code: forecastDates.map(() => 3),
      temperature_2m_min: forecastDates.map(() => 15),
      temperature_2m_max: forecastDates.map(() => 23),
      precipitation_probability_max: forecastDates.map(() => 10),
    },
  };
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('fetchForecast', () => {
  it('envia parâmetros e retorna WeatherData normalizado', async () => {
    let requestedUrl = '';
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return jsonResponse(forecastResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchForecast(city);
    const requestUrl = new URL(requestedUrl);

    expect(requestUrl.origin + requestUrl.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      latitude: '-23.5',
      longitude: '-46.6',
      current:
        'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m',
      daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '5',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
    });
    expect(result.city).toEqual(city);
    expect(result.forecast).toHaveLength(5);
    expect(Number.isNaN(Date.parse(result.fetchedAt))).toBe(false);
    expect(result.isPartial).toBe(false);
  });

  it('preserva resposta parcial normalizada pelo parser', async () => {
    const response = forecastResponse();
    const current = response.current as Record<string, unknown>;
    current.temperature_2m = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(response)),
    );

    const result = await fetchForecast(city);

    expect(result.current.temperatureC).toBeNull();
    expect(result.isPartial).toBe(true);
  });

  it('classifica status HTTP não bem-sucedido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, 503)),
    );

    await expect(fetchForecast(city)).rejects.toMatchObject({ kind: 'http', statusCode: 503 });
  });

  it('classifica falha de rede', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    );

    await expect(fetchForecast(city)).rejects.toMatchObject({ kind: 'network' });
  });

  it('classifica JSON ou envelope inválido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    );
    await expect(fetchForecast(city)).rejects.toMatchObject({ kind: 'invalid-response' });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ current: {} })),
    );
    await expect(fetchForecast(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('encaminha o signal de cancelamento ao fetch', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return jsonResponse(forecastResponse());
      }),
    );
    const controller = new AbortController();

    await fetchForecast(city, controller.signal);

    expect(requestSignal).toBeInstanceOf(AbortSignal);
  });

  it('retorna erro timeout após oito segundos', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      ),
    );

    const request = fetchForecast(city);
    const assertion = expect(request).rejects.toMatchObject({ kind: 'timeout' });
    await vi.advanceTimersByTimeAsync(8_000);
    await assertion;
  });
});
