import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { gradeApplicability, resolveFieldState } from '../src/domain/fieldState'
import { calculateValues, isBlockingFinding, sectionFindings } from '../src/domain/importedReporting'
import { readImportedReport, saveImportedNumber } from '../src/services/importedReportService'
import { patchMockSection, mockSkjemaStatusId } from '../src/services/grunnskoleApi'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'

const boys = [1,4,7,10,13,16,19,25,28,31].map((id, index) => `GG_${id}_Antall_Elever_Trinn${index + 1}_Gutter`)
const girls1 = 'GG_2_Antall_Elever_Trinn1_Jenter'
const total = 'GG_39_Antall_Elever_Sum_EleverTotalt'
const cell = (page: Page, key: string) => page.locator(`input[data-field="${key}"]`)
const nav = (page: Page) => page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true })
const section3 = (page: Page) => nav(page).getByRole('button', { name: 'Elever og timer', exact: true })
const badge3 = (page: Page) => section3(page).locator('.section-issue-badge')
const answers = { [boys[0]]: '10', [girls1]: '5', [boys[1]]: '7', [boys[6]]: '9', [boys[7]]: '11' }
const grades = (lo: number, hi: number) => ({ GG_227_Skolens_Maalform: 'Bokmål', GG_228_Laveste_Trinn_Paa_Skolen: lo, GG_229_Hoeyeste_Trinn_Paa_Skolen: hi, GG_230_Tilbyr_SFO: false })
async function seed(page: Page, lo: number, hi: number) {
  await page.route('**/src/services/grunnskoleApi.ts*', async route => {
    const response = await route.fetch()
    const fixture = ['1', '17'].map(id => `patchMockSection('demo:${id}:2026',2,${JSON.stringify(grades(lo, hi))});patchMockSection('demo:${id}:2026',3,${JSON.stringify(answers)});`).join('\n')
    await route.fulfill({ response, body: (await response.text()) + '\n' + fixture })
  })
}
async function open(page: Page, user = 'demo-school-leader', name = 'Fjordgløtt barneskole') {
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption(user)
  await page.getByRole('button', { name: `Åpne skjema for ${name}, 2026`, exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
  await section3(page).click()
}

test('shared states separate permissions, applicability, calculations and blocking errors', () => {
  expect(resolveFieldState({ canEdit: true }).kind).toBe('editable')
  expect(resolveFieldState({ canEdit: false }).kind).toBe('permission-readonly')
  expect(resolveFieldState({ canEdit: false, calculated: true })).toMatchObject({ kind: 'calculated', readOnly: true, disabled: false, editable: false })
  expect(resolveFieldState({ canEdit: true, applicable: false, error: 'invalid' })).toMatchObject({ kind: 'business-disabled', disabled: true, editable: false, invalid: false })
  expect(resolveFieldState({ canEdit: true, error: 'invalid' }).invalid).toBe(true)
  expect(isBlockingFinding({ id: 'w', section: 3, kind: 'warning', message: '' })).toBe(false)
  expect(isBlockingFinding({ id: 'w', section: 3, kind: 'warning', blocking: true, message: '' })).toBe(true)
  const report = { ...readImportedReport('test:grades:2026'), del2: grades(2,6), numbers: { 3: { ...answers, [boys[0]]: 'bad' }, 4: {} } }
  expect(sectionFindings(3, report, 'Bergen').filter(isBlockingFinding)).toEqual([])
  expect(calculateValues(3, report.numbers[3], report.del2)[total]).toBe(7)
  expect(report.numbers[3][boys[0]]).toBe('bad')
  expect(gradeApplicability('GG_70_Antall_timer_undervisning_trinn1_4', grades(8,10)).applicable).toBe(false)
  expect(gradeApplicability('GG_898_Sum_Samisk_Extra_Ressurser_Enkeltelev_Eller_Gruppe_1_7', grades(8,10)).applicable).toBe(false)
  const bandValues = calculateValues(4, { GG_70_Antall_timer_undervisning_trinn1_4: '100', GG_71_Antall_Timer_Undervisning_Trinn5_7: '200', GG_72_Antall_Timer_Undervisning_Trinn8_10: '50' }, grades(8,10))
  expect(bandValues.GG_73_Antall_Timer_Undervisning_Sum1_10).toBe(50)
  const school = schools.find(item => item.id === '1')!
  const key = mockSkjemaStatusId(school)
  patchMockSection(key, 2, grades(2,6)); patchMockSection(key, 3, answers)
  expect(saveImportedNumber({ enabled: true, user: demoUsers[0], school }, 3, boys[0], '999')).toBe(false)
  expect(readImportedReport(key).numbers[3][boys[0]]).toBe('10')
})

const scenarios = [
  { lo: 1, hi: 10, user: 'demo-school-leader', name: 'Fjordgløtt barneskole', sum: 42 },
  { lo: 1, hi: 7, user: 'demo-school-leader', name: 'Fjordgløtt barneskole', sum: 31 },
  { lo: 2, hi: 6, user: 'demo-school-leader', name: 'Fjordgløtt barneskole', sum: 7 },
  { lo: 2, hi: 6, user: 'demo-udir-support', name: 'Fjordgløtt barneskole', sum: 7 },
  { lo: 1, hi: 7, user: 'demo-owner-central', name: 'Bergen kommune sentralt', sum: 31 },
  { lo: 2, hi: 6, user: 'demo-owner-central', name: 'Bergen kommune sentralt', sum: 7 },
]
for (const scenario of scenarios) {
  test(`grades ${scenario.lo}–${scenario.hi}, ${scenario.user}: states, totals and explicit access`, async ({ page }) => {
    await seed(page, scenario.lo, scenario.hi); await open(page, scenario.user, scenario.name)
    const readonly = scenario.user === 'demo-udir-support'
    for (let grade = 1; grade <= 10; grade++) {
      const field = cell(page, boys[grade - 1])
      const excluded = grade < scenario.lo || grade > scenario.hi
      await expect(field).toHaveAttribute('data-field-state', excluded ? 'business-disabled' : readonly ? 'permission-readonly' : 'editable')
      if (excluded || readonly) await expect(field).toBeDisabled()
      else { await expect(field).toBeEnabled(); await expect(field).toHaveCSS('background-color', answers[boys[grade - 1] as keyof typeof answers] !== undefined ? 'rgb(241, 243, 245)' : 'rgb(255, 255, 255)') }
      if (excluded) {
        await expect(field).toHaveCSS('background-color', 'rgb(248, 231, 224)')
        await expect(field).toHaveCSS('border-top-color', 'rgb(217, 165, 143)')
        await expect(field).toHaveAccessibleDescription(/del 2 B og C/)
      }
    }
    await expect(cell(page, total)).toHaveValue(String(scenario.sum))
    await expect(cell(page, total)).toHaveAttribute('readonly', '')
    await expect(cell(page, total)).toHaveCSS('background-color', 'rgb(217, 221, 227)')
    await expect(badge3(page)).toHaveCount(0) // Unanswered optional/unknown-required fields are warnings.
    await expect(cell(page, boys[0])).toHaveValue('10')
    if (scenario.lo === 2 && !readonly) {
      const lock = cell(page, boys[0]).locator('..').getByRole('button')
      await lock.focus()
      await expect(page.getByRole('tooltip')).toContainText('2–6')
      await expect(lock).toHaveAccessibleDescription(/del 2 B og C/)
      await lock.press('Escape'); await expect(page.getByRole('tooltip')).toHaveCount(0)
      const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
      expect(results.violations).toEqual([])
    }
    if (!readonly) {
      await cell(page, boys[2]).fill('4')
      await expect(cell(page, total)).toHaveValue(String(scenario.sum + 4))
    }
    if (scenario.lo === 2 && scenario.user === 'demo-school-leader') await page.screenshot({ path: 'artifacts/field-states-grades-2-6.png' })
  })
}

test('active badges react to corrections, validation, grade changes and preserved excluded values', async ({ page }) => {
  await seed(page, 2,6); await open(page)
  await cell(page, boys[5]).fill('bad')
  await expect(badge3(page)).toHaveText('1')
  await expect(cell(page, boys[5])).toHaveAttribute('aria-invalid', 'true')
  await expect(cell(page, boys[5])).toHaveCSS('border-top-color', 'rgb(146, 45, 45)')
  await nav(page).getByRole('button', { name: 'Årstimer', exact: true }).click()
  await expect(badge3(page)).toHaveText('1')
  await section3(page).click(); await expect(badge3(page)).toHaveText('1')
  await nav(page).getByRole('button', { name: 'Kontroller', exact: true }).click()
  await page.getByRole('button', { name: 'Kontroller skjema', exact: true }).click()
  await section3(page).click(); await expect(page.locator('.imported-cell-error')).toBeVisible()
  async function changeUpper(value: string) {
    await nav(page).getByRole('button', { name: 'Om skolen', exact: true }).click()
    await page.getByRole('combobox', { name: 'C. Hva er normalt høyeste trinn ved skolen?', exact: true }).selectOption(value)
    await expect(page.getByRole('region', { name: 'C. Hva er normalt høyeste trinn ved skolen?', exact: true }).getByRole('status')).toHaveText('Lagret')
    await section3(page).click()
  }
  await changeUpper('5')
  await expect(cell(page, boys[5])).toBeDisabled(); await expect(cell(page, boys[5])).toHaveValue('bad')
  await expect(badge3(page)).toHaveCount(0); await expect(cell(page, total)).toHaveValue('7')
  await changeUpper('6'); await expect(badge3(page)).toHaveText('1')
  await cell(page, boys[5]).fill('2'); await expect(badge3(page)).toHaveCount(0)
  await expect(cell(page, total)).toHaveValue('9')
  await expect(section3(page)).toHaveAttribute('aria-current', 'page')
})

test('read-only unanswered fields and dependent disabled counts do not create required errors', async ({ page }) => {
  await open(page, 'demo-udir-support')
  await expect(nav(page).locator('.section-issue-badge')).toHaveCount(0)
  await nav(page).getByRole('button', { name: 'Om skolen', exact: true }).click()
  await expect(page.getByText('Velg et svar. (Demonstrasjonsvalidering)', { exact: true })).toHaveCount(0)
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-school-leader')
  await expect(nav(page).getByRole('button', { name: 'Om skolen', exact: true }).locator('.section-issue-badge')).toHaveText('4')
  await section3(page).click(); await page.getByRole('button', { name: 'Legg til kommune', exact: true }).click()
  const row = page.getByRole('row', { name: 'Finansierende kommune 1', exact: true })
  await expect(row.getByRole('textbox')).toBeDisabled()
  await expect(badge3(page)).toHaveText('1') // Missing municipality, not the dependent disabled count.
  await row.getByRole('button', { name: /Hvorfor er feltet utilgjengelig/ }).focus()
  await expect(page.getByRole('tooltip')).toContainText('del 3 E')
  await row.getByRole('combobox').selectOption('Oslo')
  await expect(row.getByRole('textbox')).toBeEnabled(); await expect(badge3(page)).toHaveText('1')
  await row.getByRole('textbox').fill('-1')
  await expect(row.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  await expect(row.locator('.imported-cell-error')).toBeVisible()
  await row.getByRole('textbox').fill('0'); await expect(badge3(page)).toHaveCount(0)
})
