import {test,expect}from'@playwright/test'
import {execFileSync}from'node:child_process'
import {mkdtempSync,readdirSync,readFileSync}from'node:fs'
import {tmpdir}from'node:os'
import {join,resolve}from'node:path'
for(const environment of ['TEST','QA','PROD'])test(`${environment} builds omit developer tooltip components, attributes and metadata payload`,()=>{
 test.setTimeout(90000)
 const output=mkdtempSync(join(tmpdir(),'gsi-field-presentation-'))
 execFileSync(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'build','--outDir',output],{cwd:process.cwd(),env:{...process.env,NODE_ENV:'production',VITE_APP_ENV:environment,VITE_ENABLE_DEMO_USERS:'true'},stdio:'pipe'})
 const assets=join(output,'assets'),names=readdirSync(assets),code=names.filter(n=>/\.(js|css)$/.test(n)).map(n=>readFileSync(join(assets,n),'utf8')).join('\n')
 for(const text of ['DEV · Field metadata','data-report-field','data-report-section','Source data table (SQL mapping unverified)','dev-field-tooltip','sourceFormula','sourceCard'])expect(code.includes(text),`Production assets must omit ${text}`).toBe(false)
 expect(names.some(name=>name.includes('DevFieldTooltip'))).toBe(false)
})
