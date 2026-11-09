import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useState } from 'react'
import type { School } from '../mockData'
import { FormStatusBadge } from './FormStatusBadge'
import { getFormStatus } from '../domain/formStatus'
import { useDemoUser } from '../demoUserContext'
import { getDemoRoleCapabilities } from '../domain/demoPermissions'
import { mayOpenForEditing } from '../services/schoolOpeningService'
import type { OpeningMode } from '../domain/reportOpeningPolicy'
import { useApplication } from '../applicationContext'

const sortColumns = [
  { key: 'name', label: 'Skolenavn' },
  { key: 'organizationNumber', label: 'Organisasjonsnr.' },
  { key: 'municipality', label: 'Kommune' },
  { key: 'year', label: 'År' },
  { key: 'statusId', label: 'Status' },
] as const
type SortKey = typeof sortColumns[number]['key']
type SortDirection = 'ascending' | 'descending'
const alphabeticCollator = new Intl.Collator('nb')
const numericCollator = new Intl.Collator('nb', { numeric: true })

interface SchoolTableProps {
  schools: School[]
  selectedId: string | null
  onSelect: (id: string) => void
  onOpen: (school: School, mode: OpeningMode) => void
}
export function SchoolTable({ schools, selectedId, onSelect, onOpen }: SchoolTableProps) {
  useTranslation('ui')
  const { enabled, selectedUser } = useDemoUser()
  const application = useApplication()
  const [preferView, setPreferView] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null)
  function toggleSort(key: SortKey) {
    setSort(current => ({
      key,
      direction: current?.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }))
  }
  const sortedSchools = sort ? [...schools].sort((a, b) => {
    const { key, direction } = sort
    const comparison = key === 'year'
      ? a.year - b.year
      : key === 'organizationNumber'
        ? numericCollator.compare(a.organizationNumber.replace(/\s/g, ''), b.organizationNumber.replace(/\s/g, ''))
        : key === 'statusId'
          ? alphabeticCollator.compare(getFormStatus(a.statusId).label, getFormStatus(b.statusId).label)
          : alphabeticCollator.compare(a[key], b[key])
    return direction === 'ascending' ? comparison : -comparison
  }) : schools

  return <div className="table-scroll" role="region" aria-label={ui("Skoleoversikt")} tabIndex={0}>
    <label>{ui('Åpningsmodus')} <select value={preferView ? 'view' : 'auto'} onChange={event => setPreferView(event.target.value === 'view')}>
      <option value="auto">{ui('Tilpass tilgang')}</option><option value="view">{ui('Se skjema (skrivebeskyttet)')}</option>
    </select></label>
    <table className="school-table">
      <caption className="visually-hidden">{ui("Skolenes rapportering. Velg en rad eller åpne skolens skjema.")}</caption>
      <thead><tr>
        <th scope="col">{ui("Velg")}</th>
        {sortColumns.map(({ key, label }) => <th key={key} scope="col" className="sortable-header" aria-sort={sort?.key === key ? sort.direction : 'none'}>
          <button type="button" className="sort-button" onClick={() => toggleSort(key)} aria-label={`${ui(label)}: sorter ${sort?.key === key && sort.direction === 'ascending' ? ui("synkende") : ui("stigende")}`}>
            {ui(label)}
            <span className="sort-arrows" aria-hidden="true">
              <span className={sort?.key === key && sort.direction === 'ascending' ? 'active' : ''}>↑</span>
              <span className={sort?.key === key && sort.direction === 'descending' ? 'active' : ''}>↓</span>
            </span>
          </button>
        </th>)}
        <th scope="col">{ui("Handling")}</th>
      </tr></thead>
      <tbody>{sortedSchools.map(school => {
        const context = { enabled, user: selectedUser, school }
        const canRead = getDemoRoleCapabilities(context).read
        const mode = !preferView && mayOpenForEditing(context, application.period, application.reportingYear) ? 'edit' : 'view'
        const label = mode === 'edit' ? 'Åpne skjema' : 'Se skjema'
        return <tr key={school.id} className={selectedId === school.id ? 'selected-row' : ''} onClick={() => onSelect(school.id)}>
        <td><label className="school-row-selector"><input type="radio" name="selected-school" checked={selectedId === school.id} onChange={() => onSelect(school.id)} aria-label={ui("Velg {{school}}, {{year}}", { school: school.name, year: school.year })} /></label></td>
        <th scope="row">{school.name}</th><td className="organization-number" data-label={ui('Organisasjonsnr.')}>{school.organizationNumber}</td><td data-label={ui('Kommune')}>{school.municipality}</td><td data-label={ui('År')}>{school.year}</td><td data-label={ui('Status')}><FormStatusBadge statusId={school.statusId} /></td>
        <td>{canRead ? <button className="gsi-button open-button" aria-label={ui(`${label} for {{school}}, {{year}}`, { school: school.name, year: school.year })} onClick={event => { event.stopPropagation(); onOpen(school, mode) }}>{ui(label)} <span aria-hidden="true">→</span></button> : <span>{ui('Ingen tilgang')}</span>}</td>
      </tr>})}</tbody>
    </table>
    {schools.length === 0 && <div className="empty-state"><h4>{ui("Ingen skoler funnet")}</h4><p>{ui("Prøv et annet søk eller nullstill filtrene.")}</p></div>}
  </div>
}
