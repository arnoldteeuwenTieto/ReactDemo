import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { importedScreens, calculateValues, sectionFindings, isBlockingFinding, fullMockFindings } from '../src/domain/importedReporting'
import { readImportedReport, saveImportedNumber } from '../src/services/importedReportService'
import { saveLanguageRows } from '../src/services/languageReportService'
import { languageCollections, collectionApplicable, collectionNumberError, collectionTotals } from '../src/domain/languageCollections'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'
import { mockSkjemaStatusId, patchMockSection } from '../src/services/grunnskoleApi'

const titles={8:'Særskilt språkopplæring',9:'Opplæringsspråk',10:'Fremmedspråk, fordypning eller arbeidslivsfag'}
const nav=(p:Page)=>p.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
const group=(p:Page,n:number,id:string)=>p.locator(`section[aria-labelledby="import-${n}-${id}"]`)
const field=(n:8|9|10,id:number)=>importedScreens[n].fields.find(f=>f.key.startsWith(`GG_${id}_`))!
const cell=(p:Page,n:8|9|10,id:number)=>p.locator(`input[data-field="${field(n,id).key}"]`)
async function go(p:Page,n:8|9|10){await nav(p).getByRole('button',{name:titles[n],exact:true}).click()}
async function open(p:Page,user='demo-school-leader',school='Fjordgløtt barneskole'){
 await p.goto('./');await p.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption(user)
 await p.getByRole('button',{name:`Åpne skjema for ${school}, 2026`,exact:true}).click();await p.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
}
const grades=(lo:number,hi:number)=>({GG_227_Skolens_Maalform:'Bokmål',GG_228_Laveste_Trinn_Paa_Skolen:lo,GG_229_Hoeyeste_Trinn_Paa_Skolen:hi,GG_230_Tilbyr_SFO:false})

test('independent source contracts, available arithmetic and unsupported backend formulas',()=>{
 for(const [n,counts]of [[8,[22,6,0,0]],[9,[66,4,0,12]],[10,[130,10]]] as const){expect(importedScreens[n].groups.map(g=>g.id)).toEqual(counts.map((_,i)=>String.fromCharCode(65+i)));expect(counts.map((_,i)=>importedScreens[n].fields.filter(f=>f.group===String.fromCharCode(65+i)).length)).toEqual(counts)}
 expect(importedScreens[10].fields.filter(f=>!f.readOnly)).toHaveLength(78)
 expect(importedScreens[9].fields.filter(f=>f.sourceSection===3)).toHaveLength(11)
 const answers8={[field(8,346).key]:'2',[field(8,347).key]:'3',[field(8,353).key]:'11'}
 expect(calculateValues(8,answers8,grades(1,10))[field(8,356).key]).toBe(16)
 expect(calculateValues(8,answers8,grades(2,6))[field(8,356).key]).toBe(3)
 expect(calculateValues(8,answers8)[field(8,345).key]).toBeNull()
 expect(calculateValues(10,{[field(10,537).key]:'2',[field(10,538).key]:'3'})[field(10,539).key]).toBeNull()
 const answers9={[field(9,378).key]:'2',[field(9,389).key]:'3',[field(9,400).key]:'4',[field(9,411).key]:'5'}
 expect(calculateValues(9,answers9)[field(9,422).key]).toBe(14)
 const report=readImportedReport('test:language:2026')
 expect(fullMockFindings(report,'Bergen').some(f=>f.id===`UNAVAILABLE-${field(10,539).key}`&&f.kind==='unsupported')).toBe(true)
 const def=languageCollections['8C'],row={id:'lang',[def.selector]:'Arabisk',[def.columns[0].key]:'2',[def.columns[1].key]:'3'}
 expect(collectionTotals(def,[row],grades(1,10)).total).toBe(5)
 expect(collectionNumberError(def.columns[0],'0')).not.toBeNull()
 expect(collectionNumberError(def.columns[0],'')).toBeNull()
 expect(collectionApplicable(def,{...row,[def.selector]:''},def.columns[0],grades(1,10))).toBe(true)
 expect(collectionApplicable(def,{...row,[def.selector]:''},def.columns[1],grades(1,10))).toBe(false)
 report.collections!['8C']=[{...row,[def.columns[0].key]:'0'}]
 expect(sectionFindings(8,report,'Bergen').filter(isBlockingFinding)).toHaveLength(1)
})

