import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { importedScreens, calculateValues, fieldNumericError, normalizeFieldNumber, sectionFindings, isBlockingFinding } from '../src/domain/importedReporting'
import { readImportedReport, saveImportedNumber } from '../src/services/importedReportService'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'

const nav = (page: Page) => page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true })
const cell = (page: Page, key: string) => page.locator(`input[data-field="${key}"]`)
const f = (section: 5|6|7, prefix: string) => importedScreens[section].fields.find(field => !field.hidden && field.key.startsWith(prefix))!
async function open(page: Page, user = 'demo-school-leader', school = 'Fjordgløtt barneskole') {
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption(user)
  await page.getByRole('button', { name: `Åpne skjema for ${school}, 2026`, exact: true }).click()
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
}
async function go(page: Page, title: string) { await nav(page).getByRole('button', { name: title, exact: true }).click() }

test('source coverage, decimal edge cases, independent arithmetic and permission guards', () => {
  expect(importedScreens[5].groups.map(g=>g.id)).toEqual(['A','B','C','D','E'])
  expect(importedScreens[6].groups.map(g=>g.id)).toEqual(['A','B','C','D'])
  expect(importedScreens[7].groups.map(g=>g.id)).toEqual(['A','B','C','D','E','F','G','H'])
  expect([5,6,7].map(n=>importedScreens[n as 5|6|7].fields.filter(f=>!f.hidden).length)).toEqual([63,11,114])
  const decimal = f(6,'GG_221_')
  for(const value of ['0.5','0,5','9999','1.234']) expect(fieldNumericError(decimal,value)).toBeNull()
  for(const value of ['0','-1','10000','abc','1,2,3']) expect(fieldNumericError(decimal,value)).not.toBeNull()
  expect(normalizeFieldNumber(decimal,'1,236')).toBe('1.24')
  const six = calculateValues(6,{[decimal.key]:'1.25',[f(6,'GG_222_').key]:'0,5'})
  expect(six[f(6,'GG_223_').key]).toBe(1.75)
  expect(six[f(6,'GG_1049_').key]).toBeNull()
  expect(calculateValues(6,{[f(6,'GG_1049_').key]:'0.75'})[f(6,'GG_1049_').key]).toBe(0.75)
  const five = calculateValues(5,{[f(5,'GG_161_').key]:'2',[f(5,'GG_162_').key]:'3',[f(5,'GG_163_').key]:'4'})
  expect(five[f(5,'GG_166_').key]).toBe(9)
  expect(five[f(5,'GG_1080_').key]).toBeNull()
  const competence = calculateValues(5,{[f(5,'GG_182_').key]:'2',[f(5,'GG_183_').key]:'4'})
  expect(competence[f(5,'GG_184_').key]).toBe(6)
  const seven = calculateValues(7,{[f(7,'GG_287_').key]:'3',[f(7,'GG_288_').key]:'4',[f(7,'GG_289_').key]:'5',[f(7,'GG_317_').key]:'2',[f(7,'GG_318_').key]:'6'})
  expect(seven[f(7,'GG_292_').key]).toBe(12)
  expect(seven[f(7,'GG_316_').key]).toBe(12)
  expect(seven[f(7,'GG_331_').key]).toBe(8)
  expect(seven[f(7,'GG_1018_').key]).toBeNull()
  const school = schools.find(s=>s.id==='17')!
  const user = demoUsers.find(u=>u.id==='demo-owner-central')!
  const context = {enabled:true,user,school}
  expect(saveImportedNumber(context,6,decimal.key,'0.5')).toBe(true)
  expect(saveImportedNumber({...context,school:{...school,isKommunesentralt:false}},6,decimal.key,'2')).toBe(false)
  expect(saveImportedNumber({...context,school:{...school,id:'no-access'}},6,decimal.key,'2')).toBe(false)
  expect(saveImportedNumber({...context,school:{...school,statusId:2}},6,decimal.key,'2')).toBe(false)
  expect(saveImportedNumber(context,6,f(6,'GG_223_').key,'2')).toBe(false)
  const report = readImportedReport('test:staff:2026')
  report.numbers[6][decimal.key]='0'
  expect(sectionFindings(6,report,'Bergen').filter(isBlockingFinding)).toHaveLength(1)
})

