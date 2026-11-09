# Del 14–16 implementation

All three exports were read by the source-audit parser. The active source controls,
not YAML card order, determine the React structure. The user explicitly confirmed
including the active Del 16 D in addition to A–C. The hidden legacy A is excluded.

## Mapping and structure

| Del/group | Implemented structure |
| --- | --- |
| 14 A | Six numbered rows: grades 1, 2, 3, 4, 5–7, total; children in SFO and children with a 100% place |
| 14 B | Four rows: teacher/kindergarten education, child/youth vocational qualification, other competence, total; Men/Women/Sum/Årsverk |
| 14 C | Five separate source questions: monthly full-time price grades 1–3, full-time price grade 4, part-time price grade 4, full-time hours, part-time hours |
| 14 D | Three independent Ja/Nei questions: local income-graduated rates, local free places, sibling discount; shared light-blue dividers |
| 14 E | Grades 1–4 plus total; local and national income-graduated arrangements |
| 15 A | Own service, intermunicipal operator, intermunicipal participant, other organisation; municipality picker only when participating |
| 15 B | Coordination with upper-secondary PPT, Ja/Nei |
| 15 C | Six staffing/education rows plus sum; decimal årsverk |
| 15 D | Linked recipient municipality records, add/select/remove, numbered rows and duplicate/own-municipality exclusion |
| 16 A | Active replacement: grades 1–10 plus total; full educational provision, residence over three months without full provision, sum |
| 16 B | Displaced Ukrainian pupils with a decision on reinforced Norwegian instruction |
| 16 C | Displaced Ukrainian pupils taught in separate groups |
| 16 D | Mother-tongue only / both mother-tongue and bilingual / bilingual only / other adapted education / sum |

Del 14 has 43 numeric bindings (32 manually editable), plus three booleans.
Del 15 has seven numeric bindings (six editable), five booleans, the GG_950
municipality picker and linked KommuneNavn records. Del 16 has 40 numeric bindings
(26 editable). The source checklist records every control, field, row, column,
digit limit, decimal rule, sum operand and excluded control.

- Registry: `src/domain/finalScreens.json`.
- Detailed audit: `DEL14_15_16_SOURCE_AUDIT.json`.
- Compact binding checklist: `DEL14_15_16_CHECKLIST.json`.
- Regenerate using `node scripts/audit-final-screens.mjs` and
  `node scripts/generate-final-screens.mjs`.

## Conditions, clearing and navigation

Del 14 is applicable only when Del 2 GG_230_Tilbyr_SFO is true. Otherwise its menu
entry is hidden, Next skips from 13 to 15, Previous skips from 15 to 13, direct
section selection is guarded, and neither local errors nor unsupported SFO
controllers are included in Del 17. Navigation uses the existing shared Del 2
snapshot/store, including optimistic UI state; no second school/applicability
source was introduced.

The existing mock Del 2 SFO-off dependent-clear operation now has verified active
field names instead of its former “source missing” placeholder. It clears the
local SFO record only; no backend patch or real persistence is performed.

15 C appears when GG_946_Egen_Kommunal_Tjeneste OR
GG_947_Drifter_Interkommunal_Tjeneste is true. 15 D appears only when GG_947 is true.
The source explicitly clears six staffing values when both answers become Nei;
it explicitly removes linked recipient rows when operation becomes Nei. These
transitions are guarded in the mock service as well as the UI. Ordinary visibility
changes do not otherwise clear data.

Source quirk: Radio1_11 compares its Ja/Nei `Selected.Value` with the literal
`"1"` before clearing GG_950_Kommune_I_Interkommunal_Tjeneste. Thus both real answer
changes reset the picker. The mock preserves that literal source behavior and
does not silently reinterpret the condition. Confirm the intended rule before
connecting a real API.

Decimal staffing follows the existing shared validation: positive values up to
9999, comma or point accepted, two-decimal normalization. Invalid entries remain
visible with a local error for correction, as on the existing React screens,
instead of silently resetting the input as Power Apps does. Integer fields retain
the exported digit limits. Requiredness absent from source controllers is not
invented; unanswered inapplicable fields do not become blocking errors.

## Shared architecture and permissions

The screens reuse ImportedNumericSection, ImportedQuestionTable, NumericCell,
ReportingFields, field-state precedence, sum presentation, validation/badges and
the in-memory per-school/year store. BooleanSubquestions reuses the established
subquestion/divider pattern. PPT linked records use stable mock IDs and the
verified KommuneNavn source property; their parent-report relationship is the
existing report store key.

Role/status capabilities and explicit unit access are unchanged, including the
selected unit's isKommunesentralt effective-role handling. Numeric, boolean and
collection callbacks enforce these guards independently of disabled HTML inputs.
No authentication, real authorization, GitHub DEMO enablement or production
permission bypass was added. Missing real user context still fails closed.

SQL metadata uses the existing DEV gate and wrappers. Actual GG_950 and linked
KommuneNavn source bindings are registered; Power Apps source aliases are not
claimed to be verified physical SQL table names. TEST/QA/PROD and the isolated
Pages DEMO build omit developer tooltip components/catalogs.

## Unresolved external dependencies and validation

No active numeric/boolean/municipality binding is unresolved. Physical SQL table
schemas, backend computed-column definitions, official nfViewSprak /
ColTekstDiverse labels and municipality dictionaries were not supplied. Clear
Norwegian fallback labels use the application translation system; no per-screen
language state or language switch was added. Municipality options reuse the
existing fictional mock municipalities rather than claiming an official list.

Visible sums are local mock arithmetic over their source row/column operands,
including decimal staffing and active Ukrainian-pupil totals. Known empty sums
show 0; unavailable backend values elsewhere retain their unavailable state.
Future BOGIAPI computed values must remain authoritative.

