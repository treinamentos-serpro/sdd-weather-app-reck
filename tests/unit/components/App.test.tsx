import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../../src/App';
import { fetchForecast, searchCities } from '../../../src/services/openMeteoService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/openMeteoService', () => ({
  fetchForecast: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.5,
  longitude: -46.6,
};

const dates = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
const weather: WeatherData = {
  city,
  timezone: 'America/Sao_Paulo',
  fetchedAt: '2026-09-30T12:00:00.000Z',
  current: {
    observedAt: '2026-09-30T09:00',
    temperatureC: 20,
    apparentTemperatureC: 19,
    weatherCode: 3,
    relativeHumidity: 70,
    windSpeedKmh: 8,
  },
  forecast: dates.map((localDate) => ({
    localDate,
    weatherCode: 3,
    temperatureMinC: 0,
    temperatureMaxC: 20,
    precipitationProbabilityMax: 10,
  })) as WeatherData['forecast'],
  isPartial: false,
};

beforeEach(() => {
  vi.mocked(searchCities).mockReset();
  vi.mocked(fetchForecast).mockReset();
});

describe('App', () => {
  it('integra busca, seleção, clima, previsão e unidade sem fetch na composição', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(fetchForecast).mockResolvedValue(weather);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: 'São Paulo, São Paulo, Brasil' }));

    expect(await screen.findByRole('heading', { name: 'Clima atual' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Previsão de cinco dias' })).toBeVisible();
    expect(screen.getAllByText('20 °C').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toBeVisible();
    expect(fetchForecast).toHaveBeenCalledOnce();
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getAllByText('68 °F').length).toBeGreaterThan(0);
    expect(fetchForecast).toHaveBeenCalledOnce();

    fetchSpy.mockRestore();
  });
});