test('navigation, tables, calculations, persistence and active error badges', async ({page}) => {
  await open(page)
  await go(page,'Lærere og assistenter')
  await expect(page.getByRole('heading',{name:'5. Lærere og assistenter',exact:true})).toBeVisible()
  for(const [prefix,value] of [['GG_161_','2'],['GG_162_','3'],['GG_163_','4']]) await cell(page,f(5,prefix).key).fill(value)
  await expect(cell(page,f(5,'GG_166_').key)).toHaveValue('9')
  await expect(cell(page,f(5,'GG_1080_').key)).toHaveAttribute('readonly','')
  for(const field of importedScreens[5].fields.filter(f=>f.hidden)) await expect(cell(page,field.key)).toHaveCount(0)
  await go(page,'Årsverk og ansatte')
  await expect(page.getByRole('heading',{name:'6. Årsverk og ansatte',exact:true})).toBeVisible()
  await cell(page,f(6,'GG_221_').key).fill('1,25')
  await cell(page,f(6,'GG_222_').key).fill('0.5')
  await expect(cell(page,f(6,'GG_223_').key)).toHaveValue('1.75')
  await cell(page,f(6,'GG_221_').key).fill('0')
  const badge=nav(page).getByRole('button',{name:'Årsverk og ansatte',exact:true}).locator('.section-issue-badge')
  await expect(badge).toHaveText('1')
  await cell(page,f(6,'GG_221_').key).fill('1.236')
  await cell(page,f(6,'GG_222_').key).focus()
  await expect(cell(page,f(6,'GG_221_').key)).toHaveValue('1.24')
  await expect(badge).toHaveCount(0)
  await go(page,'Lærere og assistenter')
  await expect(cell(page,f(5,'GG_166_').key)).toHaveValue('9')
  await expect(page.locator('main')).not.toContainText(/GG_\d|nfViewSprak|Lokal mock-up/)
  await expect(page.locator('main').getByRole('button',{name:/^(Bokmål|Nynorsk)$/})).toHaveCount(0)
})

for(const [lo,hi,user,school] of [[1,10,'demo-school-leader','Fjordgløtt barneskole'],[1,7,'demo-school-leader','Fjordgløtt barneskole'],[2,6,'demo-school-leader','Fjordgløtt barneskole'],[2,6,'demo-udir-support','Fjordgløtt barneskole'],[2,6,'demo-owner-central','Bergen kommune sentralt']] as const){
 test(`grade bounds ${lo}-${hi}, ${user}: applicability, totals and access`,async({page})=>{
  await page.route('**/src/services/grunnskoleApi.ts*',async route=>{
   const response=await route.fetch()
   const seed=['1','17'].map(id=>`patchMockSection('demo:${id}:2026',2,{GG_228_Laveste_Trinn_Paa_Skolen:${lo},GG_229_Hoeyeste_Trinn_Paa_Skolen:${hi}});patchMockSection('demo:${id}:2026',7,${JSON.stringify({[f(7,'GG_232_').key]:'5',[f(7,'GG_235_').key]:'7',[f(7,'GG_253_').key]:'11'})});`).join('\n')
   await route.fulfill({response,body:(await response.text())+'\n'+seed})
  })
  await open(page,user,school);await go(page,'Spesialundervisning')
  const readonly=user==='demo-udir-support'
  for(let grade=1;grade<=10;grade++){
   const field=importedScreens[7].fields.find(f=>f.group==='A'&&f.questionNumber===String(grade)&&f.column==='Gutter')!
   await expect(cell(page,field.key)).toHaveAttribute('data-field-state',grade<lo||grade>hi?'business-disabled':readonly?'permission-readonly':'editable')
  }
  await expect(cell(page,f(7,'GG_262_').key)).toHaveValue(hi===10?'23':lo===1?'12':'7')
  await expect(cell(page,f(7,'GG_232_').key)).toHaveValue('5')
  await go(page,'Lærere og assistenter')
  await expect(cell(page,f(5,'GG_163_').key)).toHaveAttribute('data-field-state',readonly?'permission-readonly':'editable')
  if(readonly){await go(page,'Spesialundervisning');await expect(page.getByRole('button',{name:'Legg til kommune',exact:true})).toBeDisabled()}
 })
}

