import { emptyDel2 } from '../domain/del2'
import type { ImportedReport, MunicipalityRow, SupportMunicipalityRow, NumericAnswers, NumericSection } from '../domain/importedReporting'
import { importedScreens, canSubmitMock, applicable } from '../domain/importedReporting'
import { getDemoReportPermissions, getEffectiveDemoRoleId } from '../domain/demoPermissions'
import type { DemoPermissionContext } from '../domain/demoPermissions'
import { mockSkjemaStatusId, patchMockSection, readMockSection } from './grunnskoleApi'
import type { FormStatusId } from '../domain/formStatus'
import { languageCollections, initialCollectionRows } from '../domain/languageCollections'
import type { CollectionId, CollectionRow } from '../domain/languageCollections'

export function readImportedReport(key: string): ImportedReport {
  const three = readMockSection(key, 3)
  const checks = readMockSection(key, 17)
  const finish = readMockSection(key, 18)
  return {
    del2: { ...emptyDel2, ...readMockSection(key, 2) },
    numbers: { 3: three as NumericAnswers, 4: readMockSection(key, 4) as NumericAnswers, 5: readMockSection(key, 5) as NumericAnswers, 6: readMockSection(key, 6) as NumericAnswers, 7: readMockSection(key, 7) as NumericAnswers, 8: readMockSection(key, 8) as NumericAnswers, 9: readMockSection(key, 9) as NumericAnswers, 10: readMockSection(key, 10) as NumericAnswers },
    municipalities: (three.municipalities as MunicipalityRow[] | undefined) ?? [],
    supportMunicipalities: (readMockSection(key, 7).municipalities ?? []) as SupportMunicipalityRow[],
    collections: Object.fromEntries((Object.entries(languageCollections) as [CollectionId, typeof languageCollections[CollectionId]][]).map(([id, definition]) => [id, (readMockSection(key, definition.section)[definition.storeKey] as CollectionRow[] | undefined) ?? initialCollectionRows(id)])),
    comments: (checks.comments as Record<string, string> | undefined) ?? {},
    checked: checks.checked === true,
    MerknadSkole: String(finish.MerknadSkole ?? ''), MerknadKommune: String(finish.MerknadKommune ?? ''),
    suppliedBy: finish.suppliedBy as ImportedReport['suppliedBy'] ?? null,
  }
}
export function saveImportedNumber(context: DemoPermissionContext, section: NumericSection, field: string, value: string) {
  const definition = importedScreens[section].fields.find(item => item.key === field && !item.readOnly)
  if (!context.school || !getDemoReportPermissions(context).edit || !definition || !applicable(definition, readImportedReport(mockSkjemaStatusId(context.school)).del2)) return false
  patchMockSection(mockSkjemaStatusId(context.school), section, { [field]: value })
  return true
}
export function saveMunicipalities(context: DemoPermissionContext, rows: MunicipalityRow[]) {
  if (!context.school || !getDemoReportPermissions(context).edit) return false
  const previous = readImportedReport(mockSkjemaStatusId(context.school)).municipalities
  if (rows.some(row => !row.GG_887_Finansiert_Annen_Kommune && row.GG_886_Elever_Finansiert_Annen_Kommune !== (previous.find(item => item.id === row.id)?.GG_886_Elever_Finansiert_Annen_Kommune ?? ''))) return false
  patchMockSection(mockSkjemaStatusId(context.school), 3, { municipalities: rows.map(row => ({ ...row })) })
  return true
}
export function saveSupportMunicipalities(context: DemoPermissionContext, rows: SupportMunicipalityRow[]) {
  if (!context.school || !getDemoReportPermissions(context).edit) return false
  const previous = readImportedReport(mockSkjemaStatusId(context.school)).supportMunicipalities ?? []
  if (rows.some(row => !row.GG_918_Individuell_Tilrettelagt_Opplaering && row.GG_919_Elever_Individuell_Tilrettelagt_Opplaering !== (previous.find(item => item.id === row.id)?.GG_919_Elever_Individuell_Tilrettelagt_Opplaering ?? ''))) return false
  patchMockSection(mockSkjemaStatusId(context.school), 7, { municipalities: rows.map(row => ({ ...row })) })
  return true
}
export function markMockChecked(context: DemoPermissionContext) {
  if (!context.school || !getDemoReportPermissions(context).read) return false
  patchMockSection(mockSkjemaStatusId(context.school), 17, { checked: true })
  return true
}
export function saveControllerComment(context: DemoPermissionContext, id: string, comment: string) {
  if (!context.school || !getDemoReportPermissions(context).edit) return false
  const key = mockSkjemaStatusId(context.school)
  patchMockSection(key, 17, { comments: { ...readImportedReport(key).comments, [id]: comment } })
  return true
}
export function canEditRemark(context: DemoPermissionContext, field: 'MerknadSkole' | 'MerknadKommune') {
  const rights = getDemoReportPermissions(context)
  const role = getEffectiveDemoRoleId(context.user, context.school)
  return field === 'MerknadSkole' ? rights.edit : rights.read && role === 10 && (rights.approve || rights.reject)
}
export function saveRemark(context: DemoPermissionContext, field: 'MerknadSkole' | 'MerknadKommune', value: string) {
  if (!context.school || !canEditRemark(context, field)) return false
  patchMockSection(mockSkjemaStatusId(context.school), 18, { [field]: value })
  return true
}
export type MockAction = 'submit' | 'approve' | 'reject'
export function recordMockSupplier(context: DemoPermissionContext) {
  if (!context.school || !context.user || !getDemoReportPermissions(context).edit) return false
  patchMockSection(mockSkjemaStatusId(context.school), 18, { suppliedBy: { name: context.user.name, email: context.user.email, role: context.user.roleName } })
  return true
}
export function actionTarget(context: DemoPermissionContext, action: MockAction): FormStatusId | null {
  const rights = getDemoReportPermissions(context)
  if (!rights[action]) return null
  const role = getEffectiveDemoRoleId(context.user, context.school)
  if (action === 'submit') return 2
  if (action === 'approve') return role === 10 ? 4 : role === 11 ? 6 : null
  // The receipt screen defining Udir rejection transitions was not supplied.
  return role === 10 ? 3 : role === 11 ? 5 : null
}
export function performMockAction(context: DemoPermissionContext, action: MockAction): FormStatusId | null {
  if (!context.school || !context.user) return null
  const key = mockSkjemaStatusId(context.school)
  const target = actionTarget(context, action)
  if (target === null || (action === 'submit' && !canSubmitMock(readImportedReport(key), context.school.municipality))) return null
  const suppliedBy = action === 'submit' ? { name: context.user.name, email: context.user.email, role: context.user.roleName } : readImportedReport(key).suppliedBy
  patchMockSection(key, 18, { suppliedBy, lastAction: { action, target, userId: context.user.id, timestamp: new Date().toISOString() } })
  return target
}
