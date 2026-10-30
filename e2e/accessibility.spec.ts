import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const wcag21 = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const demoStatus = (page: Page) => page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true })
const languageCard = (page: Page) => page.getByRole('region', { name: 'A. Skolens målform', exact: true })

async function openScreen(page: Page, screen: 'intro' | 'del1' | 'del2') {
  await page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
  if (screen === 'intro') return
  await page.getByRole('button', { name: 'Gå til rapporteringen' }).click()
  await expect(page.getByRole('region', { name: 'Skolenavn', exact: true })).toContainText('Fjordgløtt barneskole')
  if (screen === 'del1') return
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expect(languageCard(page).getByRole('radio')).toHaveCount(4)
}

async function openHelp(page: Page, heading: string) {
  await page.getByRole('region', { name: heading, exact: true }).getByRole('button', { name: 'Vis hjelpetekst', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByText('Henter hjelpetekst...', { exact: true })).toHaveCount(0)
}

async function audit(page: Page, info: TestInfo) {
  // No excludes, disabled rules, result baselines, or violation allowlists.
  // Best practices are reported separately rather than called WCAG failures.
  const results = await new AxeBuilder({ page })
    .withTags([...wcag21, 'wcag22aa', 'best-practice']).analyze()
  const report = {
    scenario: info.title, viewport: page.viewportSize(), url: page.url(),
    engine: results.testEngine, environment: results.testEnvironment,
    violations21: results.violations.filter(rule => rule.tags.some(tag => wcag21.includes(tag))),
    violations22: results.violations.filter(rule => rule.tags.includes('wcag22aa')),
    bestPractices: results.violations.filter(rule => !rule.tags.some(tag => [...wcag21, 'wcag22aa'].includes(tag))),
    incomplete: results.incomplete,
    passedRuleIds: results.passes.map(rule => rule.id),
    inapplicableRuleIds: results.inapplicable.map(rule => rule.id),
  }
  const path = info.outputPath('axe-results.json')
  await writeFile(path, JSON.stringify(report, null, 2))
  await info.attach('axe-results', { path, contentType: 'application/json' })
  await page.screenshot({ path: info.outputPath('screen.png'), fullPage: true })
  const summarize = (rules: typeof results.violations) => rules.map(rule => ({
    id: rule.id, impact: rule.impact, tags: rule.tags,
    nodes: rule.nodes.map(node => ({ target: node.target, reason: node.failureSummary })),
  }))
  expect.soft(summarize(report.violations21), 'WCAG 2.1 A/AA axe violations').toEqual([])
  expect.soft(summarize(report.violations22), 'Additional WCAG 2.2 AA axe violations').toEqual([])
}

test.describe('accessibility axe audit', () => {
  test.setTimeout(60_000)
  test.beforeEach(async ({ page }) => { await page.goto('./') })

  test('Skoleoversikt Bokmål', async ({ page }, info) => { await audit(page, info) })
  test('Skoleoversikt Nynorsk language metadata', async ({ page }, info) => {
    await page.getByRole('button', { name: 'Nynorsk', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'nn')
    await audit(page, info)
  })
  test('Skoleoversikt empty search results', async ({ page }, info) => {
    await page.getByRole('searchbox').fill('No such school 123456789')
    await expect(page.getByRole('heading', { name: 'Ingen skoler funnet', exact: true })).toBeVisible()
    await audit(page, info)
  })
  test('Innledning', async ({ page }, info) => { await openScreen(page, 'intro'); await audit(page, info) })
  test('Del 1 read-only information', async ({ page }, info) => { await openScreen(page, 'del1'); await audit(page, info) })
  test('Del 1 help dialog', async ({ page }, info) => {
    await openScreen(page, 'del1'); await openHelp(page, 'A. Enhet'); await audit(page, info)
  })
  test('Del 2 unanswered validation errors', async ({ page }, info) => {
    await openScreen(page, 'del2')
    await expect(page.getByText('Velg et svar. (Demonstrasjonsvalidering)', { exact: true })).toHaveCount(4)
    await audit(page, info)
  })
  test('Del 2 cross-field validation errors', async ({ page }, info) => {
    await openScreen(page, 'del2')
    await page.getByRole('combobox', { name: 'B. Hva er normalt laveste trinn ved skolen?', exact: true }).selectOption('8')
    await page.getByRole('combobox', { name: 'C. Hva er normalt høyeste trinn ved skolen?', exact: true }).selectOption('7')
    await expect(page.getByText('Laveste trinn må være mindre enn eller lik høyeste trinn. (Demonstrasjonsregel)', { exact: true })).toHaveCount(2)
    await audit(page, info)
  })
  test('Del 2 plain-text help dialog', async ({ page }, info) => {
    await openScreen(page, 'del2'); await openHelp(page, 'A. Skolens målform'); await audit(page, info)
  })
  test('Del 2 HTML help dialog with headings table and link', async ({ page }, info) => {
    await openScreen(page, 'del2'); await openHelp(page, 'B. Hva er normalt laveste trinn ved skolen?'); await audit(page, info)
  })
  test('Del 2 role-disabled answers at status 1', async ({ page }, info) => {
    await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-udir-support')
    await openScreen(page, 'del2')
    await expect(languageCard(page).getByRole('radio', { name: 'Bokmål', exact: true })).toBeDisabled()
    await audit(page, info)
  })
  for (const id of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
    test(`Del 2 demonstration status ${id}`, async ({ page }, info) => {
      await openScreen(page, 'del2'); await demoStatus(page).selectOption(String(id))
      await audit(page, info)
    })
  }
  for (const screen of ['overview', 'intro', 'del1', 'del2'] as const) {
    test(`320px viewport ${screen}`, async ({ page }, info) => {
      await page.setViewportSize({ width: 320, height: 800 })
      if (screen !== 'overview') await openScreen(page, screen)
      await audit(page, info)
      const widths = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }))
      expect.soft(widths.content, 'Page-level reflow; horizontal data-table scrolling is allowed within its own container').toBeLessThanOrEqual(widths.viewport)
    })
  }
})

