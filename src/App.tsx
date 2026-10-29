import { useTranslation } from 'react-i18next'
import { ui } from './i18n'
import { useState } from 'react'
import { schools } from './mockData'
import type { School } from './mockData'
import { SchoolFilters } from './components/SchoolFilters'
import type { Filters } from './components/SchoolFilters'
import { SchoolTable } from './components/SchoolTable'
import { Introduction } from './components/Introduction'
import { grunnskoleSections } from './components/grunnskoleSections'
import { demoUser } from './demoUser'
import { GrunnskoleLayout } from './components/GrunnskoleLayout'
import { GrunnskolePlaceholderScreen } from './components/GrunnskolePlaceholderScreen'
import './App.css'
import { OmSkolen } from './components/OmSkolen'
import { FormStatusBadge } from './components/FormStatusBadge'
import { Enhetsopplysninger } from './components/Enhetsopplysninger'
import { LanguageSwitch } from './components/LanguageSwitch'
import { CompactStatusSummary } from './components/CompactStatusSummary'

const initialFilters: Filters = { search: '', municipality: '', year: '2026', statusId: '' }

function App() {
  useTranslation('ui')
  // One shared collection supplies both the overview and the open report.
  const [schoolReports] = useState<School[]>(schools)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openReport, setOpenReport] = useState<{ id: string; year: number } | null>(null)
  const openSchool = schoolReports.find(school => school.id === openReport?.id && school.year === openReport.year) ?? null
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
    <>
      <a className="skip-link" href="#main">{ui("Gå til hovedinnhold")}</a>
      <header className="site-header has-context-bar"><div className="header-inner">
        <div className="brand-mark" aria-hidden="true">{ui("GSI")}</div>
        <div><p className="eyebrow">{ui("Grunnskolens informasjonssystem")}</p><h1>{ui("Grunnskole")}</h1></div>
        <section className="header-user" aria-label={ui("Brukerinformasjon (demonstrasjon)")}>
          <p className="header-user-demo">{ui("Demonstrasjonsbruker")}</p>
          <dl>
            <div><dt>{ui("Navn")}</dt><dd>{ui(demoUser.name)}</dd></div>
            <div><dt>{ui("E-post")}</dt><dd>{demoUser.email}</dd></div>
            <div><dt>{ui("Rolle")}</dt><dd>{ui(demoUser.role)}</dd></div>
          </dl>
        </section>
      </div></header>
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
        <footer className="page-footer">{ui("Demonstrasjonsdata · Alle skoler og organisasjonsnumre er fiktive. Ingen opplysninger sendes eller lagres eksternt.")} · {ui('Demonstrasjonsoversettelser')}</footer>
      </main>
    </>
  )
}
export default App
