import { expect, test, type Page } from '@playwright/test'

// Requirements fixtures: do not calculate expectations from the UI status model.
const statuses = [
  'Ikke påbegynt', 'Under behandling', 'Fullført av enheten',
  'Ikke godkjent av kommunen', 'Godkjent av kommunen',
  'Ikke godkjent av statsforvalter', 'Godkjent av statsforvalter',
  'Korrigert av UDIR', 'Inaktiv',
]
const statusSelector = (page: Page) => page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true })
const userSelector = (page: Page) => page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
const reset = (page: Page) => page.getByRole('button', { name: 'Tilbakestill status', exact: true })
const languageCard = (page: Page) => page.getByRole('region', { name: 'A. Skolens målform', exact: true })

async function openReport(page: Page, name = 'Fjordgløtt barneskole', year = 2026) {
  await page.getByRole('button', { name: `Åpne skjema for ${name}, ${year}`, exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
}

async function enterDel2(page: Page) {
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expect(languageCard(page)).toBeVisible()
}

async function expectEditing(page: Page, allowed: boolean) {
  const main = page.getByRole('main')
  await expect(main.getByRole('radio')).toHaveCount(6)
  await expect(main.getByRole('combobox')).toHaveCount(2)
  for (const control of [...await main.getByRole('radio').all(), ...await main.getByRole('combobox').all()]) {
    if (allowed) await expect(control).toBeEnabled()
    else await expect(control).toBeDisabled()
  }
}

async function expectStatus(page: Page, id: number) {
  await expect(statusSelector(page)).toHaveValue(String(id))
  const contextBar = page.getByRole('region', { name: 'Valgt skole', exact: true })
  await expect(contextBar.getByLabel(`Skjemastatus: ${statuses[id]}`, { exact: true })).toBeVisible()
}

for (const [id, label] of statuses.entries()) {
  test(`demo status ${id} ${label} immediately updates badge and edit permission`, async ({ page }) => {
    await page.goto('./')
    await expect(statusSelector(page)).toBeDisabled()
    await expect(reset(page)).toBeDisabled()
    await openReport(page)
    await expectStatus(page, 1)
    await expect(statusSelector(page).getByRole('option')).toHaveText(statuses.map((text, index) => `${index} ${text}`))
    await expect(reset(page)).toBeDisabled()
    await enterDel2(page)
    // Start from a different status so status 1 also tests a live transition.
    await statusSelector(page).selectOption(id === 1 ? '2' : '1')
    await statusSelector(page).selectOption(String(id))
    await expectStatus(page, id)
    await expectEditing(page, id === 1)
    await expect(reset(page)).toBeEnabled()
    await page.getByText('API Debug', { exact: true }).click()
    await expect(page.getByText('Ingen lagringskall ennå.', { exact: true })).toBeVisible()
  })
}

const profiles = [
  { id: 'demo-school-leader', allowed: true },
  { id: 'demo-owner-central', allowed: true },
  { id: 'demo-owner-noncentral', allowed: false },
  { id: 'demo-county', allowed: false },
  { id: 'demo-udir-admin', allowed: false },
  { id: 'demo-udir-support', allowed: false },
]
for (const profile of profiles) {
  test(`status override grants editing only with the required role: ${profile.id}`, async ({ page }) => {
    await page.goto('./')
    await openReport(page)
    await enterDel2(page)
    await statusSelector(page).selectOption('8')
    await userSelector(page).selectOption(profile.id)
    await expectStatus(page, 8)
    await expectEditing(page, false)
    await statusSelector(page).selectOption('1')
    await expectStatus(page, 1)
    await expectEditing(page, profile.allowed)
  })
}

for (const user of ['demo-school-leader', 'demo-owner-central']) {
  test(`status 1 override does not bypass school access for ${user}`, async ({ page }) => {
    await page.goto('./')
    await userSelector(page).selectOption(user)
    await openReport(page, 'Bjørkelia ungdomsskole')
    await expectStatus(page, 2)
    await enterDel2(page)
    await statusSelector(page).selectOption('1')
    await expectStatus(page, 1)
    await expectEditing(page, false)
  })
}

test('reset restores the original status and editing permission without changing saved answers', async ({ page }) => {
  await page.goto('./')
  await userSelector(page).selectOption('demo-owner-central')
  // Vestlia's actual status is 2; this user has explicit access to it.
  await openReport(page, 'Vestlia ungdomsskole')
  await expectStatus(page, 2)
  await enterDel2(page)
  await expectEditing(page, false)
  await statusSelector(page).selectOption('1')
  await expectEditing(page, true)
  const answer = languageCard(page).getByRole('radio', { name: 'Nynorsk', exact: true })
  await answer.check()
  await expect(languageCard(page).getByRole('status')).toHaveText('Lagret')
  await reset(page).click()
  await expectStatus(page, 2)
  await expectEditing(page, false)
  await expect(answer).toBeChecked()
  await expect(reset(page)).toBeDisabled()
  await page.getByText('API Debug', { exact: true }).click()
  await expect(page.getByRole('main').locator('pre')).toHaveCount(1)
})

test('overrides stay scoped to each school and year, survive navigation, and reset on reload', async ({ page }) => {
  await page.goto('./')
  await openReport(page)
  await statusSelector(page).selectOption('8')
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  const fjordRow = page.getByRole('table').getByRole('row').filter({
    has: page.getByRole('rowheader', { name: 'Fjordgløtt barneskole', exact: true }),
  })
  await expect(fjordRow.getByLabel('Skjemastatus: Inaktiv', { exact: true })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Status for filtrerte skoler', exact: true })
    .getByRole('listitem').filter({ has: page.getByLabel('Skjemastatus: Inaktiv', { exact: true }) })).toHaveText('Inaktiv1')
  await page.getByRole('combobox', { name: 'Skjemastatus', exact: true }).selectOption('8')
  await expect(page.getByRole('table').getByRole('rowheader')).toHaveText(['Fjordgløtt barneskole'])
  await page.getByRole('button', { name: 'Nullstill filtre', exact: true }).click()
  await openReport(page, 'Vestlia ungdomsskole')
  await expectStatus(page, 2)
  await expect(reset(page)).toBeDisabled()
  await statusSelector(page).selectOption('0')
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  await openReport(page)
  await expectStatus(page, 8)
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  await page.getByRole('combobox', { name: 'Rapporteringsår', exact: true }).selectOption('2025')
  await openReport(page, 'Fjordgløtt barneskole', 2025)
  await expectStatus(page, 4)
  await expect(reset(page)).toBeDisabled()
  await statusSelector(page).selectOption('7')
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  await page.getByRole('combobox', { name: 'Rapporteringsår', exact: true }).selectOption('2026')
  await openReport(page)
  await expectStatus(page, 8)
  await reset(page).click()
  await expectStatus(page, 1)
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  await openReport(page, 'Vestlia ungdomsskole')
  await expectStatus(page, 0)
  await page.reload()
  await expect(statusSelector(page)).toBeDisabled()
  await openReport(page, 'Vestlia ungdomsskole')
  await expectStatus(page, 2)
  await expect(reset(page)).toBeDisabled()
})

test('selecting an overview row enables status simulation before opening its report', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('radio', { name: 'Velg Fjordgløtt barneskole, 2026', exact: true }).check()
  await expect(statusSelector(page)).toHaveValue('1')
  await statusSelector(page).selectOption('0')
  await openReport(page)
  await expectStatus(page, 0)
  await enterDel2(page)
  await expectEditing(page, false)
  await reset(page).click()
  await expectStatus(page, 1)
  await expectEditing(page, true)
})
