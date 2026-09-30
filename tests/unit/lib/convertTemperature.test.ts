import { describe, expect, it } from 'vitest';
import { convertTemperature } from '../../../src/lib/convertTemperature';

describe('convertTemperature', () => {
  it.each([
    [20, 68],
    [0, 32],
    [-10, 14],
  ])('converte %i °C para %i °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('preserva a temperatura em Celsius e valores ausentes', () => {
    expect(convertTemperature(18.5, 'celsius')).toBe(19);
    expect(convertTemperature(null, 'celsius')).toBeNull();
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });
});
