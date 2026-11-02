import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { demoUsers } from '../src/demoUser'
import { schools } from '../src/mockData'
import { getEffectiveDemoRoleId, getDemoReportPermissions } from '../src/domain/demoPermissions'

test('matrix covers every category/status with access and fails closed without access', () => {
  const report = schools.find(school => school.id === '1')!
  for (const [loginRole, centralUnit] of [[9, false], [10, true], [10, false], [11, false], [12, false], [13, false]] as const) {
    const profile = demoUsers.find(user => user.roleId === loginRole)!
    const category = centralUnit ? 9 : loginRole
    const school = { ...report, isKommunesentralt: centralUnit }
    for (let statusId = 0; statusId <= 8; statusId++) {
      const editingRole = category === 9
      const edit = editingRole && [0, 1, 3, 5, 7].includes(statusId)
      const submit = editingRole && [0, 1, 3, 5].includes(statusId)
      const approve = (category === 10 && statusId === 2) || (category === 11 && statusId === 4)
      const reject = category === 12 || (category === 10 && [2, 5, 7].includes(statusId)) || (category === 11 && [2, 4, 7].includes(statusId))
      const context = { enabled: true, user: profile, school: { ...school, statusId } }
      expect(Object.values(getDemoReportPermissions(context)), String(category) + '/' + statusId).toEqual([true, edit, submit, approve, reject])
      expect(Object.values(getDemoReportPermissions({ ...context, enabled: false }))).toEqual([false, false, false, false, false])
      expect(Object.values(getDemoReportPermissions({ ...context, school: { ...context.school, id: 'no-access' } }))).toEqual([false, false, false, false, false])
    }
  }
  const central = demoUsers.find(user => user.id === 'demo-owner-central')!
  const ordinary = demoUsers.find(user => user.id === 'demo-owner-noncentral')!
  expect(getEffectiveDemoRoleId(central, report)).toBe(10)
  expect(getEffectiveDemoRoleId(ordinary, { ...report, name: 'Ordinary name', isKommunesentralt: true })).toBe(9)
  expect(getEffectiveDemoRoleId(central, { ...report, name: 'OSLO KOMMUNE SENTRALT', isKommunesentralt: false })).toBe(10)
  expect(getEffectiveDemoRoleId(demoUsers[0], { ...report, isKommunesentralt: true })).toBe(9)
  expect(central.roleId).toBe(10)
  for (const user of demoUsers) {
    expect(getEffectiveDemoRoleId(user, { ...report, isKommunesentralt: true }))
      .toBe(user.roleId === 10 ? 9 : user.roleId)
    expect(getEffectiveDemoRoleId(user, { ...report, isKommunesentralt: false })).toBe(user.roleId)
  }
  for (const statusId of [undefined, null, -1, 9, 1.5, NaN]) {
    expect(Object.values(getDemoReportPermissions({ enabled: true, user: central, school: { ...report, statusId } }))).toEqual([false, false, false, false, false])
  }
  expect(Object.values(getDemoReportPermissions({ enabled: true, user: null, school: report }))).toEqual([false, false, false, false, false])
})