test.describe('accessibility supplementary keyboard and focus audit', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./') })

  test('skip link is first and keyboard navigation continues inside main', async ({ page }, info) => {
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Gå til hovedinnhold', exact: true })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    // A native fragment may set the sequential focus start without making the
    // non-focusable <main> activeElement. Test the user outcome instead.
    const afterEnter = await page.evaluate(() => ({ active: document.activeElement?.outerHTML.slice(0, 300), hash: location.hash }))
    await info.attach('skip-link-focus', { body: JSON.stringify(afterEnter), contentType: 'application/json' })
    await expect(page).toHaveURL(/#main$/)
    await page.keyboard.press('Tab')
    // The main content begins with the language switch before the filter form.
    // Any focus inside main proves the shared header was bypassed.
    await expect(page.getByRole('main').locator(':focus')).toHaveCount(1)
  })
  test('overview sorting and report opening work from the keyboard', async ({ page }) => {
    const sort = page.getByRole('button', { name: 'Skolenavn: sorter stigende', exact: true })
    await sort.focus(); await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Skolenavn: sorter synkende', exact: true })).toBeFocused()
    const open = page.getByRole('button', { name: 'Åpne skjema for Fjordgløtt barneskole, 2026', exact: true })
    await open.focus(); await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeFocused()
  })
  test('radio group supports arrow keys and saves the selected answer', async ({ page }) => {
    await openScreen(page, 'del2')
    const radio = languageCard(page).getByRole('radio', { name: 'Bokmål', exact: true })
    await radio.focus(); await page.keyboard.press('Space'); await page.keyboard.press('ArrowRight')
    await expect(languageCard(page).getByRole('radio', { name: 'Nynorsk', exact: true })).toBeChecked()
    await expect(languageCard(page).getByRole('status')).toHaveText('Lagret')
  })
  test('disabled answers are skipped while help remains keyboard accessible', async ({ page }) => {
    await openScreen(page, 'del2'); await demoStatus(page).selectOption('0')
    const help = page.getByRole('main').getByRole('button', { name: 'Vis hjelpetekst', exact: true })
    await help.nth(0).focus(); await page.keyboard.press('Tab')
    await expect(help.nth(1)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
  })
  test('help keeps page focus modal and Escape returns focus to its trigger', async ({ page }, info) => {
    await openScreen(page, 'del2')
    const trigger = languageCard(page).getByRole('button', { name: 'Vis hjelpetekst', exact: true })
    await trigger.focus(); await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    const close = dialog.getByRole('button', { name: 'Lukk hjelpetekst', exact: true })
    await expect(close).toBeFocused()
    await dialog.getByRole('button', { name: 'Lukk', exact: true }).focus()
    await page.keyboard.press('Tab')
    const wrap = await page.evaluate(() => ({ active: document.activeElement?.tagName, documentFocused: document.hasFocus(), modal: document.querySelector('dialog')?.matches(':modal') }))
    await info.attach('dialog-tab-wrap', { body: JSON.stringify(wrap), contentType: 'application/json' })
    // Native Chromium dialogs may visit browser chrome at the Tab boundary.
    // Browser chrome is legitimate; reaching background page controls is not.
    if (!await close.evaluate(element => element === document.activeElement)) {
      expect(wrap.active).toBe('BODY')
      expect(wrap.documentFocused).toBe(false)
      await page.keyboard.press('Tab')
    }
    await expect(close).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    if (!await dialog.getByRole('button', { name: 'Lukk', exact: true }).evaluate(element => element === document.activeElement)) {
      expect(await page.evaluate(() => document.hasFocus())).toBe(false)
      await page.keyboard.press('Shift+Tab')
    }
    await expect(dialog.getByRole('button', { name: 'Lukk', exact: true })).toBeFocused()
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
  test('demo-user keyboard focus indicator has at least 3:1 contrast against the solid header', async ({ page }, info) => {
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
    const control = page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true })
    await expect(control).toBeFocused()
    const appearance = await control.evaluate(element => {
      const style = getComputedStyle(element)
      let parent = element.parentElement
      let background = 'rgb(255, 255, 255)'
      while (parent) {
        const color = getComputedStyle(parent).backgroundColor
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') { background = color; break }
        parent = parent.parentElement
      }
      return { outline: style.outlineColor, width: style.outlineWidth, style: style.outlineStyle, offset: style.outlineOffset, background }
    })
    const luminance = (color: string) => {
      const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
        const channel = value / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
    }
    const a = luminance(appearance.outline), b = luminance(appearance.background)
    const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    await writeFile(info.outputPath('focus-measurement.json'), JSON.stringify({ ...appearance, contrast }, null, 2))
    await info.attach('focus-measurement', { body: JSON.stringify({ ...appearance, contrast }, null, 2), contentType: 'application/json' })
    await page.screenshot({ path: info.outputPath('keyboard-focus.png'), fullPage: true })
    expect.soft(appearance.style).not.toBe('none')
    expect.soft(parseFloat(appearance.width)).toBeGreaterThanOrEqual(2)
    expect.soft(contrast, 'WCAG 1.4.11: authored outline against the adjacent solid header').toBeGreaterThanOrEqual(3)
  })
})
