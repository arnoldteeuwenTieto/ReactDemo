import { expect, test, type Page } from '@playwright/test'
import { schools } from '../src/mockData'

const selector = (page: Page) => page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
const language = (page: Page) => page.getByRole('group', { name: 'A. Skolens målform', exact: true })

async function openDel2(page: Page, name = 'Fjordgløtt barneskole') {
  await page.getByRole('button', { name: `Åpne skjema for ${name}, 2026`, exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  await expect(page.getByRole('heading', { name: '1. Enhetsopplysninger', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expect(language(page)).toBeVisible()
}

async function expectControls(page: Page, editable: boolean) {
  const main = page.getByRole('main')
  const radios = main.getByRole('radio')
  const selects = main.getByRole('combobox')
  await expect(radios).toHaveCount(6)
  await expect(selects).toHaveCount(2)
  for (const control of [...await radios.all(), ...await selects.all()]) {
    if (editable) await expect(control).toBeEnabled()
    else await expect(control).toBeDisabled()
  }
}

// Each profile has explicit access to report 1. Only the first two may edit.
// Expected permissions are requirements fixtures, not computed using the helper.
const profiles = [
  { id: 'demo-school-leader', label: 'role 9', editStatus1: true },
  { id: 'demo-owner-central', label: 'central role 10', editStatus1: true },
  { id: 'demo-owner-noncentral', label: 'non-central role 10', editStatus1: false },
  { id: 'demo-county', label: 'role 11', editStatus1: false },
  { id: 'demo-udir-admin', label: 'role 12', editStatus1: false },
  { id: 'demo-udir-support', label: 'role 13', editStatus1: false },
]

for (const profile of profiles) {
  for (const statusId of [1, 2]) {
    test(`${profile.label}, explicit school access, status ${statusId}`, async ({ page }) => {
      if (statusId === 2) {
        // Isolated browser module fixture: the actual mock data is unchanged.
        // This keeps report 1 accessible to each profile while varying only status.
        await page.route('**/src/mockData.ts', route => route.fulfill({
          contentType: 'application/javascript',
          body: `export const schools = ${JSON.stringify(schools.map(school => school.id === '1' ? { ...school, statusId: 2 } : school))};`,
        }))
      }
      await page.goto('./')
      await selector(page).selectOption(profile.id)
      await openDel2(page)
      await expect(page.getByRole('region', { name: 'Valgt skole', exact: true })
        .getByLabel(`Skjemastatus: ${statusId === 1 ? 'Under behandling' : 'Fullført av enheten'}`, { exact: true })).toBeVisible()
      const editable = statusId === 1 && profile.editStatus1
      await expectControls(page, editable)
      await page.getByText('API Debug', { exact: true }).click()
      if (editable) {
        await language(page).getByRole('radio', { name: 'Nynorsk', exact: true }).check()
        await expect(language(page).getByRole('radio', { name: 'Nynorsk', exact: true })).toBeChecked()
        await expect(page.getByRole('region', { name: 'A. Skolens målform', exact: true }).getByRole('status')).toHaveText('Lagret')
        await expect(page.getByRole('main').locator('pre')).toContainText('"GG_227_Skolens_Maalform": "Nynorsk"')
      } else {
        await expect(page.getByRole('note')).toContainText('Skrivebeskyttet')
        await expect(page.getByText('Ingen lagringskall ennå.', { exact: true })).toBeVisible()
        // Help remains available outside the disabled answer fieldsets.
        await page.getByRole('region', { name: 'A. Skolens målform', exact: true })
          .getByRole('button', { name: 'Vis hjelpetekst', exact: true }).click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog')).toHaveCount(0)
      }
      await expect(page.getByRole('button', { name: 'Forrige', exact: true })).toBeEnabled()
      await expect(page.getByRole('button', { name: 'Neste', exact: true })).toBeEnabled()
    })
  }
}

for (const id of ['demo-school-leader', 'demo-owner-central']) {
  test(`${id} cannot edit a status-1 school outside its explicit scope`, async ({ page }) => {
    await page.goto('./')
    await selector(page).selectOption(id)
    // Havblikk has status 1 but neither of these users has report 5 in its scope.
    await openDel2(page, 'Havblikk ungdomsskole')
    await expectControls(page, false)
    await page.getByText('API Debug', { exact: true }).click()
    await expect(page.getByText('Ingen lagringskall ennå.', { exact: true })).toBeVisible()
  })
}

test('switching users immediately revokes and restores editing without losing answers; Del 1 stays read-only', async ({ page }) => {
  await page.goto('./')
  await openDel2(page)
  const answer = language(page).getByRole('radio', { name: 'Bokmål', exact: true })
  await answer.check()
  const card = page.getByRole('region', { name: 'A. Skolens målform', exact: true })
  await expect(card.getByRole('status')).toHaveText('Lagret')
  await selector(page).selectOption('demo-udir-admin')
  await expectControls(page, false)
  await expect(answer).toBeChecked()
  await selector(page).selectOption('demo-owner-central')
  await expectControls(page, true)
  await expect(answer).toBeChecked()
  // Preserve the existing cross-field validation.
  await page.getByRole('combobox', { name: 'B. Hva er normalt laveste trinn ved skolen?', exact: true }).selectOption('8')
  await page.getByRole('combobox', { name: 'C. Hva er normalt høyeste trinn ved skolen?', exact: true }).selectOption('7')
  await expect(page.getByText('Laveste trinn må være mindre enn eller lik høyeste trinn. (Demonstrasjonsregel)', { exact: true })).toHaveCount(2)
  await selector(page).selectOption('demo-county')
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  await expect(page.getByRole('heading', { name: '1. Enhetsopplysninger', exact: true })).toBeVisible()
  await expect(page.getByRole('main').getByRole('radio')).toHaveCount(0)
  await expect(page.getByRole('main').getByRole('combobox')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Skolenavn', exact: true })).toContainText('Fjordgløtt barneskole')
})

test('a failed save cannot be retried after permission is revoked', async ({ page }) => {
  await page.goto('./')
  await openDel2(page)
  const card = page.getByRole('region', { name: 'A. Skolens målform', exact: true })
  // The existing mock deliberately fails every seventh save. Wait on each result.
  for (let index = 0; index < 7; index++) {
    await language(page).getByRole('radio', { name: index % 2 === 0 ? 'Bokmål' : 'Nynorsk', exact: true }).check()
    if (index < 6) await expect(card.getByRole('status')).toHaveText('Lagret')
  }
  const retry = card.getByRole('button', { name: 'Prøv igjen', exact: true })
  await expect(retry).toBeEnabled()
  await selector(page).selectOption('demo-udir-support')
  await expect(retry).toBeDisabled()
  await page.getByText('API Debug', { exact: true }).click()
  await expect(page.getByRole('main').locator('pre')).toHaveCount(7)
  await selector(page).selectOption('demo-school-leader')
  await retry.click()
  await expect(card.getByRole('status')).toHaveText('Lagret')
  await expect(page.getByRole('main').locator('pre')).toHaveCount(8)
})
