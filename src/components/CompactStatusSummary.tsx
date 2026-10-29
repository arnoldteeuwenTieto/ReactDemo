import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import type { School } from '../mockData'
import { formStatuses } from '../domain/formStatus'
import { FormStatusBadge } from './FormStatusBadge'

export function CompactStatusSummary({ schools }: { schools: School[] }) {
  useTranslation('ui')
  const visibleStatuses = formStatuses
    .map(status => ({ ...status, count: schools.filter(school => school.statusId === status.id).length }))
    .filter(status => status.count > 0)
  const rows = [visibleStatuses.slice(0, 5), visibleStatuses.slice(5)].filter(row => row.length > 0)
  return <div className="compact-status-summary" role="group" aria-label={ui('Status for filtrerte skoler')} aria-live="polite">
    {visibleStatuses.length === 0 && <p className="compact-status-empty">{ui('Ingen skoler i utvalget')}</p>}
    {rows.map((row, index) => <ul className="compact-status-row" key={index}>
      {row.map(status => <li key={status.id} className={`compact-status-item form-status-badge--${status.tone}`}>
        <FormStatusBadge statusId={status.id} />
        <strong>{status.count}</strong>
      </li>)}
    </ul>)}
  </div>
}
