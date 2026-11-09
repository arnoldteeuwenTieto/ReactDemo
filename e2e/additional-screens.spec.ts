import { schoolOpeningAction } from './helpers/schoolActions'
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { importedScreens, calculateValues, fullMockFindings, sectionFindings } from '../src/domain/importedReporting'
import { readImportedReport, saveImportedNumber } from '../src/services/importedReportService'
import { saveAdditionalChoice } from '../src/services/additionalReportService'
import { mockSkjemaStatusId, patchMockSection } from '../src/services/grunnskoleApi'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'
import { libraryChoices, libraryHoursKey } from '../src/domain/additionalChoices'

const names={11:'Valgfag',12:'Fysisk aktivitet og leksehjelp',13:'Andre opplysninger'}
const nav=(p:Page)=>p.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
const field=(p:Page,key:string)=>p.locator(`input[data-field="${key}"]`)
async function seed(page:Page,lo=1,hi=10){
 await page.route('**/src/services/grunnskoleApi.ts*',async route=>{
  const response=await route.fetch()
  const fixture=['1','17'].map(id=>`patchMockSection('demo:${id}:2026',2,{GG_227_Skolens_Maalform:'Bokmål',GG_228_Laveste_Trinn_Paa_Skolen:${lo},GG_229_Hoeyeste_Trinn_Paa_Skolen:${hi},GG_230_Tilbyr_SFO:false});patchMockSection('demo:${id}:2026',3,{GG_1_Antall_Elever_Trinn1_Gutter:'10',GG_2_Antall_Elever_Trinn1_Jenter:'5'});`).join('\n')
  await route.fulfill({response,body:(await response.text())+'\n'+fixture})
 })
}
async function open(page:Page,user='demo-school-leader',school='Fjordgløtt barneskole'){
 await page.goto('./');await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption(user)
 await schoolOpeningAction(page, `${school}`, `2026`).click()
 await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
}
test('source contracts, independent arithmetic, explicit access and unavailable controllers',()=>{
 expect(importedScreens[11].groups.map(g=>g.id)).toEqual(['A','B','C','D'])
 expect(importedScreens[12].groups.map(g=>g.id)).toEqual(['A','B','C'])
 expect(importedScreens[13].groups.map(g=>g.id)).toEqual(['A','B','C','D','E','F','G'])
 expect(importedScreens[11].fields.some(f=>['Local_Comp_Input_Number_119','Local_Comp_Input_Number_120','Local_Comp_Input_Number_124'].includes(f.control))).toBe(false)
 expect(importedScreens[13].fields.find(f=>f.key==='GG_825_Sum_Elever_PC_Mac')?.questionNumber).toBe('5')
 const report=readImportedReport('independent-additional')
 report.del2={GG_227_Skolens_Maalform:'Bokmål',GG_228_Laveste_Trinn_Paa_Skolen:1,GG_229_Hoeyeste_Trinn_Paa_Skolen:10,GG_230_Tilbyr_SFO:false}
 report.numbers[12]={GG_700_Antall_Elever_Som_Deltar_Paa_Leksehjelp_Trinn_1:'3',GG_701_Antall_Elever_Som_Deltar_Paa_Leksehjelp_Trinn_2:'4',GG_711_Antall_Timer_Tilbydd_Leksehjelp_Trinn_1:'2',GG_712_Antall_Timer_Tilbydd_Leksehjelp_Trinn_2:'1'}
 expect(calculateValues(12,report.numbers[12],report.del2).GG_710_Sum_Elever_Som_Deltar_Paa_Leksehjelp).toBe(7)
 expect(calculateValues(12,report.numbers[12],report.del2).GG_721_Sum_Timer_Tilbydd_Leksehjelp).toBe(3)
 report.numbers[11]={GG_1052_Antall_Gutter_Istedenfor_Valgfag_Trinn_8:'2',GG_677_Antall_Gutter_Uten_Valgfag_Trinn_8:'1'}
 report.collections={'11A':[{id:'row',GG_875_Valgfag:'Programmering',GG_876_Antall_Gutter_Med_Valgfag_Trinn_8:'4',GG_877_Antall_Jenter_Med_Valgfag_Trinn_8:'3'}]}
 const values=calculateValues(11,report.numbers[11],report.del2,report.numbers,report.collections)
 expect(values['calculated-11-Local_Comp_Input_Number_659']).toBe(7)
 expect(values['calculated-11-Local_Comp_Input_Number_661']).toBe(10)
 expect(fullMockFindings(report,'Bergen').some(f=>f.id==='GG-F40'&&f.kind==='unsupported')).toBe(true)
 const school=schools.find(s=>s.id==='1')!,key=mockSkjemaStatusId(school)
 patchMockSection(key,13,{[libraryHoursKey]:'8'})
 const context={enabled:true,user:demoUsers[0],school}
 expect(saveImportedNumber(context,13,libraryHoursKey,'5')).toBe(false)
 expect(saveAdditionalChoice(context,libraryChoices[0].key,true)).toBe(true)
 expect(saveImportedNumber(context,13,libraryHoursKey,'5')).toBe(true)
 expect(saveAdditionalChoice({...context,user:demoUsers[5]},libraryChoices[3].key,true)).toBe(false)
 expect(saveAdditionalChoice(context,libraryChoices[3].key,true)).toBe(true)
 expect(readImportedReport(key).numbers[13][libraryHoursKey]).toBe('')
 expect(saveAdditionalChoice(context,libraryChoices[0].key,true)).toBe(false)
 report.numbers[3]={GG_1_Antall_Elever_Trinn1_Gutter:'10',GG_2_Antall_Elever_Trinn1_Jenter:'5'}
 report.numbers[12].GG_700_Antall_Elever_Som_Deltar_Paa_Leksehjelp_Trinn_1='16'
 expect(sectionFindings(12,report,'Bergen').some(f=>f.id==='LOCAL-homework-pupils-1')).toBe(true)
 report.numbers[3]={};expect(sectionFindings(12,report,'Bergen').some(f=>f.id==='LOCAL-homework-pupils-1')).toBe(false)
})

