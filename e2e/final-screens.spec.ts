import {test,expect,type Page} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { importedScreens,calculateValues,sectionFindings,fullMockFindings } from '../src/domain/importedReporting'
import { readImportedReport,saveImportedNumber } from '../src/services/importedReportService'
import { saveFinalBoolean,savePptRecipients,savePptMunicipality } from '../src/services/finalReportService'
import { pptOwn,pptOperates,pptParticipates } from '../src/domain/finalScreenRules'
import { patchMockSection,mockSkjemaStatusId } from '../src/services/grunnskoleApi'
import { emptyDel2,dependentClears } from '../src/domain/del2'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'
import { sectionApplicability } from '../src/components/grunnskoleSections'
import { schoolOpeningAction } from './helpers/schoolActions'

const names={14:'Skolefritidsordningen (SFO)',15:'Pedagogisk-psykologisk tjeneste (PPT)',16:'Fordrevne ukrainske elever'}
const nav=(p:Page)=>p.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
const input=(p:Page,key:string)=>p.locator(`input[data-field="${key}"]`)
const field=(section:14|15|16,prefix:string)=>importedScreens[section].fields.find(f=>f.key.startsWith(prefix))!
async function fixture(page:Page,sfo=true,lo=1,hi=10){
 await page.route('**/src/services/grunnskoleApi.ts*',async route=>{
  const response=await route.fetch();const extra=['1','17'].map(id=>`patchMockSection('demo:${id}:2026',2,{GG_227_Skolens_Maalform:'Bokmål',GG_228_Laveste_Trinn_Paa_Skolen:${lo},GG_229_Hoeyeste_Trinn_Paa_Skolen:${hi},GG_230_Tilbyr_SFO:${sfo}});patchMockSection('demo:${id}:2026',15,{GG_946_Egen_Kommunal_Tjeneste:true,GG_947_Drifter_Interkommunal_Tjeneste:true});`).join('\n')
  await route.fulfill({response,body:(await response.text())+'\n'+extra})
 })
}
async function open(page:Page,user='demo-school-leader',school='Fjordgløtt barneskole'){
 await page.goto('./');await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption(user)
 await schoolOpeningAction(page,school).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
}
test('active source contracts, independent sums, applicability, decimal limits and guarded clears',()=>{
 expect(importedScreens[14].groups.map(g=>g.id)).toEqual(['A','B','C','D','E'])
 expect(importedScreens[15].groups.map(g=>g.id)).toEqual(['A','B','C','D'])
 expect(importedScreens[16].groups.map(g=>g.id)).toEqual(['A','B','C','D'])
 expect([14,15,16].map(n=>importedScreens[n as 14|15|16].fields.length)).toEqual([43,7,40])
 expect(importedScreens[16].fields.some(f=>f.control==='Local_Comp_Input_Number_392')).toBe(false)
 const grades={...emptyDel2,GG_230_Tilbyr_SFO:true,GG_228_Laveste_Trinn_Paa_Skolen:1,GG_229_Hoeyeste_Trinn_Paa_Skolen:10}
 const annual=field(14,'GG_1032_'),staff=calculateValues(14,{[annual.key]:'1.25',[field(14,'GG_1036_').key]:'0.5'},grades)
 expect(staff[field(14,'GG_1042_').key]).toBe(1.75)
 expect(calculateValues(16,{[field(16,'GG_959_').key]:'3',[field(16,'GG_970_').key]:'2'},grades)[field(16,'GG_1012_').key]).toBe(5)
 expect(calculateValues(16,{},grades)[field(16,'GG_1001_').key]).toBe(0)
 const school=schools.find(s=>s.id==='1')!,key=mockSkjemaStatusId(school),context={enabled:true,user:demoUsers[0],school}
 patchMockSection(key,2,grades);patchMockSection(key,15,{[pptOwn]:true,[pptOperates]:true})
 expect(saveImportedNumber(context,15,field(15,'GG_952_').key,'1,25')).toBe(true)
 expect(savePptRecipients(context,[{id:'a',KommuneNavn:''}])).toBe(true)
 expect(savePptRecipients(context,[{id:'a',KommuneNavn:'Oslo'}])).toBe(true)
 expect(saveFinalBoolean({...context,user:demoUsers[5]},15,pptOperates,false)).toBe(false)
 expect(saveFinalBoolean(context,15,pptOperates,false)).toBe(true)
 expect(readImportedReport(key).pptRecipients).toEqual([])
 expect(readImportedReport(key).numbers[15][field(15,'GG_952_').key]).toBe('1,25')
 expect(saveFinalBoolean(context,15,pptOwn,false)).toBe(true)
 expect(readImportedReport(key).numbers[15][field(15,'GG_952_').key]).toBe('')
 expect(saveImportedNumber(context,15,field(15,'GG_952_').key,'5')).toBe(false)
 expect(saveFinalBoolean(context,15,pptParticipates,true)).toBe(true)
 expect(savePptMunicipality(context,'Bergen')).toBe(false);expect(savePptMunicipality(context,'Oslo')).toBe(true)
 expect(saveFinalBoolean(context,15,pptParticipates,false)).toBe(true)
 expect(readImportedReport(key).pptMunicipality).toBe('')
 const report=readImportedReport(key);report.del2.GG_230_Tilbyr_SFO=false;report.numbers[14]={[annual.key]:'bad'}
 expect(sectionApplicability(14,report.del2).state).toBe('not-applicable')
 expect(sectionApplicability(14,{...report.del2,GG_230_Tilbyr_SFO:null}).state).toBe('unresolved')
 expect([15,16,17,18].map(n=>sectionApplicability(n,report.del2).state)).toEqual(['available','available','available','available'])
 expect(sectionFindings(14,report,'Bergen')).toEqual([])
 expect(fullMockFindings(report,'Bergen').filter(f=>f.section===14)).toEqual([])
 expect(dependentClears({GG_230_Tilbyr_SFO:false},report.del2)).toEqual([])
})

