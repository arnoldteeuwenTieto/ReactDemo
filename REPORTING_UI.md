# Shared reporting-field UI and DEV metadata

## Shared presentation

`src/domain/fieldPresentation.ts` treats only null, undefined and the empty string as empty. Numeric zero, string zero and boolean false remain populated answers. Value presence, origin, edit permission, applicability and validation remain separate concepts.

`ReportingFields.tsx` supplies shared native input, select, textarea and backend-value elements. It preserves existing handlers, labels, names, IDs, disabled/read-only rules and validation attributes. Numeric cells, municipality rows, language rows, Del 2 questions, Del 1 backend details, Del 17/18 text fields and the shared placeholder controls use it. Existing implemented screens are Del 1–10, 17 and 18; this task does not implement missing Del 11–16 questions.

| Origin/state | Background | Behavior |
| --- | --- | --- |
| User field with no answer | #FFFFFF | Existing edit permissions and blue-grey border |
| Populated user field, including 0/false | #F1F3F5 | Same color for a read-only viewer; a locked user-selected language remains user-origin |
| Calculated or backend-owned | #D9DDE3 | Read-only; origins are explicitly distinct in metadata |
| Business-inapplicable | #F8E7E0 | #D9A58F border, existing disabled behavior, lock and explanation; overrides ordinary origin/value colors |
| Invalid applicable value | Existing red border | Existing aria-invalid and error explanation; independent of background |

App.css owns the shared color variables. The lock button retains its size and explanation; a small grid reserves space beside the input so it does not cover entered text. Header, sidebar, font sizes, question structures, routing, permission matrix, IsKommunesentralt, mock records, grade rules, validation counts and submission behavior are unchanged.

## Width and calculated displays

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
