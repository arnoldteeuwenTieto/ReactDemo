import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig(({ command, mode, isPreview }) => {
  let fieldMetadataEnabled = false
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const deployedDemo = mode === 'demo' && env.VITE_APP_ENV?.trim().toUpperCase() === 'DEMO'
    && env.VITE_ENABLE_DEMO_USERS === 'true'
  return ({
  define: {
    __DEV_FIELD_METADATA__: JSON.stringify(fieldMetadataEnabled),
    __APP_VERSION__: JSON.stringify(version),
    // A deployed demo needs its own build mode, label and explicit opt-in.
    __DEPLOYED_DEMO__: JSON.stringify(deployedDemo),
    __DEMO_USERS_ENABLED__: JSON.stringify(deployedDemo || (command === 'serve' && !isPreview && mode === 'development'
      && !['TEST', 'QA', 'PROD'].includes(env.VITE_APP_ENV?.trim().toUpperCase())
      && env.VITE_ENABLE_DEMO_USERS === 'true')),
  },
  plugins: [
    { name: 'gsi-production-report-metadata', enforce: 'pre', load(id) {
      if (command !== 'build' || !/src[\\/]domain[\\/](importedScreens|staffScreens|languageScreens)\.json$/.test(id)) return
      const strip = value => Array.isArray(value) ? value.map(strip) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => !['sourceFormula', 'sourceCard', 'sourceOrder', 'textReferences'].includes(key)).map(([key, item]) => [key, strip(item)])) : value
      return JSON.stringify(strip(JSON.parse(readFileSync(id, 'utf8'))))
    } },
    { name: 'gsi-dev-field-metadata', configResolved(config) {
      const environment = config.env.VITE_APP_ENV?.trim().toUpperCase()
      // config.env.DEV is the resolved value injected as import.meta.env.DEV.
      fieldMetadataEnabled = !['TEST', 'QA', 'PROD'].includes(environment)
        && ((config.env.DEV && command === 'serve' && !isPreview) || environment === 'DEV')
      config.define.__DEV_FIELD_METADATA__ = JSON.stringify(fieldMetadataEnabled)
    }, resolveId(id) { if (id === 'virtual:gsi-field-metadata') return '\0gsi-field-metadata' }, async load(id) { if (id === '\0gsi-field-metadata') return `export default ${JSON.stringify(fieldMetadataEnabled ? (await import('./scripts/dev-field-metadata.mjs')).fieldMetadataCatalog() : {})}` } },
    react(),
    reactClickToComponent(),
  ],
  base: '/ReactDemo/',
})})
