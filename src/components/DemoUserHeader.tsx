import { useTranslation } from 'react-i18next'
import { demoUsers } from '../demoUser'
import { useDemoUser } from '../demoUserContext'
import { ui } from '../i18n'
import type { School } from '../mockData'
import { formStatuses } from '../domain/formStatus'

export interface DemoUserHeaderProps {
  school: School | null
  hasStatusOverride: boolean
  onStatusChange: (statusId: number) => void
  onStatusReset: () => void
}

export function DemoUserHeader({ school, hasStatusOverride, onStatusChange, onStatusReset }: DemoUserHeaderProps) {
  useTranslation('ui')
  const { enabled, selectedUser, selectUser } = useDemoUser()
  if (!enabled || !selectedUser) return null
  return <section className="header-demo" aria-label={ui('Brukerinformasjon (demonstrasjon)')} aria-describedby="demo-dev-label">
      <span id="demo-dev-label" className="header-dev-label">KUN DEV</span>
      <label className="header-user-demo demo-user-selector">
        {ui('Demonstrasjonsbruker')} <strong>DEMO</strong>
        <select value={selectedUser.id} onChange={event => selectUser(event.target.value)}>
          {demoUsers.map(user => <option key={user.id} value={user.id}>{user.name} · {ui(user.roleName)}</option>)}
        </select>
      </label>
      <div className="demo-status-controls">
        <label className="header-user-demo demo-user-selector">
          {ui('Demonstrasjonsstatus')}
          <select value={school?.statusId ?? ''} disabled={!school} aria-describedby={hasStatusOverride ? 'demo-status-override' : undefined} onChange={event => onStatusChange(Number(event.target.value))}>
            {(!school || !formStatuses.some(status => status.id === school.statusId)) && <option value="" disabled>{ui(school ? 'Status ukjent' : 'Velg en skole')}</option>}
            {formStatuses.map(status => <option key={status.id} value={status.id}>{status.id} {ui(status.label)}</option>)}
          </select>
        </label>
        <button className="text-button demo-status-reset" type="button" disabled={!hasStatusOverride} onClick={onStatusReset}>{ui('Tilbakestill status')}</button>
        {hasStatusOverride && <span id="demo-status-override" className="visually-hidden" role="status">{ui('Midlertidig DEMO-status')}</span>}
      </div>
      <details className="demo-user-details">
        <summary>{ui('Demokontekst')}</summary>
        <div className="demo-user-popover">
      <dl aria-live="polite" aria-atomic="true">
        <div><dt>{ui('Navn')}</dt><dd>{selectedUser.name}</dd></div>
        <div><dt>{ui('Rolle')}</dt><dd>{ui(selectedUser.roleName)} (RolleId {selectedUser.roleId})</dd></div>
        <div><dt>{ui('Enhet')}</dt><dd>{selectedUser.assignedUnit.name}</dd></div>
        <div><dt>{ui('Utvalg')}</dt><dd>{ui(selectedUser.mockAccessScope.description)}</dd></div>
      </dl>
      <p className="demo-user-note">{ui('DEMO: Kun simulert redigeringstilgang. Ingen backend-autorisasjon.')}</p>
        </div>
      </details>
  </section>
}
