import { ui } from '../i18n'
import type { Del2Data } from '../domain/del2'
import { collectionApplicable, collectionTotals, languageCollections, type CollectionRow } from '../domain/languageCollections'
import { NumericCell } from './ImportedQuestionTable'
import { ReportingSelect } from './ReportingFields'
import type { ImportedField } from '../domain/importedReporting'
import { calculatedNumberText } from '../domain/fieldPresentation'
import type { CSSProperties } from 'react'

export function ElectiveTable({rows,del2,canEdit,validated,onChange}:{rows:CollectionRow[];del2:Del2Data;canEdit:boolean;validated:boolean;onChange:(rows:CollectionRow[])=>void}){
 const def=languageCollections['11A'],totals=collectionTotals(def,rows,del2)
 const wideBlockedValue=rows.some(row=>def.columns.some(column=>!collectionApplicable(def,row,column,del2)&&(row[column.key]?.length??0)>2))
 const cell=(key:string,value:string,label:string,readOnly:boolean,relevant=true,change=(value:string)=>{void value})=>{
  const field:ImportedField={key,control:key,group:'A',questionNumber:'',label,readOnly,maxDigits:readOnly?12:4,terms:[],origin:readOnly?'calculated':'user',sqlColumn:readOnly?'':key.slice(key.indexOf('GG_')),sectionRef:'11A',minimumExclusive:readOnly?undefined:0}
  return <NumericCell key={key} id={`elective-${key}`} field={field} label={label} value={value} relevant={relevant} editable={canEdit} validated={validated} businessReason={ui('Velg valgfag først. Tilgjengelige trinn styres av del 2 B og C.')} onChange={change}/>
 }
 const cells=(row:CollectionRow|undefined,index:number)=>[8,9,10].flatMap((grade,g)=>{
   const numeric=def.columns.slice(g*2,g*2+2)
   return [...numeric.map((column,c)=>cell(`${row?.id??'total'}-${column.key}`,row?row[column.key]??'':calculatedNumberText(totals.columns[g*2+c]),`${row?`${index+1} ${row[def.selector]??''}`:'Sum'}, ${ui(column.label)}`,!row,row?collectionApplicable(def,row,column,del2):true,value=>onChange(rows.map(other=>other.id===row?.id?{...other,[column.key]:value}:other)))),
    cell(`${row?.id??'total'}-grade-${grade}`,calculatedNumberText((row?collectionTotals(def,[row],del2).columns:totals.columns).slice(g*2,g*2+2).reduce((sum,n)=>sum+n,0)),`${grade}. trinn Sum ${row?index+1:'alle'}`,true)]
 })
 return <><div className="imported-grid-scroll" role="region" aria-label={ui('Antall elever med valgfag')} tabIndex={0}><table style={{'--elective-numeric-min':wideBlockedValue?'96px':'56px'} as CSSProperties} className="imported-grid imported-grid--electives">
 <caption className="visually-hidden">{ui('Antall elever med valgfag')}</caption>
 <colgroup><col style={{width:'3%'}}/><col style={{width:'22%'}}/>{Array.from({length:10},(_,i)=><col key={i} style={{width:'7%'}}/>)}<col style={{width:'5%'}}/></colgroup>
 <thead><tr><th rowSpan={2} scope="col">{ui('Nr.')}</th><th rowSpan={2} scope="col">{ui('Valgfag')}</th>{[8,9,10].map(g=><th key={g} colSpan={3} scope="colgroup">{g}. trinn</th>)}<th rowSpan={2} scope="col">{ui('Sum')}</th><th rowSpan={2} scope="col"><span className="visually-hidden">{ui('Fjern rad')}</span></th></tr><tr>{[8,9,10].flatMap(g=>['Gutter','Jenter','Sum'].map(c=><th key={`${g}-${c}`} scope="col">{ui(c)}</th>))}</tr></thead>
 <tbody>{rows.map((row,index)=><tr key={row.id}><th scope="row">{index+1}</th><td><label className="visually-hidden" htmlFor={`elective-choice-${row.id}`}>{ui('Valgfag')} {index+1}</label><ReportingSelect id={`elective-choice-${row.id}`} fieldKey={def.selector} sectionRef="11A" className="gsi-field imported-choice" disabled={!canEdit} value={row[def.selector]??''} onChange={e=>onChange(rows.map(other=>other.id===row.id?{...other,[def.selector]:e.target.value}:other))}><option value="">{ui('Velg valgfag')}</option>{[...new Set([...def.options,...rows.map(r=>r[def.selector]).filter(Boolean)])].filter(option=>option===row[def.selector]||!rows.some(r=>r[def.selector]===option)).map(option=><option key={option}>{option}</option>)}</ReportingSelect></td>{cells(row,index)}{cell(`${row.id}-sum`,calculatedNumberText(totals.rows[index]),`Sum ${row[def.selector]||index+1}`,true)}<td><button type="button" className="municipality-remove-button" disabled={!canEdit} aria-label={`${ui('Fjern')} ${row[def.selector]||index+1}`} onClick={()=>onChange(rows.filter(r=>r.id!==row.id))}>×</button></td></tr>)}</tbody>
 <tfoot><tr className="imported-total-row"><th colSpan={2} scope="row">{ui('Sum elever')}</th>{cells(undefined,0)}{cell('grand-total',calculatedNumberText(totals.total),ui('Sum elever'),true)}<td/></tr></tfoot>
 </table></div><button className="gsi-button municipality-add-button" disabled={!canEdit} type="button" onClick={()=>onChange([...rows,{id:crypto.randomUUID(),[def.selector]:''}])}><span aria-hidden="true">+</span> {ui('Legg til valgfag')}</button></>
}
