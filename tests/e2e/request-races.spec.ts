import { expect, test } from '@playwright/test';
import { forecastPayload, geocodingPayload, porto, saoPaulo } from './weatherFixtures';

test('respostas tardias de geocoding não substituem a busca mais recente', async ({ page }) => {
  let releaseOldResponse: () => void = () => undefined;
  let markOldRequestStarted: () => void = () => undefined;
  const oldResponseGate = new Promise<void>((resolve) => {
    releaseOldResponse = resolve;
  });
  const oldRequestStarted = new Promise<void>((resolve) => {
    markOldRequestStarted = resolve;
  });

  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, async (route) => {
    const query = new URL(route.request().url()).searchParams.get('name');
    if (query === 'Cidade antiga') {
      markOldRequestStarted();
      await oldResponseGate;
      try {
        await route.fulfill({ json: geocodingPayload([saoPaulo]) });
      } catch {
        return;
      }
      return;
    }

    await route.fulfill({ json: geocodingPayload([porto]) });
  });

  await page.goto('/');
  const input = page.getByRole('searchbox', { name: 'Cidade' });
  await input.fill('Cidade antiga');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await oldRequestStarted;
  await input.fill('Cidade recente');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('button', { name: 'Porto, Porto, Portugal' })).toBeVisible();

  releaseOldResponse();
  await expect(page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' })).toHaveCount(0);
});

test('resposta tardia do forecast não troca a cidade selecionada mais recente', async ({
  page,
}) => {
  let releaseOldForecast: () => void = () => undefined;
  let markOldForecastStarted: () => void = () => undefined;
  const oldForecastGate = new Promise<void>((resolve) => {
    releaseOldForecast = resolve;
  });
  const oldForecastStarted = new Promise<void>((resolve) => {
    markOldForecastStarted = resolve;
  });

  await page.route(/geocoding-api\.open-meteo\.com\/v1\/search/, (route) =>
    route.fulfill({ json: geocodingPayload([saoPaulo, porto]) }),
  );
  await page.route(/api\.open-meteo\.com\/v1\/forecast/, async (route) => {
    const latitude = new URL(route.request().url()).searchParams.get('latitude');
    if (latitude === String(saoPaulo.latitude)) {
      markOldForecastStarted();
      await oldForecastGate;
      try {
        await route.fulfill({ json: forecastPayload({ temperature: 10 }) });
      } catch {
        return;
      }
      return;
    }

    await route.fulfill({ json: forecastPayload({ temperature: 30 }) });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' }).click();
  await oldForecastStarted;
  await page.getByRole('button', { name: 'Porto, Porto, Portugal' }).click();
  await expect(page.getByRole('heading', { name: 'Porto' })).toBeVisible();
  await expect(page.getByText('30 °C').first()).toBeVisible();

  releaseOldForecast();
  await expect(page.getByText('30 °C').first()).toBeVisible();
  await expect(page.getByText('10 °C')).toHaveCount(0);
});
