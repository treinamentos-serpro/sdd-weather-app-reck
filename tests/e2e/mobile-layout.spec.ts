import { expect, test } from '@playwright/test';
import { forecastPayload, geocodingPayload, saoPaulo } from './weatherFixtures';

test('mantém o fluxo e conteúdo sem overflow nos viewports suportados', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'Este cenário requer um projeto com touch.');

  test.skip(test.info().project.name !== 'mobile', 'Este cenário exige entrada por touch.');

  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: geocodingPayload([saoPaulo]) }),
  );
  await page.route(/api\.open-meteo\.com\/v1\/forecast/, (route) =>
    route.fulfill({ json: forecastPayload() }),
  );

  await page.goto('/');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).tap();
  await page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' }).tap();
  await expect(page.getByRole('heading', { name: 'Previsão de cinco dias' })).toBeVisible();

  for (const width of [320, 768, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  }

  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('button', { name: 'Fahrenheit' }).tap();
  await expect(page.getByText('64 °F').first()).toBeVisible();
});