test('centralized guards protect all new fields and collection actions',()=>{
 const school=schools.find(s=>s.id==='17')!,user=demoUsers.find(u=>u.id==='demo-owner-central')!,context={enabled:true,user,school}
 for(const n of [8,9,10] as const){const editable=importedScreens[n].fields.find(f=>!f.readOnly)!;expect(saveImportedNumber(context,n,editable.key,'3')).toBe(true);expect(readImportedReport(mockSkjemaStatusId(school)).numbers[n][editable.key]).toBe('3');for(const denied of [{...school,isKommunesentralt:false},{...school,statusId:2},{...school,id:'no-access'}])expect(saveImportedNumber({...context,school:denied},n,editable.key,'9')).toBe(false)}
 const def=languageCollections['9C'];let rows=readImportedReport(mockSkjemaStatusId(school)).collections!['9C']!
 rows=rows.map(row=>({...row,[def.selector]:'Nordsamisk',[def.columns[0].key]:'2'}));expect(saveLanguageRows(context,'9C',rows)).toBe(true)
 expect(saveLanguageRows(context,'9C',rows.map(row=>({...row,[def.selector]:'Finsk'})))).toBe(false)
 expect(saveLanguageRows({...context,user:demoUsers.find(u=>u.id==='demo-udir-support')!},'9C',[])).toBe(false)
 patchMockSection(mockSkjemaStatusId(school),2,grades(2,6))
 expect(saveLanguageRows(context,'9C',rows.map(row=>({...row,[def.columns[0].key]:'99'})))).toBe(false)
})

for(const n of [8,9,10] as const)test(`Del ${n}: structure, every fixed editable binding, readonly fields and responsive accessibility`,async({page})=>{
 test.setTimeout(90000);await open(page);await go(page,n)
 const rows=n===8?{A:11,B:2,C:0,D:0}:n===9?{A:11,B:2,C:1,D:3}:{A:13,B:1}
 for(const [id,count]of Object.entries(rows)){await expect(group(page,n,id).getByRole('table')).toHaveCount(1);await expect(group(page,n,id).locator('tbody tr')).toHaveCount(count)}
 if(n===10)await expect(group(page,n,'A').locator('thead tr').first().getByRole('columnheader')).toHaveText(['Nr.','Spørsmål','8. trinn','9. trinn','10. trinn','Sum 8.–10. trinn'])
 const expected:Record<string,string>={}
 for(const [index,f]of importedScreens[n].fields.entries()){const input=page.locator(`input[data-field="${f.key}"]`);await expect(input).toHaveCount(1);if(f.readOnly)await expect(input).toHaveAttribute('readonly','');else{expected[f.key]=String(index+1);await input.fill(String(index+1))}}
 const moduleUrl=new URL('src/services/grunnskoleApi.ts',page.url()).pathname
 const saved=await page.evaluate(async({moduleUrl,n})=>{const api=await import(moduleUrl);return api.readMockSection('demo:1:2026',n)},{moduleUrl,n})
 for(const [key,value]of Object.entries(expected))expect(saved[key]).toBe(value)
 await expect(page.locator('main')).not.toContainText(/GG_\d|nfViewSprak|Lokal mock-up/)
 await expect(page.locator('main').getByRole('button',{name:/^(Bokmål|Nynorsk)$/})).toHaveCount(0)
 const result=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();expect(result.violations).toEqual([])
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
})

