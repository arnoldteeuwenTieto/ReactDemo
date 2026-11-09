import { ui } from '../i18n'
import { libraryChoices, preparednessChoices } from '../domain/additionalChoices'
import { ReportingInput } from './ReportingFields'
import { FieldAvailability } from './FieldAvailability'

export function AdditionalChoices({ group, values, canEdit, onChange }: {group:'D'|'F';values:Record<string,boolean>;canEdit:boolean;onChange:(field:string,value:boolean)=>void}) {
  const choices=group==='D'?libraryChoices:preparednessChoices
  return <div className={`additional-choices${group==='F'?' subquestion-list':''}`}>{choices.map((choice,index)=>{
    const blocked=group==='D'&&index<3&&values[libraryChoices[3].key]===true
    const ruleId=`additional-${choice.key}-rule`
    const input=(label:string,value:boolean)=><label key={label}>
      <ReportingInput fieldKey={choice.key} sectionRef={`13${group}.${index+1}`} dataType="boolean" type={group==='D'?'checkbox':'radio'} name={choice.key} aria-label={ui(group==='D'?choice.label:label)} aria-describedby={blocked?ruleId:undefined} className="gsi-field" data-field-state={blocked?'business-disabled':canEdit?'editable':'permission-readonly'} reportValue={values[choice.key]} checked={group==='D'?values[choice.key]===true:values[choice.key]===value} disabled={!canEdit||blocked} onChange={event=>onChange(choice.key,group==='D'?event.target.checked:value)} />{ui(label)}
    </label>
    return <div key={choice.key} className={group==='F'?'subquestion':undefined}><fieldset><legend>{index+1}. {ui(choice.label)}</legend><div className="question-options">{group==='D'?input(choice.label,true):['Ja','Nei'].map((label,i)=>input(label,i===0))}
      {blocked&&<FieldAvailability id={ruleId} label={ui(choice.label)} reason={ui('Fjern valget Ingen bibliotekstilbud i del 13 D for å velge dette tilbudet.')} />}
    </div></fieldset></div>
  })}</div>
}
