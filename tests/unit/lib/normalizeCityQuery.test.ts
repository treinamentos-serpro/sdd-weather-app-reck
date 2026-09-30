import { describe, expect, it } from 'vitest';
import { normalizeCityQuery } from '../../../src/lib/normalizeCityQuery';

describe('normalizeCityQuery', () => {
  it('remove espaços externos e normaliza Unicode NFC', () => {
    expect(normalizeCityQuery('  Sa\u0303o Jose\u0301  ')).toEqual({
      status: 'valid',
      value: 'São José',
    });
  });

  it('rejeita texto vazio e composto apenas por espaços', () => {
    expect(normalizeCityQuery('')).toEqual({ status: 'invalid', reason: 'empty' });
    expect(normalizeCityQuery('   \t ')).toEqual({ status: 'invalid', reason: 'empty' });
  });

  it('aceita até 100 pontos de código e rejeita o 101º', () => {
    expect(normalizeCityQuery('a'.repeat(100)).status).toBe('valid');
    expect(normalizeCityQuery('a'.repeat(101))).toEqual({
      status: 'invalid',
      reason: 'too-long',
    });
    expect(normalizeCityQuery('😀'.repeat(100)).status).toBe('valid');
    expect(normalizeCityQuery('😀'.repeat(101)).status).toBe('invalid');
  });

  it('preserva caracteres especiais legítimos', () => {
    expect(normalizeCityQuery("L'Haÿ-les-Roses")).toEqual({
      status: 'valid',
      value: "L'Haÿ-les-Roses",
    });
  });
});
