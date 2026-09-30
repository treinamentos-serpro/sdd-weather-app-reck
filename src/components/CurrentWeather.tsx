import { convertTemperature } from '../lib/convertTemperature';
import { formatWeatherDateTime, formatWeatherNumber } from '../lib/formatWeather';
import { mapWeatherCode } from '../lib/mapWeatherCode';
import type { CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  current: CurrentWeatherData;
  fetchedAt: string;
  timezone: string;
  unit: Unit;
}

function formatTemperature(valueC: number | null, unit: Unit): string {
  const value = convertTemperature(valueC, unit);

  if (value === null) {
    return 'Indisponível';
  }

  return `${value} ${unit === 'celsius' ? '°C' : '°F'}`;
}

function formatMeasurement(value: number | null, unit: string): string {
  const formattedValue = formatWeatherNumber(value);
  return formattedValue === null ? 'Indisponível' : `${formattedValue} ${unit}`;
}

function formatFetchedAt(value: string, timezone: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      hourCycle: 'h23',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(date);
  } catch {
    return null;
  }
}

export default function CurrentWeather({
  current,
  fetchedAt,
  timezone,
  unit,
}: CurrentWeatherProps) {
  const unavailable = 'Indisponível';
  const observedAt = formatWeatherDateTime(current.observedAt, timezone) ?? unavailable;
  const fetchedAtLabel = formatFetchedAt(fetchedAt, timezone) ?? unavailable;
  const condition = mapWeatherCode(current.weatherCode) ?? unavailable;

  return (
    <section aria-labelledby="current-weather-title" className="space-y-3 text-white">
      <h2 id="current-weather-title" className="text-lg font-semibold">
        Clima atual
      </h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-white/70">Temperatura</dt>
          <dd className="text-xl font-semibold">{formatTemperature(current.temperatureC, unit)}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">Sensação térmica</dt>
          <dd>{formatTemperature(current.apparentTemperatureC, unit)}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">Condição</dt>
          <dd>{condition}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">Umidade relativa</dt>
          <dd>{formatMeasurement(current.relativeHumidity, '%')}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">Velocidade do vento</dt>
          <dd>{formatMeasurement(current.windSpeedKmh, 'km/h')}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">Horário da condição</dt>
          <dd>{observedAt}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">Consultado em</dt>
          <dd>{fetchedAtLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
