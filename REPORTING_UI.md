# Shared reporting-field UI and DEV metadata

## Shared presentation

`src/domain/fieldPresentation.ts` treats only null, undefined and the empty string as empty. Numeric zero, string zero and boolean false remain populated answers. Value presence, origin, edit permission, applicability and validation remain separate concepts.

`ReportingFields.tsx` supplies shared native input, select, textarea and backend-value elements. It preserves existing handlers, labels, names, IDs, disabled/read-only rules and validation attributes. Numeric cells, municipality rows, language rows, Del 2 questions, Del 1 backend details, Del 17/18 text fields and the shared placeholder controls use it. All Del 1–18 screens are implemented. Del 14 follows the selected report's SFO answer; PPT C/D follow active source conditions. See gsi-react-import/DEL14_15_16_IMPLEMENTATION.md.

| Origin/state | Background | Behavior |
| --- | --- | --- |
| User field with no answer | #FFFFFF | Existing edit permissions and blue-grey border |
| Populated user field, including 0/false | #F1F3F5 | Same color for a read-only viewer; a locked user-selected language remains user-origin |
| Calculated or backend-owned | #D9DDE3 | Read-only; origins are explicitly distinct in metadata |
| Business-inapplicable | #EAF0F7 | #BBCBDD border, #627894 lock, #54677E text; existing disabled behavior and explanation; overrides ordinary origin/value colors |
| Invalid applicable value | Existing red border | Existing aria-invalid and error explanation; independent of background |

App.css owns the shared color variables. The lock button retains its size and explanation; a small grid reserves space beside the input so it does not cover entered text. Header, sidebar, font sizes, question structures, routing, permission matrix, IsKommunesentralt, mock records, grade rules, validation counts and submission behavior are unchanged.

## Del 2 alignment

Del 2 retains its question cards and uses ReportingInput/ReportingSelect, the same
field-presentation and field-state helpers as numeric screens. Null/empty fields
remain white; zero, false and selected values count as populated. Applicability
takes precedence over ownership, followed by applicable validation borders and
value presence. Permission-readonly is separate from business-inapplicability.
CSS also prevents stale invalid attributes from making blocked/derived fields red.

Existing editableDel2Issues and useSectionValidation remain the single validation
source for inline messages and sidebar counts, including active Del 2. Required
messages now say “Velg et svar.”; the same rules/counts still apply. Native controls
reference their error descriptions directly. Explicit radio labels preserve the
accessible name when a disabled DEV metadata wrapper is present.

Technical validation references and unavailable-formula diagnostics are kept in
collapsed DEV-only details. API diagnostics use the same DEV metadata gate; TEST,
QA, PROD and deployed DEMO have neither diagnostic controls nor SQL attributes.
SQL mappings use the existing Del 2 model/catalog, with no invented physical table
mapping. The application-level language system and grade-dependent mock behavior
are unchanged.

Verification for the Del 2/blue-grey update: 21 of the initial 22 reporting/state
checks passed; one was interrupted by Vite reloading after an in-progress source
edit and passed on rerun. The next 22 targeted checks all passed, including Del 2
axe checks across statuses 0–8, cross-field errors, help dialogs, read-only roles,
other sections' grade restrictions and normal production isolation. All 12
environment-specific tooltip cases passed. These runs contain overlapping cases.
The first build caught a duplicate translation key introduced during this change;
the existing translation was retained and the duplicate removed. Final
`npm run build` passed, including TypeScript, with only the existing bundle-size
warning. Full-suite testing, full-application accessibility audit and lint were
intentionally skipped under the targeted-testing policy.

## Width and calculated displays

### Del 11–13 layout refinement

Browser measurements at 1920/1440 px found 1066 px available inside question
frames, and 906 px at 1280 px. The former 1144 px Del 13 E minimum forced scrolling
at every desktop size; Del 11 B–D's 940 px minimum also overflowed at 1280 px.
Scoped responsive table rules now reserve a compact 32 px question column,
readable wrapping descriptions and uniform numeric columns. Elective columns use
relative widths instead of a full set of fixed pixel widths. Font size remains
13 px, headers/columns are preserved, and the shared grid children retain min-width:0.

All Del 11–13 tables fit the normal fixture at 1920, 1440 and 1280 px. At 390 px,
the measured 336 px content width still needs one table scroller for:

| Tables | Minimum table width | Reason |
| --- | --- | --- |
| 11 A | 784 px | Choice, ten numeric/result columns, number and delete action |
| 11 B–D | 780 px | Grouped 8./9./10. trinn gender/sum columns plus overall sum |
| 13 A | 360 px | Description and three numeric columns |
| 13 C, G | 420 px | Description and four numeric columns |
| 13 E | 840 px | Ten grade columns plus sum and readable row labels |

