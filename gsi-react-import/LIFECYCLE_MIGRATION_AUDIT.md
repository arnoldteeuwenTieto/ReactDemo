# Lifecycle migration audit

All five files in `lifecycle/` were read. `LIFECYCLE_FORMULA_CATALOG.json` records
their SHA-256 hashes and active named expressions, inputs and dependencies.
`scripts/audit-lifecycle.mjs` decodes the YAML OnSelect string and masks line/block
comments (including escaped comment delimiters) before finding top-level formulas.
The 393 definitions include 312 validation-related definitions; cataloguing is
not a claim that all expressions have been translated or verified in React.

## Source-to-React assessment before the lifecycle integration

| Area / active source | Existing React state | Migration decision / dependency |
|---|---|---|
| OnStart `vargblEnvironment`, Formulas `nfEnv_Name`, versions | Implemented through buildInfo and deployment variables | Reuse configuration; never infer TEST/PROD from build mode |
| OnStart year, language, schema, reporting dates, `NewFeature` | Language implemented; year filter fixed to 2026; period/config missing | Central typed startup service; explicit deployment config, current-year fallback; no remote configuration credentials |
| OnStart DEV period bypass | Legacy active behavior | Replace automatic environment bypass with explicit fictional-demo-only opt-in; configured TEST/QA/PROD windows enforced |
| Formulas `nfSessionId`, `nfUserId`, `nfLoginRole`, `nfHarMistetTilgang` | Fictional profiles with explicit school scope; no real session | Use demo authorization; future BOGIAPI/Altinn session validation. Never use authority role alone as school access |
| OnSelect school/year/org and SkjemaStatus lookup | School stored centrally in App; synthetic mock IDs | Shared opening/session service; adapter returns current form ID and status |
| Formulas `nfDisplayMode`, `nfGruppeSkriveTilgang=[9]` | Baseline Del 2 status-1 guard plus a broader capability matrix for imported screens | Opening/edit requires effective role 9, authorized unit and period; view always strips mutation capabilities |
| Legacy central-unit name check in edit/Intro/Formulas | Superseded by unit boolean | Keep backend-equivalent `isKommunesentralt`; actual login role 10 unchanged |
| Edit OnSelect `Patch(SkjemaStatus)` + 16 answer-row batches | Missing creation operation | Mock-only atomic/idempotent initialization; future single authorized BOGIAPI transaction |
| Edit OnSelect Del 6 defaults 741 / 656 | Missing creation defaults | Apply only when creating a form; never overwrite existing answers |
| Edit OnSelect reset statuses 3,5,7 to 1 | Missing reopening | Only explicit edit opening, effective leader with unit access in period; mock transition authorized within adapter, no view reset |
| Edit OnSelect final stale Gallery StatusId assignment | Active source bug | Do not reproduce. Preserve initialization operation's returned ID |
| View OnSelect Altinn DEV branch literal `9` | Stale variable risk; not a reliable permission assignment | Explicit selected demo role; no implicit override to leader. View path has no initialization/transition operation |
| View final role-only navigation condition | Insufficient school authorization | Require existing ID and explicit school read scope before loading |
| Intro `Kontrollere` ParseJSON and Patch | Shared mock comments exist; no legacy JSON schema importer | Load stored comments without rewriting; no view patch. Legacy production JSON adapter remains backend work |
| Intro translated help `colHjelpetekster` and option collections | Existing i18n/help service and fallback texts | Reuse language-aware help loaders; full DB dictionaries/option values not supplied |
| Intro dynamic Del 3/7/8/9/11/15 collections | Existing shared store, stable IDs and collection components | Read existing rows; preserve IDs/order; clone shadow state in memory only, no persisted placeholders |
| Intro unit flags / OnStart temporary true defaults | Unit type metadata not supplied for all mock units | Explicit optional unit flags; unknown remains null. No invented public/private/SFO classification |
| Formulas sums, `nfBeregnedeArsverk...`, `nfKompetenteLaerereSum` | Shared calculation/validation layer already exists | Reuse; add verified shared formulas incrementally with Power Fx rounding and blank handling |
| Formulas `Statussteg1..17`, `nfTotalStatus`, controller Switch | Local error badges and conservative unsupported checks exist | Full formulas now available but not all ported. ViewKontroll category/text records still absent. Never mark unsupported rules passed |
| Intro all 18 navigation rows | Implemented | Preserve greyed-out applicability, active badges, existing question-level conditions |
| Intro active Trace vs edit commented Trace | No telemetry adapter | In-memory bounded event log only; no external identifiers/comments sent anywhere |
| OnStart fixed dimensions/font sizes, temporary NSR defaults, dummy collections | Existing responsive theme/13 px screens | Obsolete layout/default patterns not migrated |
| Commented OnStart example data and Intro old warning-clear block | Not active | Do not activate or persist placeholder rows / clear saved comments |

## Scope and permission differences

The distinct read source is **not** identical to the edit YAML. It has no Patch,
creation or transition call. Its permissive final condition does not prove unit
access; React deliberately retains the stronger explicit unit-scope requirement.
The former React baseline allowed a central-profile role 10 to edit Del 2 on an
ordinary school. School opening now checks the selected unit's effective role,
so that profile opens ordinary schools for viewing. The underlying historical
baseline helper is retained for existing sessions; it is not a source of opening
authorization. The capability matrix has status 0/3/5/7 edit categories; the
opening workflow uses only the explicit source create/reopen transitions, then
the existing status-1 editing guard. No new approval transition is invented.

Real authentication, NSR unit flags, SchemaConfiguration, authoritative status and
transactional creation, ViewKontroll rows, complete translation/help dictionaries,
and server-side authorization remain future BOGIAPI dependencies. No SQL access
or actual backend submission is introduced.

## Implementation and verification

This section is completed after integration and test execution. Source files are
preserved unchanged. Existing screens and theme are reused rather than rewritten.
