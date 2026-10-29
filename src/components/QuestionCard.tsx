import type { ReactNode } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
interface QuestionCardProps {
  id: string
  heading: string
  kind: 'radio' | 'select'
  options: { label: string; value: string | number | boolean }[]
  value: string | number | boolean | null
  onChange: (value: string | number | boolean) => void
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
  return <section className="question-card" aria-labelledby={`${id}-heading`}>
    <header className="question-header">
      <h3 id={`${id}-heading`}>{heading}</h3>
      <button type="button" className="question-help-button" aria-label="Vis hjelpetekst" aria-haspopup="dialog" onClick={event => onHelp(helpId, event.currentTarget)}><span aria-hidden="true">?</span></button>
    </header>
    {children}
  </section>
}

export function QuestionCard(props: QuestionCardProps | ReadOnlyQuestionCardProps) {
  if (props.kind === 'content') return <QuestionCardFrame {...props}>{props.children}</QuestionCardFrame>
  return <InputQuestionCard {...props} />
}

function InputQuestionCard({ id, heading, kind, options, value, onChange, validation, status, onRetry, helpId, validationIds, onHelp }: QuestionCardProps) {
  const describedBy = validation ? `${id}-validation` : undefined
  return <QuestionCardFrame id={id} heading={heading} helpId={helpId} onHelp={onHelp}>
    <div className="question-answer">
    <fieldset aria-describedby={describedBy}>
      <legend className="visually-hidden">{heading}</legend>
      {kind === 'radio' ? <div className="question-options">{options.map((option, index) => <label key={index}>
        <input type="radio" name={id} checked={value === option.value} onChange={() => onChange(option.value)} aria-invalid={!!validation} />{option.label}
      </label>)}</div> : <><label className="visually-hidden" htmlFor={id}>{heading}</label><select id={id} value={value === null ? '' : String(value)} onChange={event => {
        const selected = options.find(option => String(option.value) === event.target.value)
        if (selected) onChange(selected.value)
      }} aria-invalid={!!validation}><option value="" disabled>Velg trinn</option>{options.map(option => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}</select></>}
      {validation && <p className="question-validation" id={`${id}-validation`}>{validation}</p>}
      <p className="question-reference">Valideringsreferanser: {validationIds.join(', ')}. Offisielle formler er ikke implementert.</p>
    </fieldset>
    <div className={`question-save question-save-${status}`} role="status">{status === 'saving' ? 'Lagrer...' : status === 'saved' ? 'Lagret' : status === 'error' ? <>Simulert lagringsfeil. Svaret er ikke lagret. <button className="text-button" type="button" onClick={onRetry}>Prøv igjen</button></> : 'Ikke endret'}</div>
    </div>
  </QuestionCardFrame>
}
