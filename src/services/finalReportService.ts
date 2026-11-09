import { finalBooleanQuestions,pptOwn,pptOperates,pptParticipates,pptMunicipality } from '../domain/finalScreenRules'
import { additionalGroupVisible } from '../domain/additionalRules'
import { getDemoReportPermissions,type DemoPermissionContext } from '../domain/demoPermissions'
import { readImportedReport } from './importedReportService'
import { mockSkjemaStatusId,patchMockSection } from './grunnskoleApi'
import { schools } from '../mockData'

export function saveFinalBoolean(context:DemoPermissionContext,section:14|15,field:string,value:boolean){
 if(!context.school||!getDemoReportPermissions(context).edit||!finalBooleanQuestions[section].choices.some(q=>q.key===field))return false
 const key=mockSkjemaStatusId(context.school),report=readImportedReport(key)
 if(!additionalGroupVisible(section,'A',report.del2,report.finalChoices))return false
 const patch:Record<string,unknown>={[field]:value}
 if(section===15){
  const choices={...report.finalChoices,[field]:value}
  if([pptOwn,pptOperates].includes(field)&&!value&&choices[pptOwn]===false&&choices[pptOperates]===false)finalBooleanQuestions[15].fields.filter(f=>!f.readOnly).forEach(f=>{patch[f.key]=''})
  if(field===pptOperates&&!value)patch.ColGG15SpD=[]
  // Literal source compares Ja/Nei with "1": both changes reset the picker.
  if(field===pptParticipates)patch[pptMunicipality]=''
 }
 patchMockSection(key,section,patch);return true
}
export function savePptMunicipality(context:DemoPermissionContext,value:string){
 if(!context.school||!getDemoReportPermissions(context).edit)return false
 const key=mockSkjemaStatusId(context.school),report=readImportedReport(key)
 if(!report.finalChoices?.[pptParticipates]||value===context.school.municipality||value&&!schools.some(s=>s.municipality===value))return false
 patchMockSection(key,15,{[pptMunicipality]:value});return true
}
export function savePptRecipients(context:DemoPermissionContext,rows:{id:string;KommuneNavn:string}[]){
 if(!context.school||!getDemoReportPermissions(context).edit)return false
 const key=mockSkjemaStatusId(context.school),report=readImportedReport(key)
 if(!report.finalChoices?.[pptOperates]||new Set(rows.map(r=>r.id)).size!==rows.length)return false
 for(const row of rows){
  const old=report.pptRecipients?.find(r=>r.id===row.id)
  if(!old&&row.KommuneNavn)return false
  if(row.KommuneNavn!==old?.KommuneNavn&&row.KommuneNavn&&(row.KommuneNavn===context.school.municipality||!schools.some(s=>s.municipality===row.KommuneNavn)||rows.some(r=>r.id!==row.id&&r.KommuneNavn===row.KommuneNavn)))return false
 }
 patchMockSection(key,15,{ColGG15SpD:rows.map(r=>({...r}))});return true
}
