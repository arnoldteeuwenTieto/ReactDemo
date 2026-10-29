export interface Del2Data {
  GG_227_Skolens_Maalform: string | null
  GG_228_Laveste_Trinn_Paa_Skolen: number | null
  GG_229_Hoeyeste_Trinn_Paa_Skolen: number | null
  GG_230_Tilbyr_SFO: boolean | null
}
export type Del2Field = keyof Del2Data
export const emptyDel2: Del2Data = {
  GG_227_Skolens_Maalform: null,
  GG_228_Laveste_Trinn_Paa_Skolen: null,
  GG_229_Hoeyeste_Trinn_Paa_Skolen: null,
  GG_230_Tilbyr_SFO: null,
}
// Documented mock option values; replace with source values when Del2 is supplied.
export const languageOptions = ['Bokmål', 'Nynorsk', 'Samisk', 'Annet'].map(label => ({ label, value: label }))
export const gradeOptions = Array.from({ length: 10 }, (_, index) => ({ label: `${index + 1}. trinn`, value: index + 1 }))
export const questions: { field: Del2Field; heading: string; kind: 'radio' | 'select'; options: { label: string; value: string | number | boolean }[] }[] = [
  { field: 'GG_227_Skolens_Maalform', heading: 'A. Skolens målform', kind: 'radio', options: languageOptions },
  { field: 'GG_228_Laveste_Trinn_Paa_Skolen', heading: 'B. Hva er normalt laveste trinn ved skolen?', kind: 'select', options: gradeOptions },
  { field: 'GG_229_Hoeyeste_Trinn_Paa_Skolen', heading: 'C. Hva er normalt høyeste trinn ved skolen?', kind: 'select', options: gradeOptions },
  { field: 'GG_230_Tilbyr_SFO', heading: 'D. Har skolen tilbud om SFO?', kind: 'radio', options: [{ label: 'Ja', value: true }, { label: 'Nei', value: false }] },
]
export function validateDel2(data: Del2Data): Partial<Record<Del2Field, string>> {
  const errors: Partial<Record<Del2Field, string>> = {}
  for (const { field } of questions) if (data[field] === null) errors[field] = 'Velg et svar. (Demonstrasjonsvalidering)'
  if (data.GG_228_Laveste_Trinn_Paa_Skolen !== null && data.GG_229_Hoeyeste_Trinn_Paa_Skolen !== null && data.GG_228_Laveste_Trinn_Paa_Skolen > data.GG_229_Hoeyeste_Trinn_Paa_Skolen) {
    errors.GG_228_Laveste_Trinn_Paa_Skolen = errors.GG_229_Hoeyeste_Trinn_Paa_Skolen = 'Laveste trinn må være mindre enn eller lik høyeste trinn. (Demonstrasjonsregel)'
  }
  return errors
}
// IDs reference the source; their official formulas/content are not available.
export const questionReferences: Record<Del2Field, { helpId: string; validationIds: string[] }> = {
  GG_227_Skolens_Maalform: { helpId: 'GG-H83', validationIds: ['GG-F2'] },
  GG_228_Laveste_Trinn_Paa_Skolen: { helpId: 'GG-H84', validationIds: ['GG-F3', 'GG-F63'] },
  GG_229_Hoeyeste_Trinn_Paa_Skolen: { helpId: 'GG-H85', validationIds: ['GG-F4', 'GG-A191'] },
  GG_230_Tilbyr_SFO: { helpId: 'GG-H86', validationIds: ['GG-F5', 'GG-F23'] },
}
// Del 14 awaits source field names. Do not invent official GG identifiers.
export const dependentFields: Record<12 | 14, string[]> = { 12: [
  'GG_695_Antall_Elevtimer_Fysisk_Aktivitet_Trinn_5',
  'GG_696_Antall_Elevtimer_Fysisk_Aktivitet_Trinn_6',
  'GG_697_Antall_Elevtimer_Fysisk_Aktivitet_Trinn_7',
  'GG_699_Antall_Aarstimer_Fysisk_Aktivitet_Trinn_5_7',
], 14: [] }
export interface DependentClear { del: 12 | 14; payload: Record<string, null>; warning?: string }
export function dependentClears(patch: Partial<Del2Data>, data: Del2Data): DependentClear[] {
  const sections: (12 | 14)[] = []
  if (('GG_228_Laveste_Trinn_Paa_Skolen' in patch || 'GG_229_Hoeyeste_Trinn_Paa_Skolen' in patch) &&
    ((data.GG_228_Laveste_Trinn_Paa_Skolen ?? 0) > 7 || (data.GG_229_Hoeyeste_Trinn_Paa_Skolen !== null && data.GG_229_Hoeyeste_Trinn_Paa_Skolen < 5))) sections.push(12)
  if (patch.GG_230_Tilbyr_SFO === false) sections.push(14)
  return sections.map(del => ({ del, payload: Object.fromEntries(dependentFields[del].map(field => [field, null])),
    ...(dependentFields[del].length ? {} : { warning: `Rydding i Del ${del} avventer eksakte feltnavn fra Power Apps-definisjonen.` }) }))
}