test('unit flag controls permissions even when names disagree, without changing the login role', async ({ page }) => {
  // Isolated BOGIAPI-like response fixture: intentionally contradictory names.
  await page.route('**/src/mockData.ts', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export const schools = ${JSON.stringify(schools.map(school => school.id === '1'
      ? { ...school, isKommunesentralt: true }
      : school.id === '17' ? { ...school, isKommunesentralt: false } : school))};`,
  }))
  await page.goto('./')
  const user = page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
  await user.selectOption('demo-owner-central')
  const badges = page.getByRole('group', { name: 'Demotilganger', exact: true }).locator('.demo-permission-badge')
  for (const [name, expected] of [
    ['Fjordgløtt barneskole', ['Lese', 'Redigere', 'Levere']],
    ['Bergen kommune sentralt', ['Lese']],
    ['Fjordgløtt barneskole', ['Lese', 'Redigere', 'Levere']],
  ] as const) {
    await page.getByRole('button', { name: `Åpne skjema for ${name}, 2026`, exact: true }).click()
    await expect(badges).toHaveText([...expected])
    await expect(user).toHaveValue('demo-owner-central')
    await page.getByText('Demokontekst', { exact: true }).click()
    await expect(page.getByRole('region', { name: 'Brukerinformasjon (demonstrasjon)', exact: true }))
      .toContainText('Skoleeier, kommune sentralt (RolleId 10)')
    await page.getByText('Demokontekst', { exact: true }).click()
    await page.getByRole('button', { name: 'Tilbake til statusoversikten', exact: true }).click()
  }
})

test('header reflects user, status, access and school changes; badges are accessible and compact', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  const schoolHeader = page.getByRole('region', { name: 'Valgt skole', exact: true })
  const indicator = schoolHeader.getByRole('group', { name: 'Demotilganger', exact: true })
  const badges = indicator.locator('.demo-permission-badge')
  const user = page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
  const status = page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true })
  await expect(badges).toHaveText(['Lese', 'Redigere', 'Levere'])
  const heights = await schoolHeader.evaluate(header => {
    const indicator = header.querySelector<HTMLElement>('.demo-permission-indicator')!
    const withIndicator = header.getBoundingClientRect().height
    indicator.style.display = 'none'
    const withoutIndicator = header.getBoundingClientRect().height
    indicator.style.removeProperty('display')
    return { withIndicator, withoutIndicator }
  })
  expect(heights.withIndicator).toBe(heights.withoutIndicator)
  const statusBox = (await schoolHeader.getByLabel('Skjemastatus: Under behandling', { exact: true }).boundingBox())!
  const indicatorBox = (await indicator.boundingBox())!
  expect(indicatorBox.y).toBeGreaterThanOrEqual(statusBox.y + statusBox.height)
  expect(indicatorBox.x + indicatorBox.width).toBeCloseTo(statusBox.x + statusBox.width, 1)
  for (const statusId of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
    await status.selectOption(String(statusId))
    const labels = [0, 1, 3, 5].includes(statusId) ? ['Lese', 'Redigere', 'Levere'] : statusId === 7 ? ['Lese', 'Redigere'] : ['Lese']
    await expect(badges).toHaveText(labels)
  }
  await status.selectOption('1')
  await user.selectOption('demo-owner-central')
  await expect(badges).toHaveText(['Lese'])
  await status.selectOption('2')
  await expect(badges).toHaveText(['Lese', 'Godkjenne', 'Avvise'])
  await user.selectOption('demo-owner-noncentral')
  await expect(badges).toHaveText(['Lese', 'Godkjenne', 'Avvise'])
  await user.selectOption('demo-udir-support')
  await expect(badges).toHaveText(['Lese'])
  await status.selectOption('1')
  await expect(badges).toHaveText(['Lese'])
  await expect(indicator.getByRole('button')).toHaveCount(0)
  const audit = await new AxeBuilder({ page }).include('.school-info-bar').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(audit.violations).toEqual([])
  await page.getByRole('button', { name: 'Tilbake til statusoversikten', exact: true }).click()
  await user.selectOption('demo-owner-central')
  await page.getByRole('button', { name: 'Åpne skjema for Oslo kommune sentralt, 2026', exact: true }).click()
  await expect(badges).toHaveText(['Ingen tilgang'])
  await page.getByRole('button', { name: 'Tilbake til statusoversikten', exact: true }).click()
  await page.getByRole('button', { name: 'Åpne skjema for Bergen kommune sentralt, 2026', exact: true }).click()
  await expect(badges).toHaveText(['Lese', 'Redigere', 'Levere'])
  await expect(user).toHaveValue('demo-owner-central')
  await page.getByText('Demokontekst', { exact: true }).click()
  await expect(page.getByRole('region', { name: 'Brukerinformasjon (demonstrasjon)', exact: true }))
    .toContainText('Skoleeier, kommune sentralt (RolleId 10)')
  await page.getByText('Demokontekst', { exact: true }).click()
  await page.getByRole('button', { name: 'Tilbake til statusoversikten', exact: true }).click()
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await expect(badges).toHaveText(['Lese'])
  await expect(user).toHaveValue('demo-owner-central')
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(indicator).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
