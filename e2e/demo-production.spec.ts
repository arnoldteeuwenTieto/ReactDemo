import { expect, test } from '@playwright/test'
import { schools } from '../src/mockData'
import { readFile } from 'node:fs/promises'

test('production disables demo switching even when built with the demo flag', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Oversikt over skolenes rapportering', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Åpningsmodus', exact: true })).toHaveCount(0)
  const header = page.getByRole('banner')
  await expect(header.getByRole('region', { name: 'Brukerinformasjon (demonstrasjon)', exact: true })).toHaveCount(0)
  await expect(header.getByRole('combobox')).toHaveCount(0)
  await expect(header.getByText('KUN DEV', { exact: true })).toHaveCount(0)
  await expect(header.getByRole('button', { name: 'Tilbakestill status', exact: true })).toHaveCount(0)
  await expect(header.getByRole('region', { name: 'Innlogget bruker', exact: true })).toContainText('Ingen innlogget bruker')
  await expect(header.getByRole('region', { name: 'Innlogget bruker', exact: true }).getByRole('term')).toHaveText(['Navn', 'E-post', 'Rolle'])
  const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const metadata = header.getByRole('region', { name: 'Miljø og versjon', exact: true })
  await expect(metadata.getByRole('definition')).toHaveText(['QA', version, '2468', '1234567'])
  await expect(metadata.getByText('1234567', { exact: true })).toHaveAttribute('title', '1234567890abcdef1234567890abcdef12345678')
  await expect(metadata).not.toContainText('production')
  await expect(metadata).not.toContainText('undefined')
  await expect(header.locator('.header-inner')).toHaveClass(/header-inner--standard/)
  await expect(header.locator('.header-inner > *')).toHaveCount(3)
  const title = (await header.locator('.header-title').boundingBox())!
  const content = (await page.locator('.page-heading').boundingBox())!
  const identity = (await header.locator('.header-identity').boundingBox())!
  const filters = (await page.locator('.filter-panel').boundingBox())!
  expect(title.x).toBeCloseTo(content.x, 1)
  expect(identity.x + identity.width).toBeCloseTo(filters.x + filters.width, 1)
  expect((await header.boundingBox())!.height).toBeLessThanOrEqual(104)
  // No real session exists in this build: opening a form is now correctly denied.
  await expect(page.getByRole('button', { name: /^(Åpne|Se) skjema for/ })).toHaveCount(0)
  await expect(page.getByRole('table').getByText('Ingen tilgang', { exact: true })).toHaveCount(schools.filter(school => school.year === 2026).length)
  await expect(page.locator('.api-debug, .question-reference, [data-report-field]')).toHaveCount(0)
})