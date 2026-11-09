# GSI Grunnskole — lifecycle migration into React

## Source files
Read every file in `gsi-react-import/lifecycle/` before implementing:
- `App.OnStart.txt`: original Power Apps startup logic
- `App.Formulas.txt`: large original named-formulas and validation source; identify active and commented-out code
- `Knapp_Apne_Skjema_6.OnSelect.yaml`: original open/edit button YAML, with `OnSelect` held as a YAML string
- `Knapp_Se_skjema_5.OnSelect.txt`: separately supplied read/view button Power Fx
- `Innledning_Neste.OnSelect.txt`: initialization and transition to Del 1

**Source provenance:** Two uploaded copies of `Knapp_Apne_Skjema_6` were byte-identical; only one is packaged. The `Knapp_Se_skjema_5` source was provided as plain text in a later message. Do not confuse them or treat the duplicate edit export as a read-only button.

## Objective
Extend the existing GSI React mockup without rewriting Del 1–18. Reproduce active *functional behavior* rather than transliterating Power Fx into React components. Implement lifecycle in stages and preserve the existing mock/demo and GitHub Pages deployment.

### 1. Audit first
Create a source-to-React matrix for application startup, environment/year/language, session and identity, selected school, unit types, roles, reporting period, form creation/loading, status transitions, dynamic child rows, help text, previous control comments, formulas, section status, navigation and tracing. Mark each as implemented, partial, missing, backend-dependent, commented-out, ambiguous; cite source filename and formula/field name. Do not silently invent absent behavior.

### 2. Shared application and reporting session
Use typed application configuration, selected school/year, status IDs, original role and effective capabilities, openMode (`view` or `edit`), reporting-period policy, form loading/error state, section applicability and shared reporting answers. Preserve `IsKommunesentralt` sourced from the backend/mock unit property; do NOT reinstate school-name string matching from legacy Power Fx. Keep capabilities distinct from role, mode and section applicability.

### 3. Opening a form
Separate `openSchool(school, year, mode)` into `view` versus `edit` workflows:
- Both resolve/authorize school-specific access, locate existing form, load correct context and open Innledning.
- View mode requires an existing authorized form and performs **no writes**: no creation, status reset, answer saving, control-comment patch, child-row changes or status transitions. Missing form and permission must have explicit error states.
- Edit mode enforces the reporting window and school-specific capability, may create a missing form and initialize Del 2–16 data, and may perform explicitly permitted status transitions (e.g. certain rejected/corrected statuses); preserve new `SkjemaStatusId` and avoid a subsequent stale ID overwrite.
- The original create logic initializes Del 6 frame values `GG_224_Aarsramme_Undervisning_Trinn_1_7=741` and `GG_225_Aarsramme_Undervisning_Trinn_8_10=656`; retain these only when creating a form in the correct context.
- Future real persistence must be a BOGIAPI server-side authorized, idempotent/transactional operation, not direct SQL or multiple browser patches. The GitHub demo must remain mock-only.
- Do not assume an authority role can read every school without a school-specific authorization result. DEV overrides must be explicit, opt-in and demo-only.

### 4. Intro/initialization
Load existing Del 2–16 answers and dynamic child tables for Del 3, 7, 8, 9, 11, 15. Preserve child record identifiers, ordering and original values. Initialize language-dependent help texts and saved control comments, evaluate shared formulas and build all 18 navigation entries with applicable/greyed-out sections. Do not persist placeholder rows simply to show inputs. Do not accidentally write existing control comments in view mode. Only navigate to Del 1 after loading/initialization succeeds.

### 5. Formula engine
Catalogue and prioritize active formulas, including cross-section calculations, grade applicability, SFO, `Statussteg`, Del 17 and Del 18 gating. Preserve Power Fx blank-versus-zero, number bounds, rounding and error handling semantics. Never activate commented-out superseded formulas without evidence; report uncertainty. Keep pure calculation and validation separate from side effects.

### 6. Testing and safeguards
Test role 9/10/11/12/13 including municipal central; existing and new forms; view mode no writes; out-of-period; rejected/corrected reopening; missing/invalid session, lost access, navigation after initialization, dynamic child rows, demo GitHub Pages and test/prod DEV gating. Run TypeScript, relevant tests, production build. Report exact modified files and unresolved backend dependencies. Preserve current layouts and UI conventions.

### Known source ambiguities
- `Knapp_Se_skjema_5` DEV branch returns `9` without setting `vargblAltinnRolle`; implement explicit demo role resolution instead of relying on stale state.
- Its final navigation condition checks `nfLoginRole.RolleId` and Altinn role, but is not by itself proof of per-school authorization.
- `App.OnStart` has temporary/default unit flags, and `Innledning` still has a legacy school-name check; backend-derived unit metadata overrides these temporary patterns.
- In open/edit YAML, a later `Set(vargblSkjemaStatusId, Value(Gallery_Statusside.Selected.SkjemaStatusId))` may overwrite newly created status ID; do not reproduce this bug.
