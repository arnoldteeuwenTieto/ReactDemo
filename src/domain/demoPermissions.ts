import type { DemoUser } from '../demoUser'
import type { School } from '../mockData'

// Local simulation only. This is never evidence of authenticated BOGIAPI access.
// municipalityCentral represents Iskommunesentralt; schoolIds are explicit mock
// report associations (each year has its own school record ID).
export function canEditDemoReport({ enabled, user, school }: {
  enabled: boolean
  user: DemoUser | null
  school: School | null
}): boolean {
  if (!enabled || !user || !school || school.statusId !== 1) return false
  if (!user.mockAccessScope.schoolIds.includes(school.id)) return false
  return user.roleId === 9 || (user.roleId === 10 && user.mockAccessScope.municipalityCentral === true)
}
