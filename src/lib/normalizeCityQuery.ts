const MAX_CITY_QUERY_CODE_POINTS = 100;

export type CityQueryError = 'empty' | 'too-long';

export type NormalizedCityQuery =
  | { status: 'valid'; value: string }
  | { status: 'invalid'; reason: CityQueryError };

/** Remove espaços externos e normaliza a consulta em Unicode NFC. */
export function normalizeCityQuery(input: string): NormalizedCityQuery {
  const value = input.trim().normalize('NFC');

  if (value.length === 0) {
    return { status: 'invalid', reason: 'empty' };
  }

  if (Array.from(value).length > MAX_CITY_QUERY_CODE_POINTS) {
    return { status: 'invalid', reason: 'too-long' };
  }

  return { status: 'valid', value };
}