Del 12 tables and the single-column reference/reallocation tables fit at the
tested mobile width. When retained business-blocked values have three or more
characters, the wide tables deliberately reserve more room for the value and lock
icon. Such content can require desktop scrolling (tested with four-digit values
in 11 A and 13 E). This preserves the value, lock and font size instead of clipping.

The reusable subquestion-list/subquestion classes add a 1 px #DCE5F3 divider only
between Del 13 F's independent questions, with compact 12 px spacing. Library
multi-select options and ordinary table rows do not get these dividers.

Visible validation messages now remain in table-cell flow; only affected error
rows grow, and normal rows stay compact. SQL/help tooltips remain body portals.
Business-help tooltips reposition during focus scrolling instead of immediately
disappearing, and close when their trigger leaves the viewport.

Known empty/inapplicable sums already return numeric zero from the existing
calculation engine. Shared calculatedNumberText presentation consistently renders
that as 0 across fixed, collection, elective and municipality totals. Null or
undefined remains unavailable, including missing backend values and invalid
calculations; no database values, editable answers, formulas or permissions change.

Verification: 18 distinct targeted cases passed across final runs, including
the four viewport measurements/screenshots, divider styling, retained blocked
values, unclipped validation/help/SQL metadata, zero/backend distinctions,
existing input/permission regressions and scoped WCAG 2.1 A/AA axe checks. Edge
tests initially exposed insufficient retained-value width and the existing help
tooltip focus-scroll dismissal; both were corrected and passed on rerun.
Final npm run build passed, including TypeScript; Vite retains its non-blocking
main-chunk size warning (approximately 824 kB). Full-suite testing, full application
accessibility audit and lint were intentionally skipped in favor of targeted checks.

Changed areas for this refinement: App.css, ImportedQuestionTable, ElectiveTable,
AdditionalChoices, LanguageCollectionTable, MunicipalityFinancingTable,
FieldAvailability and domain/fieldPresentation, plus additional-layout and
calculated-values tests. No question text replacement was attempted.

Question sections stretch within the existing application shell's width, max-width and margins. Tables retain fixed column structure and grouped headings. Numeric-column counts determine a readable minimum width instead of the former blanket 740/1080 px limits. Description/numeric proportions and collection columns use the available space. Wider 5D/Del 10 tables fit the 1440 and 1920 px desktop checks; narrower viewports get one scrollbar per table without horizontal page overflow. No columns or text were removed and fonts were not reduced. Description columns are not made sticky: preserving unobstructed inputs and grouped headings is sufficient with these widths.

Known mock sums already calculate zero for empty manual operands; these remain displayed as 0. Manually entered 0 is never cleared or formatted as empty. Missing backend values and calculations dependent on unavailable backend operands retain the unavailable state, including the previously documented backend totals in Del 8–10. This task does not invent their formulas, change validation results or convert missing backend data into a validated zero. Underlying answers are not rewritten for presentation.

## DEV tooltip and deployment isolation

- The compile-time `__DEV_FIELD_METADATA__` flag permits local Vite development (`config.env.DEV`, the resolved `import.meta.env.DEV` value) or an explicit `VITE_APP_ENV=DEV` deployment, including a built deployment. Explicit TEST, QA and PROD labels always disable it, even during local development. An unset deployment label does not enable metadata in a production build. No user-selectable demo state influences the flag or grants authorization.
- `ReportingDeveloperTools` lazy-loads `DevFieldTooltip` and its stylesheet only when enabled. The catalog comes from `virtual:gsi-field-metadata`, assembled from supplied Power Apps bindings and the existing Del 2 model. It is not a second environment system.
- Hover and keyboard focus display verified column names, section/question references, user/calculated/backend origin, and known logical form data types. Existing descriptions are retained while the tooltip is attached; Escape dismisses it. The tooltip is hoverable, viewport constrained and placed above/below the field without covering its input. It never reads or displays field values, credentials, connection strings, session IDs or user identity.
- DEV-only shared wrappers provide hover targets and keyboard stops for disabled controls, including controls disabled by an enclosing fieldset. Editable and calculated controls retain native focus behavior. The tooltip is portalled to document.body with fixed positioning, outside table overflow containers, and repositions on scrolling and resizing.
- TEST/QA/PROD builds omit the tooltip component, stylesheet, catalog and developer data-report attributes. Production metadata JSON also drops unused sourceFormula, sourceCard, sourceOrder and textReferences properties. Functional field keys, calculation terms, user-facing labels and permission/validation behavior remain necessary runtime data, not a shipped DEV catalog.
- Tests use a separate `playwright.field-tools.config.ts` with dedicated ports 5188–5193 for DEV/TEST/QA/PROD, unset local configuration and an explicitly DEV built deployment. Normal targeted tests can use `E2E_PORT=5187`. Three separate production builds verify component, CSS, attribute and debug-payload exclusion for TEST, QA and PROD.

### Missing-tooltip investigation

