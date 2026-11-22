import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { demoUsers } from '../../src/demoUser'

export function openingModeTests(deployedDemo = false) {
  test('header opening modes immediately update school actions while preserving permissions', async ({ page }) => {
    await page.goto('./')
    if (deployedDemo) await page.getByRole('button', { name: 'Tilbake til statusoversikten', exact: true }).click()
    const header = page.getByRole('banner')
    const mode = header.getByRole('combobox', { name: 'Åpningsmodus', exact: true })
    await expect(mode).toBeHidden()
    await expect(page.getByRole('main').getByText('Åpningsmodus', { exact: true })).toHaveCount(0)
    await header.getByText('Demokontekst', { exact: true }).click()
    await expect(mode).toHaveValue('auto')
    await expect(mode.locator('option')).toHaveText(['Tilpass tilgang', 'Rediger', 'Les'])
    const results = await new AxeBuilder({ page }).include('.site-header').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
    const actions = page.getByRole('table').getByRole('button', { name: /^(Åpne|Se) skjema for/ })
    for (const user of demoUsers) {
      await header.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption(user.id)
      await mode.selectOption('auto')
      const normal = await actions.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))
      const denied = await page.getByRole('table').getByText('Ingen tilgang', { exact: true }).count()
      await mode.selectOption('view')
      await expect(actions).toHaveCount(normal.length)
      for (const action of await actions.all()) await expect(action).toHaveAccessibleName(/^Se skjema for/)
      await expect(page.getByRole('table').getByText('Ingen tilgang', { exact: true })).toHaveCount(denied)
      for (const value of ['edit', 'auto']) {
        await mode.selectOption(value)
        expect(await actions.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))).toEqual(normal)
      }
    }
  })
}
