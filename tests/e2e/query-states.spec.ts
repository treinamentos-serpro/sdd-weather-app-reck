import { expect, test } from '@playwright/test';
import { forecastPayload, geocodingPayload, saoPaulo } from './weatherFixtures';

test('mostra estado vazio quando geocoding não encontra cidades', async ({ page }) => {
  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: geocodingPayload([]) }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByText('Nenhuma cidade encontrada. Verifique a busca e tente novamente.'),
  ).toBeVisible();
  expect(page.getByRole('heading', { name: 'Clima atual' })).toHaveCount(0);
});

test('permite retry manual após erro HTTP no geocoding', async ({ page }) => {
  let requestCount = 0;
  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await route.fulfill({ status: 503, body: 'indisponível' });
      return;
    }

    await route.fulfill({ json: geocodingPayload([saoPaulo]) });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText('Não foi possível buscar cidades. Tente novamente.')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible();
  expect(requestCount).toBe(2);
});

test('mostra timeout do forecast e permite retry manual', async ({ page }) => {
  let forecastRequests = 0;
  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: geocodingPayload([saoPaulo]) }),
  );
  await page.route(/api\.open-meteo\.com\/v1\/forecast/, async (route) => {
    forecastRequests += 1;
    if (forecastRequests === 1) {
      await new Promise((resolve) => setTimeout(resolve, 8_500));
      try {
        await route.fulfill({ json: forecastPayload() });
      } catch {
        return;
      }
      return;
    }

    await route.fulfill({ json: forecastPayload() });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' }).click();
  await expect(
    page.getByText('A consulta demorou mais que o esperado. Tente novamente.'),
  ).toBeVisible({ timeout: 12_000 });
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  expect(forecastRequests).toBe(2);
});

test('sinaliza dados parciais sem descartar os campos válidos', async ({ page }) => {
  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: geocodingPayload([saoPaulo]) }),
  );
  await page.route(/api\.open-meteo\.com\/v1\/forecast/, (route) =>
    route.fulfill({ json: forecastPayload({ partial: true }) }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' }).click();

  await expect(page.getByText('Alguns dados estão indisponíveis.')).toBeVisible();
  await expect(page.getByText('Indisponível').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
});
