# Application version and build identification

`package.json` is the application-version source of truth, initially **0.1.0**.
Vite reads it and injects `__APP_VERSION__`; React never contains a copied version.
Keep `package-lock.json` in sync. Build identification does not affect permissions,
demo enablement or authentication.

## Deployment configuration

The existing `.github/workflows/deploy.yml` build step supplies these public values:

| Header field | Source | Local fallback |
| --- | --- | --- |
| Miljø | `VITE_APP_ENV`, from the GitHub repository/environment variable of the same name | `Local` |
| Versjon | `package.json` version | Package version, always present |
| Bygg | `VITE_BUILD_NUMBER` = `${{ github.run_number }}` | `Local` |
| Commit | First seven characters of `VITE_COMMIT_SHA` = `${{ github.sha }}` | `Local` |

Set `VITE_APP_ENV` in the repository's Actions variables or the existing
`github-pages` deployment environment's variables to `TEST`, `QA` or `PROD` as
appropriate. The workflow defaults to **TEST** when that deployment variable is
missing. The label is never inferred from Vite's `production` mode or `NODE_ENV`.
A production-optimized bundle can therefore display QA or TEST. These are compile-
time values: changing the deployment label requires a new build/deployment.

The full commit hash is retained in the displayed commit's `title` attribute;
hover over the short hash to read it, or inspect/copy the attribute. Use the build
number to find the matching **Deploy React to GitHub Pages** Actions run and open
its commit. Verify the full SHA rather than relying on the seven-character prefix
if there is any ambiguity. Locally, `git show <full-sha>` identifies the exact
source revision. Rerunning the same workflow run preserves its run number; it does
not create a new application version. Consult that run's attempts/logs when needed.

All `VITE_*` metadata is public in the browser bundle. Do not put secrets in it.
The existing deployment workflow was updated, but no deployment is initiated by
this development change.

## Local development

Without configuration, the header displays `Local`, the package version, `Local`
and `Local`; absent or whitespace-only metadata never renders as `undefined`.
Optionally add the following to `.env.development.local` and restart Vite:

```dotenv
VITE_APP_ENV=DEV
# Leave these unset for the Local fallback:
# VITE_BUILD_NUMBER=
# VITE_COMMIT_SHA=
```

For a locally built QA artifact, set `VITE_APP_ENV=QA` before `npm run build`.
The label remains QA even though the build uses production optimization. A build
without deployment metadata remains labelled Local instead of claiming PROD.

## Incrementing the application version

Increment deliberately for a release; do not increment for every CI build.
Use npm so it updates both manifests:

```powershell
npm version patch --no-git-tag-version
# Use minor for a feature release, major for a deliberate incompatible/stable release.
```

Review and commit `package.json` and `package-lock.json` together with the release
changes. The build number and SHA then distinguish individual builds of the same
version automatically. Restart the local Vite server after changing the package
version; each fresh CI build reads the new version automatically.
The current pre-1.0 application is still a prototype;
document incompatible changes in release notes and agree the 1.0 release boundary.

## Verification

The development Playwright server explicitly clears build variables to test local
fallbacks. Its production preview uses isolated fixture metadata (`QA`, a test run
number and a full fixture SHA), proving that production mode does not dictate the
environment label. Tests compare version to `package.json`, verify SHA shortening
and retention, and preserve compact desktop height and responsive layout. Existing
functional and axe tests continue to run. These fixtures are never deployed values.

Verification for 0.1.0: `npm run lint` passed; the production build passed through
the Playwright web-server setup; `npm run test:e2e` passed all **95 tests (1.7 minutes)**
on dedicated port 59466, including all 24 axe scans and compact-header regressions.
No new confirmed accessibility findings were reported.

References: [GitHub Actions contexts](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
and [Vite environment variables](https://vite.dev/guide/env-and-mode).
