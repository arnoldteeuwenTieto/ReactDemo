import { ReportingTextarea } from './ReportingFields'
import { ReportingValue } from './ReportingFields'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { ui, gsi } from '../i18n'
import type { School } from '../mockData'
import type { FormStatusId } from '../domain/formStatus'
import { useDemoUser } from '../demoUserContext'
import { canEditDemoReport, getDemoReportPermissions } from '../domain/demoPermissions'
import { canSubmitMock, mockValidationOverview, importedScreens } from '../domain/importedReporting'
import type { Finding, NumericSection } from '../domain/importedReporting'
import { questions } from '../domain/del2'
import { questionDescription } from './importedQuestionLayout'
import { getMockReportRevision, mockSkjemaStatusId, subscribeMockReports } from '../services/grunnskoleApi'
import { actionTarget, canEditRemark, markMockChecked, performMockAction, readImportedReport, recordMockSupplier, saveControllerComment, saveRemark } from '../services/importedReportService'
import type { MockAction } from '../services/importedReportService'
import { ImportedQuestionSection } from './ImportedQuestionTable'
import { HelpDrawer } from './HelpDrawer'
import { resolveFieldState } from '../domain/fieldState'
import { languageCollections } from '../domain/languageCollections'
import type { CollectionId } from '../domain/languageCollections'

