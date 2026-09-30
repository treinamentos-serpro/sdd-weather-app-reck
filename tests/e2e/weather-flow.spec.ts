import { expect, test } from '@playwright/test';
import { forecastPayload, geocodingPayload, saoPaulo } from './weatherFixtures';

test('busca, seleciona, exibe forecast e alterna unidade em desktop/mobile', async ({ page }) => {
  const geocodingRequests: string[] = [];
  let forecastRequestCount = 0;

  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, async (route) => {
    geocodingRequests.push(route.request().url());
    await route.fulfill({ json: geocodingPayload([saoPaulo]) });
  });
  await page.route(/api\.open-meteo\.com\/v1\/forecast/, async (route) => {
    forecastRequestCount += 1;
    await route.fulfill({ json: forecastPayload() });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText('1 cidade encontrada.')).toBeVisible();
  expect(new URL(geocodingRequests[0]).searchParams.get('name')).toBe('São Paulo');
  expect(forecastRequestCount).toBe(0);

  await page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' }).click();
  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de cinco dias' })).toBeVisible();
  await expect(page.getByText('18 °C').first()).toBeVisible();
  await expect(page.getByText('Consultado em')).toBeVisible();
  await expect(page.getByText('Horário da condição')).toBeVisible();
  await expect(page.getByRole('list').last().getByRole('listitem')).toHaveCount(5);
  expect(forecastRequestCount).toBe(1);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByText('64 °F').first()).toBeVisible();
  expect(forecastRequestCount).toBe(1);
});
