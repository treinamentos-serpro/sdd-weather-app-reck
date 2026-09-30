import { convertTemperature } from '../lib/convertTemperature';
import { formatWeatherDate, formatWeatherNumber } from '../lib/formatWeather';
import { mapWeatherCode } from '../lib/mapWeatherCode';
import type { ForecastDay, Unit, WeatherData } from '../types/weather';

interface ForecastListProps {
  forecast: WeatherData['forecast'];
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

function isDayUnavailable(day: ForecastDay): boolean {
  return (
    day.weatherCode === null &&
    day.temperatureMinC === null &&
    day.temperatureMaxC === null &&
    day.precipitationProbabilityMax === null
  );
}

export default function ForecastList({ forecast, timezone, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title" className="space-y-3 text-white">
      <h2 id="forecast-title" className="text-lg font-semibold">
        Previsão de cinco dias
      </h2>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => {
          const date = formatWeatherDate(day.localDate, timezone) ?? 'Data indisponível';

          return (
            <li key={day.localDate}>
              <article className="h-full rounded-md border border-white/10 bg-white/5 p-3 backdrop-blur-md">
                <h3 className="font-medium">
                  <time dateTime={day.localDate}>{date}</time>
                </h3>
                {isDayUnavailable(day) ? (
                  <p className="mt-3 text-sm text-white/70">Previsão indisponível</p>
                ) : (
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-white/70">Condição</dt>
                      <dd>{mapWeatherCode(day.weatherCode) ?? 'Indisponível'}</dd>
                    </div>
                    <div>
                      <dt className="text-white/70">Mínima</dt>
                      <dd>{formatTemperature(day.temperatureMinC, unit)}</dd>
                    </div>
                    <div>
                      <dt className="text-white/70">Máxima</dt>
                      <dd>{formatTemperature(day.temperatureMaxC, unit)}</dd>
                    </div>
                    <div>
                      <dt className="text-white/70">Probabilidade de precipitação</dt>
                      <dd>
                        {formatWeatherNumber(day.precipitationProbabilityMax) ?? 'Indisponível'}
                        {day.precipitationProbabilityMax === null ? '' : ' %'}
                      </dd>
                    </div>
                  </dl>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
