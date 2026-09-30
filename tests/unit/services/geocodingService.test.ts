import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities } from '../../../src/services/openMeteoService';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('envia a consulta e os parâmetros e normaliza os resultados', async () => {
    let requestedUrl = '';
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return jsonResponse({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            latitude: -23.5,
            longitude: -46.6,
          },
        ],
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('São Paulo');
    const requestUrl = new URL(requestedUrl);

    expect(requestUrl.origin + requestUrl.pathname).toBe(
      'https://geocoding-api.open-meteo.com/v1/search',
    );
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      name: 'São Paulo',
      count: '10',
      language: 'pt',
      format: 'json',
    });
    expect(result[0]).toMatchObject({ name: 'São Paulo', countryCode: 'BR' });
  });

  it.each([{}, { results: [] }])('retorna lista vazia para %o', async (payload) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(payload)),
    );

    await expect(searchCities('Cidade')).resolves.toEqual([]);
  });

  it('classifica status HTTP não bem-sucedido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, 503)),
    );

    await expect(searchCities('Cidade')).rejects.toMatchObject({ kind: 'http', statusCode: 503 });
  });

  it('classifica falha de rede', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    );

    await expect(searchCities('Cidade')).rejects.toMatchObject({ kind: 'network' });
  });

  it('classifica JSON e envelope incompatíveis como resposta inválida', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    );
    await expect(searchCities('Cidade')).rejects.toMatchObject({ kind: 'invalid-response' });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ results: 'inválido' })),
    );
    await expect(searchCities('Cidade')).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('encaminha o signal de cancelamento ao fetch', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return jsonResponse({ results: [] });
      }),
    );
    const controller = new AbortController();

    await searchCities('Cidade', controller.signal);

    expect(requestSignal).toBeInstanceOf(AbortSignal);
  });

  it('retorna erro timeout após oito segundos', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      ),
    );

    const request = searchCities('Cidade');
    const assertion = expect(request).rejects.toMatchObject({ kind: 'timeout' });
    await vi.advanceTimersByTimeAsync(8_000);
    await assertion;
  });
});
