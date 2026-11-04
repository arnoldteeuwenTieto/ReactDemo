import {test,expect,type Page}from'@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function open(page:Page){await page.goto('./');await page.getByRole('button',{name:'Åpne skjema for Fjordgløtt barneskole, 2026',exact:true}).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()}
const nav=(p:Page)=>p.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
const field=(p:Page,key:string)=>p.locator(`input[data-field="${key}"]`)
const boys='GG_1_Antall_Elever_Trinn1_Gutter',sum='GG_3_Antall_Elever_Trinn1_Sum'
test('blank, zero, filled, readonly and calculated origins retain distinct backgrounds',async({page})=>{
 await open(page);await expect(page.locator('.unit-detail dd').first()).toHaveCSS('background-color','rgb(217, 221, 227)')
 await nav(page).getByRole('button',{name:'Elever og timer',exact:true}).click()
 const input=field(page,boys),total=field(page,sum)
 await expect(input).toHaveValue('');await expect(input).toHaveCSS('background-color','rgb(255, 255, 255)')
 await expect(total).toHaveValue('0');await expect(total).toHaveAttribute('data-field-origin','calculated');await expect(total).toHaveCSS('background-color','rgb(217, 221, 227)')
 await input.fill('0');await expect(input).toHaveCSS('background-color','rgb(241, 243, 245)');await expect(input).toHaveValue('0')
 await input.fill('12');await expect(total).toHaveValue('12')
 await page.getByRole('combobox',{name:'Demonstrasjonsbruker DEMO',exact:true}).selectOption('demo-udir-support')
 await expect(input).toBeDisabled();await expect(input).toHaveCSS('background-color','rgb(241, 243, 245)')
 await expect(total).toHaveAttribute('readonly','')
 await nav(page).getByRole('button',{name:'Fremmedspråk, fordypning eller arbeidslivsfag',exact:true}).click()
 const unavailable=field(page,'GG_539_Sum_Tysk_Trinn_8');await expect(unavailable).toHaveValue('');await expect(unavailable).toHaveAttribute('data-field-origin','backend');await expect(unavailable).toHaveCSS('background-color','rgb(217, 221, 227)');await expect(unavailable).toHaveAttribute('placeholder','—')
})
test('business blocking and validation borders survive the new presentation',async({page})=>{
 await page.route('**/src/services/grunnskoleApi.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+"\npatchMockSection('demo:1:2026',2,{GG_228_Laveste_Trinn_Paa_Skolen:2,GG_229_Hoeyeste_Trinn_Paa_Skolen:6});patchMockSection('demo:1:2026',3,{GG_1_Antall_Elever_Trinn1_Gutter:'0'});"})})
 await open(page);await nav(page).getByRole('button',{name:'Elever og timer',exact:true}).click()
 await expect(field(page,boys)).toBeDisabled();await expect(field(page,boys)).toHaveValue('0');await expect(field(page,boys)).toHaveCSS('background-color','rgb(248, 231, 224)');await expect(field(page,boys)).toHaveCSS('border-top-color','rgb(217, 165, 143)')
 const editable=field(page,'GG_4_Antall_Elever_Trinn2_Gutter');await editable.fill('-1');await editable.blur();await expect(editable).toHaveAttribute('aria-invalid','true');await expect(editable).toHaveCSS('background-color','rgb(241, 243, 245)')
 expect(await editable.evaluate(el=>getComputedStyle(el).borderTopColor)).not.toBe('rgb(217, 165, 143)')
 const result=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();expect(result.violations).toEqual([])
})
test('desktop tables use available width and narrow screens keep one local scrollbar',async({page})=>{
 await open(page)
 for(const width of [1920,1440,1280,768,390]){
  await page.setViewportSize({width,height:1000})
  for(const [title,id]of [['Lærere og assistenter','5-D'],['Fremmedspråk, fordypning eller arbeidslivsfag','10-A']]as const){
   const item=nav(page).getByRole('button',{name:title,exact:true});if(!await item.isVisible())await page.getByRole('button',{name:'Vis navigasjon',exact:true}).click();await item.click()
   const section=page.locator(`section[aria-labelledby="import-${id}"]`),scroll=section.locator('.imported-grid-scroll')
   await expect(scroll).toHaveCount(1)
   const sizes=await scroll.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));if(width>=1440)expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await expect(section.getByRole('table')).toHaveCount(1)
  }
 }
})
