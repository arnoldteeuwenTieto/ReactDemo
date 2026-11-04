import type { Del2Data } from './del2'
import type { Finding, ImportedReport } from './importedReporting'
import { gradeApplicability } from './fieldState'

export type CollectionId = '8C' | '8D' | '9C'
export interface CollectionRow { id: string; [field: string]: string }
export interface CollectionColumn { key: string; label: string; positiveOnly?: boolean; grade?: number; allowExistingWithoutChoice?: boolean }
export interface CollectionDefinition {
 section: 8|9; group: string; storeKey: string; selector: string; selectorLabel: string; municipality?: boolean; lockChoice?: boolean
 options: string[]; columns: CollectionColumn[]; totalKey?: string
}
// Fictional demo options: authoritative nfViewSprakSvarAlternativer was not supplied.
export const languageCollections: Record<CollectionId, CollectionDefinition> = {
 '8C': {section:8,group:'C',storeKey:'ColGG8SpC',selector:'GG_869_Morsmaal',selectorLabel:'Morsmål',options:['Arabisk','Engelsk','Polsk','Somali','Ukrainsk'],columns:[
  {key:'GG_870_Elever_med_bare_morsmaalsopplaering',label:'Elever med bare morsmålsopplæring',positiveOnly:true,allowExistingWithoutChoice:true},
  {key:'GG_871_Elever_med_bare_tospraaklig_fagopplaering',label:'Elever med bare tospråklig fagopplæring',positiveOnly:true},
  {key:'GG_872_Elever_med_baade_morsmaalopplaering_og_tospraaklig_fagopplaering',label:'Elever med både morsmålsopplæring og tospråklig fagopplæring',positiveOnly:true},
  {key:'GG_873_Elever_med_tilrettelagt_opplaering',label:'Elever med tilrettelagt opplæring',positiveOnly:true},
 ],totalKey:'GG_874_Sum_Elever_morsmaal_tospraaklig_tilrettelagtopplaering'},
 '8D': {section:8,group:'D',storeKey:'ColGG8SpD',selector:'GG_916_Forstaerket_SpraakOpplaering_Annen_Kommune',selectorLabel:'Kommune',municipality:true,options:[],columns:[{key:'GG_917_Elever_Forstaerket_SpraakOpplaering_Annen_Kommune',label:'Elever'}]},
 '9C': {section:9,group:'C',storeKey:'ColGG9SpC',selector:'GG_915_Opplaering_Samisk_Kvensk_Finsk',selectorLabel:'Språk',lockChoice:true,options:['Nordsamisk','Lulesamisk','Sørsamisk','Kvensk','Finsk'],columns:Array.from({length:10},(_,i)=>({key:`GG_${904+i}_Antall_Elever_Opplaering_Trinn_${i+1}`,label:`${i+1}. trinn`,grade:i+1,positiveOnly:true})),totalKey:'GG_914_Total_Sum_Antall_Elever_Opplaering_Trinn_1_10'},
}
export function initialCollectionRows(id: CollectionId): CollectionRow[] { return id === '9C' ? [{id:`${id}-initial`,[languageCollections[id].selector]:''}] : [] }
export function collectionApplicable(def: CollectionDefinition,row: CollectionRow,column: CollectionColumn,del2: Del2Data) {
 const choice=!!row[def.selector] || !!column.allowExistingWithoutChoice && def.columns.some(c=>!!row[c.key])
 return choice && (!column.grade || gradeApplicability(column.key,del2).applicable)
}
export function collectionNumberError(column: CollectionColumn,value: string|undefined): string|null {
 if(!value)return null // Requiredness is not supplied for these cells.
 return !(column.positiveOnly?/^[1-9]\d{0,3}$/:/^\d{1,4}$/).test(value)?column.positiveOnly?'Bruk et positivt heltall med høyst fire siffer.':'Bruk et ikke-negativt heltall med høyst fire siffer.':null
}
export function collectionTotals(def: CollectionDefinition,rows: CollectionRow[],del2: Del2Data) {
 const columns=def.columns.map(column=>rows.reduce((sum,row)=>sum+(!collectionApplicable(def,row,column,del2)||collectionNumberError(column,row[column.key])?0:Number(row[column.key]||0)),0))
 const rowTotals=rows.map(row=>def.columns.reduce((sum,column)=>sum+(!collectionApplicable(def,row,column,del2)||collectionNumberError(column,row[column.key])?0:Number(row[column.key]||0)),0))
 return {columns,rows:rowTotals,total:columns.reduce((sum,n)=>sum+n,0)}
}
export function collectionFindings(section: number,report: ImportedReport,ownMunicipality: string,canEdit:boolean): Finding[] {
 const findings: Finding[]=[]
 for(const [id,def]of Object.entries(languageCollections) as [CollectionId,CollectionDefinition][]){if(def.section!==section)continue;const rows=report.collections?.[id]??[]
  for(const row of rows){const selected=row[def.selector];const duplicate=selected&&rows.some(other=>other.id!==row.id&&other[def.selector]===selected)
   if(duplicate||(def.municipality&&selected===ownMunicipality))findings.push({id:`LOCAL-${id}-${row.id}-choice`,section,kind:'error',message:'Velg et alternativ uten duplikater.',field:`${id}:${row.id}:${def.selector}`})
   if(!selected&&def.columns.some(c=>!!row[c.key]))findings.push({id:`LOCAL-${id}-${row.id}-missing-choice`,section,kind:'warning',message: def.municipality?'Kommune er ikke valgt.':'Språk er ikke valgt.',field:`${id}:${row.id}:${def.selector}`})
   for(const column of def.columns){if(!collectionApplicable(def,row,column,report.del2))continue;const message=collectionNumberError(column,row[column.key]);if(message)findings.push({id:`LOCAL-${id}-${row.id}-${column.key}`,section,field:`${id}:${row.id}:${column.key}`,kind:'error',message})}
   if(def.municipality&&selected&&!row[def.columns[0].key]&&canEdit)findings.push({id:`LOCAL-${id}-${row.id}-count`,section,kind:'warning',message:'Feltet er ikke besvart. Obligatoriske felt må avklares mot kilden.',field:`${id}:${row.id}:${def.columns[0].key}`})
  }
 }
 return findings
}
