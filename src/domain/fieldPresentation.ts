export type FieldOrigin = 'user' | 'calculated' | 'backend'

// Known empty sums are numeric 0 from the calculation engine. Never replace
// null/undefined (unavailable backend data or an invalid calculation) with zero.
export function calculatedNumberText(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

// Permission and applicability stay independent from value origin and presence.
// In particular, zero and false are answers, not empty values.
export function fieldPresentation(value: unknown, origin: FieldOrigin = 'user') {
  return { 'data-field-origin': origin, 'data-field-filled': value !== null && value !== undefined && value !== '' ? 'true' : 'false' }
}
