import { statuses } from '../mockData'
import type { SchoolStatus } from '../mockData'
export function StatusBadge({ status }: { status: SchoolStatus }) {
  return <span className={`status-badge status-${statuses.indexOf(status)}`}><span className="status-dot" aria-hidden="true" />{status}</span>
}
