import { useEffect, useRef } from 'react'
import type { School } from '../mockData'
import { StatusBadge } from './StatusBadge'
import { SchoolyardIllustration } from './SchoolyardIllustration'
export function Introduction({
  school,
  onBack,
  onStartReporting,
}: {
  school: School
  onBack: () => void
  onStartReporting: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  return <>
    <button className="back-button" onClick={onBack}><span aria-hidden="true">←</span> Tilbake til statusoversikten</button>
    <section className="introduction-panel introduction-grid" aria-labelledby="introduction-heading">
      <SchoolyardIllustration />
      <div className="introduction-content">
        <div className="page-heading"><div><h2 id="introduction-heading" ref={headingRef} tabIndex={-1}>Innledning</h2><p>{school.name}</p></div><StatusBadge status={school.status} /></div>
        <div className="intro-copy"><h3>Velkommen til rapporteringen</h3><p>Her finner du innledningen til grunnskolerapporteringen for {school.year}. Kontroller at opplysningene ovenfor gjelder riktig skole og rapporteringsår.</p><p>Dette er en lokal prototype. Skjemaet viser kun demonstrasjonsdata og har ingen innsending eller tilkobling til Altinn.</p></div>
        <button className="start-reporting-button" type="button" onClick={onStartReporting}>Gå til rapporteringen <span aria-hidden="true">→</span></button>
      </div>
    </section>
  </>
}