test('8 C/D and 9 C repeatable rows retain distinct fields, recalculate sums and update badges',async({page})=>{
 await open(page);await go(page,8)
 const c=group(page,8,'C'),d=group(page,8,'D'),def=languageCollections['8C']
 await c.getByRole('button',{name:'Legg til språk',exact:true}).click()
 const row=c.locator('tbody tr').first();await expect(row.getByRole('textbox').first()).toBeDisabled()
 await row.getByRole('combobox').selectOption('Arabisk')
 for(const [index,value]of ['2','3','4','5'].entries())await row.locator(`input[data-field="${def.columns[index].key}"]`).fill(value)
 await expect(c.getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('14')
 await c.getByRole('button',{name:'Legg til språk',exact:true}).click()
 await expect(c.locator('tbody tr').last().getByRole('combobox').getByRole('option',{name:'Arabisk',exact:true})).toHaveCount(0)
 const badge=nav(page).getByRole('button',{name:titles[8],exact:true}).locator('.section-issue-badge')
 await row.locator(`input[data-field="${def.columns[0].key}"]`).fill('0');await expect(badge).toHaveText('1')
 await row.locator(`input[data-field="${def.columns[0].key}"]`).fill('2');await expect(badge).toHaveCount(0)
 await d.getByRole('button',{name:'Legg til kommune',exact:true}).click();await d.getByRole('combobox').selectOption('Oslo');await expect(badge).toHaveCount(0) // Unknown requiredness remains a warning.
 await d.locator('tbody input[data-field]').fill('7');await expect(badge).toHaveCount(0)
 await expect(d.locator('tfoot input')).toHaveValue('7')
 await row.getByRole('button',{name:'Fjern Arabisk',exact:true}).click();await expect(c.getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('0')
 await go(page,9);const nine=group(page,9,'C');await nine.getByRole('combobox').selectOption('Nordsamisk')
 await expect(nine.getByRole('combobox')).toHaveCount(0)
 await expect(nine.locator('input[data-field="GG_915_Opplaering_Samisk_Kvensk_Finsk"]')).toHaveCSS('background-color','rgb(241, 243, 245)')
 const nineDef=languageCollections['9C'];for(const [index,column]of nineDef.columns.entries())await nine.locator(`input[data-field="${column.key}"]`).fill(String(index+1))
 await expect(nine.getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('55')
 const moduleUrl=new URL('src/services/grunnskoleApi.ts',page.url()).pathname
 const saved=await page.evaluate(async moduleUrl=>{const api=await import(moduleUrl);return api.readMockSection('demo:1:2026',9).ColGG9SpC},moduleUrl)
 for(const [index,column]of nineDef.columns.entries())expect(saved[0][column.key]).toBe(String(index+1))
 await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption('demo-udir-support')
 await expect(nine.getByRole('button',{name:'Fjern Nordsamisk',exact:true})).toBeDisabled();await expect(nine.getByRole('button',{name:'Legg til språk',exact:true})).toBeDisabled()
 await expect(nine.locator(`input[data-field="${nineDef.columns[0].key}"]`)).toBeDisabled()
})

for(const [lo,hi,user,school]of [[1,10,'demo-school-leader','Fjordgløtt barneskole'],[1,7,'demo-school-leader','Fjordgløtt barneskole'],[2,6,'demo-school-leader','Fjordgløtt barneskole'],[8,10,'demo-udir-support','Fjordgløtt barneskole'],[8,10,'demo-owner-central','Bergen kommune sentralt']]as const)test(`grades ${lo}-${hi}, ${user}: source-specific states and cross-screen pupil values`,async({page})=>{
 await page.route('**/src/services/grunnskoleApi.ts*',async route=>{const response=await route.fetch();const seed=['1','17'].map(id=>`patchMockSection('demo:${id}:2026',2,${JSON.stringify(grades(lo,hi))});patchMockSection('demo:${id}:2026',3,{GG_1_Antall_Elever_Trinn1_Gutter:'2',GG_2_Antall_Elever_Trinn1_Jenter:'3'});patchMockSection('demo:${id}:2026',9,{ColGG9SpC:[{id:'grade-fixture',GG_915_Opplaering_Samisk_Kvensk_Finsk:'Nordsamisk',GG_904_Antall_Elever_Opplaering_Trinn_1:'2',GG_905_Antall_Elever_Opplaering_Trinn_2:'3',GG_911_Antall_Elever_Opplaering_Trinn_8:'7'}]});`).join('\n');await route.fulfill({response,body:(await response.text())+'\n'+seed})})
 await open(page,user,school);await go(page,8)
 for(let grade=1;grade<=10;grade++)await expect(cell(page,8,334+grade)).toHaveAttribute('data-field-state',grade<lo||grade>hi?'business-disabled':user==='demo-udir-support'?'permission-readonly':'editable')
 await go(page,9);await expect(cell(page,9,3)).toHaveValue(lo===1?'5':'0')
 const collection=group(page,9,'C')
 for(const column of languageCollections['9C'].columns)await expect(collection.locator(`input[data-field="${column.key}"]`)).toHaveAttribute('data-field-state',column.grade!<lo||column.grade!>hi?'business-disabled':user==='demo-udir-support'?'permission-readonly':'editable')
 await expect(collection.getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue(hi===10&&lo===1?'12':lo===1?'5':lo===2?'3':'7')
 await expect(collection.locator('input[data-field="GG_904_Antall_Elever_Opplaering_Trinn_1"]')).toHaveValue('2')
 await go(page,10);await expect(cell(page,10,537)).toHaveAttribute('data-field-state',hi<8?'business-disabled':user==='demo-udir-support'?'permission-readonly':'editable')
 if(hi<8)await expect(cell(page,10,537)).toHaveCSS('background-color','rgb(248, 231, 224)')
})
