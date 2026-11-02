import { questions } from './del2'
import type { Del2Data, Del2Field } from './del2'

export type ValidationMode = 'light' | 'full'
export interface SectionIssue {
  id: string
  section: number
  field: Del2Field
  kind: 'required' | 'local'
  message: string
}

// One entry point for future modes. Navigation/data entry must request light.
// Do not return a misleading successful full validation before it is implemented.
export function runValidation({ mode, section, data }: {
  mode: ValidationMode
  section: number
  data?: Del2Data
}): SectionIssue[] {
  if (mode === 'full') throw new Error('Full controller validation is not implemented')
  if (section !== 2 || !data) return []
  const issues: SectionIssue[] = []
  for (const { field } of questions) {
    if (data[field] === null) issues.push({
      id: `${field}:required`, section: 2, field, kind: 'required',
      message: 'Velg et svar. (Demonstrasjonsvalidering)',
    })
  }
  const lower = data.GG_228_Laveste_Trinn_Paa_Skolen
  const upper = data.GG_229_Hoeyeste_Trinn_Paa_Skolen
  if (lower !== null && upper !== null && upper < lower) issues.push({
    id: 'del2-grade-range', section: 2, field: 'GG_229_Hoeyeste_Trinn_Paa_Skolen', kind: 'local',
    message: 'Verdien i 2C må være lik eller høyere enn 2B.',
  })
  return issues
}
