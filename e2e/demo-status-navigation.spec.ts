import { expect, test, type Page } from '@playwright/test'

const status = (page: Page) => page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true })
const user = (page: Page) => page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
const reset = (page: Page) => page.getByRole('button', { name: 'Tilbakestill status', exact: true })

async function expectSchoolStatus(page: Page, name: string, id: string, label: string) {
  await expect(status(page)).toBeEnabled()
  await expect(status(page)).toHaveValue(id)
  const schoolBar = page.getByRole('region', { name: 'Valgt skole', exact: true })
  await expect(schoolBar).toContainText(name)
  await expect(schoolBar.getByLabel(`Skjemastatus: ${label}`, { exact: true })).toBeVisible()
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

test('choosing a demo user does not choose their assigned school', async ({ page }) => {
  await page.goto('./')
  for (const id of ['demo-owner-central', 'demo-school-leader']) {
    await user(page).selectOption(id)
    await expect(status(page)).toBeDisabled()
    await expect(status(page)).toHaveValue('')
    await expect(status(page).getByRole('option', { name: 'Velg en skole', exact: true })).toHaveCount(1)
    await expect(page.getByRole('table').getByRole('radio', { checked: true })).toHaveCount(0)
  }
})

test('opening a report directly enables status through Innledning, Del 1, Del 2 and later sections', async ({ page }) => {
  await page.goto('./')
  await expect(status(page)).toBeDisabled()
  // Do not select an overview radio first: opening the form must resolve its school.
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '1', 'Under behandling')
  await status(page).selectOption('2')
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '2', 'Fullført av enheten')

  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  await expect(page.getByRole('heading', { name: '1. Enhetsopplysninger', exact: true })).toBeVisible()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '2', 'Fullført av enheten')
  await status(page).selectOption('0')
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '0', 'Ikke påbegynt')
  await expect(page.getByRole('main').getByRole('radio')).toHaveCount(0)
  await expect(page.getByRole('main').getByRole('combobox')).toHaveCount(0)

  // Use both section navigation and previous/next buttons in this regression.
  await page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true })
    .getByRole('button', { name: 'Om skolen', exact: true }).click()
  await expect(page.getByRole('heading', { name: '2. Om skolen', exact: true })).toBeVisible()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '0', 'Ikke påbegynt')
  await expectEditing(page, false)
  await status(page).selectOption('1')
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '1', 'Under behandling')
  await expectEditing(page, true)
  const answer = page.getByRole('group', { name: 'A. Skolens målform', exact: true })
    .getByRole('radio', { name: 'Nynorsk', exact: true })
  await answer.check()
  await expect(page.getByRole('region', { name: 'A. Skolens målform', exact: true }).getByRole('status')).toHaveText('Lagret')
  await status(page).selectOption('8')
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '8', 'Inaktiv')
  await expectEditing(page, false)
  await expect(answer).toBeChecked()

  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expect(page.getByRole('heading', { name: '3. Elever og timer', exact: true })).toBeVisible()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '8', 'Inaktiv')
  await status(page).selectOption('2')
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '2', 'Fullført av enheten')
  await expectEditing(page, false)
  await expect(answer).toBeChecked()
  await reset(page).click()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '1', 'Under behandling')
  await expectEditing(page, true)
  await expect(reset(page)).toBeDisabled()
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '1', 'Under behandling')
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '1', 'Under behandling')
})

test('the active report uses its own original zero status, independently of the assigned user school', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Åpne skjema for Nordmyra barneskole, 2026', exact: true }).click()
  await expectSchoolStatus(page, 'Nordmyra barneskole', '0', 'Ikke påbegynt')
  await user(page).selectOption('demo-owner-central')
  await expectSchoolStatus(page, 'Nordmyra barneskole', '0', 'Ikke påbegynt')
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  await expectSchoolStatus(page, 'Nordmyra barneskole', '0', 'Ikke påbegynt')
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expectEditing(page, false)
  await status(page).selectOption('1')
  await expectSchoolStatus(page, 'Nordmyra barneskole', '1', 'Under behandling')
  // The role can edit other reports, but has no explicit access to Nordmyra.
  await expectEditing(page, false)
  await reset(page).click()
  await expectSchoolStatus(page, 'Nordmyra barneskole', '0', 'Ikke påbegynt')
})

test('opening a previous-year report resolves that report through every reporting section', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Rapporteringsår', exact: true }).selectOption('2025')
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2025', exact: true }).click()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '4', 'Godkjent av kommunen')
  await status(page).selectOption('1')
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  const sections = ['Enhetsopplysninger', 'Om skolen', 'Elever og timer', 'Årstimer', 'Årsverk og ansatte',
    'Lærere og assistenter', 'Spesialundervisning', 'Særskilt språkopplæring', 'Opplæringsspråk']
  for (const section of sections) {
    await page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true })
      .getByRole('button', { name: section, exact: true }).click()
    await expectSchoolStatus(page, 'Fjordgløtt barneskole', '1', 'Under behandling')
    await expect(page.getByRole('region', { name: 'Valgt skole', exact: true })).toContainText('2025')
  }
  await reset(page).click()
  await expectSchoolStatus(page, 'Fjordgløtt barneskole', '4', 'Godkjent av kommunen')
})
