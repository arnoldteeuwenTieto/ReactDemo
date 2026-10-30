import { expect, test, type Page } from '@playwright/test'
import { schools } from '../src/mockData'

// Independently reviewed fixtures: IDs 1–12 are the 2026 reports; 13–15
// belong to 2025. Do not import the UI's filtering/sorting/status helpers.
const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
// Norwegian alphabetical order, including Å after V in this dataset.
const alphabeticalIds = ['2', '8', '1', '11', '5', '6', '4', '7', '3', '12', '9', '10']
const statusLabels = [
  'Ikke påbegynt', 'Under behandling', 'Fullført av enheten',
  'Ikke godkjent av kommunen', 'Godkjent av kommunen',
  'Ikke godkjent av statsforvalter', 'Godkjent av statsforvalter',
  'Korrigert av UDIR', 'Inaktiv',
]

function record(id: string) {
  const school = schools.find(school => school.id === id)
  if (!school) throw new Error(`Missing mock school ${id}; review the test fixtures`)
  return school
}

async function expectSchools(page: Page, ids: string[]) {
  const table = page.getByRole('table')
  await expect(table.getByRole('rowheader')).toHaveText(ids.map(id => record(id).name))
  await expect(table.getByRole('radio')).toHaveCount(ids.length)
  for (const id of ids) {
    const school = record(id)
    await expect(table.getByRole('radio', {
      name: `Velg ${school.name}, ${school.year}`, exact: true,
    })).toBeVisible()
  }
}

async function expectSummary(page: Page, counts: number[]) {
  const summary = page.getByRole('group', { name: 'Status for filtrerte skoler', exact: true })
  await expect(summary.getByRole('listitem')).toHaveCount(counts.filter(count => count > 0).length)
  for (const [id, label] of statusLabels.entries()) {
    const badge = summary.getByLabel(`Skjemastatus: ${label}`, { exact: true })
    if (counts[id] === 0) {
      await expect(badge).toHaveCount(0)
    } else {
      await expect(badge).toBeVisible()
      const item = summary.getByRole('listitem').filter({
        has: page.getByLabel(`Skjemastatus: ${label}`, { exact: true }),
      })
      await expect(item).toHaveText(`${label}${counts[id]}`)
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('searches school names and clearing search restores the overview', async ({ page }) => {
  await expectSchools(page, defaultIds)
  const search = page.getByRole('searchbox', { name: 'Skolenavn eller organisasjonsnummer' })
  await search.fill('  FJORDGLØTT  ')
  await expectSchools(page, ['1'])
  await search.fill('ungdomsskole')
  await expectSchools(page, ['2', '5', '9', '12'])
  await search.clear()
  await expect(search).toHaveValue('')
  await expectSchools(page, defaultIds)
})

test('searches by organization number', async ({ page }) => {
  await page.getByRole('searchbox').fill('000 100 002')
  await expectSchools(page, ['2'])
})

test('sorts school names ascending', async ({ page }) => {
  await page.getByRole('button', { name: 'Skolenavn: sorter stigende', exact: true }).click()
  await expectSchools(page, alphabeticalIds)
  await expect(page.getByRole('columnheader').filter({
    has: page.getByRole('button', { name: 'Skolenavn: sorter synkende', exact: true }),
  })).toHaveAttribute('aria-sort', 'ascending')
})

test('sorts school names descending', async ({ page }) => {
  await page.getByRole('button', { name: 'Skolenavn: sorter stigende', exact: true }).click()
  await page.getByRole('button', { name: 'Skolenavn: sorter synkende', exact: true }).click()
  await expectSchools(page, [...alphabeticalIds].reverse())
  await expect(page.getByRole('columnheader').filter({
    has: page.getByRole('button', { name: 'Skolenavn: sorter stigende', exact: true }),
  })).toHaveAttribute('aria-sort', 'descending')
})

test('filters by municipality, combines search, and resets filters', async ({ page }) => {
  const municipality = page.getByRole('combobox', { name: 'Kommune', exact: true })
  await municipality.selectOption('Bergen')
  await expectSchools(page, ['1', '9'])
  await page.getByRole('searchbox').fill('Vestlia')
  await expectSchools(page, ['9'])
  await page.getByRole('searchbox').clear()
  await municipality.selectOption('Oslo')
  await expectSchools(page, ['2', '7'])
  await municipality.selectOption('')
  await expectSchools(page, defaultIds)
  await municipality.selectOption('Bergen')
  await page.getByRole('searchbox').fill('Fjordgløtt')
  await page.getByRole('button', { name: 'Nullstill filtre' }).click()
  await expect(municipality).toHaveValue('')
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await expectSchools(page, defaultIds)
})

test('status summary counts follow filters and zero-count badges are hidden', async ({ page }) => {
  // Manual tally of 2026 records: three each of IDs 0, 1, 2 and 4.
  await expectSummary(page, [3, 3, 3, 0, 3, 0, 0, 0, 0])
  await page.getByRole('combobox', { name: 'Kommune', exact: true }).selectOption('Bergen')
  await expectSchools(page, ['1', '9'])
  await expectSummary(page, [0, 1, 1, 0, 0, 0, 0, 0, 0])
  const table = page.getByRole('table')
  await expect(table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: record('1').name, exact: true }) })
    .getByLabel('Skjemastatus: Under behandling', { exact: true })).toBeVisible()
  await expect(table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: record('9').name, exact: true }) })
    .getByLabel('Skjemastatus: Fullført av enheten', { exact: true })).toBeVisible()
  await page.getByRole('searchbox').fill('Vestlia')
  await expectSchools(page, ['9'])
  await expectSummary(page, [0, 0, 1, 0, 0, 0, 0, 0, 0])
  await page.getByRole('button', { name: 'Nullstill filtre' }).click()
  await page.getByRole('combobox', { name: 'Skjemastatus', exact: true }).selectOption('0')
  await expectSchools(page, ['4', '7', '12'])
  await expectSummary(page, [3, 0, 0, 0, 0, 0, 0, 0, 0])
  await page.getByRole('button', { name: 'Nullstill filtre' }).click()
  await page.getByRole('combobox', { name: 'Rapporteringsår', exact: true }).selectOption('2025')
  await expectSchools(page, ['13', '14', '15'])
  await expectSummary(page, [0, 0, 1, 0, 2, 0, 0, 0, 0])
  await page.getByRole('button', { name: 'Nullstill filtre' }).click()
  await expectSummary(page, [3, 3, 3, 0, 3, 0, 0, 0, 0])
})

test('an unmatched search shows an empty state and no status badges', async ({ page }) => {
  await page.getByRole('searchbox').fill('School that does not exist 987654321')
  await expectSchools(page, [])
  await expect(page.getByRole('heading', { name: 'Ingen skoler funnet' })).toBeVisible()
  await expectSummary(page, [0, 0, 0, 0, 0, 0, 0, 0, 0])
  await expect(page.getByRole('group', { name: 'Status for filtrerte skoler', exact: true }))
    .toHaveText('Ingen skoler i utvalget')
  await page.getByRole('searchbox').clear()
  await expectSchools(page, defaultIds)
  await expectSummary(page, [3, 3, 3, 0, 3, 0, 0, 0, 0])
})
