import { schoolOpeningAction } from './helpers/schoolActions'
import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

test('Del 11–13 tables fit desktop containers and retain one mobile scroller', async ({page},info) => {
  test.setTimeout(90000)
  await page.route('**/src/services/grunnskoleApi.ts*',async route=>{
    const response=await route.fetch()
    await route.fulfill({response,body:(await response.text())+"\npatchMockSection('demo:1:2026',2,{GG_227_Skolens_Maalform:'Bokmål',GG_228_Laveste_Trinn_Paa_Skolen:1,GG_229_Hoeyeste_Trinn_Paa_Skolen:10,GG_230_Tilbyr_SFO:false});"})
  })
  await page.goto('./')
  await schoolOpeningAction(page, 'Fjordgløtt barneskole', '2026').click()
  await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
  const nav=page.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
  const measurements=[]
  for(const width of [1920,1440,1280,390]){
    await page.setViewportSize({width,height:900})
    for(const [section,name]of [[11,'Valgfag'],[12,'Fysisk aktivitet og leksehjelp'],[13,'Andre opplysninger']]as const){
      const item=nav.getByRole('button',{name,exact:true})
      if(!await item.isVisible())await page.getByRole('button',{name:'Vis navigasjon',exact:true}).click()
      await item.click()
      if(section===11&&width===1920){
        await page.getByRole('button',{name:'Legg til valgfag',exact:true}).click()
        await page.getByRole('combobox',{name:'Valgfag 1',exact:true}).selectOption('Programmering')
      }
      const tables=await page.locator('.imported-grid-scroll').evaluateAll(elements=>elements.map(element=>({
        name:element.getAttribute('aria-label'),client:element.clientWidth,scroll:element.scrollWidth,
        table:element.querySelector('table')!.getBoundingClientRect().width,
        nested:element.querySelectorAll('.imported-grid-scroll').length,
        font:getComputedStyle(element.querySelector('table')!).fontSize,
      })))
      measurements.push({width,section,tables})
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      for(const table of tables){
        expect(table.nested).toBe(0);expect(table.font).toBe('13px')
        if(width>=1280)expect(table.scroll,`${width}px ${table.name}`).toBeLessThanOrEqual(table.client+1)
      }
      if(section===13){
        const questions=page.locator('[aria-labelledby="import-13-F"] .subquestion')
        await expect(questions).toHaveCount(3)
        await expect(questions.nth(0)).toHaveCSS('border-top-width','0px')
        for(const index of [1,2]){
          await expect(questions.nth(index)).toHaveCSS('border-top-width','1px')
          await expect(questions.nth(index)).toHaveCSS('border-top-color','rgb(220, 229, 243)')
        }
        await expect(questions.nth(2)).toHaveCSS('border-bottom-width','0px')
      }
      await page.screenshot({path:info.outputPath(`del${section}-${width}.png`),fullPage:width===1440})
    }
  }
  await writeFile(info.outputPath('table-widths.json'),JSON.stringify(measurements,null,2))
  await info.attach('table-widths',{path:info.outputPath('table-widths.json'),contentType:'application/json'})
})

test('retained blocked values stay readable and table messages/tooltips escape clipping',async({page})=>{
 await page.setViewportSize({width:1280,height:900})
 await page.route('**/src/services/grunnskoleApi.ts*',async route=>{
  const response=await route.fetch()
  await route.fulfill({response,body:(await response.text())+"\npatchMockSection('demo:1:2026',2,{GG_228_Laveste_Trinn_Paa_Skolen:4,GG_229_Hoeyeste_Trinn_Paa_Skolen:6});patchMockSection('demo:1:2026',11,{ColGG11SpA:[{id:'retained',GG_875_Valgfag:'Programmering',GG_876_Antall_Gutter_Med_Valgfag_Trinn_8:'1234'}]});patchMockSection('demo:1:2026',13,{GG_771_Antall_Elever_PC_Mac_Trinn_1:'1234'});"})
 })
 await page.goto('./');await schoolOpeningAction(page, 'Fjordgløtt barneskole', '2026').click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
 const nav=page.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true})
 for(const [section,key]of [['Valgfag','retained-GG_876_Antall_Gutter_Med_Valgfag_Trinn_8'],['Andre opplysninger','GG_771_Antall_Elever_PC_Mac_Trinn_1']]){
  await nav.getByRole('button',{name:section,exact:true}).click()
  const field=page.locator(`input[data-field="${key}"]`)
  await expect(field).toBeDisabled();await expect(field).toHaveValue('1234')
  const sizing=await field.evaluate(element=>{
   const input=element as HTMLInputElement,style=getComputedStyle(input),canvas=document.createElement('canvas'),context=canvas.getContext('2d')!
   context.font=style.font
   const text=context.measureText(input.value).width,available=input.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)
   return {fits:text<=available,text,available,font:style.font,width:input.clientWidth,table:input.closest('table')!.getBoundingClientRect().width}
  })
  expect(sizing.fits,JSON.stringify({section,...sizing})).toBe(true)
  const lock=page.locator('.field-control').filter({has:field}).getByRole('button');await lock.focus()
  await expect(page.locator('.field-rule-tooltip')).toBeVisible()
  expect(await page.locator('.field-rule-tooltip').evaluate(el=>el.parentElement===document.body)).toBe(true)
 }
 const field=page.locator('input[data-field="GG_774_Antall_Elever_PC_Mac_Trinn_4"]')
 await field.fill('bad');await field.blur()
 const error=page.locator('.imported-cell-error');await expect(error).toBeVisible()
 expect(await error.evaluate(el=>{
  const scroll=el.closest('.imported-grid-scroll')!,rect=el.getBoundingClientRect(),container=scroll.getBoundingClientRect()
  return rect.top>=container.top&&rect.bottom<=container.bottom&&scroll.scrollHeight<=scroll.clientHeight
 })).toBe(true)
 await field.focus();await expect(page.locator('#dev-field-tooltip')).toContainText('GG_774_Antall_Elever_PC_Mac_Trinn_4')
 expect(await page.locator('#dev-field-tooltip').evaluate(el=>el.parentElement===document.body)).toBe(true)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})
