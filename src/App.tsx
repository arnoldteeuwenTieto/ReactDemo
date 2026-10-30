import { useTranslation } from 'react-i18next'
import { ui } from './i18n'
import { useMemo, useState } from 'react'
import { schools } from './mockData'
import type { School } from './mockData'
import { SchoolFilters } from './components/SchoolFilters'
import type { Filters } from './components/SchoolFilters'
import { SchoolTable } from './components/SchoolTable'
import { Introduction } from './components/Introduction'
import { grunnskoleSections } from './components/grunnskoleSections'
import { AppHeader } from './components/AppHeader'
import { GrunnskoleLayout } from './components/GrunnskoleLayout'
import { GrunnskolePlaceholderScreen } from './components/GrunnskolePlaceholderScreen'
import './App.css'
import { OmSkolen } from './components/OmSkolen'
import { FormStatusBadge } from './components/FormStatusBadge'
import { Enhetsopplysninger } from './components/Enhetsopplysninger'
import { LanguageSwitch } from './components/LanguageSwitch'
import { CompactStatusSummary } from './components/CompactStatusSummary'
import { AppFooter } from './components/AppFooter'
import { useDemoUser } from './demoUserContext'
import { formStatuses } from './domain/formStatus'
import type { FormStatusId } from './domain/formStatus'

const initialFilters: Filters = { search: '', municipality: '', year: '2026', statusId: '' }
const reportKey = (school: School) => `${school.id}:${school.year}`

function App() {
  useTranslation('ui')
  const { enabled: demoEnabled } = useDemoUser()
  // Overrides belong to this page session, never the mock records or API store.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, FormStatusId>>({})
  const schoolReports = useMemo(() => schools.map(school => {
    const statusId = demoEnabled ? statusOverrides[reportKey(school)] : undefined
    return statusId === undefined ? school : { ...school, statusId }
  }), [demoEnabled, statusOverrides])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openReport, setOpenReport] = useState<{ id: string; year: number } | null>(null)
  const openSchool = schoolReports.find(school => school.id === openReport?.id && school.year === openReport.year) ?? null
  const demoSchool = openSchool ?? schoolReports.find(school => school.id === selectedId) ?? null
  const hasStatusOverride = demoEnabled && !!demoSchool && statusOverrides[reportKey(demoSchool)] !== undefined
  function changeDemoStatus(statusId: number) {
    if (!demoEnabled || !demoSchool || !formStatuses.some(status => status.id === statusId)) return
    setStatusOverrides(previous => ({ ...previous, [reportKey(demoSchool)]: statusId as FormStatusId }))
  }
  function resetDemoStatus() {
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
  function openForm(school: School) {
    setSelectedId(school.id)
    setOpenReport({ id: school.id, year: school.year })
    setCurrentSection(1)
    setShowIntroduction(true)
    window.scrollTo(0, 0)
  }
  function goHome() {
    setOpenReport(null)
    setCurrentSection(1)
    setShowIntroduction(true)
  }
  function selectSection(section: number) {
    setCurrentSection(section)
    setShowIntroduction(false)
  }
  const lastSection = grunnskoleSections[grunnskoleSections.length - 1].number
  function goPrevious() {
    if (showIntroduction) return
    if (currentSection === 1) setShowIntroduction(true)
    else selectSection(currentSection - 1)
  }
  function goNext() {
    if (showIntroduction) selectSection(1)
    else if (currentSection < lastSection) selectSection(currentSection + 1)
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">{ui("Gå til hovedinnhold")}</a>
      <AppHeader school={demoSchool} hasStatusOverride={hasStatusOverride} onStatusChange={changeDemoStatus} onStatusReset={resetDemoStatus} />
      <section className={`school-info-bar${openSchool ? '' : ' school-info-bar--overview'}`} aria-label={ui(openSchool ? 'Valgt skole' : 'Status for filtrerte skoler')}>
        <div className="school-info-inner">
          <div className="school-info-details">
            <p className="school-info-name">{openSchool ? openSchool.name : ui('Skoleoversikt')}</p>
            <p>{openSchool ? <>{openSchool.municipality} {ui("kommune ·")} {openSchool.year}</> : ui('Status for filtrerte skoler')}</p>
          </div>
          {openSchool ? <FormStatusBadge statusId={openSchool.statusId} /> : <CompactStatusSummary schools={visibleSchools} />}
        </div>
      </section>
      <main id="main" className="page">
        {openSchool ? showIntroduction ? <Introduction
          school={openSchool}
          onBack={goHome}
          onStartReporting={() => selectSection(1)}
        /> : <GrunnskoleLayout
          activeSection={currentSection}
          onHome={goHome}
          onSelectSection={selectSection}
          onPrevious={goPrevious}
          onNext={goNext}
          canGoPrevious={!showIntroduction}
          canGoNext={showIntroduction || currentSection < lastSection}
        >
          {currentSection === 1 ? <Enhetsopplysninger key={`${openSchool.id}:${openSchool.year}`} school={openSchool} /> : currentSection === 2 ? <OmSkolen key={`${openSchool.id}:${openSchool.year}`} school={openSchool} /> : <GrunnskolePlaceholderScreen section={currentSection} school={openSchool} />}
        </GrunnskoleLayout> : <>
          <div className="page-heading"><div><h2>{ui("Oversikt over skolenes rapportering")}</h2><p>{ui("Søk etter en skole og følg status for innrapporteringen.")}</p></div><LanguageSwitch /></div>
          <SchoolFilters filters={filters} municipalities={municipalities} years={years} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
          <section className="table-panel" aria-labelledby="schools-heading">
            <div className="table-heading"><h3 id="schools-heading">{ui("Skoler")}</h3><p aria-live="polite">{ui("Viser")} {visibleSchools.length} {ui("av")} {schoolReports.length} {ui("rapporteringer")}</p></div>
            <SchoolTable schools={visibleSchools} selectedId={selectedId} onSelect={setSelectedId} onOpen={openForm} />
          </section>
        </>}
        <p className="page-footer">{ui("Demonstrasjonsdata · Alle skoler og organisasjonsnumre er fiktive. Ingen opplysninger sendes eller lagres eksternt.")} · {ui('Demonstrasjonsoversettelser')}</p>
      </main>
      {!openSchool && <AppFooter />}
    </div>
  )
}
export default App
