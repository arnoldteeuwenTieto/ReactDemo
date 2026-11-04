import{test,expect}from'@playwright/test'
test('environment-gated SQL tooltip uses verified columns and supports focus and Escape',async({page},testInfo)=>{
 await page.goto('./');await page.getByRole('button',{name:'Åpne skjema for Fjordgløtt barneskole, 2026',exact:true}).click();await page.getByRole('button',{name:'Gå til rapporteringen',exact:true}).click()
 const detail=page.locator('.unit-detail dd').first();
 if(testInfo.project.name!=='DEV'){await expect(page.locator('[data-report-field]')).toHaveCount(0);await detail.hover();await expect(page.locator('#dev-field-tooltip')).toHaveCount(0);return}
 await expect(detail).toHaveAttribute('data-report-field','');await detail.focus();await expect(page.getByRole('tooltip')).toContainText('Mapping not available');await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0)
 const nav=page.getByRole('navigation',{name:'Grunnskoleseksjoner',exact:true});await nav.getByRole('button',{name:'Elever og timer',exact:true}).click()
 const input=page.locator('input[data-field="GG_1_Antall_Elever_Trinn1_Gutter"]');await input.focus()
 const tooltip=page.getByRole('tooltip');await expect(tooltip).toContainText('GG_1_Antall_Elever_Trinn1_Gutter');await expect(tooltip).toContainText('3A.1');await expect(tooltip).toContainText('User input');await expect(tooltip).toContainText('integer')
 await expect(tooltip).not.toContainText(/token|connection string|session ID/i)
 await input.fill('-1');await expect(input).toHaveAccessibleDescription(/ikke-negativt/);await expect(input).toHaveAccessibleDescription(/GG_1_Antall_Elever_Trinn1_Gutter/)
 await input.fill('7');await expect(input).toHaveValue('7');await page.keyboard.press('Escape');await expect(tooltip).toHaveCount(0)
 const total=page.locator('input[data-field="GG_3_Antall_Elever_Trinn1_Sum"]');await total.hover();await expect(tooltip).toContainText('Calculated');await expect(tooltip).toContainText('GG_3_Antall_Elever_Trinn1_Sum')
 await tooltip.hover();await expect(tooltip).toBeVisible();await page.keyboard.press('Escape');await expect(tooltip).toHaveCount(0)
})
