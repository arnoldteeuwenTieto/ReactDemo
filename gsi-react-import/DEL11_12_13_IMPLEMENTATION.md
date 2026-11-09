# Del 11–13 import

The active Power Apps YAML controls are the source of truth. The supplied import
instructions initially described Del 13 A–F; the user explicitly confirmed that
the visible G must also be implemented. No missing Del 14–16 pages were invented.

## Section mapping

`DEL11_12_13_CHECKLIST.json` records source cards, controls, exact field bindings,
question numbers, columns, foreign-section references, local sum operands and
controller IDs. Regenerate it and `src/domain/additionalScreens.json` with
`node scripts/generate-additional-screens.mjs`. Comments are stripped before
binding extraction; inherited `Visible=false` controls are excluded.

| Section | Active structure |
| --- | --- |
| 11 A | Repeatable valgfag rows: choice, 8./9./10. trinn each with Gutter/Jenter/Sum, overall sum, delete; add action and column totals |
| 11 B | One numbered question, grouped grade/gender columns; current GG_1052–1057 manual bindings, GG_691–694 sums |
| 11 C | One numbered question, same grade/gender columns; GG_677–686 |
| 11 D | Read-only A+B+C totals by grade/gender; the additional visible source references to Del 10 are retained as a read-only reference table |
| 12 A | Questions 1–3: 5./6./7. trinn pupil-hours; question 4 sum |
| 12 B | Question 1: annual teaching hours for physical activity, 5.–7. trinn |
| 12 C | Questions 1–10: grade-specific participants and weekly offered hours; question 11 totals |
| 13 A | One question: transport pupils, 1. trinn / 2.–10. trinn / sum |
| 13 B | Two questions: reallocated hours on 1.–7. and 8.–10. trinn |
| 13 C | Questions 1–10 by grade, question 11 totals; autumn current year, spring next year, spring current year, overnight stays; historical H23/V24/V23 column identifiers retained internally |
| 13 D | Active multi-select booleans GG_1081–1084, dependent opening-hours GG_770 |
| 13 E | Seven numbered rows: PC/Mac, Chromebook, tablet, other, none, total, pupils from Del 3 A; grade 1–10 columns and sum |
| 13 F | Three boolean preparedness questions, Ja/Nei |
| 13 G | Three rows: pupils from 11 B, additional ordinary-valgfag pupils, sum; grade 8/9/10 and total columns |

## Source distinctions and limitations

- Del 11 `NotVisible_C...` (BOGI-3719) is excluded. BOGI-3797 commented field
  expressions are not treated as mappings. Pure calculated 11 D cells have no
  invented SQL result column; their DEV tooltip reports mapping unavailable.
- The source's visible 11 D controls 669–680 refer to French/Spanish/etc. values
  from Del 10. Their purpose alongside the valgfag total is unclear; bindings and
  read-only values are preserved in a separate reference table rather than merged
  into the main total or silently discarded.
- Del 13's old GG_769 gallery is under `Container_Original_Skjules` with
  `Visible=false`; it is not restored, written, or migrated automatically.
  The active boolean controls replace it. Choosing “Ingen bibliotekstilbud”
  clears the other booleans and opening hours; unchecking own premises clears
  opening hours. These are explicit active OnCheck/OnUncheck rules. The obsolete
  BOGI-3929 OnVisible clearing is not executed.
- GG_825_Sum_Elever_PC_Mac is the actual source binding of the **fifth**, “Ingen
  digitale enheter”, row total. Its misleading database name is preserved, not
  used to put the value into the first PC/Mac row.
- Official nfViewSprak/ColTekstDiverse labels and option dictionaries are absent.
  Readable Norwegian fallback labels use the existing translation infrastructure;
  three valgfag options are isolated fictional demo options, not an official list.
