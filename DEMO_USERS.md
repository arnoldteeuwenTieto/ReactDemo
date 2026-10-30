# Demonstration users

The selector is opt-in and development-only. In `.env.development.local`, set
`VITE_ENABLE_DEMO_USERS=true`, then restart `npm run dev`. Alternatively set that
environment variable in your shell. Without the exact value `true`, switching is
disabled. `npm run build` disables switching even when the flag is set; the entire
demo-control section is removed from the layout. No deployment settings change.
Vite defines the enablement constant only for its development-server command in
development mode; build commands always define it as false, regardless of NODE_ENV.

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
RolleId 9 or RolleId 10 with `municipalityCentral === true` (Iskommunesentralt).
All other cases are read-only, including missing context and production builds.
Inputs, local-save callbacks and retries enforce the same rule. Switching users
updates permission immediately without clearing answers. Already initiated local
saves may finish; switching users does not initiate new saves. Del 1 remains
read-only. Help, navigation and the overview remain available; no new visibility,
approval, submission, administrative or support rules are implemented.
There is no authentication
integration; future backend authorization must use authenticated server identity,
never this context, browser storage or a client-provided role ID.

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
no status update is sent to a backend. Production builds have no status selector,
reset action or effective overrides. These controls do not represent approval or
real authorization workflows.

Known documentation conflict (reviewed, left unchanged): `DEL2_DEMO.md` says the
compact status summary always displays all nine categories. Current requirements,
implementation and regression tests hide categories with zero counts.
