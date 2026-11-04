import type { CollectionId, CollectionRow } from '../domain/languageCollections'
import { collectionApplicable, collectionTotals, languageCollections } from '../domain/languageCollections'
import type { DemoPermissionContext } from '../domain/demoPermissions'
import { getDemoReportPermissions } from '../domain/demoPermissions'
import { mockSkjemaStatusId, patchMockSection } from './grunnskoleApi'
import { readImportedReport } from './importedReportService'

export function saveLanguageRows(context: DemoPermissionContext,id: CollectionId,rows: CollectionRow[]) {
 if(!context.school||!getDemoReportPermissions(context).edit)return false
 const def=languageCollections[id],key=mockSkjemaStatusId(context.school),report=readImportedReport(key),previous=report.collections?.[id]??[]
 if(new Set(rows.map(row=>row.id)).size!==rows.length)return false
 for(const row of rows){const old=previous.find(item=>item.id===row.id);if(!old) {if(row[def.selector]||def.columns.some(c=>!!row[c.key]))return false;continue}
  if(def.lockChoice&&old[def.selector]&&row[def.selector]!==old[def.selector])return false
  if(row[def.selector]!==old[def.selector]&&row[def.selector]&&(row[def.selector]===context.school.municipality&&def.municipality||rows.some(other=>other.id!==row.id&&other[def.selector]===row[def.selector])))return false
  for(const column of def.columns)if(row[column.key]!==old[column.key]&&!collectionApplicable(def,row,column,report.del2))return false
 }
 const totals=collectionTotals(def,rows,report.del2)
 patchMockSection(key,def.section,{[def.storeKey]:rows.map((row,index)=>({id:row.id,[def.selector]:row[def.selector]??'',...Object.fromEntries(def.columns.map(c=>[c.key,row[c.key]??''])),...(def.totalKey?{[def.totalKey]:String(totals.rows[index])}:{})}))})
 return true
}
