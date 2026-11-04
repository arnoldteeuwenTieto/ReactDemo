import { defineConfig, devices } from '@playwright/test'
import { resolveConfig } from 'vite'
const vite = await resolveConfig({}, 'serve')
const baseURL = `http://localhost:5194${vite.base}`
export default defineConfig({
  testDir: './e2e', testMatch: '**/pages-demo.spec.ts',
  use: { ...devices['Desktop Chrome'], baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build:demo && npm run preview -- --host localhost --port 5194 --strictPort',
    url: baseURL, reuseExistingServer: false, timeout: 120000,
    env: { NODE_ENV: 'production', VITE_APP_ENV: 'DEMO', VITE_ENABLE_DEMO_USERS: 'true' },
  },
})
