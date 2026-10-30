import { expect, test, type Locator } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'

async function contrast(locator: Locator, focus = false) {
  const colors = await locator.evaluate((element, useOutline) => {
    const style = getComputedStyle(element)
    let current: Element | null = useOutline ? element.parentElement : element
    let background = 'rgb(255, 255, 255)'
    while (current) {
      const value = getComputedStyle(current).backgroundColor
      if (value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') { background = value; break }
      current = current.parentElement
    }
    return { foreground: useOutline ? style.outlineColor : style.color, background }
  }, focus)
  const luminance = (color: string) => {
    const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
      const channel = value / 255
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
    })
    return .2126 * r + .7152 * g + .0722 * b
  }
  const a = luminance(colors.foreground), b = luminance(colors.background)
  return { ...colors, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
}

for (const width of [1024, 1280, 1440, 1920]) {
  test(`desktop header stays one compact row at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    const header = page.getByRole('banner')
    await expect(header.getByRole('heading', { name: 'Grunnskole', exact: true })).toBeVisible()
    const bounds = (await header.boundingBox())!
    await expect(header).toHaveCSS('background-color', 'rgb(78, 102, 137)')
    await expect(header.getByText('KUN DEV', { exact: true })).toBeVisible()
    expect(bounds.height).toBeLessThanOrEqual(104)
    const sections = await header.locator('.header-inner > *').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, right: box.right, bottom: box.bottom }
    }))
    expect(sections).toHaveLength(4)
    for (let index = 0; index < sections.length; index++) {
      expect(sections[index].y).toBeGreaterThanOrEqual(bounds.y)
      expect(sections[index].bottom).toBeLessThanOrEqual(bounds.y + bounds.height)
      if (index) expect(sections[index].x).toBeGreaterThanOrEqual(sections[index - 1].right)
    }
    const selectors = header.getByRole('combobox')
    const userBox = (await selectors.nth(0).boundingBox())!
    const statusBox = (await selectors.nth(1).boundingBox())!
    expect(userBox.y).toBeCloseTo(statusBox.y, 0)
    await header.getByText('Demokontekst', { exact: true }).click()
    expect((await header.boundingBox())!.height).toBe(bounds.height)
    await header.getByText('Demokontekst', { exact: true }).click()
    await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
    await header.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true }).selectOption('8')
    expect((await header.boundingBox())!.height).toBe(bounds.height)
  })
}

for (const width of [768, 375, 320]) {
  test(`responsive header fits ${width}px without clipping or horizontal page scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    const header = page.getByRole('banner')
    await expect(header.getByRole('heading', { name: 'Grunnskole', exact: true })).toBeVisible()
    await expect(header.getByRole('region', { name: 'Innlogget bruker', exact: true })).toBeVisible()
    await header.getByText('Demokontekst', { exact: true }).click()
    const horizontalBounds = await header.locator('.header-inner > *, .demo-user-popover, select').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect()
      return { left: box.left, right: box.right }
    }))
    for (const box of horizontalBounds) {
      expect(box.left).toBeGreaterThanOrEqual(0)
      expect(box.right).toBeLessThanOrEqual(width)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}

test('session identity stays distinct from simulated users and build metadata uses configuration', async ({ page }) => {
  const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  await page.goto('./')
  const metadata = page.getByRole('region', { name: 'Miljø og versjon', exact: true })
  await expect(metadata.getByRole('definition')).toHaveText(['Local', version, 'Local', 'Local'])
  await expect(metadata).not.toContainText('undefined')
  const identity = page.getByRole('region', { name: 'Innlogget bruker', exact: true })
  await expect(identity).toContainText('Ingen innlogget bruker')
  await expect(identity.getByRole('term')).toHaveText(['Navn', 'E-post', 'Rolle'])
  await expect(identity.getByRole('definition')).toHaveText(['Ikke tilgjengelig', 'Ikke tilgjengelig', 'Ikke tilgjengelig'])
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-udir-support')
  await expect(identity).toContainText('Ingen innlogget bruker')
  await expect(identity).not.toContainText('Farid Dal')
  await expect(identity.getByRole('definition')).toHaveText(['Ikke tilgjengelig', 'Ikke tilgjengelig', 'Ikke tilgjengelig'])
})

test('header identity text and footer focus indicator have sufficient measured contrast', async ({ page }, info) => {
  await page.goto('./')
  const identity = await contrast(page.getByRole('region', { name: 'Innlogget bruker', exact: true }))
  expect(identity.ratio).toBeGreaterThanOrEqual(4.5)
  const demoLabel = await contrast(page.locator('.header-user-demo').first())
  const contextToggle = await contrast(page.getByText('Demokontekst', { exact: true }))
  const devLabel = await contrast(page.getByText('KUN DEV', { exact: true }))
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true }).selectOption('2')
  const resetButton = page.getByRole('button', { name: 'Tilbakestill status', exact: true })
  await expect(resetButton).toBeEnabled()
  const resetText = await contrast(resetButton)
  for (const measurement of [demoLabel, contextToggle, devLabel, resetText]) expect(measurement.ratio).toBeGreaterThanOrEqual(4.5)
  await page.getByRole('button', { name: 'Tilbake til statusoversikten' }).click()
  const footer = page.getByRole('contentinfo').getByRole('link', { name: 'Om GSI', exact: true })
  await footer.focus()
  await expect(footer).toBeFocused()
  const footerFocus = await contrast(footer, true)
  expect(footerFocus.ratio).toBeGreaterThanOrEqual(3)
  const path = info.outputPath('contrast-measurements.json')
  await writeFile(path, JSON.stringify({ identity, footerFocus, demoLabel, contextToggle, devLabel, resetText }, null, 2))
  await info.attach('contrast-measurements', { path, contentType: 'application/json' })
})
