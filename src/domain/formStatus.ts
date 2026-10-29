// The overview's existing labels and colors are the shared reporting status.
// These are never inferred from individual answers or save indicators.
export const formStatuses = [
  { id: 0, label: 'Ikke påbegynt', tone: 'grey' },
  { id: 1, label: 'Under behandling', tone: 'amber' },
  { id: 2, label: 'Fullført av enheten', tone: 'blue' },
  { id: 3, label: 'Ikke godkjent av kommunen', tone: 'red' },
  { id: 4, label: 'Godkjent av kommunen', tone: 'green' },
  { id: 5, label: 'Ikke godkjent av statsforvalter', tone: 'red' },
  { id: 6, label: 'Godkjent av statsforvalter', tone: 'green' },
  { id: 7, label: 'Korrigert av UDIR', tone: 'blue' },
  { id: 8, label: 'Inaktiv', tone: 'inactive' },
] as const

export type FormStatusId = typeof formStatuses[number]['id']

// Labels (including legacy "Godkjent") never determine an approval level.
export function getFormStatus(statusId?: number | null) {
  return formStatuses.find(status => status.id === statusId)
    ?? { label: 'Status ukjent', tone: 'grey' as const }
}
