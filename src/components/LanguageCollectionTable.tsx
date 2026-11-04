import { ReportingInput, ReportingSelect } from './ReportingFields'
import { useState } from 'react'
import { ui } from '../i18n'
import type { Del2Data } from '../domain/del2'
import type { ImportedField } from '../domain/importedReporting'
import { collectionApplicable, collectionTotals, languageCollections } from '../domain/languageCollections'
import type { CollectionId, CollectionRow } from '../domain/languageCollections'
import { NumericCell } from './ImportedQuestionTable'

function CollectionChoice({ id, row, rows, canEdit, municipalities, ownMunicipality, onChange, validated }: {id: CollectionId;row: CollectionRow;rows: CollectionRow[];canEdit:boolean;municipalities:string[];ownMunicipality:string;onChange:(value:string)=>void;validated:boolean}){
 const def=languageCollections[id],value=row[def.selector]??'',inputId=`${id}-${row.id}-choice`
 const [visited,setVisited]=useState(false)
 const invalid=!!value&&((def.municipality&&value===ownMunicipality)||rows.some(other=>other.id!==row.id&&other[def.selector]===value))
 const options=[...new Set([...(def.municipality?municipalities:def.options),...(value?[value]:[])])].sort((a,b)=>a.localeCompare(b,'nb'))
 return <><label className="visually-hidden" htmlFor={inputId}>{ui(def.selectorLabel)}</label>
 {def.lockChoice&&value?<ReportingInput origin="user" fieldKey={def.selector} sectionRef={id} dataType="text" id={inputId} className="gsi-field imported-choice" data-field-state="calculated" data-field={def.selector} value={value} readOnly aria-invalid={invalid} aria-describedby={invalid?`${inputId}-error`:undefined} />:
 <ReportingSelect fieldKey={def.selector} sectionRef={id} dataType="text" id={inputId} className="gsi-field imported-choice" data-field={def.selector} data-field-state={canEdit?'editable':'permission-readonly'} disabled={!canEdit} value={value} aria-invalid={invalid} aria-describedby={invalid?`${inputId}-error`:undefined} onBlur={()=>setVisited(true)} onChange={event=>onChange(event.target.value)}>
  <option value="">{ui(def.municipality?'Velg kommune':'Velg språk')}</option>
  {options.filter(option=>option===value||!(def.municipality&&option===ownMunicipality)&&!rows.some(other=>other.id!==row.id&&other[def.selector]===option)).map(option=><option key={option}>{option}</option>)}
 </ReportingSelect>}
 {invalid&&<span id={`${inputId}-error`} className={visited||validated?'question-validation':'visually-hidden'}>{ui(value?'Velg et alternativ uten duplikater.':def.municipality?'Velg kommune.':'Velg språk.')}</span>}</>
}
const cellField=(key:string,label:string,positiveOnly=false,readOnly=false):ImportedField=>({key,label,control:key,group:'',questionNumber:'',maxDigits:readOnly?12:4,terms:[],readOnly,origin:readOnly?'calculated':'user',...(positiveOnly?{minimumExclusive:0}:{})})

