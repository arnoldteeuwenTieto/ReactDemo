import { expect, test } from '@playwright/test'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'
import { canEditDemoReport } from '../src/domain/demoPermissions'

const units = [
  ['16', 'Oslo', '000200001'], ['17', 'Bergen', '000200002'],
  ['18', 'Stavanger', '000200003'], ['19', 'Trondheim', '000200004'],
  ['20', 'Drammen', '000200005'],
]

test('central-unit fixtures and explicit access preserve baseline permissions', () => {
  const central = demoUsers.find(user => user.id === 'demo-owner-central')!
  const ordinary = demoUsers.find(user => user.id === 'demo-owner-noncentral')!
  for (const [id, municipality, organizationNumber] of units) {
    const school = schools.find(school => school.id === id)!
    expect(school).toMatchObject({ name: `${municipality} kommune sentralt`, municipality, organizationNumber, year: 2026, statusId: 1, isKommunesentralt: true })
    expect(schools.filter(record => record.organizationNumber === organizationNumber)).toHaveLength(1)
    expect(central.roleId === 10 && school.isKommunesentralt).toBe(true)
    expect(canEditDemoReport({ enabled: true, user: central, school })).toBe(id === '17')
    expect(canEditDemoReport({ enabled: true, user: ordinary, school })).toBe(false)
  }
  expect(canEditDemoReport({ enabled: true, user: ordinary, school: schools.find(s => s.id === '1')! })).toBe(false)
})

for (const [, municipality, organizationNumber] of units) {
  test(`${municipality} central unit supports search, filtering and reporting navigation`, async ({ page }) => {
    await page.goto('./')
    await page.getByRole('combobox', { name: 'Kommune', exact: true }).selectOption(municipality)
    await page.getByRole('searchbox').fill(organizationNumber)
    await expect(page.getByRole('table').getByRole('rowheader')).toHaveText([`${municipality} kommune sentralt`])
    await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-owner-central')
    await page.getByRole('button', { name: `Åpne skjema for ${municipality} kommune sentralt, 2026`, exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
    await page.getByRole('button', { name: 'Neste', exact: true }).click()
    const answer = page.getByRole('group', { name: 'A. Skolens målform', exact: true }).getByRole('radio', { name: 'Bokmål', exact: true })
    if (municipality === 'Bergen') await expect(answer).toBeEnabled()
    else await expect(answer).toBeDisabled()
    await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-owner-noncentral')
    await expect(answer).toBeDisabled()
  })
}
