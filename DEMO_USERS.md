# Demonstration users

The selector is opt-in. For local development, in `.env.development.local`, set
`VITE_ENABLE_DEMO_USERS=true`, then restart `npm run dev`. Alternatively set that
environment variable in your shell. Without the exact value `true`, switching is
disabled. Normal `npm run build` disables switching even when the flag is set.
Explicit TEST/QA/PROD labels disable simulation for both local and built applications.

The GitHub Pages workflow is a dedicated fictional demonstration deployment:
`npm run build:demo` uses Vite mode `demo`, `.env.demo`, `VITE_APP_ENV=DEMO` and
`VITE_ENABLE_DEMO_USERS=true`. All three conditions (mode, label and opt-in) are
required for a deployed demo. The workflow explicitly sets the label and opt-in;
it no longer defaults this fictional deployment to TEST. Real-user deployment
workflows must use `npm run build` with their own TEST/QA/PROD label and no demo
opt-in. Do not deploy the demo artifact to an environment handling real users.

Only the dedicated deployed demo initially opens the 2026 Fjordgløtt report with
the existing default fictional profile Ada Fjord. This is an explicit fixture,
not automatic selection of whichever unit a user is assigned. Changing users
does not change the selected school. Status overrides and mock answers remain
in memory and reset on reload. The header labels this build DEMO rather than KUN DEV.
SQL metadata is independently gated and is absent in DEMO builds.

The missing-access deployment defect came from the former build-wide ban on demo
users: GitHub Pages shipped mock data but no authenticated session and no demo
profile. Imported screens correctly denied access to the null context. No Altinn
authentication is added here; the separate real-user panel correctly continues
to show `Ingen innlogget bruker`. All services remain fictional in-memory mocks.
Permissions, explicit unit access and selected-unit `isKommunesentralt` remain
authoritative for simulated actions; no permission checks are bypassed.

Verify the built Pages artifact with
`npx playwright test --config=playwright.pages-demo.config.ts` (port 5194).
The dedicated test is excluded from the normal local/QA projects because it
requires its own demo artifact. Both new tests passed: real-deployment label
rejection (TEST/QA/PROD, with both demo and normal modes) and built-app navigation,
mock editing, user/status switching, reset, explicit unit access, central-unit
effective permissions and absence of SQL metadata.

Targeted existing local/normal-production regressions passed 14 of 15 tests.
The remaining local `demo-status-navigation` test fails on exact accessible name
`Nynorsk` after disabling the form: the existing DEV-only ReportingFields wrapper
contributes `DEV field metadata 2` to the native radio label. The failure snapshot
shows the answer still checked and disabled. This pre-existing wrapper/naming
issue is not changed by the Pages deployment fix and does not occur in the DEMO
artifact, where SQL metadata wrappers are absent. The initial new Pages test also
had a wrong home-button locator; it was corrected to the existing `Hjem` label.
Both normal and demo builds passed TypeScript checks; normal production build
passed with the existing bundle-size warning. Full-suite tests, full accessibility
audit and lint were intentionally skipped in favor of the affected checks.

Current implemented navigation contains Del 1–10, 17 and 18. Del 11–16 have no
implemented entries in this repository; this deployment fix does not add them.

`DemoUserProvider` wraps the application. Screens can read `useDemoUser()` from
`src/demoUserContext.ts`. Selection is memory-only and resets on reload. Navigation,
school selection, filters and report state are preserved when switching users.
The desktop selectors sit side by side in the compact header. The role, assigned
unit, scope and simulation notice remain available under the keyboard-operable
`Demokontekst` disclosure; opening it does not increase desktop header height.
The original blue header now labels the entire simulation area `KUN DEV`, exposes
the original GSI/Grunnskole branding, and uses white focus indicators on blue.

