import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { demoUsers } from '../src/demoUser'
import { schools } from '../src/mockData'
import { saveMunicipalities, readImportedReport } from '../src/services/importedReportService'
import { mockSkjemaStatusId } from '../src/services/grunnskoleApi'

const table = (page: Page) => page.getByRole('table', { name: 'Finansiering fra annen kommune', exact: true })
const rows = (page: Page) => table(page).locator('tbody tr')
const total = (page: Page) => table(page).getByRole('textbox', { name: 'Sum finansierte elever', exact: true })
const add = (page: Page) => page.getByRole('button', { name: 'Legg til kommune', exact: true })
async function open(page: Page) {
  await page.goto('./')
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
  await page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true }).getByRole('button', { name: 'Elever og timer', exact: true }).click()
}
async function addRow(page: Page, municipality: string, value: string) {
  await add(page).click()
  const row = rows(page).last()
  await row.getByRole('combobox').selectOption(municipality)
  await row.getByRole('textbox').fill(value)
}

test('compact rows update totals, validation and numbering on edit and delete', async ({ page }) => {
  await open(page)
  await expect(table(page).getByRole('columnheader')).toHaveCount(4)
  await expect(total(page)).toHaveValue('0')
  await addRow(page, 'Oslo', '3'); await addRow(page, 'Trondheim', '5')
  await expect(total(page)).toHaveValue('8')
  await expect(total(page)).toHaveAttribute('readonly', '')
  await expect(total(page)).toHaveCSS('background-color', 'rgb(217, 221, 227)')
  await expect(rows(page).getByRole('rowheader')).toHaveText(['1', '2'])
  await expect(rows(page).first().getByRole('combobox')).not.toContainText('Bergen')
  const remove = page.getByRole('button', { name: 'Fjern Oslo', exact: true })
  await remove.hover(); await expect(remove).toHaveCSS('color', 'rgb(146, 45, 45)')
  await remove.focus(); await expect(remove).toHaveCSS('background-color', 'rgb(251, 231, 231)')
  await remove.click()
  await expect(rows(page)).toHaveCount(1); await expect(rows(page).getByRole('rowheader')).toHaveText(['1'])
  await expect(rows(page).first().getByRole('combobox')).toHaveValue('Trondheim')
  await expect(total(page)).toHaveValue('5')
  await rows(page).first().getByRole('textbox').fill('7'); await expect(total(page)).toHaveValue('7')
  await addRow(page, 'Oslo', '-1')
  const badge = page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true }).getByRole('button', { name: 'Elever og timer', exact: true }).locator('.section-issue-badge')
  await expect(badge).toHaveText('1')
  await page.getByRole('button', { name: 'Fjern Oslo', exact: true }).click()
  await expect(badge).toHaveCount(0); await expect(total(page)).toHaveValue('7')
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expect(total(page)).toHaveValue('7')
  await expect(rows(page).first().getByRole('combobox')).toHaveValue('Trondheim')
  await page.getByRole('button', { name: 'Fjern Trondheim', exact: true }).click()
  await expect(rows(page)).toHaveCount(0); await expect(total(page)).toHaveValue('0')
})

test('read-only users cannot add, modify or delete existing financing rows', async ({ page }) => {
  await open(page); await addRow(page, 'Oslo', '4')
  const user = page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
  await user.selectOption('demo-udir-support')
  await expect(add(page)).toBeDisabled()
  await expect(rows(page).getByRole('combobox')).toBeDisabled()
  await expect(rows(page).getByRole('textbox')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Fjern Oslo', exact: true })).toBeDisabled()
  await expect(total(page)).toHaveValue('4')
  await user.selectOption('demo-school-leader')
  await expect(page.getByRole('button', { name: 'Fjern Oslo', exact: true })).toBeEnabled()
  await expect(rows(page).getByRole('textbox')).toHaveValue('4')
})

test('financing controls stay aligned without overlap at desktop and narrow widths', async ({ page }) => {
  await open(page); await addRow(page, 'Oslo', '12'); await addRow(page, 'Trondheim', '8')
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await table(page).scrollIntoViewIfNeeded()
    const heights: number[] = []
    for (const row of await rows(page).all()) {
      const select = (await row.getByRole('combobox').boundingBox())!
      const input = (await row.getByRole('textbox').boundingBox())!
      const remove = (await row.getByRole('button', { name: /^Fjern / }).boundingBox())!
      expect(select.x + select.width).toBeLessThan(input.x)
      expect(input.x + input.width).toBeLessThan(remove.x)
      expect(Math.abs(select.y - input.y)).toBeLessThanOrEqual(1)
      heights.push((await row.boundingBox())!.height)
    }
    expect(heights[0]).toBeCloseTo(heights[1], 1)
    expect(heights[0]).toBeLessThanOrEqual(42)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await expect(total(page)).toHaveValue('20')
    if (width === 1280 || width === 390) await page.screenshot({ path: `artifacts/financing-${width}.png` })
  }
  const results = await new AxeBuilder({ page }).include('section[aria-labelledby="import-3-E"]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
  expect(results.violations).toEqual([])
})

test('the existing state adapter rejects read-only add, edit and delete attempts', () => {
  const school = { ...schools[0], id: 'financing-test-fixture' }
  const leader = { ...demoUsers[0], mockAccessScope: { ...demoUsers[0].mockAccessScope, schoolIds: [school.id] } }
  const reader = { ...demoUsers.find(user => user.roleId === 13)!, mockAccessScope: { ...leader.mockAccessScope } }
  const original = [{ id: 'row-a', GG_887_Finansiert_Annen_Kommune: 'Oslo', GG_886_Elever_Finansiert_Annen_Kommune: '4' }]
  expect(saveMunicipalities({ enabled: true, user: leader, school }, original)).toBe(true)
  const context = { enabled: true, user: reader, school }
  expect(saveMunicipalities(context, [])).toBe(false)
  expect(saveMunicipalities(context, [{ ...original[0], GG_886_Elever_Finansiert_Annen_Kommune: '99' }])).toBe(false)
  expect(saveMunicipalities(context, [...original, { ...original[0], id: 'row-b' }])).toBe(false)
  expect(readImportedReport(mockSkjemaStatusId(school)).municipalities).toEqual(original)
})
