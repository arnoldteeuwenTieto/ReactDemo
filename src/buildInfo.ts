// Public build identification only. Environment is a deployment label, never a
// conclusion drawn from import.meta.env.MODE / PROD or an authorization input.
const commitSha = import.meta.env.VITE_COMMIT_SHA?.trim() || 'Local'

export const buildInfo = {
  environment: import.meta.env.VITE_APP_ENV?.trim() || 'Local',
  version: __APP_VERSION__,
  buildNumber: import.meta.env.VITE_BUILD_NUMBER?.trim() || 'Local',
  commitSha,
  shortCommitSha: commitSha === 'Local' ? commitSha : commitSha.slice(0, 7),
} as const
