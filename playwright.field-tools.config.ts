import{defineConfig,devices}from'@playwright/test'
import{resolveConfig}from'vite'
const vite=await resolveConfig({},'serve'),labels=['DEV','TEST','QA','PROD']
export default defineConfig({testDir:'./e2e',testMatch:'**/field-presentation-dev.spec.ts',use:{...devices['Desktop Chrome']},projects:labels.map((label,index)=>({name:label,use:{baseURL:`http://localhost:${5188+index}${vite.base}`}})),webServer:labels.map((label,index)=>({command:`npm run dev -- --host localhost --port ${5188+index} --strictPort`,url:`http://localhost:${5188+index}${vite.base}`,reuseExistingServer:false,env:{VITE_ENABLE_DEMO_USERS:'true',VITE_APP_ENV:label},timeout:60000}))})
