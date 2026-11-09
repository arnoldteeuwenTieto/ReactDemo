import { useTranslation } from 'react-i18next'
import { ui } from './i18n'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { schools } from './mockData'
import type { School } from './mockData'
import { SchoolFilters } from './components/SchoolFilters'
import type { Filters } from './components/SchoolFilters'
import { SchoolTable } from './components/SchoolTable'
import { Introduction } from './components/Introduction'
import { grunnskoleSections, sectionApplicability } from './components/grunnskoleSections'
import { AppHeader } from './components/AppHeader'
import { GrunnskoleLayout } from './components/GrunnskoleLayout'
import { GrunnskolePlaceholderScreen } from './components/GrunnskolePlaceholderScreen'
import { ReportingDeveloperTools } from './components/ReportingDeveloperTools'
import './App.css'
import './styles/buttons.css'
import { OmSkolen } from './components/OmSkolen'
import { FormStatusBadge } from './components/FormStatusBadge'
import { DemoPermissionIndicator } from './components/DemoPermissionIndicator'
import { Enhetsopplysninger } from './components/Enhetsopplysninger'
import { LanguageSwitch } from './components/LanguageSwitch'
import { CompactStatusSummary } from './components/CompactStatusSummary'
import { AppFooter } from './components/AppFooter'
import { useDemoUser } from './demoUserContext'
import { formStatuses } from './domain/formStatus'
import type { FormStatusId } from './domain/formStatus'
import type { Del2Data } from './domain/del2'
import { useSectionValidation } from './useSectionValidation'
import { mockSkjemaStatusId } from './services/grunnskoleApi'
import { ImportedNumericSection } from './components/ImportedNumericSection'
import { numericSections, type NumericSection } from './domain/importedReporting'
import { ImportedWorkflowSection } from './components/ImportedWorkflowSection'
import { openSchool as openSchoolReport } from './services/schoolOpeningService'
import { clearOpeningPolicy, openingKey, setOpeningPolicy, isWithinReportingPeriod, type OpeningMode } from './domain/reportOpeningPolicy'
import { getDemoRoleCapabilities, getDemoReportPermissions } from './domain/demoPermissions'
import { useApplication } from './applicationContext'
import { initializeReporting, recordLifecycleEvent, type ReportingInitialization } from './services/reportingInitialization'
import { readImportedReport } from './services/importedReportService'
import { ReportingSessionContext, type ReportingSession } from './reportingSessionContext'
import { mockHelpTextService } from './services/helpTextService'

const initialFilters: Filters = { search: '', municipality: '', year: '2026', statusId: '' }
const reportKey = (school: School) => `${school.id}:${school.year}`
// Deployment fixture selection is independent of a user's assigned unit.
const initialDemoSchool = __DEPLOYED_DEMO__ ? schools.find(school => school.id === '1' && school.year === 2026) : null

