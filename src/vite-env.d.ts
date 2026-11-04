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
  readonly VITE_ENABLE_DEMO_USERS?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_BUILD_NUMBER?: string
  readonly VITE_COMMIT_SHA?: string
}
