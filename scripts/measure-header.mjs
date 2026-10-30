import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const url = process.argv[2] ?? 'http://localhost:5173/ReactDemo/'
const label = process.argv[3] ?? 'header'
await mkdir('artifacts/header-layout', { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const measurements = []
  for (const width of [1280, 1440, 1920, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(url)
    await page.getByRole('heading', { name: 'Oversikt over skolenes rapportering', exact: true }).waitFor()
    const header = page.locator('.site-header')
    const bounds = await header.boundingBox()
    measurements.push({ width, height: bounds.height, pageWidth: await page.evaluate(() => document.documentElement.scrollWidth) })
    if (width === 1280 || width === 375) await header.screenshot({ path: `artifacts/header-layout/${label}-${width}.png` })
  }
  await writeFile(`artifacts/header-layout/${label}.json`, JSON.stringify(measurements, null, 2) + '\n')
  console.log(JSON.stringify(measurements))
} finally { await browser.close() }