function App() {
  useTranslation('ui')
  const application = useApplication()
  const { enabled: demoEnabled, selectedUser } = useDemoUser()
  // Overrides belong to this page session, never the mock records or API store.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, FormStatusId>>({})
  const schoolReports = useMemo(() => schools.map(school => {
    const statusId = demoEnabled ? statusOverrides[reportKey(school)] : undefined
    return statusId === undefined ? school : { ...school, statusId }
  }), [demoEnabled, statusOverrides])
  const [filters, setFilters] = useState<Filters>({ ...initialFilters, year: String(application.reportingYear) })
  const [selectedId, setSelectedId] = useState<string | null>(initialDemoSchool?.id ?? null)
  const [openReport, setOpenReport] = useState<{ id: string; year: number } | null>(initialDemoSchool ? { id: initialDemoSchool.id, year: initialDemoSchool.year } : null)
  const [openingMode, setOpeningMode] = useState<OpeningMode>('edit')
  const [openingMessage, setOpeningMessage] = useState('')
  const [reportInitialization, setReportInitialization] = useState<ReportingInitialization | null>(null)
  const [initializingReport, setInitializingReport] = useState(false)
  const openingRequest = useRef(0)
  useEffect(() => { ++openingRequest.current }, [selectedUser])
  const openSchool = schoolReports.find(school => school.id === openReport?.id && school.year === openReport.year) ?? null
  const { sectionIssueCounts, updateDel2, visitSection, leaveSection, activeDel2 } = useSectionValidation({ enabled: demoEnabled, user: selectedUser, school: openSchool })
  const applicability = Object.fromEntries(grunnskoleSections.map(section => [section.number, sectionApplicability(section.number, activeDel2)]))
  const availableSections = grunnskoleSections.filter(section => applicability[section.number].state !== 'not-applicable')
  const validationKey = openSchool ? `${mockSkjemaStatusId(openSchool)}` : null
  const onDel2DataChange = useCallback((data: Del2Data) => {
    if (validationKey) updateDel2(validationKey, data)
  }, [validationKey, updateDel2])
  const demoSchool = openSchool ?? schoolReports.find(school => school.id === selectedId) ?? null
  const hasStatusOverride = demoEnabled && !!demoSchool && statusOverrides[reportKey(demoSchool)] !== undefined
  function changeDemoStatus(statusId: number) {
    if (openReport && openingMode === 'view') return
    if (!demoEnabled || !demoSchool || !formStatuses.some(status => status.id === statusId)) return
    setStatusOverrides(previous => ({ ...previous, [reportKey(demoSchool)]: statusId as FormStatusId }))
  }
  function resetDemoStatus() {
    if (openReport && openingMode === 'view') return
    if (!demoEnabled || !demoSchool) return
    setStatusOverrides(previous => {
      const next = { ...previous }
      delete next[reportKey(demoSchool)]
      return next
    })
  }
  const [currentSection, setCurrentSection] = useState(1)
  const [showIntroduction, setShowIntroduction] = useState(true)
  const municipalities = [...new Set(schoolReports.map(school => school.municipality))].sort((a, b) => a.localeCompare(b, 'nb'))
  const years = [...new Set(schoolReports.map(school => school.year))].sort((a, b) => b - a)
  const query = filters.search.trim().toLocaleLowerCase('nb')
  const visibleSchools = schoolReports.filter(school =>
    (school.name.toLocaleLowerCase('nb').includes(query) || school.organizationNumber.includes(query.replace(/\s/g, ''))) &&
    (!filters.municipality || school.municipality === filters.municipality) &&
    (!filters.year || school.year === Number(filters.year)) &&
    (filters.statusId === '' || school.statusId === Number(filters.statusId)),
  )
  async function openForm(school: School, mode: OpeningMode) {
    const request = ++openingRequest.current
    setOpeningMessage(ui('Henter skjema…'))
    let resolved: Awaited<ReturnType<typeof openSchoolReport>>
    try {
      resolved = await openSchoolReport({ enabled: demoEnabled, user: selectedUser, school }, mode, { period: application.period, reportingYear: application.reportingYear, isCurrent: () => request === openingRequest.current })
      if (request !== openingRequest.current) return
    } catch (error) {
      if (request === openingRequest.current) setOpeningMessage(error instanceof Error ? error.message : ui('Kunne ikke åpne skjemaet.'))
      return
    }
    setOpeningMessage('')
    setOpeningMode(mode)
    setReportInitialization(null)
    recordLifecycleEvent('open', { enabled: demoEnabled, user: selectedUser, school })
    if (resolved.statusId !== school.statusId && typeof resolved.statusId === 'number') setStatusOverrides(previous => ({ ...previous, [reportKey(school)]: resolved.statusId as FormStatusId }))
    setSelectedId(school.id)
    setOpenReport({ id: school.id, year: school.year })
    setCurrentSection(1)
    setShowIntroduction(true)
    window.scrollTo(0, 0)
  }
  function goHome() {
    ++openingRequest.current
    if (openSchool) clearOpeningPolicy(openingKey(openSchool))
    if (validationKey && !showIntroduction) leaveSection(validationKey, currentSection)
    setOpenReport(null)
    setCurrentSection(1)
    setShowIntroduction(true)
  }
  async function startReporting() {
    if (!openSchool) return
    const request = ++openingRequest.current
    setInitializingReport(true)
    setOpeningMessage('')
    try {
      const initialized = await initializeReporting({ enabled: demoEnabled, user: selectedUser, school: openSchool }, application.language, mockHelpTextService)
      if (request !== openingRequest.current) return
      setOpeningPolicy(openingKey(openSchool), { mode: openingMode, period: application.period })
      setReportInitialization(initialized)
      selectSection(1)
    } catch (error) {
      if (request === openingRequest.current) setOpeningMessage(error instanceof Error ? error.message : ui('Kunne ikke åpne skjemaet.'))
    } finally { setInitializingReport(false) }
  }
  function selectSection(section: number) {
    if (applicability[section].state === 'not-applicable') return
    if (validationKey) {
      if (!showIntroduction && section !== currentSection) leaveSection(validationKey, currentSection)
      visitSection(validationKey, section)
    }
    setCurrentSection(section)
    setShowIntroduction(false)
  }
  const lastSection = grunnskoleSections[grunnskoleSections.length - 1].number
  function goPrevious() {
    if (showIntroduction) return
    if (currentSection === 1) {
      if (validationKey) leaveSection(validationKey, currentSection)
      setShowIntroduction(true)
    }
    else selectSection(availableSections.filter(item => item.number < currentSection).at(-1)!.number)
  }
  function goNext() {
    if (showIntroduction) void startReporting()
    else if (currentSection < lastSection) selectSection(availableSections.find(item => item.number > currentSection)!.number)
  }
  const sessionContext = { enabled: demoEnabled, user: selectedUser, school: openSchool }
  const session: ReportingSession | null = openSchool ? {
    school: openSchool, organizationNumber: openSchool.organizationNumber, year: openSchool.year,
    skjemaStatusId: openingKey(openSchool), statusId: openSchool.statusId, actualRoleId: selectedUser?.roleId ?? null,
    capabilities: getDemoReportPermissions(sessionContext), openMode: openingMode,
    isKommunesentralt: openSchool.isKommunesentralt, isGrunnskole: openSchool.isGrunnskole ?? null,
    isOffentligskole: openSchool.isOffentligskole ?? null, isPrivatSkole: openSchool.isPrivatSkole ?? null,
    periodConfigured: application.periodConfigured, inReportingPeriod: isWithinReportingPeriod(application.period),
    answers: { ...readImportedReport(openingKey(openSchool)), ...(activeDel2 ? { del2: activeDel2 } : {}) },
    applicability, validationErrorCounts: sectionIssueCounts, initialization: reportInitialization,
    phase: initializingReport ? 'initializing' : showIntroduction ? 'introduction' : 'ready',
  } : null
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">{ui("Gå til hovedinnhold")}</a>
      <AppHeader school={demoSchool} statusReadOnly={!!openReport && openingMode === 'view'} hasStatusOverride={hasStatusOverride} onStatusChange={changeDemoStatus} onStatusReset={resetDemoStatus} />
      <section className={`school-info-bar${openSchool ? '' : ' school-info-bar--overview'}`} aria-label={ui(openSchool ? 'Valgt skole' : 'Status for filtrerte skoler')}>
        <div className="school-info-inner">
          <div className="school-info-details">
            <p className="school-info-name">{openSchool ? openSchool.name : ui('Skoleoversikt')}</p>
            <p>{openSchool ? <>{openSchool.municipality} {ui("kommune ·")} {openSchool.year}</> : ui('Status for filtrerte skoler')}</p>
          </div>
          {openSchool ? <div className="school-info-status">
            <FormStatusBadge statusId={openSchool.statusId} />
            <DemoPermissionIndicator school={openSchool} />
          </div> : <CompactStatusSummary schools={visibleSchools} />}
        </div>
      </section>
      <main id="main" className="page">
        <ReportingSessionContext.Provider value={session}>
        {openingMessage && <p role="alert">{openingMessage}</p>}
        {openSchool && openingMode === 'view' && <p role="note">{ui('Skjemaet er åpnet for visning. Svar, kommentarer og status kan ikke endres.')}</p>}
        {openSchool ? !getDemoRoleCapabilities({ enabled: demoEnabled, user: selectedUser, school: openSchool }).read ? <><p role="alert">{ui('Du har ikke lesetilgang til denne skolen.')}</p><button className="gsi-button" onClick={goHome}>{ui('Tilbake til statusoversikten')}</button></> : showIntroduction ? <Introduction
          school={openSchool}
          onBack={goHome}
          onStartReporting={() => { void startReporting() }}
          initializing={initializingReport}
        /> : <GrunnskoleLayout
          applicability={applicability}
          activeSection={currentSection}
          sectionIssueCounts={sectionIssueCounts}
          onHome={goHome}
          onSelectSection={selectSection}
          onPrevious={goPrevious}
          onNext={goNext}
          canGoPrevious={!showIntroduction}
          canGoNext={showIntroduction || currentSection < lastSection}
        >
          {__DEV_FIELD_METADATA__ && activeDel2?.GG_230_Tilbyr_SFO == null && <p role="status">
            DEV: SFO-konfigurasjon mangler for {openSchool.name} ({openSchool.year}). GG_230_Tilbyr_SFO er ukjent. Velg Ja eller Nei i Del 2 — Om skolen. Del 14 er uavklart inntil svaret er valgt.
          </p>}
          {currentSection === 1 ? <Enhetsopplysninger key={`${openSchool.id}:${openSchool.year}`} school={openSchool} /> : currentSection === 2 ? <OmSkolen key={`${openSchool.id}:${openSchool.year}`} school={openSchool} onDataChange={onDel2DataChange} /> : numericSections.includes(currentSection as NumericSection) ? <ImportedNumericSection key={`${openSchool.id}:${openSchool.year}:${currentSection}`} school={openSchool} section={currentSection as NumericSection} /> : currentSection === 17 || currentSection === 18 ? <ImportedWorkflowSection key={`${openSchool.id}:${openSchool.year}:${currentSection}`} school={openSchool} section={currentSection} onSection={selectSection} onStatusChange={changeDemoStatus} /> : <GrunnskolePlaceholderScreen section={currentSection} school={openSchool} />}
        </GrunnskoleLayout> : <>
          <div className="page-heading"><div><h2>{ui("Oversikt over skolenes rapportering")}</h2><p>{ui("Søk etter en skole og følg status for innrapporteringen.")}</p></div><LanguageSwitch /></div>
          <SchoolFilters filters={filters} municipalities={municipalities} years={years} onChange={setFilters} onReset={() => setFilters({ ...initialFilters, year: String(application.reportingYear) })} />
          <section className="table-panel" aria-labelledby="schools-heading">
            <div className="table-heading"><h3 id="schools-heading">{ui("Skoler")}</h3><p aria-live="polite">{ui("Viser")} {visibleSchools.length} {ui("av")} {schoolReports.length} {ui("rapporteringer")}</p></div>
            <SchoolTable schools={visibleSchools} selectedId={selectedId} onSelect={setSelectedId} onOpen={openForm} />
          </section>
        </>}
        <p className="page-footer">{ui("Demonstrasjonsdata · Alle skoler og organisasjonsnumre er fiktive. Ingen opplysninger sendes eller lagres eksternt.")} · {ui('Demonstrasjonsoversettelser')}</p>
        </ReportingSessionContext.Provider>
      </main>
      {!openSchool && <AppFooter />}
      <ReportingDeveloperTools />
    </div>
  )
}
export default App
