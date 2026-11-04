import source from './importedScreens.json' with { type: 'json' }
import staff from './staffScreens.json' with { type: 'json' }
import languages from './languageScreens.json' with { type: 'json' }
import { collectionFindings } from './languageCollections'
import type { CollectionId, CollectionRow } from './languageCollections'
import type { Del2Data } from './del2'
import { editableDel2Issues } from './sectionValidation'
import { gradeApplicability } from './fieldState'

export type NumericSection = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export const numericSections = [3, 4, 5, 6, 7, 8, 9, 10] as const
export interface ImportedField {
  key: string; control: string; group: string; questionNumber: string; label: string; readOnly: boolean
  maxDigits: number; terms: { field: string; sign: number }[]; sourceFormula?: string
  rowLabel?: string; column?: string; table?: string; hidden?: boolean; gradeRestricted?: boolean
  numericKind?: 'integer' | 'decimal'; minimumExclusive?: number; maximum?: number; precision?: number
  origin?: 'user' | 'calculated' | 'backend'; sqlColumn?: string; sectionRef?: string
  sourceSection?: NumericSection
}
export interface ImportedScreen {
  groups: { id: string; title: string; reference: string; helpId?: string; tables?: string[]; description?: string; columnGroups?: { title: string; table: string; columns: { fieldColumn: string; label: string }[] }[] }[]
  fields: ImportedField[]; controllers: string[]
}
export const importedScreens = { ...source, ...staff, ...languages } as Record<NumericSection, ImportedScreen>
export type NumericAnswers = Record<string, string>
export interface MunicipalityRow {
  id: string
  GG_887_Finansiert_Annen_Kommune: string
  GG_886_Elever_Finansiert_Annen_Kommune: string
}
export interface SupportMunicipalityRow {
  id: string
  GG_918_Individuell_Tilrettelagt_Opplaering: string
  GG_919_Elever_Individuell_Tilrettelagt_Opplaering: string
}
export interface ImportedReport {
  del2: Del2Data
  numbers: Record<NumericSection, NumericAnswers>
  municipalities: MunicipalityRow[]
  supportMunicipalities?: SupportMunicipalityRow[]
  collections?: Partial<Record<CollectionId, CollectionRow[]>>
  comments: Record<string, string>
  checked: boolean
  MerknadSkole: string
  MerknadKommune: string
  suppliedBy: { name: string; email: string; role: string } | null
}
export interface Finding { id: string; section: number; field?: string; kind: 'error' | 'warning' | 'unsupported'; message: string; blocking?: boolean; required?: boolean }
export function isBlockingFinding(finding: Finding): boolean {
  return finding.kind === 'error' || (finding.kind === 'warning' && finding.blocking === true)
}