const actions: { action: MockAction; label: string }[] = [
  { action: 'submit', label: 'Lever skjema' }, { action: 'approve', label: 'Godkjenn' }, { action: 'reject', label: 'Avvis' },
]
function findingTitle(finding: Finding, index: number) {
  const [collectionId, , collectionField] = finding.field?.split(':') ?? []
  const collection = languageCollections[collectionId as CollectionId]
  if (collection) return `${collectionId} ${ui(collection.columns.find(column => column.key === collectionField)?.label ?? collection.selectorLabel)}`
  const question = questions.find(item => item.field === finding.field)
  if (finding.section === 2 && question) return gsi(question.field)
  if (finding.section >= 3 && finding.section <= 10) {
    const field = importedScreens[finding.section as NumericSection].fields.find(item => item.key === finding.field)
    if (field) return `${finding.section}${field.group}.${field.questionNumber} ${ui(questionDescription(finding.section as NumericSection, field.group, field))}`
  }
  return `${ui('Kontroll')} ${index + 1} · ${ui('Del')} ${finding.section}`
}
export function ImportedWorkflowSection({ school, section, onSection, onStatusChange }: {
  school: School; section: 17 | 18; onSection: (section: number) => void; onStatusChange: (status: FormStatusId) => void
}) {
  useTranslation('ui')
  useSyncExternalStore(subscribeMockReports, getMockReportRevision)
  const { enabled, selectedUser } = useDemoUser()
  const context = { enabled, user: selectedUser, school }
  const rights = getDemoReportPermissions(context)
  const report = readImportedReport(mockSkjemaStatusId(school))
  const overview = report.checked ? mockValidationOverview(report, school.municipality, { del2: canEditDemoReport(context), imported: rights.edit }) : null
  const findings = overview?.findings ?? []
  const [pending, setPending] = useState<MockAction | null>(null)
  const [message, setMessage] = useState('')
  const [help, setHelp] = useState<{ id: string; trigger: HTMLButtonElement } | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (pending) dialog.current?.showModal()
    else dialog.current?.close()
  }, [pending])
  function confirm() {
    if (!pending) return
    const status = performMockAction(context, pending)
    if (status === null) { setMessage('Handlingen er ikke tillatt eller rapporten er ufullstendig.'); setPending(null); return }
    onStatusChange(status)
    setMessage('Handlingen er simulert lokalt. Ingen data er sendt til BOGIAPI.')
    setPending(null)
  }
  if (!rights.read) return <><h2>{section}. {ui(section === 17 ? 'Kontroller' : 'Fullfør')}</h2><p role="note">{ui('Ingen tilgang')}</p></>
  return <>
    <h2>{section}. {ui(section === 17 ? 'Kontroller' : 'Fullfør')}</h2>
    <span className="visually-hidden" id="workflow-permission-reason">{ui('Valgt rolle eller rapporteringsstatus gir ikke redigeringstilgang.')}</span>
    {section === 17 ? <>
      <p>{ui('Kontroller som ikke er tilgjengelige, er ikke vurdert.')}</p>
      <button type="button" className="gsi-button" onClick={() => markMockChecked(context)}>{ui('Kontroller skjema')}</button>
      {!report.checked ? <p role="status">{ui('Kontroll er ikke kjørt.')}</p> : <>
        <p role="status">{ui('Lokale feil')}: {findings.filter(finding => finding.kind === 'error').length} · {ui('Advarsler')}: {findings.filter(finding => finding.kind === 'warning').length} · {ui('Uavklarte kontroller')}: {findings.filter(finding => finding.kind === 'unsupported').length} · {ui('Beståtte lokale tallkontroller')}: {overview?.passedNumericChecks ?? 0}</p>
        <div className="imported-findings">{findings.map((finding, index) => <section className="question-card" key={`${finding.section}-${finding.id}`} data-controller={finding.id} aria-label={`${ui('Kontroll')} ${index + 1}`}>
          <div className="imported-section-content">
          <h3>{findingTitle(finding, index)}</h3>
          <p>{ui(finding.kind === 'unsupported' ? 'Denne kontrollen kan ikke vurderes ennå.' : finding.kind === 'warning' ? 'Feltet er ikke besvart.' : finding.message.replace(' (Demonstrasjonsvalidering)', ''))}</p>
          <p>{ui(finding.kind === 'error' ? 'Lokal feil' : finding.kind === 'warning' ? 'Advarsel' : 'Ikke vurdert')}</p>
          <button type="button" className="gsi-button" onClick={() => onSection(finding.section)}>{ui('Gå til del')} {finding.section}</button>
          <label>{ui('Kommentar')} {index + 1}<ReportingTextarea sectionRef={String(section)} dataType="text" className="gsi-field" data-field-state={resolveFieldState({ canEdit: rights.edit }).kind} aria-describedby={!rights.edit ? 'workflow-permission-reason' : undefined} disabled={!rights.edit} value={report.comments[finding.id] ?? ''} onChange={event => saveControllerComment(context, finding.id, event.target.value)} /></label>
          </div>
        </section>)}</div>
      </>}
    </> : <>
      <ImportedQuestionSection id="finish-supplier" title="A. Opplysningene er gitt av" onHelp={trigger => setHelp({ id: 'GG_H57', trigger })}>
        <dl><dt>{ui('Navn')}</dt><ReportingValue sectionRef="18">{report.suppliedBy?.name ?? ui('Ikke registrert')}</ReportingValue><dt>{ui('E-post')}</dt><ReportingValue sectionRef="18">{report.suppliedBy?.email ?? ui('Ikke registrert')}</ReportingValue><dt>{ui('Rolle')}</dt><ReportingValue sectionRef="18">{report.suppliedBy?.role ?? ui('Ikke registrert')}</ReportingValue></dl>
        <button className="gsi-button" type="button" disabled={!rights.edit} onClick={() => recordMockSupplier(context)}>{ui('Bruk mine demoopplysninger')}</button>
      </ImportedQuestionSection>
      <ImportedQuestionSection id="finish-remarks" title="Merknader" onHelp={trigger => setHelp({ id: 'GG_H58', trigger })}>
        {(['MerknadSkole', 'MerknadKommune'] as const).map(field => <label className="imported-remark" key={field}>{ui(field === 'MerknadSkole' ? 'Skolens merknader' : 'Kommunens merknader')}
          <ReportingTextarea sectionRef={String(section)} dataType="text" className="gsi-field" data-field-state={resolveFieldState({ canEdit: canEditRemark(context, field) }).kind} aria-describedby={!canEditRemark(context, field) ? 'workflow-permission-reason' : undefined} fieldKey={field} value={report[field]} disabled={!canEditRemark(context, field)} onChange={event => saveRemark(context, field, event.target.value)} />
        </label>)}
      </ImportedQuestionSection>
      <p>{ui('Kontroller og fullfør svarene før du leverer.')}</p>
      <button className="gsi-button" type="button" onClick={() => onSection(17)}>{ui('Gå til kontroller')}</button>
      <div className="imported-actions">{actions.filter(item => rights[item.action]).map(({ action, label }) => <button className="gsi-button" key={action} type="button"
        disabled={actionTarget(context, action) === null || (action === 'submit' && !canSubmitMock(report, school.municipality))}
        onClick={() => { if (actionTarget(context, action) !== null) setPending(action) }}>{ui(label)}</button>)}</div>
      {rights.reject && actionTarget(context, 'reject') === null && <p>{ui('Avvisning er ikke tilgjengelig i denne løsningen ennå.')}</p>}
      <p role="status">{message ? ui(message) : ''}</p>
    </>}
    <dialog ref={dialog} onCancel={() => setPending(null)} aria-labelledby="mock-confirm-heading">
      <h3 id="mock-confirm-heading">{ui('Bekreft simulert handling')}</h3>
      <p>{pending ? ui(actions.find(item => item.action === pending)!.label) : ''} · {school.name} · {school.year}</p>
      <p>{ui('Ingen data sendes til BOGIAPI.')}</p>
      <button className="gsi-button" type="button" onClick={() => setPending(null)}>{ui('Avbryt')}</button>
      <button className="gsi-button" type="button" disabled={!pending || actionTarget(context, pending) === null} onClick={confirm}>{ui('Bekreft')}</button>
    </dialog>
    {help && <HelpDrawer key={help.id} helpId={help.id} returnFocusTo={help.trigger} showReference={false} onClose={() => setHelp(null)} />}
  </>
}
