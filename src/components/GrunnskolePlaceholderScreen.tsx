import { grunnskoleSections } from './grunnskoleSections'
import type { School } from '../mockData'

interface GrunnskolePlaceholderScreenProps {
  section: number
  school: School
}

export function GrunnskolePlaceholderScreen({ section, school }: GrunnskolePlaceholderScreenProps) {
  const sectionDetails = grunnskoleSections.find(item => item.number === section)

  if (!sectionDetails) {
    throw new Error(`Unknown grunnskole section: ${section}`)
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>{sectionDetails.number}. {sectionDetails.title}</h2>
          {section !== 2 && <p>Her kommer rapporteringsskjemaet for {sectionDetails.title.toLocaleLowerCase('nb')}.</p>}
        </div>
      </div>
      {section === 2 ? <section className="introduction-panel" aria-labelledby="school-details-heading">
        <h3 id="school-details-heading">Opplysninger om skolen</h3>
        <dl className="school-details">
          <div><dt>Skolenavn</dt><dd>{school.name}</dd></div>
          <div><dt>Organisasjonsnummer</dt><dd>{school.organizationNumber}</dd></div>
          <div><dt>Kommune</dt><dd>{school.municipality}</dd></div>
          <div><dt>Rapporteringsår</dt><dd>{school.year}</dd></div>
        </dl>
      </section> : <section className="placeholder-panel" aria-labelledby="placeholder-heading">
        <h3 id="placeholder-heading">Eksempelfelter</h3>
        <p>Dette er en demonstrasjon. Feltene er deaktivert, og opplysningene lagres ikke.</p>
        <div className="placeholder-fields">
          <label>
            Skolens navn
            <input type="text" value={school.name} disabled />
          </label>
          <label>
            Rapporteringsår
            <input type="text" value={school.year} disabled />
          </label>
          <label>
            Status
            <select value={school.status} disabled>
              <option>{school.status}</option>
            </select>
          </label>
        </div>
      </section>}
    </>
  )
}