for(const section of [14,15,16]as const)test(`Del ${section}: all active numeric bindings, zero totals and responsive accessible layout`,async({page})=>{
 test.setTimeout(90000);await fixture(page);await open(page);await nav(page).getByRole('button',{name:names[section],exact:true}).click()
 await expect(page.locator('.imported-question > .question-header h3')).toHaveCount(section===14?5:4)
 for(const f of importedScreens[section].fields.filter(f=>!f.readOnly)){
  const el=input(page,f.key);await expect(el).toBeEnabled();await expect(el).toHaveValue('');await el.fill(f.numericKind==='decimal'?'1.5':'2');await expect(el).toHaveValue(f.numericKind==='decimal'?'1.5':'2')
 }
 for(const f of importedScreens[section].fields.filter(f=>f.readOnly)){const el=input(page,f.key);await expect(el).toHaveCount(1);await expect(el).toHaveAttribute('readonly','');await expect(el).toHaveAttribute('data-field-origin','calculated');await expect(el).toHaveCSS('background-color','rgb(217, 221, 227)')}
 expect(await page.getByRole('main').innerText()).not.toMatch(/GG_\d|Gammel|nfSelectedRecord/)
 for(const legend of await page.locator('.boolean-subquestions legend').all())await expect(legend).toHaveCSS('font-size','13px')
 expect((await new AxeBuilder({page}).include('main').include('.section-navigation').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations).toEqual([])
 for(const width of [1920,1440,1280,390]){
  await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  for(const scroll of await page.locator('.imported-grid-scroll').all()){
   const measure=await scroll.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,nested:el.querySelectorAll('.imported-grid-scroll').length}))
   expect(measure.nested).toBe(0);if(width>=1280)expect(measure.scroll).toBeLessThanOrEqual(measure.client+1)
  }
  await page.screenshot({path:test.info().outputPath(`del${section}-${width}.png`),fullPage:width===1440})
 }
})

