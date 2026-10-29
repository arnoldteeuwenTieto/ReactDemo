import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { formStatuses } from '../domain/formStatus'
export interface Filters { search: string; municipality: string; year: string; statusId: string }
interface SchoolFiltersProps {
  filters: Filters
  municipalities: string[]
  years: number[]
  onChange: (filters: Filters) => void
  onReset: () => void
}
export function SchoolFilters({ filters, municipalities, years, onChange, onReset }: SchoolFiltersProps) {
  useTranslation('ui')
  function update(key: keyof Filters, value: string) { onChange({ ...filters, [key]: value }) }
  return <section className="filter-panel" aria-labelledby="filter-heading">
    <div className="filter-heading"><h3 id="filter-heading">{ui("Finn rapportering")}</h3><button className="text-button" onClick={onReset}>{ui("Nullstill filtre")}</button></div>
    <div className="filter-grid">
      <label className="search-field">{ui("Skolenavn eller organisasjonsnummer")}<input type="search" placeholder={ui("Søk etter skole …")} value={filters.search} onChange={event => update('search', event.target.value)} /></label>
      <label>{ui("Kommune")}<select value={filters.municipality} onChange={event => update('municipality', event.target.value)}><option value="">{ui("Alle kommuner")}</option>{municipalities.map(municipality => <option key={municipality}>{municipality}</option>)}</select></label>
      <label>{ui("Rapporteringsår")}<select value={filters.year} onChange={event => update('year', event.target.value)}><option value="">{ui("Alle år")}</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label>
      <label>{ui("Skjemastatus")}<select value={filters.statusId} onChange={event => update('statusId', event.target.value)}><option value="">{ui("Alle statuser")}</option>{formStatuses.map(status => <option key={status.id} value={status.id}>{ui(status.label)}</option>)}</select></label>
    </div>
  </section>
}
