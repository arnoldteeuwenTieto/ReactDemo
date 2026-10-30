import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig(({ command, mode, isPreview }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    // Build commands must never include an enabled user switcher, regardless
    // of NODE_ENV or a caller's VITE_ENABLE_DEMO_USERS setting.
    __DEMO_USERS_ENABLED__: JSON.stringify(command === 'serve' && !isPreview && mode === 'development'
      && loadEnv(mode, process.cwd(), 'VITE_').VITE_ENABLE_DEMO_USERS === 'true'),
  },
  plugins: [
    react(),
    reactClickToComponent(),
  ],
  base: '/ReactDemo/',
}))
