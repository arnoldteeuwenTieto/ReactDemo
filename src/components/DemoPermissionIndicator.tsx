import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useDemoUser } from '../demoUserContext'
import { getDemoReportPermissions } from '../domain/demoPermissions'
import type { School } from '../mockData'

const permissionLabels = [
  ['read', 'Lese'], ['edit', 'Redigere'], ['submit', 'Levere'],
  ['approve', 'Godkjenne'], ['reject', 'Avvise'],
] as const

export function DemoPermissionIndicator({ school }: { school: School }) {
  useTranslation('ui')
  const { enabled, selectedUser } = useDemoUser()
  if (!enabled) return null
  const permissions = getDemoReportPermissions({ enabled, user: selectedUser, school })
  const available = permissionLabels.filter(([key]) => permissions[key])
  return (
    <div className="demo-permission-indicator" role="group" aria-label={ui('Demotilganger')}>
      {available.length ? available.map(([key, label]) => (
        <span className="demo-permission-badge" key={key}>{ui(label)}</span>
      )) : <span className="demo-permission-badge">{ui('Ingen tilgang')}</span>}
    </div>
  )
}
