import { getFormStatus } from '../domain/formStatus'

export function FormStatusBadge({ status: value }: { status?: string | null }) {
  const status = getFormStatus(value)
  return <span className={`form-status-badge form-status-badge--${status.tone}`} aria-label={`Skjemastatus: ${status.label}`}>
    <span className="status-dot" aria-hidden="true" />{status.label}
  </span>
}
