import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useEffect, useRef } from 'react'
import type { School } from '../mockData'
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
  useTranslation('ui')
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  return <>
    <section className="introduction-panel introduction-grid" aria-labelledby="introduction-heading">
      <SchoolyardIllustration />
      <div className="introduction-content">
        <div className="page-heading"><div><h2 id="introduction-heading" ref={headingRef} tabIndex={-1}>{ui("Innledning")}</h2><p>{school.name}</p></div></div>
        <div className="intro-copy"><h3>{ui("Velkommen til rapporteringen")}</h3><p>{ui("Her finner du innledningen til grunnskolerapporteringen for")} {school.year}{ui(". Kontroller at opplysningene ovenfor gjelder riktig skole og rapporteringsår.")}</p><p>{ui("Dette er en lokal prototype. Skjemaet viser kun demonstrasjonsdata og har ingen innsending eller tilkobling til Altinn.")}</p></div>
      </div>
      <footer className="introduction-actions">
        <button className="open-button" type="button" onClick={onBack}><span aria-hidden="true">←</span> {ui("Tilbake til statusoversikten")}</button>
        <button className="start-reporting-button" type="button" onClick={onStartReporting}>{ui("Gå til rapporteringen")} <span aria-hidden="true">→</span></button>
      </footer>
    </section>
  </>
}
