import { describe, expect, it } from 'vitest';
import { parseForecastResponse } from '../../../src/lib/parseForecastResponse';
import type { City } from '../../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.5475,
  longitude: -46.6361,
};

const fetchedAt = '2026-09-30T12:00:00.000Z';

function createResponse(
  dailyDates: string[] = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
): Record<string, unknown> {
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
      temperature_2m: 18.5,
      apparent_temperature: 18.1,
      weather_code: 3,
      relative_humidity_2m: 72,
      wind_speed_10m: 8.4,
    },
    daily_units: {
      temperature_2m_min: '°C',
      temperature_2m_max: '°C',
      precipitation_probability_max: '%',
    },
    daily: {
      time: dailyDates,
      weather_code: dailyDates.map(() => 3),
      temperature_2m_min: dailyDates.map((_, index) => 15 + index),
      temperature_2m_max: dailyDates.map((_, index) => 23 + index),
      precipitation_probability_max: dailyDates.map(() => 10),
    },
  };
}

describe('parseForecastResponse', () => {
  it('normaliza condições atuais e cinco dias locais', () => {
    const result = parseForecastResponse(createResponse(), city, fetchedAt);

    expect(result.city).toEqual(city);
    expect(result.timezone).toBe('America/Sao_Paulo');
    expect(result.fetchedAt).toBe(fetchedAt);
    expect(result.current).toEqual({
      observedAt: '2026-09-30T09:00',
      temperatureC: 18.5,
      apparentTemperatureC: 18.1,
      weatherCode: 3,
      relativeHumidity: 72,
      windSpeedKmh: 8.4,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast.map((day) => day.localDate)).toEqual([
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(result.forecast[2]).toMatchObject({
      weatherCode: 3,
      temperatureMinC: 17,
      temperatureMaxC: 25,
      precipitationProbabilityMax: 10,
    });
    expect(result.isPartial).toBe(false);
  });

  it('preenche a data ausente sem deslocar os dados dos outros dias', () => {
    const response = createResponse(['2026-09-30', '2026-10-01', '2026-10-03', '2026-10-04']);
    const result = parseForecastResponse(response, city, fetchedAt);

    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[2]).toEqual({
      localDate: '2026-10-02',
      weatherCode: null,
      temperatureMinC: null,
      temperatureMaxC: null,
      precipitationProbabilityMax: null,
    });
    expect(result.forecast[3].temperatureMinC).toBe(17);
    expect(result.forecast[4].temperatureMinC).toBe(18);
    expect(result.isPartial).toBe(true);
  });

  it('normaliza campos individuais inválidos para null e marca o resultado parcial', () => {
    const response = createResponse();
    const current = response.current as Record<string, unknown>;
    const daily = response.daily as Record<string, unknown>;
    current.temperature_2m = Number.NaN;
    current.relative_humidity_2m = 101;
    current.wind_speed_10m = -1;
    daily.precipitation_probability_max = [101, 10, 10, 10, 10];

    const result = parseForecastResponse(response, city, fetchedAt);

    expect(result.current.temperatureC).toBeNull();
    expect(result.current.relativeHumidity).toBeNull();
    expect(result.current.windSpeedKmh).toBeNull();
    expect(result.forecast[0].precipitationProbabilityMax).toBeNull();
    expect(result.isPartial).toBe(true);
  });

  it.each([
    ['sem objeto current', { ...createResponse(), current: undefined }],
    ['sem timezone', { ...createResponse(), timezone: '' }],
    ['timezone inválido', { ...createResponse(), timezone: 'Invalid/Zone' }],
    [
      'array diário desalinhado',
      {
        ...createResponse(),
        daily: {
          ...(createResponse().daily as Record<string, unknown>),
          temperature_2m_min: [15],
        },
      },
    ],
    [
      'unidade inesperada',
      {
        ...createResponse(),
        current_units: {
          temperature_2m: '°F',
          apparent_temperature: '°C',
          relative_humidity_2m: '%',
          wind_speed_10m: 'km/h',
        },
      },
    ],
  ])('rejeita envelope estrutural inválido: %s', (_caseName, response) => {
    expect(() => parseForecastResponse(response, city, fetchedAt)).toThrow(TypeError);
  });
});
