import { describe, expect, it } from 'vitest';
import {
  formatWeatherDate,
  formatWeatherDateTime,
  formatWeatherNumber,
} from '../../../src/lib/formatWeather';

describe('formatWeather', () => {
  it('formata o horário local sem deslocá-lo pelo timezone do processo', () => {
    expect(formatWeatherDateTime('2026-09-30T09:00', 'America/Sao_Paulo')).toBe(
      '30/09/2026, 09:00',
    );
  });

  it('formata datas e números em pt-BR', () => {
    expect(formatWeatherDate('2026-09-30', 'America/Sao_Paulo')).toBe('30/09/2026');
    expect(formatWeatherNumber(18.5)).toBe('18,5');
  });

  it('retorna null para valores ausentes ou inválidos', () => {
    expect(formatWeatherDateTime(null, 'America/Sao_Paulo')).toBeNull();
    expect(formatWeatherDateTime('data inválida', 'America/Sao_Paulo')).toBeNull();
    expect(formatWeatherDateTime('2026-09-30T09:00', 'Invalid/Zone')).toBeNull();
    expect(formatWeatherNumber(null)).toBeNull();
    expect(formatWeatherNumber(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

