import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import type { CurrentWeather as CurrentWeatherData } from '../../../src/types/weather';

const current: CurrentWeatherData = {
  observedAt: '2026-09-30T09:00',
  temperatureC: 20,
  apparentTemperatureC: 19,
  weatherCode: 3,
  relativeHumidity: 72,
  windSpeedKmh: 8.5,
};

describe('CurrentWeather', () => {
  it('renderiza campos, unidades e timestamps no timezone informado', () => {
    render(
      <CurrentWeather
        current={current}
        fetchedAt="2026-09-30T12:00:00.000Z"
        timezone="America/Sao_Paulo"
        unit="celsius"
      />,
    );

    const region = screen.getByRole('region', { name: 'Clima atual' });
    expect(region).toHaveTextContent('20 °C');
    expect(region).toHaveTextContent('19 °C');
    expect(region).toHaveTextContent('Encoberto');
    expect(region).toHaveTextContent('72 %');
    expect(region).toHaveTextContent('8,5 km/h');
    expect(region).toHaveTextContent('Horário da condição');
    expect(region).toHaveTextContent('Consultado em');
    expect(region).toHaveTextContent('30/09/2026, 09:00');
  });

  it('deriva Fahrenheit e mostra campos nulos como indisponíveis', () => {
    render(
      <CurrentWeather
        current={{
          ...current,
          temperatureC: null,
          apparentTemperatureC: null,
          weatherCode: null,
          relativeHumidity: null,
          windSpeedKmh: null,
        }}
        fetchedAt="2026-09-30T12:00:00.000Z"
        timezone="America/Sao_Paulo"
        unit="fahrenheit"
      />,
    );

    const region = screen.getByRole('region', { name: 'Clima atual' });
    expect(region).toHaveTextContent('Indisponível');
    expect(region).not.toHaveTextContent('20 °F');
  });
});

