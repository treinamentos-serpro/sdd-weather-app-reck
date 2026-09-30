import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../../src/components/ForecastList';
import type { WeatherData } from '../../../src/types/weather';

const forecast: WeatherData['forecast'] = [
  {
    localDate: '2026-09-30',
    weatherCode: 3,
    temperatureMinC: 15,
    temperatureMaxC: 23,
    precipitationProbabilityMax: 10,
  },
  {
    localDate: '2026-10-01',
    weatherCode: 1,
    temperatureMinC: 16,
    temperatureMaxC: 24,
    precipitationProbabilityMax: 20,
  },
  {
    localDate: '2026-10-02',
    weatherCode: 61,
    temperatureMinC: 17,
    temperatureMaxC: 25,
    precipitationProbabilityMax: 70,
  },
  {
    localDate: '2026-10-03',
    weatherCode: 3,
    temperatureMinC: 18,
    temperatureMaxC: 26,
    precipitationProbabilityMax: 30,
  },
  {
    localDate: '2026-10-04',
    weatherCode: 0,
    temperatureMinC: 19,
    temperatureMaxC: 27,
    precipitationProbabilityMax: 10,
  },
];

describe('ForecastList', () => {
  it('exibe cinco dias em ordem local com campos e unidades', () => {
    render(<ForecastList forecast={forecast} timezone="America/Sao_Paulo" unit="celsius" />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent('30/09/2026');
    expect(items[0]).toHaveTextContent('15 °C');
    expect(items[0]).toHaveTextContent('23 °C');
    expect(items[0]).toHaveTextContent('10 %');
    expect(items[2]).toHaveTextContent('Chuva fraca');
  });

  it('usa timezone local, converte temperaturas e marca dia ausente', () => {
    const partialForecast: WeatherData['forecast'] = [
      forecast[0],
      forecast[1],
      {
        localDate: '2026-10-02',
        weatherCode: null,
        temperatureMinC: null,
        temperatureMaxC: null,
        precipitationProbabilityMax: null,
      },
      forecast[3],
      forecast[4],
    ];

    render(
      <ForecastList forecast={partialForecast} timezone="America/Sao_Paulo" unit="fahrenheit" />,
    );

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('59 °F');
    expect(items[2]).toHaveTextContent('Previsão indisponível');
    expect(items[2]).toHaveTextContent('02/10/2026');
  });
});
