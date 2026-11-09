import { ui } from '../i18n'
import { ReportingInput } from './ReportingFields'

export function BooleanSubquestions({section,group,questions,values,canEdit,onChange}:{section:number;group:string;questions:readonly {key:string;label:string;questionNumber:string}[];values:Record<string,boolean>;canEdit:boolean;onChange:(key:string,value:boolean)=>void}){
 if(!questions.length)return null
 return <div className="additional-choices boolean-subquestions subquestion-list">{questions.map(q=><div className="subquestion" key={q.key}><fieldset><legend>{q.questionNumber}. {ui(q.label)}</legend><div className="question-options">{['Ja','Nei'].map((label,index)=><label key={label}><ReportingInput fieldKey={q.key} sectionRef={`${section}${group}.${q.questionNumber}`} dataType="boolean" className="gsi-field" data-field-state={canEdit?'editable':'permission-readonly'} type="radio" name={q.key} aria-label={ui(label)} reportValue={values[q.key]} checked={values[q.key]=== (index===0)} disabled={!canEdit} onChange={()=>onChange(q.key,index===0)}/>{ui(label)}</label>)}</div></fieldset></div>)}</div>
}
