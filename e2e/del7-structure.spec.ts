import { test, expect, type Page } from '@playwright/test'
import { importedScreens, calculateValues, sectionFindings, isBlockingFinding, fullMockFindings } from '../src/domain/importedReporting'
import { readImportedReport, saveImportedNumber, saveSupportMunicipalities } from '../src/services/importedReportService'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'
import { mockSkjemaStatusId } from '../src/services/grunnskoleApi'

const fields=importedScreens[7].fields
const field=(id:number)=>fields.find(f=>f.key.startsWith(`GG_${id}_`))!
const range=(lo:number,hi:number)=>Array.from({length:hi-lo+1},(_,i)=>lo+i)
const nav=(page:Page)=>page.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
const section=(page:Page,id:string)=>page.locator(`section[aria-labelledby="import-7-${id}"]`)
const cell=(page:Page,id:number)=>page.locator(`input[data-field="${field(id).key}"]`)
async function open(page:Page){await page.goto('./');await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption('demo-school-leader');await page.getByRole('button',{name:'Åpne skjema for Fjordgløtt barneskole, 2026',exact:true}).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click();await nav(page).getByRole('button',{name:'Spesialundervisning',exact:true}).click()}

test('Del 7 source-card mapping and arithmetic contracts cover all sections',()=>{
 const mapping={A:range(232,264),B:[...range(920,931),1018,1019],C:range(265,269),D:range(270,274),E:range(275,286),F:range(287,316),G:range(317,331),H:[]}
 for(const [group,ids]of Object.entries(mapping))expect(fields.filter(f=>f.group===group).map(f=>Number(f.key.split('_')[1])).sort((a,b)=>a-b)).toEqual(ids.sort((a,b)=>a-b))
 const answers=Object.fromEntries([[287,3],[288,4],[289,5],[290,9],[291,3],[293,7],[317,2],[318,6],[320,3]].map(([id,value])=>[field(id).key,String(value)]))
 const values=calculateValues(7,answers)
 expect(values[field(292).key]).toBe(12)
 expect(values[field(298).key]).toBe(7)
 expect(values[field(311).key]).toBe(10)
 expect(values[field(316).key]).toBe(19)
 expect(values[field(319).key]).toBe(8)
 expect(values[field(329).key]).toBe(5)
 expect(values[field(331).key]).toBe(11)
 expect(values[field(922).key]).toBeNull() // Source supplies a backend binding, no formula.
 const school=schools.find(s=>s.id==='1')!,context={enabled:true,user:demoUsers.find(u=>u.id==='demo-school-leader')!,school}
 for(const [index,f]of fields.filter(f=>!f.readOnly).entries()){
  expect(saveImportedNumber(context,7,f.key,String(index+1))).toBe(true)
  expect(readImportedReport(mockSkjemaStatusId(school)).numbers[7][f.key]).toBe(String(index+1))
 }
 for(const f of fields.filter(f=>f.readOnly))expect(saveImportedNumber(context,7,f.key,'99')).toBe(false)
 const rows=[{id:'source-h',GG_918_Individuell_Tilrettelagt_Opplaering:'Oslo',GG_919_Elever_Individuell_Tilrettelagt_Opplaering:'8'}]
 expect(saveSupportMunicipalities(context,rows)).toBe(true)
 expect(readImportedReport(mockSkjemaStatusId(school)).supportMunicipalities).toEqual(rows)
 expect(saveSupportMunicipalities({...context,user:demoUsers.find(u=>u.id==='demo-udir-support')!},[])).toBe(false)
 const report=readImportedReport('test:del7:findings')
 report.numbers[7][field(287).key]='-1';report.supportMunicipalities=[{...rows[0],GG_919_Elever_Individuell_Tilrettelagt_Opplaering:''}]
 expect(sectionFindings(7,report,'Bergen').filter(isBlockingFinding)).toHaveLength(2)
 expect(fullMockFindings(report,'Bergen').filter(f=>f.section===7&&isBlockingFinding(f))).toHaveLength(2)
})