test('unknown SFO configuration is visible in DEV and resolves reactively',async({page})=>{
 await open(page)
 const diagnostic=page.getByRole('status').filter({hasText:'DEV: SFO-konfigurasjon mangler'})
 await expect(diagnostic).toContainText('GG_230_Tilbyr_SFO er ukjent')
 await expect(nav(page).getByRole('button',{name:names[14],exact:true})).toHaveAttribute('data-applicability','unresolved')
 await nav(page).getByRole('button',{name:'Om skolen',exact:true}).click()
 await page.getByRole('group',{name:'D. Har skolen tilbud om SFO?',exact:true}).getByRole('radio',{name:'Ja',exact:true}).check()
 await expect(diagnostic).toHaveCount(0)
 await nav(page).getByRole('button',{name:'Andre opplysninger',exact:true}).click()
 await page.getByRole('button',{name:'Neste',exact:true}).click()
 await expect(page.getByRole('heading',{name:`14. ${names[14]}`,exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Neste',exact:true}).click()
 await page.getByRole('button',{name:'Forrige',exact:true}).click()
 await expect(page.getByRole('heading',{name:`14. ${names[14]}`,exact:true})).toBeVisible()
})

test('SFO disabled navigation and Next/Previous skip, retained answers and current-section badges',async({page})=>{
 await fixture(page,false);await open(page)
 await expect(nav(page).getByRole('button',{name:names[14],exact:true})).toBeDisabled()
 await expect(nav(page).getByRole('button')).toHaveCount(19)
 await nav(page).getByRole('button',{name:names[14],exact:true}).focus()
 await expect(page.getByRole('tooltip').filter({hasText:'ikke tilbyr SFO'})).toBeVisible()
 await page.keyboard.press('Enter')
 await expect(nav(page).getByRole('button',{name:names[14],exact:true})).not.toHaveAttribute('aria-current','page')
 await page.keyboard.press('Escape')
 await expect(page.getByRole('tooltip').filter({hasText:'ikke tilbyr SFO'})).toBeHidden()
 await nav(page).getByRole('button',{name:'Andre opplysninger',exact:true}).click();await page.getByRole('button',{name:'Neste',exact:true}).click()
 await expect(page.getByRole('heading',{name:`15. ${names[15]}`,exact:true})).toBeVisible();await page.getByRole('button',{name:'Forrige',exact:true}).click()
 await expect(page.getByRole('heading',{name:'13. Andre opplysninger',exact:true})).toBeVisible()
 await nav(page).getByRole('button',{name:'Om skolen',exact:true}).click()
 const sfo=page.getByRole('group',{name:'D. Har skolen tilbud om SFO?',exact:true})
 await sfo.getByRole('radio',{name:'Ja',exact:true}).check();await expect(page.getByRole('region',{name:'D. Har skolen tilbud om SFO?',exact:true}).getByRole('status')).toHaveText('Lagret')
 const item=nav(page).getByRole('button',{name:names[14],exact:true});await item.click()
 const count=input(page,field(14,'GG_840_').key);await count.fill('bad');await count.blur();await expect(item.locator('.section-issue-badge')).toHaveText('1')
 await count.fill('0');await expect(item.locator('.section-issue-badge')).toHaveCount(0)
 await nav(page).getByRole('button',{name:'Om skolen',exact:true}).click();await sfo.getByRole('radio',{name:'Nei',exact:true}).check()
 await expect(page.getByRole('region',{name:'D. Har skolen tilbud om SFO?',exact:true}).getByRole('status')).toHaveText('Lagret')
 await expect(item).toBeDisabled();await expect(item.locator('.section-issue-badge')).toHaveCount(0);await sfo.getByRole('radio',{name:'Ja',exact:true}).check()
 await expect(page.getByRole('region',{name:'D. Har skolen tilbud om SFO?',exact:true}).getByRole('status')).toHaveText('Lagret')
 await item.click();await expect(count).toHaveValue('0');await expect(input(page,field(14,'GG_845_').key)).toHaveValue('0')
})

for (const [user,school] of [['demo-owner-central','Bergen kommune sentralt'],['demo-owner-noncentral','Fjordgløtt barneskole']] as const) test(`section applicability stays independent of ${user} and unit scope`,async({page})=>{
 await fixture(page,false);await open(page,user,school)
 await expect(nav(page).locator('ol > li')).toHaveCount(18)
 await expect(nav(page).getByRole('button',{name:names[14],exact:true})).toBeDisabled()
 await nav(page).getByRole('button',{name:'Andre opplysninger',exact:true}).click()
 for(const section of [15,16,17,18]){
  await page.getByRole('button',{name:'Neste',exact:true}).click()
  await expect(nav(page).locator('[aria-current="page"]')).toHaveText(new RegExp(`^${section}`))
 }
 await page.getByRole('button',{name:'Forrige',exact:true}).click()
 await expect(nav(page).locator('[aria-current="page"]')).toHaveText(/^17/)
})

test('PPT conditions, decimal validation, municipality records and explicit resets',async({page})=>{
 await fixture(page);await open(page);await nav(page).getByRole('button',{name:names[15],exact:true}).click()
 const own=page.getByRole('group',{name:'1. Har kommunen egen kommunal PP-tjeneste?',exact:true})
 const operates=page.getByRole('group',{name:'2. Drifter kommunen en interkommunal PP-tjeneste?',exact:true})
 const staff=input(page,field(15,'GG_952_').key)
 await staff.fill('1,236');await staff.blur();await expect(staff).toHaveValue('1.24')
 await staff.focus();await expect(page.getByRole('tooltip')).toContainText(field(15,'GG_952_').key)
 await page.getByRole('button',{name:'Legg til kommune',exact:true}).click();await page.getByRole('combobox',{name:'Mottakerkommune 1',exact:true}).selectOption('Oslo')
 await operates.getByRole('radio',{name:'Nei',exact:true}).check();await expect(page.locator('[aria-labelledby="import-15-D"]')).toHaveCount(0);await expect(staff).toHaveValue('1.24')
 await own.getByRole('radio',{name:'Nei',exact:true}).check();await expect(page.locator('[aria-labelledby="import-15-C"]')).toHaveCount(0)
 await own.getByRole('radio',{name:'Ja',exact:true}).check();await expect(staff).toHaveValue('')
 await staff.fill('0');await staff.blur();await expect(staff).toHaveAttribute('aria-invalid','true')
 await expect(nav(page).getByRole('button',{name:names[15],exact:true}).locator('.section-issue-badge')).toHaveText('1')
 await staff.fill('1');await expect(nav(page).getByRole('button',{name:names[15],exact:true}).locator('.section-issue-badge')).toHaveCount(0)
 await operates.getByRole('radio',{name:'Ja',exact:true}).check();await expect(page.getByRole('combobox',{name:'Mottakerkommune 1',exact:true})).toHaveCount(0)
 const participant=page.getByRole('group',{name:'3. Deltar kommunen i en interkommunal PP-tjeneste?',exact:true})
 await participant.getByRole('radio',{name:'Ja',exact:true}).check()
 const provider=page.getByRole('combobox',{name:'Kommune som leverer interkommunal PPT',exact:true})
 await provider.selectOption('Oslo');await expect(provider).toHaveValue('Oslo')
 await participant.getByRole('radio',{name:'Nei',exact:true}).check();await expect(provider).toHaveCount(0)
 await participant.getByRole('radio',{name:'Ja',exact:true}).check();await expect(provider).toHaveValue('')
})

for(const [user,school]of [['demo-school-leader','Fjordgløtt barneskole'],['demo-owner-central','Bergen kommune sentralt'],['demo-udir-support','Fjordgløtt barneskole']]as const)test(`grades 4–6 and ${user}: applicability and permissions remain independent`,async({page})=>{
 await fixture(page,true,4,6);await open(page,user,school)
 await nav(page).getByRole('button',{name:names[14],exact:true}).click()
 await expect(input(page,field(14,'GG_840_').key)).toBeDisabled();await expect(input(page,field(14,'GG_840_').key)).toHaveCSS('background-color','rgb(234, 240, 247)')
 const grade4=input(page,field(14,'GG_843_').key)
 if(user==='demo-udir-support')await expect(grade4).toBeDisabled();else await expect(grade4).toBeEnabled()
 await nav(page).getByRole('button',{name:names[16],exact:true}).click()
 await expect(input(page,field(16,'GG_959_').key)).toBeDisabled()
 const grade6=input(page,field(16,'GG_964_').key)
 if(user==='demo-udir-support')await expect(grade6).toBeDisabled();else await expect(grade6).toBeEnabled()
 await expect(input(page,field(16,'GG_1012_').key)).toHaveValue('0')
})
