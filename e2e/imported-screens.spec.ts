import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { importedScreens, calculateValues, numericError, fullMockFindings, canSubmitMock, mockValidationOverview } from '../src/domain/importedReporting'
import { readImportedReport, saveImportedNumber, performMockAction, actionTarget } from '../src/services/importedReportService'
import { mockSkjemaStatusId } from '../src/services/grunnskoleApi'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'

const menu = (page: Page) => page.getByRole('navigation', { name: /^(Grunnskoleseksjoner|Grunnskuleseksjonar)$/ })
const input = (page: Page, key: string) => page.locator(`input[data-field="${key}"]`)
async function open(page: Page, name = 'Fjordgløtt barneskole') {
  await page.getByRole('button', { name: `Åpne skjema for ${name}, 2026`, exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
}
async function section(page: Page, name: string) { await menu(page).getByRole('button', { name, exact: true }).click() }
const boys = 'GG_1_Antall_Elever_Trinn1_Gutter'
const girls = 'GG_2_Antall_Elever_Trinn1_Jenter'
const total = 'GG_3_Antall_Elever_Trinn1_Sum'

test('all exported fields and local arithmetic are preserved; unsupported formulas block submission', () => {
  expect(importedScreens[3].fields).toHaveLength(70)
  expect(importedScreens[4].fields).toHaveLength(113)
  expect(importedScreens[3].groups.map(group => group.id)).toEqual(['A','B','C','D','E','F','G'])
  expect(importedScreens[4].groups.map(group => group.id)).toEqual(['A','B','C','D','E'])
  const values = calculateValues(3, { [boys]: '17', [girls]: '19' })
  expect(values[total]).toBe(36)
  expect(values.GG_39_Antall_Elever_Sum_EleverTotalt).toBe(36)
  const four = calculateValues(4, { GG_70_Antall_timer_undervisning_trinn1_4: '100', GG_71_Antall_Timer_Undervisning_Trinn5_7: '200' })
  expect(four.GG_890_Antall_Timer_Undervisning_Sum1_7).toBe(300)
  expect(four.GG_73_Antall_Timer_Undervisning_Sum1_10).toBe(300)
  expect(four.GG_1043_Sum_Aarstimer_Trinn1_4).toBeNull()
  for (const invalid of ['', '-1', '1.5', 'abc', '10000']) expect(numericError(invalid, 4)).not.toBeNull()
  expect(numericError('0', 4)).toBeNull()
  const report = readImportedReport('test:incomplete:2026')
  expect(fullMockFindings(report, 'Bergen').some(finding => finding.id === 'GG-A145' && finding.kind === 'unsupported')).toBe(true)
  expect(canSubmitMock({ ...report, checked: true }, 'Bergen')).toBe(false)
  const completed = { ...report, checked: true, del2: { GG_227_Skolens_Maalform: 'Bokmål', GG_228_Laveste_Trinn_Paa_Skolen: 1, GG_229_Hoeyeste_Trinn_Paa_Skolen: 10, GG_230_Tilbyr_SFO: false },
    numbers: { ...report.numbers,
      ...Object.fromEntries(([3, 4, 5, 6, 7, 8, 9, 10] as const).map(section => [section, Object.fromEntries(importedScreens[section].fields.filter(field => !field.hidden && !field.readOnly).map(field => [field.key, field.numericKind === 'decimal' ? '1' : '0']))])) } }
  expect(mockValidationOverview(completed, 'Bergen').passedNumericChecks).toBe(382)
  expect(mockValidationOverview(completed, 'Bergen').findings.every(finding => finding.kind === 'unsupported')).toBe(true)
  expect(canSubmitMock(completed, 'Bergen')).toBe(false)
})

test('event handlers enforce current access, effective-role flags and workflow status', () => {
  const user = demoUsers.find(user => user.id === 'demo-owner-central')!
  const central = schools.find(school => school.id === '17')!
  const context = { enabled: true, user, school: central }
  expect(saveImportedNumber(context, 3, boys, '5')).toBe(true)
  expect(saveImportedNumber(context, 3, total, '99')).toBe(false)
  expect(readImportedReport(mockSkjemaStatusId(central)).numbers[3][boys]).toBe('5')
  expect(saveImportedNumber({ ...context, school: { ...central, isKommunesentralt: false } }, 3, boys, '8')).toBe(false)
  expect(saveImportedNumber({ ...context, school: { ...central, statusId: 2 } }, 3, boys, '8')).toBe(false)
  expect(saveImportedNumber({ ...context, school: { ...central, id: 'no-access' } }, 3, boys, '8')).toBe(false)
  expect(performMockAction(context, 'submit')).toBeNull()
  const regular = schools.find(school => school.id === '1')!
  expect(actionTarget({ ...context, school: { ...regular, statusId: 2 } }, 'approve')).toBe(4)
  expect(performMockAction({ ...context, school: { ...regular, statusId: 2 } }, 'approve')).toBe(4)
  expect(performMockAction({ ...context, school: regular }, 'approve')).toBeNull()
  expect(performMockAction({ ...context, enabled: false, school: { ...regular, statusId: 2 } }, 'approve')).toBeNull()
  const county = demoUsers.find(user => user.roleId === 11)!
  expect(performMockAction({ enabled: true, user: county, school: { ...regular, statusId: 4 } }, 'approve')).toBe(6)
  expect(performMockAction({ enabled: true, user: county, school: { ...regular, statusId: 4 } }, 'reject')).toBe(5)
  expect(performMockAction({ ...context, school: { ...regular, statusId: 2 } }, 'reject')).toBe(3)
})

test('numeric grids calculate and retain data, municipalities and school isolation through navigation', async ({ page }) => {
  await page.goto('./'); await open(page); await section(page, 'Elever og timer')
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(7)
  await expect(page.locator('.imported-number[data-field]')).toHaveCount(70)
  const pupils = page.getByRole('table', { name: 'A. Elever per trinn', exact: true })
  await expect(pupils.locator('tbody .imported-question-number')).toHaveText(['1','2','3','4','5','6','7','8','9','10','11','12','13'])
  await expect(pupils.getByRole('columnheader')).toHaveText(['Nr.', 'Spørsmål', 'Gutter', 'Jenter', 'Sum'])
  await expect(page.locator('.question-validation')).toHaveCount(0)
  await expect(input(page, total)).toHaveCSS('background-color', 'rgb(217, 221, 227)')
  const firstSection = (await page.locator('.imported-question').nth(0).boundingBox())!
  const secondSection = (await page.locator('.imported-question').nth(1).boundingBox())!
  expect(secondSection.y - firstSection.y - firstSection.height).toBeGreaterThanOrEqual(20)
  expect(secondSection.y - firstSection.y - firstSection.height).toBeLessThanOrEqual(24)
  await input(page, boys).fill('17'); await input(page, girls).fill('19')
  await page.screenshot({ path: 'artifacts/imported-del3.png' })
  await expect(input(page, total)).toHaveValue('36'); await expect(input(page, total)).toHaveAttribute('readonly', '')
  await input(page, girls).fill('-1'); await expect(input(page, girls)).toHaveAttribute('aria-invalid', 'true')
  await input(page, girls).press('Tab')
  await expect(page.locator('.imported-cell-error')).toBeVisible()
  await input(page, girls).fill('19')
  await page.getByRole('button', { name: 'Legg til kommune', exact: true }).click()
  const row = page.getByRole('row', { name: 'Finansierende kommune 1', exact: true })
  await expect(row.getByRole('combobox')).not.toContainText('Bergen')
  await row.getByRole('combobox').selectOption('Oslo'); await row.getByRole('textbox').fill('3')
  await expect(page.getByRole('textbox', { name: 'Sum finansierte elever', exact: true })).toHaveValue('3')
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expect(page.getByRole('heading', { name: '4. Årstimer', exact: true })).toBeVisible()
  await expect(page.locator('.imported-number')).toHaveCount(112)
  await expect(page.locator('.imported-number[readonly]')).toHaveCount(53)
  await expect(page.getByRole('main')).not.toContainText(/GG[_-]|Lokal mock-up/)
  await input(page, 'GG_70_Antall_timer_undervisning_trinn1_4').fill('100')
  await input(page, 'GG_71_Antall_Timer_Undervisning_Trinn5_7').fill('200')
  await expect(input(page, 'GG_73_Antall_Timer_Undervisning_Sum1_10')).toHaveValue('300')
  await page.screenshot({ path: 'artifacts/imported-del4.png' })
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expect(input(page, boys)).toHaveValue('17')
  await expect(row.getByRole('combobox')).toHaveValue('Oslo')
  await menu(page).getByRole('button', { name: 'Hjem', exact: true }).click()
  await open(page, 'Bergen kommune sentralt'); await section(page, 'Elever og timer')
  await expect(page.getByRole('main').getByText('Ingen tilgang', { exact: true })).toBeVisible()
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-owner-central')
  await expect(input(page, boys)).toHaveValue('')
  await expect(input(page, boys)).toBeEnabled()
  await page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true }).selectOption('2')
  await expect(input(page, boys)).toBeDisabled()
  await page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true }).selectOption('1')
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-udir-support')
  await expect(input(page, boys)).toBeDisabled()
})