export function LanguageCollectionTable({id,rows,del2,canEdit,validated,municipalities,ownMunicipality,onChange}:{id:CollectionId;rows:CollectionRow[];del2:Del2Data;canEdit:boolean;validated:boolean;municipalities:string[];ownMunicipality:string;onChange:(rows:CollectionRow[])=>void}){
 const def=languageCollections[id],totals=collectionTotals(def,rows,del2),hasRowTotal=!!def.totalKey
 const columnWidths=def.columns.map(column=>rows.some(row=>!collectionApplicable(def,row,column,del2)&&(row[column.key]?.length??0)>2)?80:64)
 const update=(rowId:string,key:string,value:string)=>onChange(rows.map(row=>row.id===rowId?{...row,[key]:value}:row))
 const title=id==='8C'?'Morsmålsopplæring og tospråklig fagopplæring':id==='8D'?'Elever med forsterket opplæring fra andre kommuner':'Opplæring i samiske språk, kvensk og finsk'
 const calculated=(value:number,label:string,key:string)=><NumericCell key={key} id={`collection-${id}-${key}`} field={{...cellField(key,label,false,true),sectionRef:id,sqlColumn:key.startsWith('total-')?key.slice(6):def.totalKey}} label={label} value={String(value)} relevant editable={false} validated={validated} businessReason="" onChange={()=>{}} />
 return <><div className="imported-grid-scroll" role="region" aria-label={ui(title)} tabIndex={0}>
 <table style={{minWidth:32+(def.columns.length>6?140:180)+columnWidths.reduce((sum,width)=>sum+width,0)+(hasRowTotal?70:0)+32}} className={`imported-grid imported-grid--collection${def.columns.length>6?' imported-grid--wide':''}`}>
 <caption className="visually-hidden">{ui(title)}</caption>
 <colgroup><col style={{width:'32px'}}/><col style={{width:def.columns.length>6?'140px':'180px'}}/>{def.columns.map((c,index)=><col key={c.key} style={{width:columnWidths[index]}}/>)}{hasRowTotal&&<col style={{width:'70px'}}/>}<col style={{width:'32px'}}/></colgroup>
 <thead><tr><th scope="col">{ui('Nr.')}</th><th scope="col">{ui(def.selectorLabel)}</th>{def.columns.map(c=><th scope="col" key={c.key}>{ui(c.label)}</th>)}{hasRowTotal&&<th scope="col">{ui('Sum')}</th>}<th scope="col"><span className="visually-hidden">{ui('Fjern rad')}</span></th></tr></thead>
 <tbody>{rows.map((row,index)=><tr key={row.id} data-report-row={row.id}>
  <th scope="row" className="imported-question-number">{index+1}</th><td><CollectionChoice id={id} row={row} rows={rows} canEdit={canEdit} validated={validated} municipalities={municipalities} ownMunicipality={ownMunicipality} onChange={value=>update(row.id,def.selector,value)}/></td>
  {def.columns.map(column=>{const relevant=collectionApplicable(def,row,column,del2),gradeBlocked=!!column.grade&&!!row[def.selector]&&!relevant
   return <NumericCell key={column.key} id={`collection-${id}-${row.id}-${column.key}`} field={{...cellField(column.key,column.label,!!column.positiveOnly),sectionRef:id}} label={`${ui(def.selectorLabel)} ${index+1} ${row[def.selector]??''}, ${ui(column.label)}`} value={row[column.key]??''} relevant={relevant} editable={canEdit} validated={validated} businessReason={gradeBlocked?ui('Tilgjengelige trinn styres av laveste og høyeste trinn i del 2 B og C.'):ui('Velg språk eller kommune på raden før du fyller ut antall elever.')} onChange={value=>update(row.id,column.key,value)} />
  })}
  {hasRowTotal&&calculated(totals.rows[index],`${ui('Sum')} ${row[def.selector]||index+1}`,`${row.id}-sum`)}
  <td className="municipality-action-cell"><button className="municipality-remove-button" type="button" disabled={!canEdit} aria-label={row[def.selector]?ui('Fjern {{municipality}}',{municipality:row[def.selector]}):ui('Fjern rad {{number}}',{number:index+1})} onClick={()=>onChange(rows.filter(other=>other.id!==row.id))}><span aria-hidden="true">×</span></button></td>
 </tr>)}</tbody>
 <tfoot><tr className="imported-total-row"><th scope="row" colSpan={2}>{ui('Sum elever')}</th>{def.columns.map((c,i)=>calculated(totals.columns[i],`${ui('Sum elever')}, ${ui(c.label)}`,`total-${c.key}`))}{hasRowTotal&&calculated(totals.total,ui('Sum elever'),'grand-total')}<td/></tr></tfoot>
 </table></div>
 <button className="gsi-button municipality-add-button" type="button" disabled={!canEdit} onClick={()=>onChange([...rows,{id:crypto.randomUUID(),[def.selector]:''}])}><span aria-hidden="true">+</span> {ui(def.municipality?'Legg til kommune':'Legg til språk')}</button></>
}
