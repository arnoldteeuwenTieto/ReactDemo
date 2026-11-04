export type FieldOrigin = 'user' | 'calculated' | 'backend'

// Permission and applicability stay independent from value origin and presence.
// In particular, zero and false are answers, not empty values.
export function fieldPresentation(value: unknown, origin: FieldOrigin = 'user') {
  return { 'data-field-origin': origin, 'data-field-filled': value !== null && value !== undefined && value !== '' ? 'true' : 'false' }
}