- Sums are mock calculations for visible sum rows, using verified operands where
  supplied (notably 11 D's collection + B + C formulas). Simple row/column sums are
  mock equivalents of the displayed sum fields; SQL computed-column definitions
  are not supplied. Future BOGIAPI values must be authoritative. This does not
  claim verification of database formulas or official controller results.
- Physical SQL table mappings remain unverified. Power Apps data-source aliases
  are only shown as unverified SQL mappings in DEV; no metadata UI ships to
  TEST/QA/PROD or the dedicated Pages DEMO build.

## Validation and dependencies

Shared numeric validation, grade applicability, in-memory answer storage, unit
access and effective-role permissions are reused. Sidebar counts come from
useSectionValidation and include the active screen. Empty fixed inputs remain
non-blocking warnings unless requiredness is verified. Inapplicable questions and
hidden physical-activity sections do not create errors. Values are preserved on
ordinary applicability changes, except existing verified Del 2 dependent clears
and explicit library-choice clears.

Del 12 A/B are visible only when the selected grade range overlaps 5–7. Del 12 C
participants are compared with Del 3 A pupil totals only when both underlying
gender counts are present and valid. This local comparison is supported by the
export's explicit `participants > pupils` expressions; it is not reported as a
complete implementation of GG-F40–F49/GG-F67. Errors appear inline and contribute
to the same sidebar/Del 17 findings.

These official controller formulas/texts are not supplied and remain explicitly
unsupported in Del 17 (never counted as successful checks):

- **Del 11:** GG-F157, GG-F73, GG-F145, GG-F146, GG-A85, BK-A10.
- **Del 12:** GG-A30, GG-A110, GG-A131, GG-F38, GG-F39, GG-F55, GG-A144,
  GG-A26–GG-A29, GG-A82, GG-A109, GG-F40–GG-F49, GG-F67.
- **Del 13:** GG-A7, GG-F56, GG-F60, BK-A10, GG-A123, GG-A124, GG-F75–GG-F84,
  GG-A119, GG-F137, GG-F85–GG-F104, GG-F7.

Full submission remains blocked by unresolved completeness/controllers as before.
No backend calls or real submissions were added.

## Compact navigation

The existing sidebar uses 13 px labels and 18 px line height, 25 px number
circles, 6 px vertical padding, 40 px desktop minimum item height (44 px with a
coarse pointer), 248 px sidebar width and independent vertical scrolling. Wrapped
labels expand naturally. Existing active highlighting, badges, focus indicators,
aria-current and the responsive mobile menu remain intact.

## Verification

- Eight new targeted tests passed: structural/binding and arithmetic contracts,
  all fixed editable inputs, mock totals, year headings, collection add/delete,
  library dependencies, active error badges, SQL tooltips, grade ranges 1–10 and
  4–6, role 9, role 10 on a central unit, and read-only support users.
- Scoped WCAG 2.1 A/AA axe checks passed on each new screen and the compact
  navigation; 1440 px and 390 px checks confirmed no horizontal page overflow.
- Sixteen targeted existing field-state/navigation/production-isolation tests
  passed, including TEST/QA/PROD asset inspection.
- Nine earlier-screen/source-contract/smoke regressions passed. The completed
  report fixture now includes the 133 additional applicable fixed numeric inputs
  (515 total), retaining all previous assertions.
- The existing Del 17/18 comments/approval regression and both Pages DEMO build
  tests passed. The latter visits every implemented navigation entry with a
  resolved fictional role, and checks access/status switching and metadata absence.
- The first new collection test exposed a decorative plus character in the add
  button's accessible name; marking the icon aria-hidden fixed it. The workflow
  regression exposed the existing DEV-wrapper name contribution on disabled
  textareas; explicit native textarea labels fixed it without permission changes.
- TypeScript and production builds passed. Vite retains a non-blocking main-chunk
  size warning (approximately 823 kB minified). Full-suite testing, full application
  accessibility audit and lint were intentionally skipped in favor of the affected
  checks. Official unsupported controllers remain unsupported despite passing tests.

## Modified files

- New data/rules: `src/domain/additionalScreens.json`, `additionalChoices.ts`,
  `additionalRules.ts`; extended `importedReporting.ts` and `languageCollections.ts`.
- New UI: `src/components/ElectiveTable.tsx`, `AdditionalChoices.tsx`; extended
  `ImportedNumericSection.tsx`, `ImportedQuestionTable.tsx`, `grunnskoleSections.ts`,
  `src/App.tsx` and `src/App.css`. `ImportedWorkflowSection.tsx` received only the
  native textarea accessibility-label correction uncovered by regression testing.
- Mock services: new `src/services/additionalReportService.ts`; extended
  `importedReportService.ts` to read/guard Del 11–13 data.
- Source tooling: new `scripts/generate-additional-screens.mjs`; extended
  `inspect-powerapps.mjs`, `dev-field-metadata.mjs`,
  `generate-imported-translations.mjs`; regenerated `src/locales/importedUi.ts`.
- Build isolation: `vite.config.js` strips DEV source descriptors from the new
  registry alongside existing registries. Demo/authentication enablement is unchanged.
- Tests: new `e2e/additional-screens.spec.ts`; extended completed-report fixture in
  `e2e/imported-screens.spec.ts`. Existing regression tests were retained.
- Documentation: this report, `DEL11_12_13_CHECKLIST.json`, `REPORTING_UI.md` and
  `DEMO_USERS.md`. User-supplied YAML exports and instructions were read unchanged.

Other pre-existing working-tree changes, including nested import-folder removals
and the earlier Del 2 improvements, were preserved.