The separate beige `Innlogget bruker` section is never populated from a demo
profile. There is no authenticated-session source in this prototype, so it shows
`Ingen innlogget bruker` and separate Navn, E-post and Rolle fields with
`Ikke tilgjengelig` placeholders. `AppHeader` accepts a nullable `signedInUser`
input with a display name and optional email/role for
future integration by a real session owner. No screenshot identity is hardcoded.
The environment label comes explicitly from deployment configuration via
`VITE_APP_ENV`, independently of Vite's build mode. Application version is injected
from `package.json`; the workflow supplies build number and commit SHA. Local
metadata falls back to `Local`. See [BUILD_VERSION.md](BUILD_VERSION.md). No service
version exists, so none is invented or copied from the reference screenshot.

The six fictional profiles in `src/demoUser.ts` cover RolleId 9, both central and
non-central RolleId 10 variants, 11, 12 and 13. IDs and unit associations are stable.
School IDs identify mock reporting records, including separate years. Associations
are invented fixtures, not claims about GSI jurisdiction or ownership.

The context contains profile metadata and an explicit mock access scope, marked
`baseline-edit-only`. `canEditDemoReport` permits Del 2 editing only with an enabled
demo context, StatusId 1, explicit selected-report access in `schoolIds`, and
RolleId 9 or RolleId 10 with the legacy profile flag `municipalityCentral === true`.
That legacy flag is distinct from the selected unit's BOGIAPI `IsKommunesentralt`.
All other cases are read-only, including missing context and ordinary non-demo builds.
Inputs, local-save callbacks and retries enforce the same rule. Switching users
updates permission immediately without clearing answers. Already initiated local
saves may finish; switching users does not initiate new saves. Del 1 remains
read-only. Help, navigation and the overview remain available. Imported Del 3/4
fields and Del 18 mock actions use the centralized matrix capabilities below,
with explicit unit access and the selected-unit boolean. This does not change
the earlier Del 2 guard. Del 18 confirms supported local approval/rejection
transitions and keeps submission blocked by unresolved completeness/validation.
See [the import implementation](gsi-react-import/IMPLEMENTATION.md). No real
backend or administrative/support workflow is implemented.
There is no authentication
integration; future backend authorization must use authenticated server identity,
never this context, browser storage or a client-provided role ID.

## School-header permission indicator

`DemoPermissionIndicator` sits beneath the unchanged reporting-status badge,
right-aligned in `App`'s green school header. It is hidden when demo mode is
disabled. Labels are text, not action buttons. No permissions displays
`Ingen tilgang`; denied actions have no badge. No real authentication or API
permission is affected.

The source is `src/domain/demoPermissions.ts`. `getDemoReportPermissions`
uses the user-supplied Power Apps matrix below, requiring explicit report scope
and enabled demo mode. `getEffectiveDemoRoleId` maps login role 10 to effective role
9 only when the **selected unit** has `isKommunesentralt === true`.
The mock field corresponds to BOGIAPI `IsKommunesentralt`; names play no part.
The profile's central flag and assigned unit do not determine this category.
Actual roleId remains unchanged. The original matrix shorthand 109 is not a login
role or a separate matrix row: central units reuse the role 9 row. Normal-school
selection immediately restores effective role 10. R or S implies L for display.

Production integration must read `IsKommunesentralt` from BOGIAPI for the selected
reporting unit. This prototype has no real API/authentication adapter; its explicit
mock boolean simulates that response only. Backend authorization must independently
validate authenticated Altinn identity, unit access and authoritative server data;
never trust a browser-provided central flag or effective role.

Boolean-flag correction verification: all nine targeted tests passed. Tests cover
all matrix scenarios, explicit access, flags contradicting unit names, switching
units and unchanged visible role 10. No style or backend changes were made.
Full suite, full audit, lint, TypeScript checks and build were intentionally skipped.

Earlier effective-role clarification verification: both targeted permission-indicator
tests passed, covering normal → central → normal selection, the unchanged visible
RolleId 10, all nine statuses, missing access and the shared role 9 permissions.
No extra matrix row or authenticated role 109 exists. Full suite, full audit,
lint, TypeScript checks and build were intentionally skipped for this refinement.

