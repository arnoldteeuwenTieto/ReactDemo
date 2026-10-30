import { defineConfig, devices } from '@playwright/test'
import process from 'node:process'
import { resolveConfig } from 'vite'

const vite = await resolveConfig({}, 'serve')
const port = Number(process.env.E2E_PORT ?? vite.server.port)
const baseURL = `http://localhost:${port}${vite.base}`
const productionURL = `http://localhost:${vite.preview.port}${vite.base}`

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', testIgnore: '**/demo-production.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-production', testMatch: '**/demo-production.spec.ts', use: { ...devices['Desktop Chrome'], baseURL: productionURL } },
  ],
  webServer: [{
    command: `npm run dev -- --host localhost --port ${port} --strictPort`,
    url: baseURL,
    // Own the server so an existing instance cannot silently omit the demo flag.
    reuseExistingServer: false,
    env: { VITE_ENABLE_DEMO_USERS: 'true', VITE_APP_ENV: '', VITE_BUILD_NUMBER: '', VITE_COMMIT_SHA: '' },
    timeout: 60_000,
  }, {
    // Build with the flag deliberately set: production must still disable it.
    command: `npm run build && npm run preview -- --host localhost --port ${vite.preview.port} --strictPort`,
    url: productionURL,
    reuseExistingServer: false,
    env: {
      VITE_ENABLE_DEMO_USERS: 'true', NODE_ENV: 'production',
      // A production bundle deployed to QA must say QA, not infer PROD.
      VITE_APP_ENV: 'QA', VITE_BUILD_NUMBER: '2468',
      VITE_COMMIT_SHA: '1234567890abcdef1234567890abcdef12345678',
    },
    timeout: 120_000,
  }],
})