The old gate required an explicit DEV label and a local serve command simultaneously. The local env file had no deployment label, and the gate also excluded explicitly DEV built deployments. Native-input event targets additionally left disabled inputs without reliable hover/focus access. A regression test exposed another defect: scrolling a field into view closed the tooltip immediately. Wrappers and scroll repositioning resolve these problems without changing field values, presentation, permission rules or validation. The existing body portal and high stacking layer were retained; table clipping was not the root cause.

Regression coverage checks editable grade 6 (`GG_16_Antall_Elever_Trinn6_Gutter`) and business-disabled grade 1 (`GG_1_Antall_Elever_Trinn1_Gutter`) in Del 3A, calculated totals, zero/populated values, validation descriptions, Escape, wrapper keyboard focus and viewport placement. Twelve environment-specific cases passed after fixing the scroll-close defect; the first run had two failures exposing that defect.

For this fix, all 27 targeted checks passed: 12 environment-specific cases plus 15 field-state, presentation (including scoped WCAG 2.1 A/AA axe), responsive-layout and production-isolation cases. `npm run build` passed, including `tsc --noEmit`; only the existing bundle-size warning remained. The first main-config launch encountered an occupied port 5173; the targeted rerun used dedicated port 5187 successfully. Full-suite testing, a full accessibility audit and lint were intentionally skipped under the targeted-testing policy. The verification section below records the earlier shared-presentation implementation, not additional checks run for this fix.

## Mapping limitations

No physical SQL schema/DDL or data-source-to-SQL table mapping was supplied. Therefore SQL table is shown as **Mapping not available**; where verified, the Power Apps Patch data-source name is shown separately with an explicit warning that the physical SQL mapping is unverified. Logical form types (integer/decimal/text/boolean) are not claimed to be exact SQL storage types.

Del 1 NSR/display fields, generic placeholder fields, transient controller comments and aggregates without a dedicated mapped result column have no verified SQL column mapping. Their DEV tooltip reports **Mapping not available**. Column mappings are not guessed from display labels. Repeatable rows use their actual mappings, including 3E GG_887/GG_886 and 7H GG_918/GG_919, rather than confusing the shared view adapter with the source schema.

The source exports and existing import audit documents remain the authority for unresolved official formulas, backend totals, dictionary values and translations. This UI task does not resolve those missing source dependencies.

## Verification

TypeScript, production build and full project lint passed. Vite retains its non-blocking main-bundle size warning (approximately 703 kB minified).

All **66 distinct targeted checks** passed across final runs: 62 reporting/layout/regression/build-isolation cases and four environment-label cases. The affected reporting files passed a 39-case rerun; the final spacing passed seven presentation/municipality checks. DEV tests verify that SQL descriptions coexist with validation errors, keyboard focus and Escape; a focused language-row check verifies user-entered styling after the choice becomes read-only. TEST/QA/PROD asset checks each build separately and inspect JavaScript/CSS for excluded developer code, attributes, catalog and source-formula descriptors.

The first broad run passed 52/62. Ten failures identified a genuine CSS specificity problem (filled fields overriding business-blocked backgrounds, affecting six cases), a leftover empty debug-property key in three production-bundle checks, and an incorrect mobile-menu locator in one new test. These were corrected; no test was disabled or weakened to hide a failure. Existing color expectations were updated only where the requirements changed.

Coverage includes blank/zero/filled/calculated/backend values, read-only roles, business blocking, validation borders and badges, grouped tables, collection actions, desktop/mobile sizing, header/sidebar regressions, scoped WCAG 2.1 A/AA axe, DEV hover/focus/Escape and TEST/QA/PROD gating and build isolation. The full Playwright suite and full application accessibility audit were intentionally skipped in favor of affected checks. Automated axe does not replace manual screen-reader verification.

## Modified implementation areas

- Shared field metadata/presentation: `src/domain/fieldPresentation.ts`, `src/components/ReportingFields.tsx`, and the presentation metadata properties in `src/domain/importedReporting.ts`.
- Reporting controls: `ImportedQuestionTable`, `MunicipalityFinancingTable`, `LanguageCollectionTable`, `QuestionCard`, `Enhetsopplysninger`, `ImportedWorkflowSection`, `GrunnskolePlaceholderScreen`, with source mappings wired through `ImportedNumericSection`.
- Styles: `src/App.css` (scoped reporting-field/table rules) and the DEV-only `src/components/DevFieldTooltip.css`. Header/sidebar selectors and shell max-width/margins are preserved.
- DEV integration: `DevFieldTooltip`, `ReportingDeveloperTools`, `scripts/dev-field-metadata.mjs`, `src/App.tsx`, `src/vite-env.d.ts`, and `vite.config.js`.
- Verification: three field-presentation test files, affected existing color assertions, `playwright.config.ts` and `playwright.field-tools.config.ts`.