export function numericError(value: string | undefined, digits: number): string | null {
  if (value === undefined || value === '') return 'Fyll ut et heltall.'
  if (!/^\d+$/.test(value) || value.length > digits) return 'Bruk et ikke-negativt heltall innenfor feltets siffergrense.'
  return null
}
export function applicable(field: ImportedField, del2: Del2Data): boolean {
  if (field.hidden) return false
  if (field.gradeRestricted === false) return true
  return gradeApplicability(field.key, del2).applicable
}
export function fieldNumericError(field: ImportedField, value: string | undefined): string | null {
  if (field.numericKind !== 'decimal') return numericError(value, field.maxDigits) ?? (field.minimumExclusive !== undefined && Number(value) <= field.minimumExclusive ? 'Bruk et positivt heltall med høyst fire siffer.' : null)
  if (!value) return 'Fyll ut et tall.'
  const number = Number(value.replace(',', '.'))
  return !/^\d+(?:[.,]\d+)?$/.test(value) || number <= (field.minimumExclusive ?? -1) || number > (field.maximum ?? Infinity)
    ? 'Bruk et tall større enn 0 og høyst 9999. Komma eller punktum kan brukes som desimaltegn.' : null
}
export function normalizeFieldNumber(field: ImportedField, value: string): string {
  return field.numericKind === 'decimal' && !fieldNumericError(field, value)
    ? String(Number(Number(value.replace(',', '.')).toFixed(field.precision ?? 2))) : value
}
export function calculateValues(section: NumericSection, answers: NumericAnswers, del2?: Del2Data, allAnswers?: Partial<Record<NumericSection, NumericAnswers>>): Record<string, number | null> {
  const fields = importedScreens[section].fields
  const results: Record<string, number | null> = {}
  const resolving = new Set<string>()
  function value(key: string): number | null {
    if (key in results) return results[key]
    const field = fields.find(item => item.key === key)
    if (!field || resolving.has(key)) return null
    resolving.add(key)
    let result: number | null = null
    if (field.sourceSection) result = calculateValues(field.sourceSection, allAnswers?.[field.sourceSection] ?? {}, del2, allAnswers)[field.key] ?? null
    else if (!field.readOnly && del2 && !applicable(field, del2)) result = 0
    else if (!field.readOnly) result = fieldNumericError(field, answers[key]) ? null : Number(answers[key].replace(',', '.'))
    else if (field.terms.length) {
      const terms = field.terms.map(term => ({ ...term, value: value(term.field) }))
      // Blank operands count as zero for mock sums; invalid entries do not.
      result = terms.some(term => term.value === null && (fields.find(item => item.key === term.field)?.readOnly || !!answers[term.field]))
        ? null : terms.reduce((sum, term) => sum + (term.value ?? 0) * term.sign, 0)
    } else if (answers[key] && !fieldNumericError(field, answers[key])) result = Number(answers[key].replace(',', '.'))
    if (result !== null && field.precision !== undefined) result = Number(result.toFixed(field.precision))
    resolving.delete(key)
    return (results[key] = result)
  }
  fields.forEach(field => value(field.key))
  return results
}
export function sectionFindings(section: NumericSection, report: ImportedReport, ownMunicipality: string, canEdit = true): Finding[] {
  const findings: Finding[] = []
  const seen = new Set<string>()
  for (const field of importedScreens[section].fields) {
    if (seen.has(field.key) || !applicable(field, report.del2)) continue
    seen.add(field.key)
    if (!field.readOnly) {
      const message = fieldNumericError(field, report.numbers[section]?.[field.key])
      if (message) {
        const unanswered = !report.numbers[section]?.[field.key]
        findings.push({ id: `LOCAL-${field.key}`, section, field: field.key,
          kind: unanswered ? 'warning' : 'error',
          message: unanswered ? 'Feltet er ikke besvart. Obligatoriske felt må avklares mot kilden.' : message })
      }
    }
  }
  if (section === 3) report.municipalities.forEach(row => {
    const municipality = row.GG_887_Finansiert_Annen_Kommune
    if ((!municipality || municipality === ownMunicipality || report.municipalities.filter(other => other.GG_887_Finansiert_Annen_Kommune === municipality).length > 1) && (municipality || canEdit))
      findings.push({ id: `LOCAL-municipality-${row.id}`, section, kind: 'error', required: !municipality, message: 'Velg en annen kommune uten duplikater.' })
    const message = numericError(row.GG_886_Elever_Finansiert_Annen_Kommune, 4)
    if (message && municipality && (row.GG_886_Elever_Finansiert_Annen_Kommune || canEdit)) findings.push({ id: `LOCAL-pupils-${row.id}`, section, kind: 'error', required: !row.GG_886_Elever_Finansiert_Annen_Kommune, message })
  })
  if (section === 7) (report.supportMunicipalities ?? []).forEach(row => {
    const municipality = row.GG_918_Individuell_Tilrettelagt_Opplaering
    if ((!municipality || municipality === ownMunicipality || (report.supportMunicipalities ?? []).filter(other => other.GG_918_Individuell_Tilrettelagt_Opplaering === municipality).length > 1) && (municipality || canEdit))
      findings.push({ id: `LOCAL-support-municipality-${row.id}`, section, kind: 'error', required: !municipality, message: 'Velg en annen kommune uten duplikater.' })
    const message = numericError(row.GG_919_Elever_Individuell_Tilrettelagt_Opplaering, 4)
    if (message && municipality && (row.GG_919_Elever_Individuell_Tilrettelagt_Opplaering || canEdit)) findings.push({ id: `LOCAL-support-pupils-${row.id}`, section, kind: 'error', required: !row.GG_919_Elever_Individuell_Tilrettelagt_Opplaering, message })
  })
  findings.push(...collectionFindings(section, report, ownMunicipality, canEdit))
  return findings
}
// Full local checks are explicit. Navigation uses only sectionFindings.
export function fullMockFindings(report: ImportedReport, municipality: string, editable: { del2?: boolean; imported?: boolean } = {}): Finding[] {
  const findings: Finding[] = editableDel2Issues(report.del2, editable.del2 ?? true).map(issue => ({ ...issue, kind: 'error' }))
  for (const section of numericSections) {
    findings.push(...sectionFindings(section, report, municipality, editable.imported ?? true))
    for (const field of importedScreens[section].fields.filter(field => !field.hidden && field.readOnly && !field.sourceSection && !field.terms.length)) {
      if (!findings.some(finding => finding.id === `UNAVAILABLE-${field.key}`))
        findings.push({ id: `UNAVAILABLE-${field.key}`, section, field: field.key, kind: 'unsupported', message: 'Beregningen krever en databaseformel som ikke følger eksporten.' })
    }
    findings.push(...importedScreens[section].controllers.map(id => ({ id, section, kind: 'unsupported' as const, message: 'Offisiell kontrollformel og kontrolltekst følger ikke eksporten.' })))
  }
  findings.push({ id: 'UNAVAILABLE-other-sections', section: 17, kind: 'unsupported', message: 'Fullstendighet for øvrige rapporteringsdeler kan ikke bekreftes i denne mock-upen.' })
  return findings
}
export function canSubmitMock(report: ImportedReport, municipality: string): boolean {
  return report.checked && fullMockFindings(report, municipality).length === 0
}
export function mockValidationOverview(report: ImportedReport, municipality: string, editable: { del2?: boolean; imported?: boolean } = {}) {
  const findings = fullMockFindings(report, municipality, editable)
  const passedNumericChecks = numericSections.flatMap(section => importedScreens[section].fields
    .filter(field => !field.readOnly && applicable(field, report.del2) && !fieldNumericError(field, report.numbers[section]?.[field.key])))
    .length
  return { findings, passedNumericChecks }
}