test('Del 7 tables render every binding once and every editable field saves to its source property',async({page})=>{
 test.setTimeout(60000)
 await open(page)
 for(const [group,rows]of Object.entries({A:11,B:2,C:1,D:1,E:4,F:5,G:5,H:0})){
  await expect(section(page,group).getByRole('table')).toHaveCount(1)
  await expect(section(page,group).locator('tbody tr')).toHaveCount(rows)
 }
 await expect(section(page,'F').getByRole('columnheader')).toHaveText(['Nr.','Spørsmål','1.–4. trinn','5.–7. trinn','8.–10. trinn','Gutter','Jenter','Sum'])
 await expect(section(page,'G').getByRole('columnheader')).toHaveText(['Nr.','Spørsmål','Gutter','Jenter','Sum'])
 await expect(section(page,'G').getByRole('button',{name:'Legg til kommune',exact:true})).toHaveCount(0)
 await expect(section(page,'H').getByRole('columnheader')).toHaveText(['Nr.','Kommune','Elever','Fjern rad'])
 await expect(section(page,'B').locator('thead tr').first().getByRole('columnheader')).toHaveText(['Nr.','Spørsmål','Med individuelt tilrettelagt opplæring','Uten individuelt tilrettelagt opplæring','Totalt'])
 const expected:Record<string,string>={}
 for(const [index,f]of fields.entries()){
  const input=page.locator(`input[data-field="${f.key}"]`)
  await expect(input).toHaveCount(1)
  if(f.readOnly)await expect(input).toHaveAttribute('readonly','')
  else {expected[f.key]=String(index+1);await input.fill(expected[f.key])}
 }
 const moduleUrl=new URL('src/services/grunnskoleApi.ts',page.url()).pathname
 const saved=await page.evaluate(async moduleUrl=>{const api=await import(moduleUrl);return api.readMockSection('demo:1:2026',7)},moduleUrl)
 for(const [key,value]of Object.entries(expected))expect(saved[key]).toBe(value)
 await expect(page.locator('main')).not.toContainText(/Elevgruppe|GG_\d|nfViewSprak/)
 await page.setViewportSize({width:390,height:844})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
 await expect(section(page,'F').locator('.imported-grid-scroll')).toHaveCount(1)
})

test('Del 7 F/G totals, H mutations and active badges use shared validation through Del 17',async({page})=>{
 await open(page)
 for(const [id,value]of [[287,3],[288,4],[289,5],[317,2],[318,6]])await cell(page,id).fill(String(value))
 await expect(cell(page,292)).toHaveValue('12');await expect(cell(page,316)).toHaveValue('12');await expect(cell(page,331)).toHaveValue('8')
 const badge=nav(page).getByRole('button',{name:'Spesialundervisning',exact:true}).locator('.section-issue-badge')
 await cell(page,287).fill('-1');await expect(badge).toHaveText('1')
 await nav(page).getByRole('button',{name:'Kontroller',exact:true}).click()
 await page.getByRole('button',{name:'Kontroller skjema',exact:true}).click()
 await expect(page.getByText(/^7F\.1 Antall elever som får 1–75 timer per år\./).first()).toBeVisible()
 await nav(page).getByRole('button',{name:'Spesialundervisning',exact:true}).click()
 await cell(page,287).fill('3');await expect(badge).toHaveCount(0)
 await section(page,'H').getByRole('button',{name:'Legg til kommune',exact:true}).click()
 await expect(badge).toHaveText('1')
 await section(page,'H').getByRole('combobox').selectOption('Oslo')
 await expect(badge).toHaveText('1')
 await section(page,'H').getByRole('textbox',{name:'Elever',exact:true}).fill('9')
 await expect(badge).toHaveCount(0)
 await expect(section(page,'H').getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('9')
 await nav(page).getByRole('button',{name:'Om skolen',exact:true}).click()
 await nav(page).getByRole('button',{name:'Spesialundervisning',exact:true}).click()
 await expect(section(page,'H').getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('9')
 await section(page,'H').getByRole('button',{name:'Fjern Oslo',exact:true}).click()
 await expect(section(page,'H').getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('0')
 await expect(cell(page,331)).toHaveValue('8')
})
