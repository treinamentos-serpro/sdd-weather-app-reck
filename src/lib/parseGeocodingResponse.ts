import type { City } from '../types/weather';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown, fieldName: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`Resposta de geocoding inválida: ${fieldName} deve ser um objeto.`);
  }

  return value as JsonObject;
}

function optionalString(record: JsonObject, fieldName: string): string | null {
  const value = record[fieldName];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new TypeError(`Resposta de geocoding inválida: ${fieldName} deve ser texto.`);
  }

  return value;
}

function parseCity(value: unknown): City {
  const record = asObject(value, 'results[]');
  const name = record.name;
  const id = record.id;
  const latitude = record.latitude;
  const longitude = record.longitude;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('Resposta de geocoding inválida: name deve ser texto não vazio.');
  }

  if (id !== undefined && id !== null && (typeof id !== 'number' || !Number.isFinite(id))) {
    throw new TypeError('Resposta de geocoding inválida: id deve ser um número finito.');
  }

  if (typeof latitude !== 'number' || !Number.isFinite(latitude)) {
    throw new TypeError('Resposta de geocoding inválida: latitude deve ser um número finito.');
  }

  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) {
    throw new TypeError('Resposta de geocoding inválida: longitude deve ser um número finito.');
  }

  return {
    id: typeof id === 'number' ? id : null,
    name,
    admin1: optionalString(record, 'admin1'),
    country: optionalString(record, 'country'),
    countryCode: optionalString(record, 'country_code'),
    latitude,
    longitude,
  };
}

export function parseGeocodingResponse(response: unknown): City[] {
  const record = asObject(response, 'raiz');
  const results = record.results;

  if (results === undefined) {
    return [];
  }

  if (!Array.isArray(results)) {
    throw new TypeError('Resposta de geocoding inválida: results deve ser uma lista.');
  }

  return results.map(parseCity);
}
