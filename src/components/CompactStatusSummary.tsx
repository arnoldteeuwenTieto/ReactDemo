import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import type { School } from '../mockData'
import { formStatuses } from '../domain/formStatus'
import { FormStatusBadge } from './FormStatusBadge'

export function CompactStatusSummary({ schools }: { schools: School[] }) {
  useTranslation('ui')
  return <div className="compact-status-summary" role="group" aria-label={ui('Status for filtrerte skoler')} aria-live="polite">
    {[formStatuses.slice(0, 5), formStatuses.slice(5)].map((row, index) => <ul className="compact-status-row" key={index}>
      {row.map(status => <li key={status.id} className={`compact-status-item form-status-badge--${status.tone}`}>
        <FormStatusBadge statusId={status.id} />
        <strong>{schools.filter(school => school.statusId === status.id).length}</strong>
      </li>)}
    </ul>)}
  </div>
}
