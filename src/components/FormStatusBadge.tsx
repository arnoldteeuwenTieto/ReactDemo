import { getFormStatus } from '../domain/formStatus'
import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'

export function FormStatusBadge({ statusId }: { statusId?: number | null }) {
  useTranslation('ui')
  const status = getFormStatus(statusId)
  return <span className={`form-status-badge form-status-badge--${status.tone}`} aria-label={ui('Skjemastatus: {{status}}', { status: ui(status.label) })}>
    <span className="status-dot" aria-hidden="true" />{ui(status.label)}
  </span>
}
