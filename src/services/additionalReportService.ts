import { libraryChoices, preparednessChoices, libraryHoursKey } from '../domain/additionalChoices'
import { getDemoReportPermissions, type DemoPermissionContext } from '../domain/demoPermissions'
import { mockSkjemaStatusId, patchMockSection, readMockSection } from './grunnskoleApi'

export function saveAdditionalChoice(context: DemoPermissionContext, field: string, value: boolean) {
  if (!context.school || !getDemoReportPermissions(context).edit || ![...libraryChoices,...preparednessChoices].some(c=>c.key===field)) return false
  const key=mockSkjemaStatusId(context.school), previous=readMockSection(key,13)
  const noOffer=libraryChoices[3].key
  if (libraryChoices.slice(0,3).some(c=>c.key===field) && previous[noOffer]===true) return false
  const patch: Record<string,unknown> = {[field]:value}
  if (field===noOffer && value) {
    libraryChoices.slice(0,3).forEach(c=>{patch[c.key]=false})
    patch[libraryHoursKey]='' // Verified explicit OnCheck side effect, never OnVisible.
  }
  if (field===libraryChoices[0].key && !value) patch[libraryHoursKey]=''
  if (libraryChoices.slice(0,3).some(c=>c.key===field) && value) patch[noOffer]=false
  patchMockSection(key,13,patch)
  return true
}
