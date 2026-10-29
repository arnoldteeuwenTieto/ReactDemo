import { FormStatusBadge } from './FormStatusBadge'
export function StatusBadge({ statusId }: { statusId?: number | null }) {
  return <FormStatusBadge statusId={statusId} />
}
