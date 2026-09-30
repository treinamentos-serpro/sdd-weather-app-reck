import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number | null, unit: Unit): number | null {
  if (temperatureC === null) {
    return null;
  }

  const displayTemperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;

  return Math.round(displayTemperature);
}
