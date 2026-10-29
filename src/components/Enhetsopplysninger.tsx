import { useTranslation } from 'react-i18next'
import { ui, gsi } from '../i18n'
import { useEffect, useState } from 'react'
import type { School } from '../mockData'
import type { SchoolDetails } from '../domain/schoolDetails'
import { displaySchoolDetail, getSchoolOwnerOrganizationNumber } from '../domain/schoolDetails'
import { mockSchoolInformationService } from '../services/schoolInformationService'
import type { SchoolInformationService } from '../services/schoolInformationService'
import { QuestionCard } from './QuestionCard'
import { HelpDrawer } from './HelpDrawer'

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="unit-detail"><dt>{label}</dt><dd>{value?.trim() ? value : ui(displaySchoolDetail(value))}</dd></div>
}

export function Enhetsopplysninger({ school, service = mockSchoolInformationService }: { school: School; service?: SchoolInformationService }) {
  useTranslation('ui')
  const [details, setDetails] = useState<SchoolDetails | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [help, setHelp] = useState<{ id: string; trigger: HTMLButtonElement } | null>(null)
  useEffect(() => {
    let cancelled = false
    service.getSchoolDetails(school).then(result => {
      if (!cancelled) setDetails(result)
    }).catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [school, service, attempt])
  const nsr = details?.nsr
  return <>
    <div className="page-heading"><h2>{ui("1. Enhetsopplysninger")}</h2></div>
    <QuestionCard id="del1-enhet" heading={gsi("GG-H82.question")} kind="content" helpId="GG-H82" onHelp={(id, trigger) => setHelp({ id, trigger })}>
      <div className="unit-panels" aria-busy={!details && !error}>
        {!details ? <div className="unit-panel unit-panel-full" role="status">{error ? <>{ui("Kunne ikke hente enhetsopplysninger.")} <button className="text-button" type="button" onClick={() => { setError(false); setAttempt(value => value + 1) }}>{ui("Prøv igjen")}</button></> : ui("Henter enhetsopplysninger...")}</div> : <>
          <section className="unit-panel unit-panel-full" aria-label={ui("Skolenavn")}><dl className="unit-details"><Detail label={ui("Skolenavn")} value={nsr?.Navn} /></dl></section>
          <section className="unit-panel" aria-labelledby="visiting-address-heading">
            <h4 id="visiting-address-heading">{ui("Besøksadresse")}</h4>
            <dl className="unit-details">
              <Detail label={ui("Adresse")} value={nsr?.BeliggenhetsadresseAdresse} />
              <Detail label={ui("Postnummer")} value={nsr?.BeliggenhetsadressePostnummer} />
              <Detail label={ui("Poststed")} value={nsr?.BeliggenhetsadressePoststed} />
            </dl>
          </section>
          <section className="unit-panel" aria-labelledby="postal-address-heading">
            <h4 id="postal-address-heading">{ui("Postadresse")}</h4>
            <dl className="unit-details">
              <Detail label={ui("Adresse")} value={nsr?.PostadresseAdresse} />
              <Detail label={ui("Postnummer")} value={nsr?.PostadressePostnummer} />
              <Detail label={ui("Poststed")} value={nsr?.PostadressePoststed} />
            </dl>
          </section>
          <section className="unit-panel unit-panel-full" aria-labelledby="organization-contact-heading">
            <h4 id="organization-contact-heading">{ui("Organisasjon og kontakt")}</h4>
            <dl className="unit-details unit-details-columns">
              <Detail label={ui("Skolens organisasjonsnummer")} value={details.selectedSchool.Organisasjonsnummer} />
              <Detail label={ui("Skoleeiers organisasjonsnummer")} value={getSchoolOwnerOrganizationNumber(details)} />
              <Detail label={ui("Driftsansvar")} value={nsr?.Driftsansvar} />
              <Detail label={ui("Telefon")} value={nsr?.Telefon} />
              <Detail label={ui("E-post")} value={nsr?.Epost} />
              <Detail label={ui("Kommunenummer")} value={nsr?.Kommunenummer} />
              <Detail label={ui("Kommunenavn")} value={nsr?.Kommunenavn} />
              <Detail label={ui("Fylkesnummer")} value={nsr?.Fylkesnummer} />
              <Detail label={ui("Fylkesnavn")} value={nsr?.Fylkesnavn} />
            </dl>
          </section>
        </>}
      </div>
    </QuestionCard>
    <p className="unit-data-note">{ui("Fiktive demonstrasjonsopplysninger. Ingen tilkobling til NSR. Manglende opplysninger vises som «Ikke tilgjengelig».")}</p>
    {help && <HelpDrawer key={help.id} helpId={help.id} returnFocusTo={help.trigger} onClose={() => setHelp(null)} />}
  </>
}
