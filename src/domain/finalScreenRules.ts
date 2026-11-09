import source from './finalScreens.json' with {type:'json'}
import type { Finding, ImportedReport } from './importedReporting'
export const pptOwn='GG_946_Egen_Kommunal_Tjeneste'
export const pptOperates='GG_947_Drifter_Interkommunal_Tjeneste'
export const pptParticipates='GG_948_Deltar_I_Interkommunal_Tjeneste'
export const pptMunicipality='GG_950_Kommune_I_Interkommunal_Tjeneste'
export const finalBooleanQuestions=source
export function pptFindings(report:ImportedReport,ownMunicipality:string):Finding[]{
 const findings:Finding[]=[]
 if(report.finalChoices?.[pptParticipates]&&report.pptMunicipality===ownMunicipality)findings.push({id:'LOCAL-ppt-provider',section:15,kind:'error',message:'Velg en annen kommune.'})
 if(report.finalChoices?.[pptOperates])for(const row of report.pptRecipients??[]){
  if(row.KommuneNavn&&(row.KommuneNavn===ownMunicipality||report.pptRecipients!.some(other=>other.id!==row.id&&other.KommuneNavn===row.KommuneNavn)))findings.push({id:`LOCAL-ppt-recipient-${row.id}`,section:15,kind:'error',message:'Velg en annen kommune uten duplikater.'})
 }
 return findings
}
