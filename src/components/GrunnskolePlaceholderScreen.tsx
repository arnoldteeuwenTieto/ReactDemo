import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { grunnskoleSections } from './grunnskoleSections'
import type { School } from '../mockData'

interface GrunnskolePlaceholderScreenProps {
  section: number
  school: School
}

export function GrunnskolePlaceholderScreen({ section, school }: GrunnskolePlaceholderScreenProps) {
  useTranslation('ui')
  const sectionDetails = grunnskoleSections.find(item => item.number === section)

  if (!sectionDetails) {
    throw new Error(`Unknown grunnskole section: ${section}`)
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>{sectionDetails.number}. {ui(sectionDetails.title)}</h2>
          {section !== 2 && <p>{ui("Her kommer rapporteringsskjemaet for")} {ui(sectionDetails.title).toLocaleLowerCase()}.</p>}
        </div>
      </div>
      {section === 2 ? <section className="introduction-panel" aria-labelledby="school-details-heading">
        <h3 id="school-details-heading">{ui("Opplysninger om skolen")}</h3>
        <dl className="school-details">
          <div><dt>{ui("Skolenavn")}</dt><dd>{school.name}</dd></div>
          <div><dt>{ui("Organisasjonsnummer")}</dt><dd>{school.organizationNumber}</dd></div>
          <div><dt>{ui("Kommune")}</dt><dd>{school.municipality}</dd></div>
          <div><dt>{ui("Rapporteringsår")}</dt><dd>{school.year}</dd></div>
        </dl>
      </section> : <section className="placeholder-panel" aria-labelledby="placeholder-heading">
        <h3 id="placeholder-heading">{ui("Eksempelfelter")}</h3>
        <p>{ui("Dette er en demonstrasjon. Feltene er deaktivert, og opplysningene lagres ikke.")}</p>
        <div className="placeholder-fields">
          <label>{ui("Skolens navn")} <input type="text" value={school.name} disabled />
          </label>
          <label>{ui("Rapporteringsår")} <input type="text" value={school.year} disabled />
          </label>
          <label>{ui("Status")} <select value={school.status} disabled>
              <option value={school.status}>{ui(school.status)}</option>
            </select>
          </label>
        </div>
      </section>}
    </>
  )
}
