import type { DemoUser } from '../demoUser'
import type { School } from '../mockData'

export interface DemoPermissionContext {
  enabled: boolean
  user: DemoUser | null
  school: School | null
}

// Matrix shorthand 109 means effective role 9 for this selected unit only.
// Never mutate the actual login role or infer access from this effective role.
export function getEffectiveDemoRoleId(user: DemoUser | null, school: School | null): number | null {
  return user?.roleId === 10 && school?.isKommunesentralt === true
    ? 9 : user?.roleId ?? null
}

// Preserve the previously specified, enforced baseline until its conflicts with
// the Power Apps capability matrix are explicitly resolved. See DEMO_USERS.md.
// This guard controls local form editing/saving, never backend authorization.
export function canEditDemoReport({ enabled, user, school }: DemoPermissionContext): boolean {
  if (!enabled || !user || !school || school.statusId !== 1) return false
  if (!user.mockAccessScope.schoolIds.includes(school.id)) return false
  return user.roleId === 9 || (user.roleId === 10 && user.mockAccessScope.municipalityCentral === true)
}

// User-supplied Power Apps matrix, columns StatusId 0 through 8.
// R=edit, L=read, S=submit, G=approve, A=reject. R/S imply read for display.
const capabilityMatrix: Record<number, readonly string[]> = {
  9:   ['RS', 'RS', 'L', 'RS', 'L', 'RS', 'L', 'R', 'L'],
  10:  ['L', 'L', 'LGA', 'L', 'L', 'LA', 'L', 'LA', 'L'],
  11:  ['L', 'L', 'LA', 'L', 'LGA', 'L', 'L', 'LA', 'L'],
  12:  ['LA', 'LA', 'LA', 'LA', 'LA', 'LA', 'LA', 'LA', 'LA'],
  13:  ['L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L'],
}

// Shared capabilities for indicators and future action prerequisites. These do
// not execute actions, bypass the baseline guard, or authorize API operations.
export function getDemoReportPermissions({ enabled, user, school }: DemoPermissionContext) {
  const effectiveRoleId = getEffectiveDemoRoleId(user, school)
  const status = school?.statusId
  const hasAccess = enabled && user && school && user.mockAccessScope.schoolIds.includes(school.id)
  const flags = hasAccess && effectiveRoleId !== null && typeof status === 'number' && Number.isInteger(status) && status >= 0 && status <= 8
    ? capabilityMatrix[effectiveRoleId]?.[status] ?? '' : ''
  return {
    read: /[LRS]/.test(flags),
    edit: flags.includes('R'),
    submit: flags.includes('S'),
    approve: flags.includes('G'),
    reject: flags.includes('A'),
  }
}