test('controllers are explicit, comments persist, finishing requires completeness and approvals confirm', async ({ page }) => {
  await page.goto('./'); await open(page); await section(page, 'Kontroller')
  await expect(page.getByText('Kontroll er ikke kjørt.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Kontroller skjema', exact: true }).click()
  const control = page.locator('[data-controller="GG-A145"]')
  await expect(control).toContainText('Ikke vurdert')
  await control.getByRole('textbox').fill('Kildeformel mangler')
  await control.getByRole('button', { name: 'Gå til del 3', exact: true }).click()
  await expect(page.getByRole('heading', { name: '3. Elever og timer', exact: true })).toBeVisible()
  await section(page, 'Kontroller'); await expect(control.getByRole('textbox')).toHaveValue('Kildeformel mangler')
  await section(page, 'Fullfør')
  await expect(page.getByRole('button', { name: 'Lever skjema', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Bruk mine demoopplysninger', exact: true }).click()
  await expect(page.getByText('ada.fjord@example.com', { exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Skolens merknader', exact: true }).fill('Lokal merknad')
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-owner-noncentral')
  await page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true }).selectOption('2')
  await expect(page.getByRole('textbox', { name: 'Skolens merknader', exact: true })).toBeDisabled()
  await page.getByRole('textbox', { name: 'Kommunens merknader', exact: true }).fill('Kontrollert lokalt')
  await page.getByRole('button', { name: 'Godkjenn', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Avbryt', exact: true }).click()
  await expect(page.getByLabel('Skjemastatus: Fullført av enheten', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Godkjenn', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Bekreft', exact: true }).click()
  await expect(page.getByLabel('Skjemastatus: Godkjent av kommunen', { exact: true })).toBeVisible()
  await expect(page.getByText('Handlingen er simulert lokalt. Ingen data er sendt til BOGIAPI.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expect(page.getByRole('heading', { name: '17. Kontroller', exact: true })).toBeVisible()
})

test('imported screens support locale switching, responsive layout and targeted accessibility', async ({ page }) => {
  await page.goto('./'); await open(page)
  for (const name of ['Elever og timer', 'Årstimer', 'Kontroller', 'Fullfør']) {
    await section(page, name)
    await expect(page.getByRole('main').getByRole('group', { name: 'Språk', exact: true })).toHaveCount(0)
    await expect(page.getByRole('main')).not.toContainText(/GG[_-]|Lokal mock-up|nfViewSprak/)
    const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
    expect(results.violations).toEqual([])
  }
  await menu(page).getByRole('button', { name: 'Hjem', exact: true }).click()
  await page.getByRole('button', { name: 'Nynorsk', exact: true }).click()
  await page.getByRole('button', { name: 'Opne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringa', exact: true }).click()
  await menu(page).getByRole('button', { name: 'Elevar og timar', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang','nn')
  await expect(page.getByRole('heading', { name: '3. Elevar og timar', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  const overflow = await page.evaluate(() => ({
    width: window.innerWidth, scroll: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll('body *')].filter(element => {
      const box = element.getBoundingClientRect()
      return box.width > 0 && box.right > window.innerWidth + 1 && !element.closest('.imported-grid-scroll')
    }).map(element => ({ tag: element.tagName, class: element.className, width: element.getBoundingClientRect().width, right: element.getBoundingClientRect().right })).slice(0, 15),
  }))
  expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width)
  for (const name of ['Årstimar', 'Kontroller', 'Fullfør']) {
    await page.getByRole('button', { name: 'Vis navigasjon', exact: true }).click()
    await menu(page).getByRole('button', { name, exact: true }).click()
    await expect(page.getByRole('main').getByRole('group', { name: 'Språk', exact: true })).toHaveCount(0)
    await expect(page.getByRole('main')).not.toContainText(/GG[_-]|Lokal mock-up/)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    if (name === 'Årstimar') await page.screenshot({ path: 'artifacts/imported-del4-mobile.png' })
  }
})
