import { describe, expect, it } from 'vitest';
import { parseGeocodingResponse } from '../../../src/lib/parseGeocodingResponse';

describe('parseGeocodingResponse', () => {
  it('mapeia resultados para City', () => {
    expect(
      parseGeocodingResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            country_code: 'BR',
            admin1: 'São Paulo',
            country: 'Brasil',
          },
        ],
      }),
    ).toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        admin1: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        latitude: -23.5475,
        longitude: -46.6361,
      },
    ]);
  });

  it('converte metadados opcionais ausentes para null e permite ID ausente', () => {
    expect(
      parseGeocodingResponse({
        results: [{ name: 'Cidade', latitude: 10, longitude: -20 }],
      }),
    ).toEqual([
      {
        id: null,
        name: 'Cidade',
        admin1: null,
        country: null,
        countryCode: null,
        latitude: 10,
        longitude: -20,
      },
    ]);
  });

  it('retorna lista vazia para results ausente ou vazio', () => {
    expect(parseGeocodingResponse({})).toEqual([]);
    expect(parseGeocodingResponse({ results: [] })).toEqual([]);
  });

  it.each([
    ['envelope que não é objeto', null],
    ['results que não é lista', { results: {} }],
    ['item que não é objeto', { results: [null] }],
    ['nome vazio', { results: [{ name: ' ', latitude: 0, longitude: 0 }] }],
    ['latitude não finita', { results: [{ name: 'Cidade', latitude: Number.NaN, longitude: 0 }] }],
    ['longitude não finita', { results: [{ name: 'Cidade', latitude: 0, longitude: Infinity }] }],
    [
      'metadado com tipo inválido',
      {
        results: [{ name: 'Cidade', latitude: 0, longitude: 0, admin1: 3 }],
      },
    ],
  ])('rejeita %s', (_caseName, response) => {
    expect(() => parseGeocodingResponse(response)).toThrow(TypeError);
  });
});