The following controller IDs have no supplied formula/text and remain explicitly
unsupported in Del 17, never reported as passed:

- **14:** GG-A10–GG-A13, GG-A31, GG-A34, GG-A37, GG-A62, GG-A61,
  GG-A74, GG-A76–GG-A78, GG-F109, GG-A122, GG-A9, GG-F2, GG-F125.
- **15:** GG-F151, GG-F152, GG-F155, GG-F154.
- **16:** GG-A64, GG-A67, GG-A69–GG-A71, GG-A66, GG-A68.

The obsolete blanket “other reporting sections not implemented” result was
removed now that 1–18 are implemented. Actual unsupported controller/backend
results remain and continue blocking mock completeness/submission as appropriate.

## Verification results

- All nine new Del 14–16 tests passed after correcting the SFO sum-row mapping.
  Both 1–10 and 4–6 grade ranges, role 9, central-unit role 10 and read-only role 13
  are covered. Tests require every active editable **and calculated** field to
  render once, independently check sums, and verify source-driven clears and badges.
- Each screen was checked at 1920, 1440, 1280 and 390 px, with screenshots. All new
  tables fit at the three desktop widths without horizontal scrolling. Narrow
  screens use one scroller where multiple columns genuinely require it. Scoped
  WCAG 2.1 A/AA axe checks passed for every new screen and navigation.
- The full normal Playwright suite ran **182 cases: 181 passed, 1 failed**. The
  failed older keyboard assertion assumed Tab skips directly between help buttons;
  intentional DEV metadata wrappers now add keyboard stops. The test was updated
  to verify those wrappers, skip native disabled controls, and reach the next help
  button within the real tab order. A separate non-DEV test retains the direct
  Tab-to-next-help assertion. All three focused rerun cases passed.
- Both dedicated GitHub Pages DEMO build tests passed. The built demo test enables
  SFO through Del 2, then visits **all 18** implemented sections; TEST/QA/PROD labels
  still cannot enable the dedicated fictional demo mode. The full suite also
  verified non-DEV tooltip/catalog/source-descriptor exclusion.
- Lint passed after removing one unused test import. TypeScript and normal/demo
  production builds passed. Vite retains a non-blocking main-chunk warning
  (approximately 888 kB minified). No tests or axe rules were disabled.

The initial SFO test failure was a genuine layout/mapping defect: total identifiers
containing `Trinn_1_7` were classified as the preceding grade-band row. Totals now
use the separate source question 6. The final keyboard failure was a stale test
expectation, not a change to disabled-answer or help behavior.

## Changed files

- New data/rules/services: `src/domain/finalScreens.json`, `finalScreenRules.ts`,
  `src/services/finalReportService.ts`; extended `importedReporting.ts`,
  `additionalRules.ts`, `del2.ts`, and `services/importedReportService.ts`.
- New shared UI: `src/components/BooleanSubquestions.tsx`, `PptMunicipalities.tsx`;
  extended `ImportedNumericSection.tsx`, `ImportedQuestionTable.tsx`,
  `grunnskoleSections.ts`, `GrunnskoleNavigation.tsx`, `GrunnskoleLayout.tsx`,
  `src/App.tsx`, `src/useSectionValidation.ts` and the scoped PPT table CSS.
- Source/build tooling: `scripts/audit-final-screens.mjs`,
  `generate-final-screens.mjs`, `inspect-powerapps.mjs`, `dev-field-metadata.mjs`,
  `generate-imported-translations.mjs`, regenerated `src/locales/importedUi.ts`,
  and `vite.config.js` production source-descriptor stripping for the new registry.
- Tests: new `e2e/final-screens.spec.ts`; updated applicable completed-report count
  (541 when SFO is off/PPT organisation is unanswered), built-demo navigation setup,
  and DEV/non-DEV keyboard expectations in existing tests.
- Documentation: this report, source audit/checklist, `REPORTING_UI.md` and
  `DEMO_USERS.md`. Supplied exports/instructions and earlier exports were not edited.

Existing unrelated working-tree changes and import-folder removals were preserved.

## SFO navigation investigation

**Superseded navigation policy:** All 18 numbered items now remain visible. The
shared section registry distinguishes available, unresolved and not-applicable.
SFO false disables Del 14 with a focusable explanation; unknown remains enabled,
marked with ?, with an explanation directing the user to Del 2. Questions remain
unavailable until explicit Ja. Next/Previous skip only not-applicable sections.
Del 15/16 have no verified whole-section restriction; existing PPT group conditions
are unchanged. Roles and IsKommunesentralt affect permissions, not applicability.
The former SFO-off clearing operation is removed as requested: answers survive
inapplicability and return when SFO is enabled. Existing validation excludes
inapplicable SFO findings from badges and completion checks. Other unsupported
controller limitations remain. Earlier hide/clear descriptions below are historical.

Del 14 is registered in both the numeric-screen registry and sidebar configuration.
Unconfigured mock reports inherit `emptyDel2.GG_230_Tilbyr_SFO = null`; they do not
have a verified SFO answer. Navigation includes Del 14 only for explicit `true`,
and Next/Previous skip it otherwise. A DEV-only notice now identifies the school,
year and missing field when its answer is unknown, rather than silently presenting
unknown as an explicit false. No school answer is invented or seeded.

The existing shared Del 2 snapshot updates applicability immediately, and the mock
store retains the saved answer during this page session. Selecting Ja reveals
Del 14; selecting Nei hides it. The targeted navigation tests cover unknown,
true/false, both pagination directions and reactive changes. No Del 15/16 screen
or question structure was changed by this investigation.