for(const section of [11,12,13] as const)test(`Del ${section}: complete structure, editable bindings, calculations and accessible compact layout`,async({page})=>{
 test.setTimeout(90000)
 await seed(page);await open(page);await nav(page).getByRole('button',{name:names[section],exact:true}).click()
 await expect(page.locator('.imported-question > .question-header h3')).toHaveCount(section===11?4:section===12?3:7)
 for(const f of importedScreens[section].fields.filter(f=>!f.readOnly&&!f.requiresChoice)){
  const input=field(page,f.key);await expect(input).toHaveCount(1);await expect(input).toBeEnabled();await input.fill('2');await expect(input).toHaveValue('2')
 }
 for(const input of await page.getByRole('main').locator('input[readonly]').all())await expect(input).toHaveCSS('background-color','rgb(217, 221, 227)')
 if(section===11)await expect(field(page,'calculated-11-Local_Comp_Input_Number_668')).toHaveValue('24')
 if(section===12)await expect(field(page,'GG_710_Sum_Elever_Som_Deltar_Paa_Leksehjelp')).toHaveValue('20')
 if(section===13){
  await expect(page.locator('[aria-labelledby="import-13-C"] thead th')).toHaveText(['Nr.','Spørsmål','Høst 2026','Vår 2027','Vår 2026','Overnattinger'])
  await expect(field(page,'GG_1077_Sum_13G_Trinn_8_10')).toHaveValue('6')
 }
 expect(await page.getByRole('main').innerText()).not.toMatch(/GG_\d|nfSelectedRecord|Local_Comp_Input/)
 const button=nav(page).getByRole('button',{name:names[section],exact:true})
 await expect(button).toHaveCSS('font-size','13px');await expect(button.locator('.section-navigation-number')).toHaveCSS('width','25px')
 await expect(button).toHaveAttribute('aria-current','page')
 await page.setViewportSize({width:1440,height:900})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 expect((await new AxeBuilder({page}).include('main').include('.section-navigation').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations).toEqual([])
 await page.setViewportSize({width:390,height:720});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.getByRole('button',{name:'Vis navigasjon',exact:true}).click()
 await nav(page).getByRole('button',{name:'Fullfør',exact:true}).click();await expect(page.getByRole('heading',{name:'18. Fullfør',exact:true})).toBeVisible()
})

test('valgfag collection and totals, library choices, DEV metadata and active error badges',async({page})=>{
 await seed(page);await open(page);await nav(page).getByRole('button',{name:names[11],exact:true}).click()
 await page.getByRole('button',{name:'Legg til valgfag',exact:true}).click()
 await page.getByRole('combobox',{name:'Valgfag 1',exact:true}).selectOption('Programmering')
 const boys=page.locator('input[data-report-field="GG_876_Antall_Gutter_Med_Valgfag_Trinn_8"]')
 await boys.fill('4');await boys.focus();await expect(page.getByRole('tooltip')).toContainText('GG_876_Antall_Gutter_Med_Valgfag_Trinn_8')
 await expect(page.getByRole('textbox',{name:'8. trinn Sum 1',exact:true})).toHaveValue('4')
 await expect(field(page,'calculated-11-Local_Comp_Input_Number_659')).toHaveValue('4')
 await page.getByRole('button',{name:'Fjern Programmering',exact:true}).click()
 await expect(field(page,'calculated-11-Local_Comp_Input_Number_659')).toHaveValue('0')
 const del12=nav(page).getByRole('button',{name:names[12],exact:true});await del12.click()
 const pupils=field(page,'GG_700_Antall_Elever_Som_Deltar_Paa_Leksehjelp_Trinn_1');await pupils.fill('16');await pupils.blur()
 await expect(pupils).toHaveAccessibleDescription(/del 3 A/);await expect(del12.locator('.section-issue-badge')).toHaveText('1')
 await pupils.fill('15');await expect(del12.locator('.section-issue-badge')).toHaveCount(0)
 await nav(page).getByRole('button',{name:names[13],exact:true}).click()
 await expect(field(page,libraryHoursKey)).toHaveCount(0)
 await page.getByRole('checkbox',{name:'Skolebibliotek i egne lokaler',exact:true}).check()
 await field(page,libraryHoursKey).fill('8')
 await page.getByRole('checkbox',{name:'Ingen bibliotekstilbud',exact:true}).check()
 const own=page.getByRole('checkbox',{name:'Skolebibliotek i egne lokaler',exact:true});await expect(own).toBeDisabled();await expect(own).toHaveCSS('background-color','rgb(234, 240, 247)')
 await page.getByRole('checkbox',{name:'Ingen bibliotekstilbud',exact:true}).uncheck();await own.check();await expect(field(page,libraryHoursKey)).toHaveValue('')
 await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption('demo-udir-support')
 await expect(own).toBeDisabled();await expect(field(page,libraryHoursKey)).toBeDisabled();await expect(own).not.toHaveAttribute('data-field-state','business-disabled')
})

for(const [user,school]of [['demo-school-leader','Fjordgløtt barneskole'],['demo-owner-central','Bergen kommune sentralt'],['demo-udir-support','Fjordgløtt barneskole']]as const)test(`grades 4–6: ${user} preserves applicable fields and permissions`,async({page})=>{
 await seed(page,4,6);await open(page,user,school)
 await nav(page).getByRole('button',{name:names[12],exact:true}).click()
 await expect(field(page,'GG_700_Antall_Elever_Som_Deltar_Paa_Leksehjelp_Trinn_1')).toBeDisabled()
 const grade4=field(page,'GG_703_Antall_Elever_Som_Deltar_Paa_Leksehjelp_Trinn_4')
 if(user==='demo-udir-support')await expect(grade4).toBeDisabled();else await expect(grade4).toBeEnabled()
 await expect(field(page,'GG_697_Antall_Elevtimer_Fysisk_Aktivitet_Trinn_7')).toHaveCSS('background-color','rgb(234, 240, 247)')
 await nav(page).getByRole('button',{name:names[13],exact:true}).click()
 await expect(field(page,'GG_771_Antall_Elever_PC_Mac_Trinn_1')).toBeDisabled()
 await expect(field(page,'GG_724_Sum_Elever_Skoleskyss_Trinn_1_10')).toHaveAttribute('readonly','')
 await nav(page).getByRole('button',{name:names[11],exact:true}).click()
 await expect(field(page,'GG_1052_Antall_Gutter_Istedenfor_Valgfag_Trinn_8')).toBeDisabled()
})
