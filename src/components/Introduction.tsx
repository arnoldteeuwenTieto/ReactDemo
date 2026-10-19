import { useEffect, useRef } from 'react'
import type { School } from '../mockData'
import { StatusBadge } from './StatusBadge'
export function Introduction({ school, onBack }: { school: School; onBack: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  return <>
    <button className="back-button" onClick={onBack}><span aria-hidden="true">←</span> Tilbake til statusoversikten</button>
    <div className="page-heading"><div><p className="eyebrow">Grunnskolerapportering · {school.year}</p><h2 ref={headingRef} tabIndex={-1}>Innledning</h2><p>{school.name}</p></div><StatusBadge status={school.status} /></div>
    <section className="introduction-panel" aria-labelledby="school-details-heading">
      <h3 id="school-details-heading">Opplysninger om skolen</h3>
      <dl className="school-details"><div><dt>Skolenavn</dt><dd>{school.name}</dd></div><div><dt>Organisasjonsnummer</dt><dd>{school.organizationNumber}</dd></div><div><dt>Kommune</dt><dd>{school.municipality}</dd></div><div><dt>Rapporteringsår</dt><dd>{school.year}</dd></div></dl>
      <div className="intro-copy"><h3>Velkommen til rapporteringen</h3><p>Her finner du innledningen til grunnskolerapporteringen for {school.year}. Kontroller at opplysningene ovenfor gjelder riktig skole og rapporteringsår.</p><p>Dette er en lokal prototype. Skjemaet viser kun demonstrasjonsdata og har ingen innsending eller tilkobling til Altinn.</p></div>
    </section>
  </>
}
