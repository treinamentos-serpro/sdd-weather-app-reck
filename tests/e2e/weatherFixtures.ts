export const saoPaulo = {
  id: 3448439,
  name: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.6361,
  country_code: 'BR',
  admin1: 'São Paulo',
  country: 'Brasil',
};

export const porto = {
  id: 2735943,
  name: 'Porto',
  latitude: 41.1496,
  longitude: -8.6109,
  country_code: 'PT',
  admin1: 'Porto',
  country: 'Portugal',
};

export function geocodingPayload(results: object[] = [saoPaulo]) {
  return { results };
}

export function forecastPayload(options: { temperature?: number; partial?: boolean } = {}) {
  const temperature = options.temperature ?? 18;
  const dates = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];

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
      temperature_2m: temperature,
      apparent_temperature: temperature - 1,
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
      time: dates,
      weather_code: dates.map(() => 3),
      temperature_2m_min: dates.map((_, index) => (options.partial && index === 0 ? null : 15)),
      temperature_2m_max: dates.map(() => 23),
      precipitation_probability_max: dates.map(() => 10),
    },
  };
}
