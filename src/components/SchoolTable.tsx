import { useState } from 'react'
import type { School } from '../mockData'
import { FormStatusBadge } from './FormStatusBadge'

const sortColumns = [
  { key: 'name', label: 'Skolenavn' },
  { key: 'organizationNumber', label: 'Organisasjonsnr.' },
  { key: 'municipality', label: 'Kommune' },
  { key: 'year', label: 'År' },
  { key: 'status', label: 'Status' },
] as const
type SortKey = typeof sortColumns[number]['key']
type SortDirection = 'ascending' | 'descending'
const alphabeticCollator = new Intl.Collator('nb')
const numericCollator = new Intl.Collator('nb', { numeric: true })

interface SchoolTableProps {
  schools: School[]
  selectedId: string | null
  onSelect: (id: string) => void
  onOpen: (school: School) => void
}
export function SchoolTable({ schools, selectedId, onSelect, onOpen }: SchoolTableProps) {
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
        : alphabeticCollator.compare(a[key], b[key])
    return direction === 'ascending' ? comparison : -comparison
  }) : schools

  return <div className="table-scroll" role="region" aria-label="Skoleoversikt" tabIndex={0}>
    <table>
      <caption className="visually-hidden">Skolenes rapportering. Velg en rad eller åpne skolens skjema.</caption>
      <thead><tr>
        <th scope="col">Velg</th>
        {sortColumns.map(({ key, label }) => <th key={key} scope="col" className="sortable-header" aria-sort={sort?.key === key ? sort.direction : 'none'}>
          <button type="button" className="sort-button" onClick={() => toggleSort(key)} aria-label={`${label}: sorter ${sort?.key === key && sort.direction === 'ascending' ? 'synkende' : 'stigende'}`}>
            {label}
            <span className="sort-arrows" aria-hidden="true">
              <span className={sort?.key === key && sort.direction === 'ascending' ? 'active' : ''}>↑</span>
              <span className={sort?.key === key && sort.direction === 'descending' ? 'active' : ''}>↓</span>
            </span>
          </button>
        </th>)}
        <th scope="col">Handling</th>
      </tr></thead>
      <tbody>{sortedSchools.map(school => <tr key={school.id} className={selectedId === school.id ? 'selected-row' : ''} onClick={() => onSelect(school.id)}>
        <td><input type="radio" name="selected-school" checked={selectedId === school.id} onChange={() => onSelect(school.id)} aria-label={`Velg ${school.name}, ${school.year}`} /></td>
        <th scope="row">{school.name}</th><td className="organization-number">{school.organizationNumber}</td><td>{school.municipality}</td><td>{school.year}</td><td><FormStatusBadge status={school.status} /></td>
        <td><button className="open-button" aria-label={`Åpne skjema for ${school.name}, ${school.year}`} onClick={event => { event.stopPropagation(); onOpen(school) }}>Åpne skjema <span aria-hidden="true">→</span></button></td>
      </tr>)}</tbody>
    </table>
    {schools.length === 0 && <div className="empty-state"><h4>Ingen skoler funnet</h4><p>Prøv et annet søk eller nullstill filtrene.</p></div>}
  </div>
}
