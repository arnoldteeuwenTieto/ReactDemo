import { createContext, useContext } from 'react'
import type { School } from './mockData'
import type { OpeningMode } from './domain/reportOpeningPolicy'
import type { ImportedReport } from './domain/importedReporting'
import type { ReportingInitialization } from './services/reportingInitialization'
import type { SectionApplicability } from './components/grunnskoleSections'
import type { getDemoReportPermissions } from './domain/demoPermissions'

export interface ReportingSession {
  school: School; organizationNumber: string; year: number; skjemaStatusId: string; statusId: School['statusId']
  actualRoleId: number | null; capabilities: ReturnType<typeof getDemoReportPermissions>; openMode: OpeningMode
  isKommunesentralt: boolean; isGrunnskole: boolean | null; isOffentligskole: boolean | null; isPrivatSkole: boolean | null
  periodConfigured: boolean; inReportingPeriod: boolean; answers: ImportedReport
  applicability: Record<number, SectionApplicability>; validationErrorCounts: Record<number,number>
  initialization: ReportingInitialization | null; phase: 'introduction' | 'initializing' | 'ready'
}
export const ReportingSessionContext = createContext<ReportingSession | null>(null)
export function useReportingSession() { return useContext(ReportingSessionContext) }
