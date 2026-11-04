import { ReportingInput } from './ReportingFields'
import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { ui } from '../i18n'
import { fieldNumericError, normalizeFieldNumber } from '../domain/importedReporting'
import type { ImportedField, NumericSection } from '../domain/importedReporting'
import { numberedRows, numericColumn, questionDescription } from './importedQuestionLayout'
import { resolveFieldState } from '../domain/fieldState'
import { FieldAvailability } from './FieldAvailability'

export function ImportedQuestionSection({ id, title, onHelp, children }: { id: string; title: string; onHelp?: (trigger: HTMLButtonElement) => void; children: ReactNode }) {
  return <section className="question-card imported-question" aria-labelledby={id}>
    <header className="question-header"><h3 id={id}>{ui(title)}</h3>
      {onHelp && <button className="question-help-button" type="button" aria-label={ui('Vis hjelpetekst')} aria-haspopup="dialog" onClick={event => onHelp(event.currentTarget)}><span aria-hidden="true">?</span></button>}
    </header><div className="imported-section-content">{children}</div>
  </section>
}

export function NumericCell({ field, id, label, value, relevant, editable, validated, businessReason, onChange }: {
  field: ImportedField; id: string; label: string; value: string; relevant: boolean; editable: boolean; validated: boolean; businessReason: string; onChange: (value: string) => void
}) {
  const [visited, setVisited] = useState(false)
  const error = relevant && !field.readOnly ? fieldNumericError(field, value) : null
  const invalid = !!error && value !== ''
  const state = resolveFieldState({ canEdit: editable, applicable: relevant, calculated: field.readOnly, error: invalid ? error : null })
  const unavailable = field.readOnly && value === ''
  return <td className={field.readOnly ? 'imported-cell--calculated' : undefined}>
    <label className="visually-hidden" htmlFor={id}>{label}</label>
    <span className={`field-control${!relevant ? ' field-control--locked' : ''}`}>
    <ReportingInput fieldKey={field.sqlColumn ?? field.key} sectionRef={field.sectionRef ?? label.match(/^\d+[A-Z](?:\.\d+)?/)?.[0]} dataType={field.numericKind === 'decimal' ? 'decimal' : 'integer'} origin={field.origin ?? (field.readOnly ? field.terms.length || field.sourceSection ? 'calculated' : 'backend' : 'user')} data-field={field.key} data-field-state={state.kind} id={id} type="text" inputMode={field.numericKind === 'decimal' ? 'decimal' : 'numeric'} className="imported-number gsi-field" value={value}
      readOnly={state.readOnly} disabled={state.disabled} aria-invalid={state.invalid}
      aria-describedby={[state.invalid ? `${id}-error` : '', !relevant ? `${id}-rule` : '', unavailable ? `${id}-unavailable` : '', !editable && relevant && !field.readOnly ? `${id}-permission` : ''].filter(Boolean).join(' ') || undefined}
      placeholder={unavailable ? '—' : undefined} onBlur={() => { setVisited(true); if (state.editable && normalizeFieldNumber(field, value) !== value) onChange(normalizeFieldNumber(field, value)) }} onChange={event => onChange(event.target.value)} />
    {!relevant && <FieldAvailability id={`${id}-rule`} label={label} reason={businessReason} />}
    </span>
    {state.invalid && <span id={`${id}-error`} className={visited || validated ? 'question-validation imported-cell-error' : 'visually-hidden'}>{ui(error!)}</span>}
    {unavailable && <span id={`${id}-unavailable`} className="visually-hidden">{ui('Verdien er ikke tilgjengelig.')}</span>}
    {!editable && relevant && !field.readOnly && <span id={`${id}-permission`} className="visually-hidden">{ui('Valgt rolle eller rapporteringsstatus gir ikke redigeringstilgang.')}</span>}
  </td>
}

export interface QuestionColumnGroup { title: string; table: string; columns: { fieldColumn: string; label: string }[] }

