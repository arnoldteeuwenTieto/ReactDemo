# Four-screen import — 3 November 2026

The existing React shell is retained. Del 3 and Del 4 replace their placeholders;
Del 17 and Del 18 are appended to the existing navigation. Previous/Next follows
the registered sections, skipping unimplemented section numbers 10–16. Existing
Del 1/2, demo selectors, overview, filters, status overrides and language controls
remain in place. No API calls, authentication or real submissions were added.

## Compact UI refinement

### Section framing aligned with Del 2

All imported section containers now inherit Del 2's existing `.question-card`
frame without overriding its padding/background: 8px internal frame padding,
1px `--farge-spm-kantlinje` (#DCE5F3) border, `--size-border-radius` (8px) radius
and `--farge-stalblaa01` (#DCE5F3) frame background. No copies of those values
were introduced for the imported sections. The shared `ImportedQuestionSection`
wraps its contents in a white, borderless content region; Del 17 findings use
the same content class inside their existing question cards. Tables, totals,
comments and contained actions stay within the one outer frame. Existing dark
headers, inter-section whitespace and input sizing rules are retained; no nested
table frame or new business behavior is added.

This is a visual-only change, checked through source inspection. TypeScript and
production-build verification were explicitly requested. Playwright, accessibility
audits and lint are intentionally skipped under Level 1 of the local test policy.

### Del 3E financing table

`MunicipalityFinancingTable.tsx` renders Nr., Kommune, Antall elever and a visually
unlabelled action column, using the existing imported table styles/blue section
header. Each municipality is one 40px row; the dropdown/count are 30px controls in
separate cells. The small delete icon has a dynamic accessible name such as
`Fjern Oslo`, a red hover/focus state, and the existing edit-permission gate.
The add button remains below the table with a decorative plus icon. A final grey
read-only input row shows the existing financing sum.

Rows retain their original IDs, values, dependency explanations and validation.
Add/edit/delete still use `saveMunicipalities` and the same report store; removing
a record immediately refreshes totals and shared validation badges. Other Del 3
sections, rules and permissions are unchanged. The old financing-only fieldset
layout styles were removed; shared styles used elsewhere retain their values.

Verification: TypeScript and production build passed. All 18 targeted tests passed
(four financing tests, five imported-screen tests and nine field-state tests).
They cover deletion/re-numbering, totals, validation, readonly UI and adapter
guards, persistence, red hover/focus, and non-overlapping controls at 1280/768/390/
320px. A 3E-only axe check reported no WCAG 2.1 A/AA violations; desktop/mobile
screenshots were inspected. Full suite, full audit and lint were intentionally
skipped under the local verification policy.

Shared field-state/badge update: active and inactive sections now receive their
blocking-error counts from `useSectionValidation`; warnings are excluded unless
explicitly marked blocking. Grade applicability is shared by rendering, local
validation, mock totals and save guards. Out-of-range answers are retained, but
excluded from applicable sums. Business-disabled controls use terracotta styling
and accessible lock explanations, while calculated and permission-read-only
controls remain grey. See [SECTION_VALIDATION.md](../SECTION_VALIDATION.md) for
the current policy and test scenarios; this supersedes the earlier leave-only
badge behavior. No additional role, school-type or approval rule is introduced.

The four imported screens have no local language switch or language state. They
continue to render from the application's existing i18n selection. Source codes
remain in metadata, bindings, controller keys and internal test attributes, not
in visible labels or imported-screen help references.

`ImportedQuestionTable.tsx` shares section headers, numbered rows, numeric cells,
calculated cells and accessible validation descriptions between Del 3 and Del 4.
`importedQuestionLayout.ts` contains presentation-only row/column labels. Row
numbers are extracted from actual numeric labels in the Power Apps row containers,
including numbered subtotal rows, rather than derived from database field IDs.
The gender table uses 5/55/13/13/14 percent columns. Other tables use the same narrow
number column and proportions appropriate to their number of numeric columns.

Calculated inputs/cells and subtotal rows use the existing light-grey token and
remain read-only. The renderer accepts calculated values independently of editable
answers, so an eventual API adapter can supply authoritative backend values without
making those fields editable. Current mock calculations and persistence are unchanged.
Empty-field reminders no longer appear beneath every cell; invalid entered values
retain accessible descriptions and show compact feedback on blur. Sections have
24px white spacing, existing dark-blue headers/help icons, white editable cells
and internally scrolling tables on narrow screens. The sidebar/header are unchanged.

Del 17 retains the same findings, counts, comment keys and section links, using
readable question/control descriptions instead of technical codes. Del 18 keeps
its existing guards, confirmation and mock transitions. Existing Del 1/2 help
drawers retain their reference display; only the imported views opt out.

Verification: TypeScript and the production build passed. Five targeted tests
passed, covering editing permissions, calculated read-only values and grey styling,
source numbering, 24px spacing, data/navigation preservation, hidden identifiers,
application-level locale selection and axe checks on all four views. Mobile checks
cover all four screens at 390px. A stale Bokmål-only navigation test locator was
corrected to recognize the existing Nynorsk label; no application behavior changed.
Full Playwright suite, full accessibility audit and lint were intentionally skipped
for this UI refinement under the local verification policy.

## Source coverage

- Del 3: all seven A–G groups, 70 exported numeric controls, and the repeatable
  financing rows (`GG_887_Finansiert_Annen_Kommune`,
  `GG_886_Elever_Finansiert_Annen_Kommune`). Add/remove, own-municipality exclusion,
  duplicate exclusion and the financing total are implemented. The source's stale
  F/G heading letters are aligned with the seven current sections.
- Del 4: all five A–E groups and all 113 exported numeric-control definitions
  (112 unique fields; the source repeats GG_136). Available arithmetic preserves
  the source's explicit control-reference expressions and read-only totals.
- 71 arithmetic totals are derived from explicit Sum/Value expressions in the
  exports. Blank operands contribute zero; invalid operands propagate an unknown
  result. Zero is a valid answer, distinct from an unanswered field.
- Del 17: an explicit local check action, error/warning/unsupported counts, passed
  local numeric checks, every exported controller reference, comments and links
  to the relevant section. No official or server check is reported as passed.
- Del 18: explicit recording of the selected demo user's supplied-by details,
  school/municipality remarks, capability-gated action buttons, a native modal
  confirmation and local success/receipt state. No automatic writes on rendering.

## State and permissions

`grunnskoleApi.ts` remains the single in-memory section store keyed by
`demo:<school-id>:<year>`. The import adds read/patch/subscription primitives;
existing asynchronous Del 2 saves notify the same store. Imported-section edits
survive normal navigation and are isolated by school and year, resetting on reload.
Raw editable values are retained so local errors can be corrected. Calculated
values are derived, never independently editable.

`importedReportService.ts` is the adapter boundary for guarded writes and workflow
actions. It can later be replaced with an authenticated BOGIAPI adapter. Every
edit/action handler rechecks `getDemoReportPermissions`, not just disabled UI.
The centralized matrix uses selected-unit `isKommunesentralt` (the mock counterpart
of BOGIAPI `IsKommunesentralt`) and explicit unit access. Actual roleId is unchanged;
there is no name detection or separate role 109. The existing Del 2 baseline guard
is unchanged; its documented differences from matrix capabilities still apply.

Approve transitions: ordinary owner → status 4; county governor → status 6.
Reject transitions: ordinary owner → status 3; county governor → status 5.
Submission targets status 2 and requires checked, complete/resolved findings.
Actions remain subject to the centralized role/status matrix and are confirmed
before any local mutation. Successful mock actions store an audit entry and update
the existing session status override, without changing underlying mock records.

## Validation and missing source dependencies

`importedReporting.ts` contains validation/calculation logic, separate from UI.
Light per-section checks feed existing leave-section badges; normal navigation
never runs the full controller inventory. Numeric non-negative integer/digit-limit
checks use exported numeric controls and MaxLength values. Unanswered fields are
warnings: the exports do not establish an authoritative required-field catalog.
Del 2's existing required/local rules are reused unchanged. Known grade bands use
Del 2's selected range; other unavailable NSR-dependent conditions are not invented.

The following cannot be faithfully reconstructed from these four exports:

1. `nfViewSprak` / `ColTekstDiverse` and help tables are absent. Norwegian fallback
   labels use exported heading comments and readable field identifiers, preserving
   source GG codes/references. `importedUi.ts` integrates those strings with the
   existing Bokmål/Nynorsk resources. Untranslated Nynorsk labels explicitly fall
   back to the Norwegian source labels; these are not official translations.
   The existing app has no English language option; English resources can be added
   later without changing data or permission code.
2. 47 Del 3 and 45 Del 4 official controller references have no supplied formula/
   text definitions (`nfKontrolleretable`, named `Kontroll_GG_*` formulas, bounds
   such as `NedreGrense`). They appear as unsupported findings, not successful checks.
3. Del 4's database-computed fields GG_1043, GG_1044, GG_1045, GG_1046 and GG_136
   have no usable expression in the export. The repeated GG_136 view contains a
   stale A3−C1 comment referencing controls not present in the export. These values
   remain blank with a visible unavailable-calculation explanation; no formula is
   guessed and no stored value is overwritten with a fabricated zero.
4. Other reporting sections lack imported answers/rules, so whole-report
   completeness cannot be asserted. **Lever remains disabled** while source checks
   or calculations are unresolved. A component rendering never marks it complete.
   Receipt/confirmation state is implemented locally for supported successful
   mock actions; unsupported validation cannot silently enable submission.
5. Udir's rejection capability has no unambiguous target workflow status in the
   supplied sources/current model. Its button is disabled with an explanation;
   status 7 is not mislabelled as rejection. No extra approval rules are invented.
6. NSR/private-school flags and a complete municipality catalog are absent. The
   repeatable rows use the existing fictional municipalities; no real jurisdiction
   or backend access is inferred. School remarks require edit capability;
   municipality remarks require ordinary role 10 review capability.

These are the agreed fallback/placeholder boundaries, not requests for additional
exports. Production must validate real access, identity, authoritative unit flags
and workflow transitions on the server; client flags never authorize backend calls.

## Files and regeneration

- `src/domain/importedScreens.json`: complete extracted field/reference inventory.
- `src/domain/importedReporting.ts`: arithmetic, light checks, full local overview.
- `src/services/importedReportService.ts`: typed mock persistence/action adapter.
- `src/components/ImportedNumericSection.tsx`: numeric tables and municipality rows.
- `src/components/ImportedWorkflowSection.tsx`: controllers, comments, completion.
- `src/App.tsx`, `grunnskoleSections.ts`: navigation, shared state and badge wiring.
- `src/App.css`: scoped imported table/remark styles using existing tokens.
- `src/locales/importedUi.ts`, `ui.ts`: fallback translation resources.
- `e2e/imported-screens.spec.ts`: source coverage, arithmetic, isolation, permissions,
  workflow confirmation, locale, responsive layout and targeted axe checks.

Regenerate with `node scripts/generate-imported-screens.mjs` followed by
`node scripts/generate-imported-translations.mjs`. The indentation-aware extractor
in `scripts/inspect-powerapps.mjs` is deliberately scoped to these export files;
it is not a general YAML/Power Fx evaluator. Source expressions remain in metadata
for review. Run the focused coverage tests after modifying the exports.

## Verification

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npm run build`: passed (production bundle, no build errors).
- Five imported-screen tests: passed, including all exported numeric fields,
  explicit unit flags/access, arithmetic, validation results, comments, confirmation,
  school isolation, locale switching and responsive layout.
- Nine affected existing section-validation/status-navigation tests: passed.
- Targeted axe checks on all four new screens: no WCAG 2.1 A/AA violations.
- Desktop screenshots inspected after fixing inherited table no-wrap styling.

Initial failures were investigated and corrected: the Node test runner required
an explicit JSON import attribute; a test incorrectly expected protected form
fields without unit access; hidden absolute labels caused mobile page overflow;
and two differently named Del 4 totals initially shared a rendered grid cell.
The field-coverage assertion now verifies all 112 unique Del 4 fields. No tests
were disabled and no axe rules were suppressed. The full Playwright suite and
full manual accessibility audit were intentionally not run; this was targeted
verification. Missing source dependencies above remain explicit limitations.
