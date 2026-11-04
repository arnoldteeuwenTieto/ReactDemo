import type { Del2Data } from './del2'

export type FieldKind = 'editable' | 'calculated' | 'business-disabled' | 'permission-readonly'
export function resolveFieldState({ canEdit, applicable = true, calculated = false, error = null }: {
  canEdit: boolean; applicable?: boolean; calculated?: boolean; error?: string | null
}) {
  return {
    kind: (!applicable ? 'business-disabled' : calculated ? 'calculated' : !canEdit ? 'permission-readonly' : 'editable') as FieldKind,
    editable: canEdit && applicable && !calculated,
    disabled: !applicable || (!calculated && !canEdit),
    readOnly: calculated,
    invalid: applicable && !calculated && !!error,
  }
}

// Grade bands are encoded in the exported field bindings, not unit names.
// A band is applicable if it overlaps the school's offered grades; no pro-rating.
export function gradeApplicability(key: string, data: Del2Data) {
  const lower = data.GG_228_Laveste_Trinn_Paa_Skolen
  const upper = data.GG_229_Hoeyeste_Trinn_Paa_Skolen
  const match = key.match(/_(?:Trinn|Sum)_?(\d+)(?:_(\d+))?(?:_|$)/i)
    ?? key.match(/_(1)_(7|10)$/)
  const validRange = lower !== null && upper !== null && Number.isInteger(lower) && Number.isInteger(upper) && lower >= 1 && upper <= 10 && lower <= upper
  const relevant = !match || !validRange || (Number(match[1]) <= upper! && Number(match[2] ?? match[1]) >= lower!)
  return { applicable: relevant, lower, upper, controllingSection: 2 as const }
}
