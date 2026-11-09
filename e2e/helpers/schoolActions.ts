import type { Page } from '@playwright/test'
export function schoolOpeningAction(page: Page, school: string, year: number | string = 2026) {
  const suffix = `skjema for ${school}, ${year}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return page.getByRole('button', { name: new RegExp(`^(?:Åpne|Se) ${suffix}$`) })
}
