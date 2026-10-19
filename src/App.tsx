import { useState } from 'react'
import { schools, statuses } from './mockData'
import type { School } from './mockData'
import { SchoolFilters } from './components/SchoolFilters'
import type { Filters } from './components/SchoolFilters'
import { SchoolTable } from './components/SchoolTable'
import { Introduction } from './components/Introduction'
import './App.css'

const initialFilters: Filters = { search: '', municipality: '', year: '2026', status: '' }

function App() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openSchool, setOpenSchool] = useState<School | null>(null)
  const municipalities = [...new Set(schools.map(school => school.municipality))].sort((a, b) => a.localeCompare(b, 'nb'))
  const years = [...new Set(schools.map(school => school.year))].sort((a, b) => b - a)
  const query = filters.search.trim().toLocaleLowerCase('nb')
  const visibleSchools = schools.filter(school =>
    (school.name.toLocaleLowerCase('nb').includes(query) || school.organizationNumber.includes(query.replace(/\s/g, ''))) &&
    (!filters.municipality || school.municipality === filters.municipality) &&
    (!filters.year || school.year === Number(filters.year)) &&
    (!filters.status || school.status === filters.status),
  )
  function openForm(school: School) {
    setSelectedId(school.id)
    setOpenSchool(school)
    window.scrollTo(0, 0)
  }
  return (
    <>
      <a className="skip-link" href="#main">Gå til hovedinnhold</a>
      <header className="site-header"><div className="header-inner">
        <div className="brand-mark" aria-hidden="true">GSI</div>
        <div><p className="eyebrow">Grunnskolens informasjonssystem</p><h1>GSI Grunnskole – Statusside (React Demo)</h1></div>
        <span className="year-chip">2026</span>
      </div></header>
      <main id="main" className="page">
        <nav className="breadcrumb" aria-label="Brødsmulesti"><span>GSI Grunnskole</span><span aria-hidden="true">/</span><span>{openSchool ? 'Innledning' : 'Statusside'}</span></nav>
        {openSchool ? <Introduction school={openSchool} onBack={() => setOpenSchool(null)} /> : <>
          <div className="page-heading"><div><p className="eyebrow">Rapportering · Grunnskole</p><h2>Oversikt over skolenes rapportering</h2><p>Søk etter en skole og følg status for innrapporteringen.</p></div><span className="prototype-label">Lokal prototype</span></div>
          <div className="summary-grid" aria-label="Status for filtrerte skoler">
            {statuses.map((status, index) => <div className="summary-card" key={status}><span className={`status-dot status-${index}`} aria-hidden="true" /><span>{status}</span><strong>{visibleSchools.filter(school => school.status === status).length}</strong></div>)}
          </div>
          <SchoolFilters filters={filters} municipalities={municipalities} years={years} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
          <section className="table-panel" aria-labelledby="schools-heading">
            <div className="table-heading"><h3 id="schools-heading">Skoler</h3><p aria-live="polite">Viser {visibleSchools.length} av {schools.length} rapporteringer</p></div>
            <SchoolTable schools={visibleSchools} selectedId={selectedId} onSelect={setSelectedId} onOpen={openForm} />
          </section>
        </>}
        <footer className="page-footer">Demonstrasjonsdata · Alle skoler og organisasjonsnumre er fiktive. Ingen opplysninger sendes eller lagres eksternt.</footer>
      </main>
    </>
  )
}
export default App
