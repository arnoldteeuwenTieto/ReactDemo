import type { School } from '../mockData'

export type OpeningMode = 'edit' | 'view'
export interface ReportingPeriod { startsAt: string; endsAt: string }
export interface OpeningPolicy { mode: OpeningMode; period: ReportingPeriod | null }
const policies = new Map<string, OpeningPolicy>()
export const openingKey = (school: School) => `demo:${school.id}:${school.year}`
export function setOpeningPolicy(key: string, policy: OpeningPolicy) { policies.set(key, policy) }
export function clearOpeningPolicy(key: string) { policies.delete(key) }
export function isWithinReportingPeriod(period: ReportingPeriod | null, now = Date.now()) {
  if (!period) return true // Existing demo has no verified collection-period configuration.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/
  const start = Date.parse(dateOnly.test(period.startsAt) ? `${period.startsAt}T00:00:00` : period.startsAt)
  const end = Date.parse(dateOnly.test(period.endsAt) ? `${period.endsAt}T23:59:59.999` : period.endsAt)
  return Number.isFinite(start) && Number.isFinite(end) && start <= end && now >= start && now <= end
}
export function isReportWriteRestricted(key: string) {
  const policy = policies.get(key)
  return !!policy && (policy.mode === 'view' || !isWithinReportingPeriod(policy.period))
}
