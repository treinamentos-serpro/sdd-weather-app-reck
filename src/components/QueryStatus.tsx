import type { AsyncState, City, WeatherData } from '../types/weather';

interface QueryStatusProps {
  search: AsyncState<City[]>;
  weather: AsyncState<WeatherData>;
  onRetrySearch: () => void | Promise<void>;
  onRetryForecast: () => void | Promise<void>;
}

function requestErrorMessage(stage: 'search' | 'weather', kind: string): string {
  if (kind === 'timeout') {
    return 'A consulta demorou mais que o esperado. Tente novamente.';
  }

  return stage === 'search'
    ? 'Não foi possível buscar cidades. Tente novamente.'
    : 'Não foi possível carregar o clima. Tente novamente.';
}

export default function QueryStatus({
  search,
  weather,
  onRetrySearch,
  onRetryForecast,
}: QueryStatusProps) {
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      {search.status === 'loading' && (
        <p className="text-sm text-white/80" role="status">
          Buscando cidades…
        </p>
      )}
      {search.status === 'empty' && (
        <p className="text-sm text-white/80" role="status">
          Nenhuma cidade encontrada. Verifique a busca e tente novamente.
        </p>
      )}
      {search.status === 'success' && (
        <p className="text-sm text-white/80" role="status">
          {search.data.length === 1
            ? '1 cidade encontrada.'
            : `${search.data.length} cidades encontradas.`}
        </p>
      )}
      {search.status === 'error' && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-red-300" role="alert">
          <span>{requestErrorMessage('search', search.error.kind)}</span>
          <button
            className="rounded-md underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            type="button"
            onClick={() => void onRetrySearch()}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {weather.status === 'loading' && (
        <p className="text-sm text-white/80" role="status">
          Carregando clima…
        </p>
      )}
      {weather.status === 'error' && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-red-300" role="alert">
          <span>{requestErrorMessage('weather', weather.error.kind)}</span>
          <button
            className="rounded-md underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            type="button"
            onClick={() => void onRetryForecast()}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {weather.status === 'success' && weather.data.isPartial && (
        <p className="text-sm text-white/80" role="status">
          Alguns dados estão indisponíveis.
        </p>
      )}
    </div>
  );
}
