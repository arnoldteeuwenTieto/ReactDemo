import { ReportingInput, ReportingSelect } from './ReportingFields'
import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import type { ReactNode } from 'react'
import { resolveFieldState } from '../domain/fieldState'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
interface QuestionCardProps {
  id: string
  heading: string
  kind: 'radio' | 'select'
  options: { label: string; value: string | number | boolean }[]
  value: string | number | boolean | null
  onChange: (value: string | number | boolean) => void
  canEdit: boolean
  validation?: string
  status: SaveStatus
  onRetry: () => void
  helpId: string
  validationIds: string[]
  onHelp: (helpId: string, trigger: HTMLButtonElement) => void
}
type ReadOnlyQuestionCardProps = Pick<QuestionCardProps, 'id' | 'heading' | 'helpId' | 'onHelp'> & {
  kind: 'content'
  children: ReactNode
}

function QuestionCardFrame({ id, heading, helpId, onHelp, children }: Pick<QuestionCardProps, 'id' | 'heading' | 'helpId' | 'onHelp'> & { children: ReactNode }) {
  useTranslation('ui')
  return <section className="question-card" aria-labelledby={`${id}-heading`}>
    <header className="question-header">
      <h3 id={`${id}-heading`}>{heading}</h3>
      <button type="button" className="question-help-button" aria-label={ui("Vis hjelpetekst")} aria-haspopup="dialog" onClick={event => onHelp(helpId, event.currentTarget)}><span aria-hidden="true">?</span></button>
    </header>
    {children}
  </section>
}

export function QuestionCard(props: QuestionCardProps | ReadOnlyQuestionCardProps) {
  if (props.kind === 'content') return <QuestionCardFrame {...props}>{props.children}</QuestionCardFrame>
  return <InputQuestionCard {...props} />
}

function InputQuestionCard({ id, heading, kind, options, value, onChange, canEdit, validation, status, onRetry, helpId, validationIds, onHelp }: QuestionCardProps) {
  useTranslation('ui')
  const state = resolveFieldState({ canEdit, error: validation })
  const describedBy = [validation ? `${id}-validation` : '', !canEdit ? `${id}-permission` : ''].filter(Boolean).join(' ') || undefined
  return <QuestionCardFrame id={id} heading={heading} helpId={helpId} onHelp={onHelp}>
    <div className="question-answer">
    <fieldset disabled={!canEdit} aria-describedby={describedBy}>
      <legend className="visually-hidden">{heading}</legend>
      {kind === 'radio' ? <div className="question-options">{options.map((option, index) => <label key={index}>
        <ReportingInput fieldKey={id} sectionRef="2" dataType={typeof options[0]?.value === 'number' ? 'integer' : typeof options[0]?.value === 'boolean' ? 'boolean' : 'text'} reportValue={value} className="gsi-field" data-field-state={state.kind} type="radio" name={id} checked={value === option.value} onChange={() => onChange(option.value)} aria-invalid={state.invalid} />{option.label}
      </label>)}</div> : <><label className="visually-hidden" htmlFor={id}>{heading}</label><ReportingSelect fieldKey={id} sectionRef="2" dataType="integer" className="gsi-field" data-field-state={state.kind} id={id} value={value === null ? '' : String(value)} onChange={event => {
        const selected = options.find(option => String(option.value) === event.target.value)
        if (selected) onChange(selected.value)
      }} aria-invalid={!!validation}><option value="" disabled>{ui("Velg trinn")}</option>{options.map(option => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}</ReportingSelect></>}
      {validation && <p className="question-validation" id={`${id}-validation`}>{validation}</p>}
      {!canEdit && <span className="visually-hidden" id={`${id}-permission`}>{ui('Valgt rolle eller rapporteringsstatus gir ikke redigeringstilgang.')}</span>}
      <p className="question-reference">{ui("Valideringsreferanser:")} {validationIds.join(', ')}{ui(". Offisielle formler er ikke implementert.")}</p>
    </fieldset>
    <div className={`question-save question-save-${status}`} role="status">{status === 'saving' ? ui("Lagrer...") : status === 'saved' ? ui("Lagret") : status === 'error' ? <>{ui("Simulert lagringsfeil. Svaret er ikke lagret.")} <button className="gsi-button text-button" type="button" onClick={onRetry} disabled={!canEdit}>{ui("Prøv igjen")}</button></> : ui("Ikke endret")}</div>
    </div>
  </QuestionCardFrame>
}
