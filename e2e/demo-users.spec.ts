import { expect, test } from '@playwright/test'

// Explicit requirements fixtures, independent of the production profile array.
const profiles = [
  { id: 'demo-school-leader', name: 'Ada Fjord', role: 'Skoleleder', roleId: 9, unit: 'Fjordgløtt barneskole', scope: 'Fjordgløtt barneskole (2025 og 2026)' },
  { id: 'demo-owner-central', name: 'Birk Vik', role: 'Skoleeier, kommune sentralt', roleId: 10, unit: 'Bergen kommune (demo)', scope: 'Bergen: Fjordgløtt og Vestlia' },
  { id: 'demo-owner-noncentral', name: 'Celine Lund', role: 'Skoleeier, ikke sentralt', roleId: 10, unit: 'Fjord skoleeier (demo)', scope: 'Fiktiv tilknytning til Fjordgløtt barneskole' },
  { id: 'demo-county', name: 'David Li', role: 'Statsforvalter', roleId: 11, unit: 'Statsforvalteren i Eksempelfylket (demo)', scope: 'Fiktivt utvalg: Fjordgløtt og Vestlia' },
  { id: 'demo-udir-admin', name: 'Elin Berg', role: 'Udir administrator', roleId: 12, unit: 'Udir (demo)', scope: 'Alle fiktive rapporteringer' },
  { id: 'demo-udir-support', name: 'Farid Dal', role: 'Udir brukerstøtte', roleId: 13, unit: 'Udir brukerstøtte (demo)', scope: 'Alle fiktive rapporteringer' },
]

for (const profile of profiles) {
  test(`switches to ${profile.role} and displays its simulated context`, async ({ page }) => {
    await page.goto('./')
    const header = page.getByRole('region', { name: 'Brukerinformasjon (demonstrasjon)', exact: true })
    const selector = header.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
    await expect(selector.getByRole('option')).toHaveCount(6)
    // Start on a different profile so even the default user's test exercises a switch.
    await selector.selectOption(profile.id === profiles[0].id ? profiles[5].id : profiles[0].id)
    await page.getByRole('searchbox').fill('Vestlia')
    await page.getByRole('button', { name: 'Skolenavn: sorter stigende', exact: true }).click()
    await page.evaluate(() => { document.documentElement.dataset.demoNavigationMarker = 'same-document' })
    await selector.selectOption(profile.id)
    await expect(selector).toHaveValue(profile.id)
    await header.getByText('Demokontekst', { exact: true }).click()
    await expect(header.getByRole('definition')).toHaveText([
      profile.name, `${profile.role} (RolleId ${profile.roleId})`, profile.unit, profile.scope,
    ])
    await expect(header.getByText('DEMO: Kun simulert redigeringstilgang. Ingen backend-autorisasjon.', { exact: true })).toBeVisible()
    await expect(page.getByRole('searchbox')).toHaveValue('Vestlia')
    await expect(page.getByRole('table').getByRole('rowheader')).toHaveText(['Vestlia ungdomsskole'])
    await expect(page.getByRole('button', { name: 'Skolenavn: sorter synkende', exact: true })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-demo-navigation-marker', 'same-document')
  })
}

test('keeps the open report and selected demo context across navigation', async ({ page }) => {
  await page.goto('./')
  const selector = page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
  await selector.selectOption('demo-owner-central')
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
  await expect(selector).toHaveValue('demo-owner-central')
  await selector.selectOption('demo-udir-support')
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Valgt skole', exact: true })).toContainText('Fjordgløtt barneskole')
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  await expect(page.getByRole('heading', { name: 'Oversikt over skolenes rapportering', exact: true })).toBeVisible()
  await expect(selector).toHaveValue('demo-udir-support')
})
