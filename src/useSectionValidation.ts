import { useCallback, useRef, useState } from 'react'
import type { Del2Data } from './domain/del2'
import { runValidation } from './domain/sectionValidation'
import type { SectionIssue } from './domain/sectionValidation'
import { getGsiSkjemaStatus } from './services/grunnskoleApi'

interface ReportValidation {
  visited: Record<number, boolean>
  issues: Record<number, SectionIssue[]>
}

export function useSectionValidation() {
  const [reports, setReports] = useState<Record<string, ReportValidation>>({})
  // Validation snapshots only: the form/API remain the owners of actual answers.
  const snapshots = useRef<Record<string, Del2Data>>({})

  const updateDel2 = useCallback((key: string, data: Del2Data) => {
    snapshots.current[key] = { ...data }
    const issues = runValidation({ mode: 'light', section: 2, data })
    setReports(previous => {
      const report = previous[key] ?? { visited: {}, issues: {} }
      if (!report.visited[2]) return previous
      return { ...previous, [key]: { ...report, issues: { ...report.issues, 2: issues } } }
    })
  }, [])

  const visitSection = useCallback((key: string, section: number) => {
    const data = snapshots.current[key]
    setReports(previous => {
      const report = previous[key] ?? { visited: {}, issues: {} }
      const issues = section === 2 && !data ? report.issues : {
        ...report.issues, [section]: runValidation({ mode: 'light', section, data }),
      }
      return { ...previous, [key]: { visited: { ...report.visited, [section]: true }, issues } }
    })
  }, [])

  const leaveSection = useCallback((key: string, section: number) => {
    visitSection(key, section)
    // If navigation occurs before the form finishes loading, finish a read-only
    // snapshot fetch independently. Never block navigation or replace newer edits.
    if (section === 2 && !snapshots.current[key]) {
      void getGsiSkjemaStatus(key).then(result => {
        if (!snapshots.current[key]) updateDel2(key, result.del2)
      }).catch(() => { /* No fabricated issue count when source data cannot load. */ })
    }
  }, [visitSection, updateDel2])

  return { reports, updateDel2, visitSection, leaveSection }
}
