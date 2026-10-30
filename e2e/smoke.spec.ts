import { expect, test } from '@playwright/test'

test('shows the school reporting overview', async ({ page }) => {
  const response = await page.goto('./')

  expect(response?.ok()).toBeTruthy()
  const main = page.getByRole('main')
  await expect(main).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Oversikt over skolenes rapportering' })).toBeVisible()
  await expect(main.getByRole('table')).toBeVisible()
})
