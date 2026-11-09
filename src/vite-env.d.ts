/// <reference types="vite/client" />

declare const __DEMO_USERS_ENABLED__: boolean
declare const __DEPLOYED_DEMO__: boolean
declare const __APP_VERSION__: string
declare const __DEV_FIELD_METADATA__: boolean
declare module 'virtual:gsi-field-metadata' {
  const catalog: Record<string, { column: string; source?: string; type?: string }>
  export default catalog
}

interface ImportMetaEnv {
  readonly VITE_REPORTING_START?: string
  readonly VITE_REPORTING_END?: string
  readonly VITE_REPORTING_YEAR?: string
  readonly VITE_ALLOW_DEMO_PERIOD_OVERRIDE?: string
  readonly VITE_ENABLE_NEW_FEATURE?: string
  readonly VITE_ENABLE_DEMO_USERS?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_BUILD_NUMBER?: string
  readonly VITE_COMMIT_SHA?: string
}