test('Del 7 municipality rows, totals, errors, readonly controls and responsive accessibility',async({page})=>{
 await open(page);await go(page,'Spesialundervisning')
 await page.getByRole('button',{name:'Legg til kommune',exact:true}).click()
 const region=page.getByRole('region',{name:'Elever med individuell tilrettelegging fra andre kommuner',exact:true})
 await expect(region.getByRole('textbox',{name:'Elever',exact:true})).toBeDisabled()
 await region.getByRole('combobox').selectOption('Oslo')
 await region.getByRole('textbox',{name:'Elever',exact:true}).fill('8')
 await expect(region.getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('8')
 await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption('demo-udir-support')
 await expect(region.getByRole('button',{name:'Fjern Oslo',exact:true})).toBeDisabled()
 await expect(region.getByRole('combobox')).toBeDisabled()
 await expect(region.getByRole('textbox',{name:'Elever',exact:true})).toBeDisabled()
 await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption('demo-school-leader')
 await region.getByRole('button',{name:'Fjern Oslo',exact:true}).click()
 await expect(region.getByRole('textbox',{name:'Sum elever',exact:true})).toHaveValue('0')
 for(const section of [5,6,7] as const){
  await go(page,section===5?'Lærere og assistenter':section===6?'Årsverk og ansatte':'Spesialundervisning')
  const results=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
  expect(results.violations).toEqual([])
  await page.setViewportSize({width:390,height:844})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
  await page.setViewportSize({width:1440,height:900})
 }
})

test('combined 5D table keeps grade-group inputs and totals separate', async ({page}) => {
 await open(page);await go(page,'Lærere og assistenter')
 const section=page.locator('section[aria-labelledby="import-5-D"]').getByRole('region',{name:'D. Kompetansekrav for undervisning',exact:true})
 await expect(section.getByRole('table')).toHaveCount(1)
 await expect(page.getByText('Lærere fordelt på antall studiepoeng de har i fagene de underviser i.',{exact:true})).toBeVisible()
 await expect(section.getByRole('columnheader',{name:'1.–7. trinn',exact:true})).toHaveAttribute('colspan','3')
 await expect(section.getByRole('columnheader',{name:'8.–10. trinn',exact:true})).toHaveAttribute('colspan','4')
 await expect(section.locator('tbody tr')).toHaveCount(5)
 await expect(section.getByRole('textbox')).toHaveCount(35)
 for(const [prefix,value] of [['GG_182_','2'],['GG_183_','3'],['GG_185_','7'],['GG_186_','11'],['GG_187_','13']])await cell(page,f(5,prefix).key).fill(value)
 await expect(cell(page,f(5,'GG_184_').key)).toHaveValue('5')
 await expect(cell(page,f(5,'GG_188_').key)).toHaveValue('31')
 for(const prefix of ['GG_184_','GG_188_']){
  await expect(cell(page,f(5,prefix).key)).toHaveAttribute('readonly','')
  await expect(cell(page,f(5,prefix).key)).toHaveCSS('background-color','rgb(217, 221, 227)')
 }
 await page.setViewportSize({width:1440,height:900})
 expect(await section.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
 await page.setViewportSize({width:390,height:844})
 expect(await section.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
})
