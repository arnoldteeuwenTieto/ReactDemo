import { statuses } from '../mockData'
export interface Filters { search: string; municipality: string; year: string; status: string }
interface SchoolFiltersProps {
  filters: Filters
  municipalities: string[]
  years: number[]
  onChange: (filters: Filters) => void
  onReset: () => void
}
export function SchoolFilters({ filters, municipalities, years, onChange, onReset }: SchoolFiltersProps) {
  function update(key: keyof Filters, value: string) { onChange({ ...filters, [key]: value }) }
  return <section className="filter-panel" aria-labelledby="filter-heading">
    <div className="filter-heading"><h3 id="filter-heading">Finn rapportering</h3><button className="text-button" onClick={onReset}>Nullstill filtre</button></div>
    <div className="filter-grid">
      <label className="search-field">Skolenavn eller organisasjonsnummer<input type="search" placeholder="Søk etter skole …" value={filters.search} onChange={event => update('search', event.target.value)} /></label>
      <label>Kommune<select value={filters.municipality} onChange={event => update('municipality', event.target.value)}><option value="">Alle kommuner</option>{municipalities.map(municipality => <option key={municipality}>{municipality}</option>)}</select></label>
      <label>Rapporteringsår<select value={filters.year} onChange={event => update('year', event.target.value)}><option value="">Alle år</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label>
      <label>Skjemastatus<select value={filters.status} onChange={event => update('status', event.target.value)}><option value="">Alle statuser</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
    </div>
  </section>
}
