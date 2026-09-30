import type { City, ForecastDay, WeatherData } from '../types/weather';

type JsonObject = Record<string, unknown>;
type NumericValidator = (value: number) => boolean;

function asObject(value: unknown, fieldName: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`Resposta de forecast inválida: ${fieldName} deve ser um objeto.`);
  }

  return value as JsonObject;
}

function requiredString(record: JsonObject, fieldName: string): string {
  const value = record[fieldName];

  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`Resposta de forecast inválida: ${fieldName} deve ser texto não vazio.`);
  }

  return value;
}

function requireUnits(record: JsonObject, fieldName: string, expected: JsonObject): void {
  const units = asObject(record[fieldName], fieldName);

  for (const [fieldName, expectedUnit] of Object.entries(expected)) {
    if (units[fieldName] !== expectedUnit) {
      throw new TypeError(`Resposta de forecast inválida: unidade incompatível para ${fieldName}.`);
    }
  }
}

function readNumber(value: unknown, validate: NumericValidator = () => true): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || !validate(value)) {
    return null;
  }

  return value;
}

function parseLocalDate(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`Resposta de forecast inválida: ${fieldName} deve usar YYYY-MM-DD.`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new TypeError(`Resposta de forecast inválida: ${fieldName} não é uma data válida.`);
  }

  return value;
}

function localDateFromTimestamp(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.exec(
    value,
  );

  if (match === null) {
    throw new TypeError(
      'Resposta de forecast inválida: current.time deve ser uma data local válida.',
    );
  }

  return parseLocalDate(match[1], 'current.time');
}

function addLocalDays(startDate: string): [string, string, string, string, string] {
  const [year, month, day] = startDate.split('-').map(Number);

  return [0, 1, 2, 3, 4].map((offset) => {
    const date = new Date(Date.UTC(year, month - 1, day + offset));
    return date.toISOString().slice(0, 10);
  }) as [string, string, string, string, string];
}

function parseForecastDay(
  localDate: string,
  dailyIndex: number | undefined,
  dailyArrays: JsonObject,
): ForecastDay {
  if (dailyIndex === undefined) {
    return {
      localDate,
      weatherCode: null,
      temperatureMinC: null,
      temperatureMaxC: null,
      precipitationProbabilityMax: null,
    };
  }

  return {
    localDate,
    weatherCode: readNumber((dailyArrays.weather_code as unknown[])[dailyIndex], Number.isInteger),
    temperatureMinC: readNumber((dailyArrays.temperature_2m_min as unknown[])[dailyIndex]),
    temperatureMaxC: readNumber((dailyArrays.temperature_2m_max as unknown[])[dailyIndex]),
    precipitationProbabilityMax: readNumber(
      (dailyArrays.precipitation_probability_max as unknown[])[dailyIndex],
      (value) => value >= 0 && value <= 100,
    ),
  };
}

function isPartialCurrent(current: ForecastCurrent): boolean {
  return (
    current.temperatureC === null ||
    current.apparentTemperatureC === null ||
    current.weatherCode === null ||
    current.relativeHumidity === null ||
    current.windSpeedKmh === null
  );
}

interface ForecastCurrent {
  observedAt: string;
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  weatherCode: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
}

function parseCurrent(record: JsonObject): ForecastCurrent {
  const observedAt = requiredString(record, 'time');

  localDateFromTimestamp(observedAt);

  return {
    observedAt,
    temperatureC: readNumber(record.temperature_2m),
    apparentTemperatureC: readNumber(record.apparent_temperature),
    weatherCode: readNumber(record.weather_code, Number.isInteger),
    relativeHumidity: readNumber(
      record.relative_humidity_2m,
      (value) => value >= 0 && value <= 100,
    ),
    windSpeedKmh: readNumber(record.wind_speed_10m, (value) => value >= 0),
  };
}

export function parseForecastResponse(
  response: unknown,
  city: City,
  fetchedAt: string,
): WeatherData {
  const root = asObject(response, 'raiz');
  const timezone = requiredString(root, 'timezone');

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
  } catch {
    throw new TypeError('Resposta de forecast inválida: timezone não é um fuso IANA válido.');
  }

  if (Number.isNaN(Date.parse(fetchedAt))) {
    throw new TypeError('fetchedAt deve ser uma data ISO 8601 válida.');
  }

  const currentRecord = asObject(root.current, 'current');
  const currentUnits = {
    temperature_2m: '°C',
    apparent_temperature: '°C',
    relative_humidity_2m: '%',
    wind_speed_10m: 'km/h',
  };
  requireUnits(root, 'current_units', currentUnits);

  const dailyRecord = asObject(root.daily, 'daily');
  const dailyTimes = dailyRecord.time;

  if (!Array.isArray(dailyTimes) || dailyTimes.length > 5) {
    throw new TypeError(
      'Resposta de forecast inválida: daily.time deve conter no máximo cinco datas.',
    );
  }

  const dailyArrays: JsonObject = {};
  const dailyFields = [
    'weather_code',
    'temperature_2m_min',
    'temperature_2m_max',
    'precipitation_probability_max',
  ];

  for (const fieldName of dailyFields) {
    const fieldValue = dailyRecord[fieldName];

    if (!Array.isArray(fieldValue) || fieldValue.length !== dailyTimes.length) {
      throw new TypeError(
        `Resposta de forecast inválida: ${fieldName} deve alinhar com daily.time.`,
      );
    }

    dailyArrays[fieldName] = fieldValue;
  }

  requireUnits(root, 'daily_units', {
    temperature_2m_min: '°C',
    temperature_2m_max: '°C',
    precipitation_probability_max: '%',
  });

  const observedDates = dailyTimes.map((date, index) =>
    parseLocalDate(date, `daily.time[${index}]`),
  );
  const dateIndexes = new Map<string, number>();

  for (const [index, date] of observedDates.entries()) {
    if (dateIndexes.has(date)) {
      throw new TypeError(
        `Resposta de forecast inválida: daily.time contém data duplicada (${date}).`,
      );
    }

    dateIndexes.set(date, index);
  }

  const current = parseCurrent(currentRecord);
  const expectedDates = addLocalDays(localDateFromTimestamp(current.observedAt));
  const forecast = expectedDates.map((date) =>
    parseForecastDay(date, dateIndexes.get(date), dailyArrays),
  );
  const currentWeather = {
    observedAt: current.observedAt,
    temperatureC: current.temperatureC,
    apparentTemperatureC: current.apparentTemperatureC,
    weatherCode: current.weatherCode,
    relativeHumidity: current.relativeHumidity,
    windSpeedKmh: current.windSpeedKmh,
  };
  const forecastTuple: WeatherData['forecast'] = [
    forecast[0],
    forecast[1],
    forecast[2],
    forecast[3],
    forecast[4],
  ];

  const hasPartialForecast = forecast.some(
    (day) =>
      day.weatherCode === null ||
      day.temperatureMinC === null ||
      day.temperatureMaxC === null ||
      day.precipitationProbabilityMax === null,
  );

  return {
    city,
    timezone,
    fetchedAt,
    current: currentWeather,
    forecast: forecastTuple,
    isPartial: isPartialCurrent(current) || hasPartialForecast,
  };
}
