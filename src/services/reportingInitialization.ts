import type { DemoPermissionContext } from '../domain/demoPermissions'
import { getDemoRoleCapabilities } from '../domain/demoPermissions'
import { readImportedReport } from './importedReportService'
import { mockSkjemaStatusId } from './grunnskoleApi'
import type { HelpTextService } from './helpTextService'
import { nbHelpTexts } from '../locales/gsiHelp'
import type { Language } from '../locales/gsi'
import { lifecycleFormulas } from '../domain/lifecycleFormulas'

const events: { event: 'open' | 'initialize'; schoolId: string; year: number; timestamp: string }[] = []
export function recordLifecycleEvent(event: 'open' | 'initialize', context: DemoPermissionContext) {
  if (!context.school) return
  events.push({ event, schoolId: context.school.id, year: context.school.year, timestamp: new Date().toISOString() })
  if (events.length > 100) events.shift()
}
export function getLifecycleEvents() { return events.map(e => ({...e})) }
export async function initializeReporting(context: DemoPermissionContext, language: Language, helpService: HelpTextService) {
  if (!context.school || !getDemoRoleCapabilities(context).read) throw new Error('Du har ikke lesetilgang til denne skolen.')
  const report = structuredClone(readImportedReport(mockSkjemaStatusId(context.school)))
  const results = await Promise.allSettled(Object.keys(nbHelpTexts).map(id=>helpService.getHelpText(id,language)))
  recordLifecycleEvent('initialize', context)
  return {
    language, helpTexts: results.flatMap(result=>result.status==='fulfilled'?[result.value]:[]),
    unavailableHelp: results.filter(result=>result.status==='rejected').length,
    comments: report.comments,
    shadow: structuredClone({ municipalities:report.municipalities,supportMunicipalities:report.supportMunicipalities,collections:report.collections,pptRecipients:report.pptRecipients }),
    formulas: lifecycleFormulas(report),
  }
}
export type ReportingInitialization = Awaited<ReturnType<typeof initializeReporting>>
