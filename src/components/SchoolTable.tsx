import type { School } from '../mockData'
import { StatusBadge } from './StatusBadge'
interface SchoolTableProps {
  schools: School[]
  selectedId: string | null
  onSelect: (id: string) => void
  onOpen: (school: School) => void
}
export function SchoolTable({ schools, selectedId, onSelect, onOpen }: SchoolTableProps) {
  return <div className="table-scroll" role="region" aria-label="Skoleoversikt" tabIndex={0}>
    <table>
      <caption className="visually-hidden">Skolenes rapportering. Velg en rad eller åpne skolens skjema.</caption>
      <thead><tr><th scope="col">Velg</th><th scope="col">Skolenavn</th><th scope="col">Organisasjonsnr.</th><th scope="col">Kommune</th><th scope="col">År</th><th scope="col">Status</th><th scope="col">Handling</th></tr></thead>
      <tbody>{schools.map(school => <tr key={school.id} className={selectedId === school.id ? 'selected-row' : ''} onClick={() => onSelect(school.id)}>
        <td><input type="radio" name="selected-school" checked={selectedId === school.id} onChange={() => onSelect(school.id)} aria-label={`Velg ${school.name}, ${school.year}`} /></td>
        <th scope="row">{school.name}</th><td className="organization-number">{school.organizationNumber}</td><td>{school.municipality}</td><td>{school.year}</td><td><StatusBadge status={school.status} /></td>
        <td><button className="open-button" aria-label={`Åpne skjema for ${school.name}, ${school.year}`} onClick={event => { event.stopPropagation(); onOpen(school) }}>Åpne skjema <span aria-hidden="true">→</span></button></td>
      </tr>)}</tbody>
    </table>
    {schools.length === 0 && <div className="empty-state"><h4>Ingen skoler funnet</h4><p>Prøv et annet søk eller nullstill filtrene.</p></div>}
  </div>
}
