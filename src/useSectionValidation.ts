import { useCallback, useState, useSyncExternalStore } from 'react'
import type { Del2Data } from './domain/del2'
import { editableDel2Issues } from './domain/sectionValidation'
import { isBlockingFinding, sectionFindings, numericSections } from './domain/importedReporting'
import type { Finding } from './domain/importedReporting'
import { canEditDemoReport, getDemoReportPermissions } from './domain/demoPermissions'
import type { DemoPermissionContext } from './domain/demoPermissions'
import { getMockReportRevision, mockSkjemaStatusId, subscribeMockReports } from './services/grunnskoleApi'
import { readImportedReport } from './services/importedReportService'

export function useSectionValidation(context: DemoPermissionContext) {
  const [reports, setReports] = useState<Record<string, { visited: Record<number, boolean> }>>({})
  // Latest visible Del 2 answers, including its existing optimistic save state.
  const [snapshots, setSnapshots] = useState<Record<string, Del2Data>>({})
  useSyncExternalStore(subscribeMockReports, getMockReportRevision)
  const updateDel2 = useCallback((key: string, data: Del2Data) => {
    setSnapshots(previous => ({ ...previous, [key]: { ...data } }))
  }, [])
  const visitSection = useCallback((key: string, section: number) => {
    setReports(previous => ({ ...previous, [key]: { visited: { ...previous[key]?.visited, [section]: true } } }))
  }, [])
  const leaveSection = visitSection
  const rights = getDemoReportPermissions(context)
  const issuesBySection: Record<number, Finding[]> = {}
  if (context.school && rights.read) {
    const key = mockSkjemaStatusId(context.school)
    const report = readImportedReport(key)
    report.del2 = snapshots[key] ?? report.del2
    issuesBySection[2] = editableDel2Issues(report.del2, canEditDemoReport(context)).map(issue => ({ ...issue, kind: 'error' }))
    for (const section of numericSections) issuesBySection[section] = sectionFindings(section, report, context.school.municipality, rights.edit)
  }
  // Sidebar is presentational: active section and visit history never suppress errors.
  const sectionIssueCounts = Object.fromEntries(Object.entries(issuesBySection)
    .map(([section, issues]) => [section, issues.filter(isBlockingFinding).length]))
  return { reports, issuesBySection, sectionIssueCounts, updateDel2, visitSection, leaveSection }
}
