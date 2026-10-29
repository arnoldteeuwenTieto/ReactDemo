import { useState } from 'react'
import { schools, statuses } from './mockData'
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

const initialFilters: Filters = { search: '', municipality: '', year: '2026', status: '' }

function App() {
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
    (!filters.status || school.status === filters.status),
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
      <a className="skip-link" href="#main">Gå til hovedinnhold</a>
      <header className={`site-header${openSchool ? ' has-open-school' : ''}`}><div className="header-inner">
        <div className="brand-mark" aria-hidden="true">GSI</div>
        <div><p className="eyebrow">Grunnskolens informasjonssystem</p><h1>GSI Grunnskole – Statusside (React Demo)</h1></div>
        <section className="header-user" aria-label="Brukerinformasjon (demonstrasjon)">
          <p className="header-user-demo">Demonstrasjonsbruker</p>
          <dl>
            <div><dt>Navn</dt><dd>{demoUser.name}</dd></div>
            <div><dt>E-post</dt><dd>{demoUser.email}</dd></div>
            <div><dt>Rolle</dt><dd>{demoUser.role}</dd></div>
          </dl>
        </section>
      </div></header>
      {openSchool && <section className="school-info-bar" aria-label="Valgt skole">
        <div className="school-info-inner">
          <div className="school-info-details">
            <p className="school-info-name">{openSchool.name}</p>
            <p>{openSchool.municipality} kommune · {openSchool.year}</p>
          </div>
          <FormStatusBadge status={openSchool.status} />
        </div>
      </section>}
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
          <div className="page-heading"><div><p className="eyebrow">Rapportering · Grunnskole</p><h2>Oversikt over skolenes rapportering</h2><p>Søk etter en skole og følg status for innrapporteringen.</p></div><span className="prototype-label">Lokal prototype</span></div>
          <div className="summary-grid" aria-label="Status for filtrerte skoler">
            {statuses.map((status, index) => <div className="summary-card" key={status}><span className={`status-dot status-${index}`} aria-hidden="true" /><span>{status}</span><strong>{visibleSchools.filter(school => school.status === status).length}</strong></div>)}
          </div>
          <SchoolFilters filters={filters} municipalities={municipalities} years={years} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
          <section className="table-panel" aria-labelledby="schools-heading">
            <div className="table-heading"><h3 id="schools-heading">Skoler</h3><p aria-live="polite">Viser {visibleSchools.length} av {schoolReports.length} rapporteringer</p></div>
            <SchoolTable schools={visibleSchools} selectedId={selectedId} onSelect={setSelectedId} onOpen={openForm} />
          </section>
        </>}
        <footer className="page-footer">Demonstrasjonsdata · Alle skoler og organisasjonsnumre er fiktive. Ingen opplysninger sendes eller lagres eksternt.</footer>
      </main>
    </>
  )
}
export default App
