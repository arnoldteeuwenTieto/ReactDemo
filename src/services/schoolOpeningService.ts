import type { DemoPermissionContext } from '../domain/demoPermissions'
import { getDemoRoleCapabilities, getEffectiveDemoRoleId } from '../domain/demoPermissions'
import { clearOpeningPolicy, isWithinReportingPeriod, openingKey, setOpeningPolicy } from '../domain/reportOpeningPolicy'
import type { OpeningMode, ReportingPeriod } from '../domain/reportOpeningPolicy'
import type { School } from '../mockData'
import { schools } from '../mockData'
import { getGsiSkjemaStatus, initializeMockReportingForm } from './grunnskoleApi'
import { readImportedReport } from './importedReportService'

export interface ExistingMockForm { skjemaStatusId: string; schoolId: string; year: number; statusId?: number }
// Mock fixtures represent existing reports; StatusId 0 does not imply a missing form.
const existingForms = new Map<string, ExistingMockForm>(schools.map(school => [openingKey(school), { skjemaStatusId: openingKey(school), schoolId: school.id, year: school.year }]))
export interface SchoolOpeningAdapter {
  findExisting(school: School): Promise<ExistingMockForm | null>
  load(form: ExistingMockForm): Promise<ReturnType<typeof readImportedReport>>
  initializeForEdit?(context: DemoPermissionContext, period: ReportingPeriod | null, existing: ExistingMockForm | null): Promise<ExistingMockForm>
}
export const mockSchoolOpeningAdapter: SchoolOpeningAdapter = {
  async findExisting(school) { const form = existingForms.get(openingKey(school)); return form ? { ...form, statusId: schools.some(s => s.id === school.id && s.year === school.year) ? school.statusId ?? undefined : form.statusId } : null },
  async load(form) { await getGsiSkjemaStatus(form.skjemaStatusId); return readImportedReport(form.skjemaStatusId) },
  async initializeForEdit(context, period, existing) {
    if (!context.school || !mayOpenForEditing(context, period, context.school.year)) throw new Error('Oppretting eller gjenåpning er ikke tillatt.')
    const school = context.school, key = openingKey(school)
    // This is a mock boundary, not authoritative production authorization.
    // Future BOGIAPI must resolve user/scope/status/period from the server session.
    clearOpeningPolicy(key)
    if (!existing) initializeMockReportingForm(key)
    const form = { skjemaStatusId: existing?.skjemaStatusId ?? key, schoolId: school.id, year: school.year, statusId: 1 }
    existingForms.set(key, form)
    return form
  },
}
export function mayOpenForEditing(context: DemoPermissionContext, period: ReportingPeriod | null = null, reportingYear = new Date().getFullYear()) {
  return context.school?.year === reportingYear && getEffectiveDemoRoleId(context.user, context.school) === 9 && getDemoRoleCapabilities(context).edit && isWithinReportingPeriod(period)
}
export async function openSchool(context: DemoPermissionContext, mode: OpeningMode, options: { period?: ReportingPeriod | null; reportingYear?: number; adapter?: SchoolOpeningAdapter; isCurrent?: () => boolean } = {}) {
  if (mode !== 'edit' && mode !== 'view') throw new Error('Ugyldig åpningsmodus.')
  const school = context.school
  if (!school || !getDemoRoleCapabilities(context).read) throw new Error('Du har ikke lesetilgang til denne skolen.')
  const period = options.period ?? null
  if (mode === 'edit' && !mayOpenForEditing(context, period, options.reportingYear)) throw new Error('Skjemaet kan ikke åpnes for redigering med valgt tilgang, status eller rapporteringsperiode.')
  const adapter = options.adapter ?? mockSchoolOpeningAdapter
  let form = await adapter.findExisting(school)
  if (options.isCurrent && !options.isCurrent()) throw new Error('Åpningen ble avbrutt fordi bruker eller skole ble endret.')
  const existingStatus = form?.statusId ?? school.statusId
  if (mode === 'edit' && (!form || (typeof existingStatus === 'number' && [3,5,7].includes(existingStatus)))) {
    if (!adapter.initializeForEdit) throw new Error('Oppretting eller gjenåpning krever en autorisert initialiseringsoperasjon.')
    form = await adapter.initializeForEdit(context, period, form)
  }
  if (!form?.skjemaStatusId || form.schoolId !== school.id || form.year !== school.year || form.skjemaStatusId !== openingKey(school)) {
    throw new Error('Fant ikke et eksisterende SkjemaStatusId for skolen og rapporteringsåret. Ingen data er opprettet.')
  }
  const report = await adapter.load(form)
  if (options.isCurrent && !options.isCurrent()) throw new Error('Åpningen ble avbrutt fordi bruker eller skole ble endret.')
  // Loading is read-only. A future BOGIAPI adapter must reauthorize server-side,
  // preserve the returned ID, and initialize new forms atomically/idempotently.
  setOpeningPolicy(form.skjemaStatusId, { mode, period })
  const statusId = form.statusId ?? school.statusId
  return { school: { ...school, statusId }, year: school.year, organizationNumber: school.organizationNumber, skjemaStatusId: form.skjemaStatusId, statusId, mode, period, report }
}
