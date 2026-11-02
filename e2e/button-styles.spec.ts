import { expect, test, type Locator, type Page } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

async function buttonColors(button: Locator) {
  const style = await button.evaluate(element => {
    const css = getComputedStyle(element)
    return { background: css.backgroundColor, text: css.color, border: css.borderTopColor, radius: css.borderRadius, weight: css.fontWeight }
  })
  function luminance(color: string) {
    const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number)
    const values = channels.map(value => {
      const channel = color.startsWith('color(srgb') ? value : value / 255
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
    })
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722
  }
  const a = luminance(style.background), b = luminance(style.text)
  return { ...style, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), luminance: a }
}

async function expectSharedButtons(page: Page) {
  await page.mouse.move(0, 0)
  const buttons = page.getByRole('button').and(page.locator('.gsi-button'))
  expect(await buttons.count()).toBeGreaterThan(0)
  for (const button of await buttons.all()) {
    await expect(button).toHaveClass(/gsi-button/)
    if (!await button.isEnabled()) continue
    await expect(button).toHaveCSS('background-color', 'rgb(78, 102, 137)')
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(button).toHaveCSS('border-top-color', 'rgb(78, 102, 137)')
    await expect(button).toHaveCSS('border-top-width', '1px')
    await expect(button).toHaveCSS('border-radius', '8px')
    await expect(button).toHaveCSS('font-weight', '600')
  }
}

test('opt-in actions retain the reference styling across overview, reporting and help', async ({ page }) => {
  await page.goto('./')
  await expectSharedButtons(page)
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await expectSharedButtons(page)
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  await expectSharedButtons(page)
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  const question = page.getByRole('region', { name: 'A. Skolens målform', exact: true })
  await expect(question).toBeVisible()
  await expectSharedButtons(page)
  await question.getByRole('button', { name: 'Vis hjelpetekst', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectSharedButtons(page)
})

test('normal, hover, pressed, disabled and keyboard-focus states remain accessible', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  const reference = page.getByRole('button', { name: 'Gå til rapporteringen' })
  await page.mouse.move(0, 0)
  const normal = await buttonColors(reference)
  await reference.hover()
  await expect(reference).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(reference).toHaveCSS('color', 'rgb(78, 102, 137)')
  const hover = await buttonColors(reference)
  await page.mouse.down()
  const active = await buttonColors(reference)
  expect(active.luminance).toBeLessThan(normal.luminance)
  await expect(reference).toHaveCSS('color', 'rgb(255, 255, 255)')
  // Release outside the button so this style check does not navigate yet.
  await page.mouse.move(0, 0); await page.mouse.up()
  await reference.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
  await expect(reference).toBeFocused()
  await expect(reference).toHaveCSS('outline-style', 'solid')
  await expect(reference).toHaveCSS('outline-width', '3px')
  await expect(reference).toHaveCSS('transition-duration', '0s')
  await reference.click()
  await page.getByRole('button', { name: 'Forrige', exact: true }).click()
  // Back at introduction: use status reset, which is disabled without an override.
  const disabledButton = page.getByRole('button', { name: 'Tilbakestill status', exact: true })
  await expect(disabledButton).toBeDisabled()
  await page.mouse.move(0, 0)
  const disabled = await buttonColors(disabledButton)
  await disabledButton.hover({ force: true })
  expect(await buttonColors(disabledButton)).toEqual(disabled)
  await expect(disabledButton).toHaveCSS('opacity', '1')
  for (const state of [normal, hover, active, disabled]) expect(state.ratio).toBeGreaterThanOrEqual(4.5)
  const path = info.outputPath('button-state-contrast.json')
  await writeFile(path, JSON.stringify({ normal, hover, active, disabled }, null, 2))
  await info.attach('button-state-contrast', { path, contentType: 'application/json' })
})

test('specialized language, sorting and menu controls keep their original independent styles', async ({ page }) => {
  await page.goto('./')
  const bokmal = page.getByRole('button', { name: 'Bokmål', exact: true })
  await expect(bokmal).toHaveAttribute('aria-pressed', 'true')
  await expect(bokmal).not.toHaveClass(/gsi-button/)
  await expect(bokmal).toHaveCSS('background-color', 'rgb(78, 102, 137)')
  await expect(bokmal).toHaveCSS('border-radius', '0px')
  const nynorsk = page.getByRole('button', { name: 'Nynorsk', exact: true })
  await expect(nynorsk).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(nynorsk).toHaveCSS('color', 'rgb(78, 102, 137)')
  const sort = page.getByRole('button', { name: 'Skolenavn: sorter stigende', exact: true })
  await expect(sort).not.toHaveClass(/gsi-button/)
  await expect(sort).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(sort).toHaveCSS('padding', '6px 10px')
  await sort.hover()
  await expect(sort).toHaveCSS('background-color', 'rgb(220, 229, 243)')
  const reset = page.getByRole('button', { name: 'Nullstill filtre', exact: true })
  await expect(reset).toHaveCSS('padding', '6px 14px')
  await expect(reset).toHaveCSS('background-color', 'rgb(78, 102, 137)')
  await page.getByRole('button', { name: 'Nynorsk', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'nn')
  await page.getByRole('button', { name: 'Bokmål', exact: true }).click()
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  const section = page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true }).getByRole('button', { name: 'Enhetsopplysninger', exact: true })
  await expect(section).toHaveAttribute('aria-current', 'page')
  await expect(section).not.toHaveClass(/gsi-button/)
  await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(section).toHaveCSS('color', 'rgb(48, 48, 48)')
  await expect(section).toHaveCSS('font-weight', '700')
  await section.hover()
  await expect(section).toHaveCSS('background-color', 'rgb(244, 244, 244)')
  await section.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(section).toBeFocused()
  await expect(section).toHaveCSS('outline-style', 'solid')
})
