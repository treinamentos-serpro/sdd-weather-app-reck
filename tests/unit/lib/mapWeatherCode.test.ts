import { describe, expect, it } from 'vitest';
import { mapWeatherCode } from '../../../src/lib/mapWeatherCode';

describe('mapWeatherCode', () => {
  it.each([0, 1, 3, 45, 61, 71, 80, 95])('mapeia o código WMO %i para um rótulo', (code) => {
    expect(mapWeatherCode(code)).toEqual(expect.any(String));
    expect(mapWeatherCode(code)?.length).toBeGreaterThan(0);
  });

  it('retorna null para código nulo, desconhecido ou não inteiro', () => {
    expect(mapWeatherCode(null)).toBeNull();
    expect(mapWeatherCode(999)).toBeNull();
    expect(mapWeatherCode(1.5)).toBeNull();
  });
});
