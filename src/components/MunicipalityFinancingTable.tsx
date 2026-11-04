import { ReportingInput, ReportingSelect } from './ReportingFields'
import { useState } from 'react'
import { ui } from '../i18n'
import { numericError } from '../domain/importedReporting'
import type { MunicipalityRow } from '../domain/importedReporting'
import { resolveFieldState } from '../domain/fieldState'
import { FieldAvailability } from './FieldAvailability'

function MunicipalityCount({ row, canEdit, validated, onChange, dependencyReason, countLabel, sqlFields, sectionRef }: { row: MunicipalityRow; canEdit: boolean; validated: boolean; onChange: (value: string) => void; dependencyReason: string; countLabel: string; sqlFields: {choice:string;count:string}; sectionRef:string }) {
  const [interacted, setInteracted] = useState(false)
  const relevant = !!row.GG_887_Finansiert_Annen_Kommune
  const value = row.GG_886_Elever_Finansiert_Annen_Kommune
  const error = relevant && (canEdit || value !== '') ? numericError(value, 4) : null
  const state = resolveFieldState({ canEdit, applicable: relevant, error: value !== '' || interacted || validated ? error : null })
  const id = `municipality-${row.id}`
  return <>
    <label className="visually-hidden" htmlFor={`${id}-count`}>{ui(countLabel)}</label>
    <span className={`field-control${!relevant ? ' field-control--locked' : ''}`}>
      <ReportingInput fieldKey={sqlFields.count} sectionRef={sectionRef} dataType="integer" id={`${id}-count`} className="imported-number gsi-field" data-field-state={state.kind} type="text" inputMode="numeric" disabled={state.disabled} value={value}
        aria-required={relevant && canEdit} aria-invalid={state.invalid}
        aria-describedby={!relevant ? `${id}-rule` : error ? `${id}-error` : undefined}
        onFocus={() => setInteracted(true)} onBlur={() => setInteracted(true)} onChange={event => onChange(event.target.value)} />
      {!relevant && <FieldAvailability id={`${id}-rule`} label={ui(countLabel)} reason={ui(dependencyReason)} />}
      {error && <span id={`${id}-error`} className={interacted || validated ? 'question-validation imported-cell-error' : 'visually-hidden'}>{ui(error)}</span>}
    </span>
  </>
}

export function MunicipalityFinancingTable({ rows, municipalities, ownMunicipality, canEdit, validated, onChange, caption = 'Finansiering fra annen kommune', totalLabel = 'Sum finansierte elever', dependencyReason = 'Velg finansierende kommune i del 3 E før du fyller ut antall elever.', countLabel = 'Antall elever', rowLabel = 'Finansierende kommune', sectionRef = '3E', sqlFields = {choice:'GG_887_Finansiert_Annen_Kommune',count:'GG_886_Elever_Finansiert_Annen_Kommune'} }: {
  rows: MunicipalityRow[]; municipalities: string[]; ownMunicipality: string; canEdit: boolean; validated: boolean
  onChange: (rows: MunicipalityRow[]) => void
  sectionRef?: string; sqlFields?: {choice:string;count:string}; caption?: string; totalLabel?: string; dependencyReason?: string; countLabel?: string; rowLabel?: string
}) {
  const total = rows.reduce((sum, row) => sum + (numericError(row.GG_886_Elever_Finansiert_Annen_Kommune, 4) ? 0 : Number(row.GG_886_Elever_Finansiert_Annen_Kommune)), 0)
  return <>
    <div className="imported-grid-scroll" role="region" aria-label={ui(caption)} tabIndex={0}>
      <table className="imported-grid imported-grid--financing">
        <caption className="visually-hidden">{ui(caption)}</caption>
        <colgroup><col style={{ width: '32px' }} /><col /><col style={{ width: '128px' }} /><col style={{ width: '40px' }} /></colgroup>
        <thead><tr><th scope="col" className="imported-question-number">{ui('Nr.')}</th><th scope="col">{ui('Kommune')}</th><th scope="col">{ui(countLabel)}</th><th scope="col"><span className="visually-hidden">{ui('Fjern rad')}</span></th></tr></thead>
        <tbody>{rows.map((row, index) => {
          const municipality = row.GG_887_Finansiert_Annen_Kommune
          const removeLabel = municipality ? ui('Fjern {{municipality}}', { municipality }) : ui('Fjern rad {{number}}', { number: index + 1 })
          return <tr key={row.id} aria-label={`${ui(rowLabel)} ${index + 1}`}>
            <th scope="row" className="imported-question-number">{index + 1}</th>
            <td>
              <label className="visually-hidden" htmlFor={`municipality-${row.id}-name`}>{ui('Kommune')}</label>
              <ReportingSelect fieldKey={sqlFields.choice} sectionRef={sectionRef} dataType="text" id={`municipality-${row.id}-name`} className="gsi-field" data-field-state={resolveFieldState({ canEdit }).kind} disabled={!canEdit} value={municipality}
                onChange={event => onChange(rows.map(item => item.id === row.id ? { ...item, GG_887_Finansiert_Annen_Kommune: event.target.value } : item))}>
                <option value="">{ui('Velg kommune')}</option>
                {municipalities.filter(name => name !== ownMunicipality && !rows.some(item => item.id !== row.id && item.GG_887_Finansiert_Annen_Kommune === name)).map(name => <option key={name}>{name}</option>)}
              </ReportingSelect>
            </td>
            <td><MunicipalityCount sqlFields={sqlFields} sectionRef={sectionRef} countLabel={countLabel} row={row} canEdit={canEdit} validated={validated} dependencyReason={dependencyReason} onChange={value => onChange(rows.map(item => item.id === row.id ? { ...item, GG_886_Elever_Finansiert_Annen_Kommune: value } : item))} /></td>
            <td className="municipality-action-cell"><button className="municipality-remove-button" type="button" disabled={!canEdit} aria-label={removeLabel} title={removeLabel} onClick={() => onChange(rows.filter(item => item.id !== row.id))}><span aria-hidden="true">×</span></button></td>
          </tr>
        })}</tbody>
        <tfoot><tr className="imported-total-row"><th scope="row" colSpan={2}>{ui(totalLabel)}</th><td><ReportingInput origin="calculated" sectionRef={sectionRef} dataType="integer" className="imported-number gsi-field" data-field-state="calculated" aria-label={ui(totalLabel)} value={total} readOnly /></td><td /></tr></tfoot>
      </table>
    </div>
    <button className="gsi-button municipality-add-button" type="button" disabled={!canEdit} onClick={() => onChange([...rows, { id: crypto.randomUUID(), GG_887_Finansiert_Annen_Kommune: '', GG_886_Elever_Finansiert_Annen_Kommune: '' }])}><span aria-hidden="true">+</span> {ui('Legg til kommune')}</button>
  </>
}
