import { type FormEvent, useRef } from 'react';

import { type CityQueryError, normalizeCityQuery } from '../lib/normalizeCityQuery';

interface SearchFormProps {
  query: string;
  queryError: CityQueryError | null;
  isLoading: boolean;
  onQueryChange: (query: string) => void;
  onSubmit: () => void | Promise<void>;
}

const QUERY_ERROR_MESSAGES: Record<CityQueryError, string> = {
  empty: 'Digite uma cidade.',
  'too-long': 'Use até 100 caracteres para buscar uma cidade.',
};

export default function SearchForm({
  query,
  queryError,
  isLoading,
  onQueryChange,
  onSubmit,
}: SearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = 'city-query-error';

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (normalizeCityQuery(query).status === 'invalid') {
      inputRef.current?.focus();
    }

    void onSubmit();
  }

  return (
    <form
      className="flex w-full flex-col gap-2 sm:flex-row"
      aria-busy={isLoading}
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="city-query">
          Cidade
        </label>
        <input
          ref={inputRef}
          id="city-query"
          name="city"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          aria-invalid={queryError !== null}
          aria-describedby={queryError === null ? undefined : errorId}
          className="min-w-0 rounded-md border border-white/20 bg-night-800 px-4 py-3 text-white placeholder:text-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
        />
        {queryError !== null && (
          <p id={errorId} className="text-sm text-red-300" role="alert">
            {QUERY_ERROR_MESSAGES[queryError]}
          </p>
        )}
      </div>
      <button
        type="submit"
        aria-busy={isLoading}
        className="min-h-11 self-end rounded-md bg-accent-500 px-5 py-3 font-medium text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {isLoading ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  );
}