export function ImportedQuestionTable({ section, group, title, fields, values, answers, canEdit, validated, businessReason, isRelevant, onChange, columnGroups, rowHeading = 'Spørsmål' }: {
  section: NumericSection; group: string; title: string; fields: ImportedField[]
  values: Record<string, number | null>; answers: Record<string, string>; canEdit: boolean
  validated: boolean; businessReason: string
  isRelevant: (field: ImportedField) => boolean; onChange: (field: string, value: string) => void
  columnGroups?: QuestionColumnGroup[]
  rowHeading?: string
}) {
  const columns = [...new Set(fields.map(field => numericColumn(section, group, field)))]
  if (columns.length === 3 && columns.includes('Gutter') && columns.includes('Jenter')) columns.sort((a, b) => ['Gutter', 'Jenter', 'Sum'].indexOf(a) - ['Gutter', 'Jenter', 'Sum'].indexOf(b))
  const genders = columns.length === 3 && columns[2] === 'Sum' && ['Gutter', 'Menn'].includes(columns[0])
  const descriptionWidth = genders ? 45 : columns.length === 1 ? 60 : columns.length > 3 ? 35 : 45
  const numericWidth = (95-descriptionWidth)/columns.length
  const displayedColumns = columnGroups
    ? columnGroups.flatMap(group => group.columns.map(column => ({ ...column, table: group.table, groupTitle: group.title })))
    : columns.map(column => ({ fieldColumn: column, label: column, table: undefined, groupTitle: '' }))
  return <div className="imported-grid-scroll" role="region" aria-label={ui(title)} tabIndex={0}>
    <table style={{'--numeric-columns':displayedColumns.length} as CSSProperties} className={`imported-grid${columnGroups ? ' imported-grid--competence' : genders ? ' imported-grid--genders' : columns.length === 1 ? ' imported-grid--single' : ''}${displayedColumns.length > 7 ? ' imported-grid--wide' : ''}`}>
      <caption className="visually-hidden">{ui(title)}</caption>
      {columnGroups ? <>
        <colgroup><col style={{ width: '4%' }} /><col style={{ width: '19%' }} /></colgroup>
        {columnGroups.map(group => <colgroup key={group.table}>{group.columns.map(column => <col key={column.fieldColumn} style={{ width: `${77 / displayedColumns.length}%` }} />)}</colgroup>)}
      </> : <colgroup><col style={{ width: '5%' }} /><col style={{ width: `${descriptionWidth}%` }} />
        {columns.map(column => <col key={column} style={{ width: `${numericWidth}%` }} />)}</colgroup>}
      <thead>{columnGroups && <tr><th scope="col" rowSpan={2} className="imported-question-number">{ui('Nr.')}</th><th scope="col" rowSpan={2}>{ui(rowHeading)}</th>{columnGroups.map(group => <th key={group.table} scope="colgroup" colSpan={group.columns.length}>{ui(group.title)}</th>)}</tr>}
        <tr>{!columnGroups && <><th scope="col" className="imported-question-number">{ui('Nr.')}</th><th scope="col">{ui('Spørsmål')}</th></>}{displayedColumns.map(column => <th key={`${column.table ?? ''}:${column.fieldColumn}`} scope="col">{ui(column.label)}</th>)}</tr></thead>
      <tbody>{numberedRows(fields).map(([number, row]) => {
        const description = questionDescription(section, group, row[0])
        return <tr key={number} className={row.every(field => field.readOnly) ? 'imported-total-row' : undefined}>
          <td className="imported-question-number">{number}</td><th scope="row">{ui(description)}</th>
          {displayedColumns.map(column => {
            const field = row.find(item => numericColumn(section, group, item) === column.fieldColumn && (!column.table || item.table === column.table))
            return field ? <NumericCell key={field.key} field={field} id={`import-${section}-${field.control}`} label={`${section}${group}.${number} ${ui(description)}, ${column.groupTitle ? `${ui(column.groupTitle)}, ` : ''}${ui(column.label)}`}
              value={field.readOnly ? String(values[field.key] ?? '') : answers[field.key] ?? ''} relevant={isRelevant(field)} editable={canEdit} validated={validated} businessReason={businessReason} onChange={value => onChange(field.key, value)} /> : <td key={`${column.table ?? ''}:${column.fieldColumn}`} />
          })}
        </tr>
      })}</tbody>
    </table>
  </div>
}
