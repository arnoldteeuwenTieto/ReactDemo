import type { ImportedField, NumericSection } from '../domain/importedReporting'

const descriptions: Record<string, string[]> = {
  '3D': ['Elever med opplæring både i og på tegnspråk', 'Elever med opplæring kun i tegnspråk', 'Elever med punktskriftopplæring'],
  '3F': ['Elever med hjemmeundervisning'],
  '3G': ['Elever som ikke har møtt ved skolestart'],
  '4A': ['Årstimer til undervisning', 'Årstimer til undervisning med personale uten godkjent kompetanse', 'Sum årstimer til undervisning'],
  '4B': ['Spesialundervisning etter enkeltvedtak', 'Særskilt norskopplæring', 'Morsmålsopplæring', 'Tospråklig fagopplæring', 'Tilrettelagt opplæring', 'Samisk – ekstra ressurser', 'Samisk – ekstra ressurser til enkeltelever eller grupper', 'Annen målform – ekstra ressurser', 'Kvensk som andrespråk', 'Finsk som andrespråk', 'Tegnspråkopplæring', 'Punktskriftopplæring', 'Sum årstimer til spesialundervisning og andre ressurser'],
  '4C': ['Sum årstimer utført av undervisningspersonale'],
  '4D': ['Årstimer til andre oppgaver utført av undervisningspersonale'],
  '4E': ['Barne- og ungdomsarbeidere', 'Vernepleiere, barnevernspedagoger og sosionomer', 'Personale med annen høyskole- eller universitetsutdanning', 'Personale med annen bakgrunn', 'Sum assistenttimer til elevrettet arbeid', 'Årstimer til spesialundervisning etter enkeltvedtak'],
}
export function numericColumn(section: NumericSection, group: string, field: ImportedField): string {
  if (field.column) return field.column
  if (section === 3 && group === 'A') return /Gutter/.test(field.key) ? 'Gutter' : /Jenter/.test(field.key) ? 'Jenter' : 'Sum'
  if (section === 3) return group === 'B' ? 'Timer' : 'Antall elever'
  const grade = field.key.match(/(?:Trinn|Sum)(\d+(?:_\d+)?)/i)?.[1] ?? field.key.match(/_(1_(?:7|10))$/)?.[1]
  return grade ? `${grade.replace('_', '–')}. trinn` : 'Sum'
}
export function questionDescription(section: NumericSection, group: string, field: ImportedField): string {
  if (field.rowLabel) return field.rowLabel
  const known = descriptions[`${section}${group}`]?.[Number(field.questionNumber) - 1]
  if (known) return known
  const grade = field.key.match(/(?:Trinn|Sum)(\d+(?:_\d+)?)/i)?.[1]
  if (grade) return `${field.readOnly ? 'Sum ' : ''}${grade.replace('_', '–')}. trinn`
  if (section === 3 && group === 'A') return 'Sum elever'
  if (section === 3 && group === 'C') return /Jenter/.test(field.key) ? 'Av disse jenter' : /Gutter/.test(field.key) ? 'Av disse gutter' : 'Sum elever'
  return field.label
}
export function numberedRows(fields: ImportedField[]) {
  const rows = new Map<string, ImportedField[]>()
  fields.forEach(field => {
    const row = rows.get(field.questionNumber) ?? []
    if (!row.some(item => item.key === field.key)) row.push(field)
    rows.set(field.questionNumber, row)
  })
  return [...rows].sort(([a], [b]) => Number(a) - Number(b))
}
