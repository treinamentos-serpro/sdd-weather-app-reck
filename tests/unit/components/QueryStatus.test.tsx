import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QueryStatus from '../../../src/components/QueryStatus';
import type { AsyncState, City, WeatherData } from '../../../src/types/weather';

const weatherData = {
  isPartial: true,
} as WeatherData;

function renderStatus(search: AsyncState<City[]>, weather: AsyncState<WeatherData>) {
  const onRetrySearch = vi.fn();
  const onRetryForecast = vi.fn();
  render(
    <QueryStatus
      search={search}
      weather={weather}
      onRetrySearch={onRetrySearch}
      onRetryForecast={onRetryForecast}
    />,
  );
  return { onRetrySearch, onRetryForecast };
}

describe('QueryStatus', () => {
  it('anuncia estados loading, vazio, success e parcial', () => {
    const city: City = {
      id: 1,
      name: 'São Paulo',
      admin1: null,
      country: 'Brasil',
      countryCode: 'BR',
      latitude: 0,
      longitude: 0,
    };
    const { rerender } = render(
      <QueryStatus
        search={{ status: 'loading' }}
        weather={{ status: 'loading' }}
        onRetrySearch={vi.fn()}
        onRetryForecast={vi.fn()}
      />,
    );
    expect(screen.getByText('Buscando cidades…')).toHaveAttribute('role', 'status');
    expect(screen.getByText('Carregando clima…')).toHaveAttribute('role', 'status');

    rerender(
      <QueryStatus
        search={{ status: 'empty' }}
        weather={{ status: 'success', data: weatherData }}
        onRetrySearch={vi.fn()}
        onRetryForecast={vi.fn()}
      />,
    );
    expect(
      screen.getByText('Nenhuma cidade encontrada. Verifique a busca e tente novamente.'),
    ).toHaveAttribute('role', 'status');
    expect(screen.getByText('Alguns dados estão indisponíveis.')).toHaveAttribute('role', 'status');

    rerender(
      <QueryStatus
        search={{ status: 'success', data: [city] }}
        weather={{ status: 'idle' }}
        onRetrySearch={vi.fn()}
        onRetryForecast={vi.fn()}
      />,
    );
    expect(screen.getByText('1 cidade encontrada.')).toHaveAttribute('role', 'status');
  });

  it('distingue erros e aciona retry da etapa correspondente', () => {
    const { onRetrySearch, onRetryForecast } = renderStatus(
      { status: 'error', error: { kind: 'http', statusCode: 503 } },
      { status: 'error', error: { kind: 'timeout' } },
    );

    expect(
      screen.getByText('Não foi possível buscar cidades. Tente novamente.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A consulta demorou mais que o esperado. Tente novamente.'),
    ).toBeInTheDocument();
    const retryButtons = screen.getAllByRole('button', { name: 'Tentar novamente' });
    fireEvent.click(retryButtons[0]);
    fireEvent.click(retryButtons[1]);
    expect(onRetrySearch).toHaveBeenCalledOnce();
    expect(onRetryForecast).toHaveBeenCalledOnce();
  });
});
