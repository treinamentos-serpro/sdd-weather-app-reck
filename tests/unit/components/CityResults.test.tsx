import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CityResults from '../../../src/components/CityResults';
import type { City } from '../../../src/types/weather';

const cities: City[] = [
  {
    id: 1,
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    latitude: -23.5,
    longitude: -46.6,
  },
  {
    id: 2,
    name: 'São Paulo',
    admin1: 'Lisboa',
    country: 'Portugal',
    countryCode: 'PT',
    latitude: 38.7,
    longitude: -9.1,
  },
];

describe('CityResults', () => {
  it('exibe metadados acessíveis sem selecionar resultado automaticamente', () => {
    const onSelectCity = vi.fn();
    render(<CityResults cities={cities} onSelectCity={onSelectCity} />);

    const results = screen.getByRole('list', { name: 'Resultados da busca' });
    expect(within(results).getAllByRole('button')).toHaveLength(2);
    expect(
      within(results).getByRole('button', { name: 'São Paulo, São Paulo, Brasil' }),
    ).toBeVisible();
    expect(
      within(results).getByRole('button', { name: 'São Paulo, Lisboa, Portugal' }),
    ).toBeVisible();
    expect(onSelectCity).not.toHaveBeenCalled();
  });

  it('seleciona uma localidade por teclado', async () => {
    const user = userEvent.setup();
    const onSelectCity = vi.fn();
    render(<CityResults cities={cities} onSelectCity={onSelectCity} />);

    const result = screen.getByRole('button', { name: 'São Paulo, Lisboa, Portugal' });
    result.focus();
    await user.keyboard('{Enter}');

    expect(onSelectCity).toHaveBeenCalledOnce();
    expect(onSelectCity).toHaveBeenCalledWith(cities[1]);
  });
});
