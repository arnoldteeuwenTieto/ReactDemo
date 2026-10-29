// The overview's existing labels and colors are the shared reporting status.
// These are never inferred from individual answers or save indicators.
export const formStatuses = [
  { label: 'Ikke påbegynt', tone: 'grey' },
  { label: 'Under arbeid', tone: 'amber' },
  { label: 'Levert', tone: 'blue' },
  { label: 'Godkjent', tone: 'green' },
] as const

export function getFormStatus(value?: string | null) {
  return formStatuses.find(status => status.label === value) ?? { label: 'Status ukjent', tone: 'grey' as const }
}