| Category | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | RS | RS | L | RS | L | RS | L | R | L |
| 10 | L | L | LGA | L | L | LA | L | LA | L |
| 11 | L | L | LA | L | LGA | L | L | LA | L |
| 12 | LA | LA | LA | LA | LA | LA | LA | LA | LA |
| 13 | L | L | L | L | L | L | L | L | L |

R=Redigere, L=Lese, S=Levere, G=Godkjenne, A=Avvise. Unknown/invalid statuses
and missing access/context grant no capabilities. Status 7 deliberately lacks S.
These centralized capabilities are reused by the imported action controls, which may
also require complete answers and other specified prerequisites.

### Existing authorization conflicts — preserved explicitly

The existing `canEditDemoReport` guard still enforces status 1 only, role 9 or
role 10 with the **profile** central flag, plus explicit access and demo mode.
It is retained unchanged for Del 2 controls/saving/retries. Thus matrix capability
badges and currently executable edits may differ:

- Effective role 9 has matrix R at statuses 0, 3, 5 and 7, while the guard disables edits.
- Birk on a regular Bergen school at status 1 is category 10 (L only in the
  matrix), while the baseline guard permits editing from his profile central flag.
- A non-central role 10 profile with explicit access to a unit with `isKommunesentralt: true` is
  effective role 9 for matrix lookup, but the baseline guard still denies editing.

Changing that guard would alter the earlier authorization requirements; this
indicator task does not silently migrate them. Submission, approval and rejection
are capabilities only: their action workflows are not implemented. The metadata
`baseline-edit-only` describes the existing enforced editing simulation. No
backend authorization changes. User, unit and temporary status changes recompute
the indicators from current props/context, with no separate permission state.

Verification: 16 existing editing-permission tests passed. The two indicator
tests passed after updating a stale pre-matrix UI expectation: central-profile
role 10 on a regular school is category 10, so status 2 includes G/A. This was a
test issue, not an application defect. The matrix test checks all 54 category/
status combinations plus access denial, disabled demo context and invalid
statuses. The UI test covers all nine statuses, context changes, unchanged
desktop school-header height, right alignment, mobile overflow and a header-only
axe check with no violations. The full suite, full accessibility audit, lint,
TypeScript checks and production build were intentionally skipped under the
targeted local verification policy.

`npm run test:e2e` starts its own Vite server with the flag explicitly enabled,
and builds/serves a production preview with the same flag to verify switching is
disabled there. Stop existing servers on the configured development and preview
ports before running the suite. Tests
can use a different development-server port via `E2E_PORT` when the normal Vite
port is occupied; this does not change the application's Vite settings. Tests
cover profile switching, preserved navigation/filter state and the simulated Del 2
editing rule across all six profiles, statuses 1 and 2, and absent school access.
Status-2 scenarios use a browser-only module fixture for the same accessible
report; application mock data remains unchanged. These tests do not establish
real authentication or backend authorization.

## Demonstration status

With the same development-only flag enabled, `Demonstrasjonsstatus` appears directly
below the user selector. Select an overview row or open a report to enable it.
It initially shows that report's actual mock status and offers all nine statuses
(0–8). Choosing a status creates an in-memory override keyed by school record ID
and reporting year. The open report takes precedence over the selected overview row.
Overrides survive navigation, switching schools and switching users in the current
page session. Each report retains its own override; reloading clears them all.
`Tilbakestill status` clears only the selected report's override and restores its
original mock status. The reset action is disabled when there is no override.

The effective status is shared by overview rows, status filters/counts, the selected
school badge and `canEditDemoReport`. Only status 1 can permit editing, still subject
to role and explicit school access. Status 0 is not started; status 8 is inactive;
both remain read-only. Switching to status 1 grants no additional role or school
access. Status changes do not alter answers or initiate saves. Already initiated
local saves may finish. Neither source mock records nor API data are mutated, and
no status update is sent to a backend. Ordinary non-demo builds have no status selector,
reset action or effective overrides. These controls do not represent approval or
real authorization workflows.

Known documentation conflict (reviewed, left unchanged): `DEL2_DEMO.md` says the
compact status summary always displays all nine categories. Current requirements,
implementation and regression tests hide categories with zero counts.
