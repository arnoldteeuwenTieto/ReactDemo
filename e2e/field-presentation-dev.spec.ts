import{test,expect}from'@playwright/test'
test('environment-gated SQL tooltip uses verified columns and supports focus and Escape',async({page},testInfo)=>{
 await page.goto('./');await page.getByRole('button',{name:'Åpne skjema for Fjordgløtt barneskole, 2026',exact:true}).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
 const detail=page.locator('.unit-detail dd').first();
 if(['TEST','QA','PROD'].includes(testInfo.project.name)){await expect(page.locator('[data-report-field]')).toHaveCount(0);await detail.hover();await expect(page.locator('#dev-field-tooltip')).toHaveCount(0);return}
 await expect(detail).toHaveAttribute('data-report-field','');await detail.focus();await expect(page.getByRole('tooltip')).toContainText('Mapping not available');await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0)
 if(testInfo.project.name==='DEPLOYED_DEV')return // Existing production authorization/demo-selector safeguards still apply.
 const nav=page.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true});await nav.getByRole('button',{name:'Elever og timer',exact:true}).click()
 const input=page.locator('input[data-field="GG_1_Antall_Elever_Trinn1_Gutter"]');await input.focus()
 const tooltip=page.getByRole('tooltip');await expect(tooltip).toContainText('GG_1_Antall_Elever_Trinn1_Gutter');await expect(tooltip).toContainText('3A.1');await expect(tooltip).toContainText('User input');await expect(tooltip).toContainText('integer')
 await expect(tooltip).not.toContainText(/token|connection string|session ID/i)
 await input.fill('-1');await expect(input).toHaveAccessibleDescription(/ikke-negativt/);await expect(input).toHaveAccessibleDescription(/GG_1_Antall_Elever_Trinn1_Gutter/)
 await input.fill('7');await expect(input).toHaveValue('7');await page.keyboard.press('Escape');await expect(tooltip).toHaveCount(0)
 const total=page.locator('input[data-field="GG_3_Antall_Elever_Trinn1_Sum"]');await total.hover();await expect(tooltip).toContainText('Calculated');await expect(tooltip).toContainText('GG_3_Antall_Elever_Trinn1_Sum')
 await tooltip.hover();await expect(tooltip).toBeVisible();await page.keyboard.press('Escape');await expect(tooltip).toHaveCount(0)
})

test('wrappers expose disabled/read-only metadata only in allowed environments',async({page},testInfo)=>{
 if(!['DEV','LOCAL','chromium'].includes(testInfo.project.name)){
  await page.goto('./');await page.getByRole('button',{name:'Åpne skjema for Fjordgløtt barneskole, 2026',exact:true}).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
  if(testInfo.project.name==='DEPLOYED_DEV'){
   await page.getByRole('button',{name:'Neste',exact:true}).click();const select=page.getByRole('combobox',{name:'B. Hva er normalt laveste trinn ved skolen?',exact:true});await expect(select).toBeDisabled();await select.locator('..').focus();await expect(page.locator('#dev-field-tooltip')).toContainText('GG_228_Laveste_Trinn_Paa_Skolen');await expect(select).toBeDisabled()
  }else await expect(page.locator('[data-report-wrapper]')).toHaveCount(0)
  return
 }
 await page.route('**/src/services/grunnskoleApi.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+"\npatchMockSection('demo:1:2026',2,{GG_228_Laveste_Trinn_Paa_Skolen:2,GG_229_Hoeyeste_Trinn_Paa_Skolen:6});"})})
 await page.goto('./');await page.getByRole('button',{name:'Åpne skjema for Fjordgløtt barneskole, 2026',exact:true}).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
 await page.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true}).getByRole('button',{name:'Elever og timer',exact:true}).click()
 const input=page.locator('input[data-field="GG_16_Antall_Elever_Trinn6_Gutter"]'),disabled=page.locator('input[data-field="GG_1_Antall_Elever_Trinn1_Gutter"]'),tooltip=page.locator('#dev-field-tooltip')
 await expect(input).toBeEnabled();await input.hover();await expect(tooltip).toContainText('GG_16_Antall_Elever_Trinn6_Gutter');await expect(tooltip).toContainText('3A.6');await expect(tooltip).toContainText('User input')
 await input.fill('0');await input.focus();await expect(tooltip).toContainText('GG_16_Antall_Elever_Trinn6_Gutter');await expect(input).toHaveCSS('background-color','rgb(241, 243, 245)')
 await expect(disabled).toBeDisabled();const wrapper=disabled.locator('..');await expect(wrapper).toHaveAttribute('data-report-wrapper','');await wrapper.hover();await expect(tooltip).toContainText('GG_1_Antall_Elever_Trinn1_Gutter');await expect(tooltip).toContainText('3A.1')
 await wrapper.focus();await expect(wrapper).toHaveAccessibleDescription(/GG_1_Antall_Elever_Trinn1_Gutter/);await expect(disabled).toBeDisabled();await expect(disabled).toHaveCSS('background-color','rgb(248, 231, 224)')
 expect(await tooltip.evaluate(el=>el.parentElement===document.body)).toBe(true)
 const bounds=(await tooltip.boundingBox())!;expect(bounds.y).toBeGreaterThanOrEqual(0);expect(bounds.y+bounds.height).toBeLessThanOrEqual(720)
 await page.keyboard.press('Escape');await expect(tooltip).toHaveCount(0)
 const total=page.locator('input[data-field="GG_18_Antall_Elever_Trinn6_Sum"]');await total.hover();await expect(tooltip).toContainText('Calculated');await expect(total).toHaveAttribute('readonly','')
})
