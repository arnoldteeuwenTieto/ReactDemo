import { expect, test } from '@playwright/test'
import { grunnskoleSections } from '../src/components/grunnskoleSections'
import { resolveConfig } from 'vite'
import process from 'node:process'

test('real deployment labels cannot enable the dedicated demo even with an opt-in', async () => {
  const previous = { ...process.env }
  try {
    process.env.VITE_ENABLE_DEMO_USERS = 'true'
    for (const label of ['TEST', 'QA', 'PROD']) {
      process.env.VITE_APP_ENV = label
      for (const mode of ['demo', 'production']) {
        const config = await resolveConfig({ mode }, 'build')
        expect(config.define.__DEMO_USERS_ENABLED__).toBe('false')
        expect(config.define.__DEPLOYED_DEMO__).toBe('false')
        expect(config.define.__DEV_FIELD_METADATA__).toBe('false')
      }
    }
  } finally {
    for (const key of ['VITE_ENABLE_DEMO_USERS', 'VITE_APP_ENV']) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
})

test('built Pages demo resolves fictional context and preserves access, statuses and central-unit roles', async ({ page }) => {
  await page.goto('./')
  const header = page.getByRole('banner')
  const user = header.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
  const status = header.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true })
  await expect(user).toHaveValue('demo-school-leader')
  await expect(status).toHaveValue('1')
  await expect(header.getByRole('region', { name: 'Innlogget bruker', exact: true })).toContainText('Ingen innlogget bruker')
  await expect(header.locator('.header-dev-label')).toHaveText('DEMO')
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
  const nav = page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true })
  for (const section of grunnskoleSections) {
    await nav.getByRole('button', { name: section.title, exact: true }).click()
    await expect(page.getByRole('main').getByText('Ingen tilgang', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('main').getByRole('heading', { level: 2 }).first()).toBeVisible()
  }
  await nav.getByRole('button', { name: 'Elever og timer', exact: true }).click()
  const field = page.locator('input[data-field="GG_16_Antall_Elever_Trinn6_Gutter"]')
  await expect(field).toBeEnabled()
  await field.fill('4')
  await status.selectOption('2'); await expect(field).toBeDisabled()
  await header.getByRole('button', { name: 'Tilbakestill status', exact: true }).click()
  await expect(field).toBeEnabled(); await expect(field).toHaveValue('4')
  await user.selectOption('demo-udir-support'); await expect(field).toBeDisabled()
  await user.selectOption('demo-owner-central')
  await expect(field).toBeDisabled() // Normal school retains actual role 10 capabilities.
  await expect(page.locator('[data-report-field], [data-report-wrapper]')).toHaveCount(0)
  await field.hover(); await expect(page.getByRole('tooltip')).toHaveCount(0)
  await nav.getByRole('button', { name: 'Hjem', exact: true }).click()
  await page.getByRole('button', { name: 'Åpne skjema for Bergen kommune sentralt, 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
  await nav.getByRole('button', { name: 'Elever og timer', exact: true }).click()
  await expect(field).toBeEnabled() // Explicit isKommunesentralt=true plus unit access.
  await header.getByText('Demokontekst', { exact: true }).click()
  await expect(header.locator('.demo-user-popover')).toContainText('RolleId 10')
  await user.selectOption('demo-school-leader')
  await expect(page.getByRole('main').getByText('Ingen tilgang', { exact: true })).toBeVisible()
})
