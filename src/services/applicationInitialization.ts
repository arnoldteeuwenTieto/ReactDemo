import type { ReportingPeriod } from '../domain/reportOpeningPolicy'

export interface ApplicationConfiguration {
  environment: string
  reportingYear: number
  language: 'nb' | 'nn'
  schema: 'grunnskole'
  period: ReportingPeriod | null
  periodConfigured: boolean
  features: { newFeature: boolean; demoPeriodOverride: boolean }
}
export function createApplicationConfiguration(input: {
  environment: string; year?: string; language?: string; startsAt?: string; endsAt?: string
  newFeature?: boolean; demoPeriodOverride?: boolean; demoEnabled: boolean; now?: Date
}): ApplicationConfiguration {
  const reportingYear = input.year?.trim() ? Number(input.year) : (input.now ?? new Date()).getFullYear()
  if (!Number.isInteger(reportingYear) || reportingYear < 1900 || reportingYear > 9999) throw new Error('Ugyldig rapporteringsår i applikasjonskonfigurasjonen.')
  const environment = input.environment.trim() || 'Local'
  const demoPeriodOverride = input.demoEnabled && environment.toUpperCase() === 'DEV' && input.demoPeriodOverride === true
  const periodConfigured = !!(input.startsAt?.trim() || input.endsAt?.trim())
  return { environment, reportingYear, language: input.language === 'nn' ? 'nn' : 'nb', schema: 'grunnskole',
    period: periodConfigured && !demoPeriodOverride ? { startsAt: input.startsAt?.trim() ?? '', endsAt: input.endsAt?.trim() ?? '' } : null,
    periodConfigured, features: { demoPeriodOverride, newFeature: input.newFeature === true && ['DEV','TEST','QA'].includes(environment.toUpperCase()) } }
}
export interface ApplicationInitializationAdapter { load(): Promise<ApplicationConfiguration> }
export async function initializeApplication(adapter: ApplicationInitializationAdapter) { return adapter.load() }
