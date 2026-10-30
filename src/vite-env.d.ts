/// <reference types="vite/client" />

declare const __DEMO_USERS_ENABLED__: boolean
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_ENABLE_DEMO_USERS?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_BUILD_NUMBER?: string
  readonly VITE_COMMIT_SHA?: string
}
