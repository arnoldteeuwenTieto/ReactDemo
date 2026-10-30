import { useTranslation } from 'react-i18next'
import { ui, gsi } from '../i18n'
import { useEffect, useRef, useState } from 'react'
import type { School } from '../mockData'
import { emptyDel2, questions, questionReferences, validateDel2 } from '../domain/del2'
import type { Del2Data, Del2Field } from '../domain/del2'
import { getApiLogs, getGsiSkjemaStatus, grunnskoleSave, mockSkjemaStatusId } from '../services/grunnskoleApi'
import { QuestionCard } from './QuestionCard'
import type { SaveStatus } from './QuestionCard'
import { HelpDrawer } from './HelpDrawer'
import { useDemoUser } from '../demoUserContext'
import { canEditDemoReport } from '../domain/demoPermissions'

export function OmSkolen({ school }: { school: School }) {
  useTranslation('ui')
  const { enabled, selectedUser } = useDemoUser()
  const canEdit = canEditDemoReport({ enabled, user: selectedUser, school })
  const id = mockSkjemaStatusId(school)
  const [form, setForm] = useState<Del2Data>(emptyDel2)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [statuses, setStatuses] = useState<Partial<Record<Del2Field, SaveStatus>>>({})
  const [logs, setLogs] = useState(() => getApiLogs(id))
  const [help, setHelp] = useState<{ id: string; trigger: HTMLButtonElement } | null>(null)
  const versions = useRef<Partial<Record<Del2Field, number>>>({})
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    let cancelled = false
    getGsiSkjemaStatus(id).then(result => {
      if (!cancelled) { setForm(result.del2); setLoaded(true) }
    }).catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true; active.current = false }
  }, [id])
  const validation = validateDel2(form)
  function save(field: Del2Field, value: Del2Data[Del2Field]) {
    // Also guards retries and callbacks: disabling inputs alone is insufficient.
    if (!canEdit) return
    setForm(previous => ({ ...previous, [field]: value }))
    const version = (versions.current[field] ?? 0) + 1
    versions.current[field] = version
    setStatuses(previous => ({ ...previous, [field]: 'saving' }))
    // Exactly one changed Del 2 field per request, including actual boolean SFO values.
    const payload = { [field]: value } as Partial<Del2Data>
    grunnskoleSave(id, 2, payload).then(() => {
      if (active.current && versions.current[field] === version) setStatuses(previous => ({ ...previous, [field]: 'saved' }))
    }).catch(() => {
      if (active.current && versions.current[field] === version) setStatuses(previous => ({ ...previous, [field]: 'error' }))
    }).finally(() => { if (active.current) setLogs(getApiLogs(id)) })
  }
  return <>
    <div className="page-heading"><h2>{ui("2. Om skolen")}</h2></div>
    {!canEdit && <p role="note">{ui('DEMO: Skrivebeskyttet. Redigering krever status 1, skoletilgang og rolle 9 eller kommunesentral rolle 10.')}</p>}
    {!loaded ? <p role="status">{loadError ? ui("Kunne ikke hente lokale demonstrasjonsdata. Last siden på nytt.") : ui("Henter lokale demonstrasjonsdata...")}</p> : <div className="question-list">{questions.map(question => <QuestionCard key={question.field} id={question.field} heading={gsi(question.field)} kind={question.kind} canEdit={canEdit} options={question.options.map(option => ({ ...option, label: gsi(`${question.field}:${String(option.value)}`) }))} value={form[question.field]} onChange={value => save(question.field, value)} validation={validation[question.field] ? ui(validation[question.field]!) : undefined} status={statuses[question.field] ?? 'idle'} onRetry={() => save(question.field, form[question.field])} onHelp={(helpId, trigger) => setHelp({ id: helpId, trigger })} {...questionReferences[question.field]} />)}</div>}
    {help && <HelpDrawer key={help.id} helpId={help.id} returnFocusTo={help.trigger} onClose={() => setHelp(null)} />}
    <details className="api-debug"><summary>{ui("API Debug")}</summary>
      <p>{ui("Valgt skole:")} {school.name} · {school.id} · {school.year}</p><p>{ui("SkjemaStatusId (mock):")} {id} {ui("· Del: 2")}</p>
      <p>{ui("Kun lokal simulering. Hver sjuende lagring feiler før data endres. Avhengige oppdateringer inngår i samme simulerte operasjon.")}</p>
      {logs.length ? logs.map((log, index) => <pre key={index}>{JSON.stringify(log, null, 2)}</pre>) : <p>{ui("Ingen lagringskall ennå.")}</p>}
    </details>
  </>
}
