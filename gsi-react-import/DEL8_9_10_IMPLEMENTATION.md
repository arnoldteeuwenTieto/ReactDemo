# Del 8, Del 9 and Del 10: source audit and implementation

## Scope and architecture

The complete exports `source/Del8.yaml`, `source/Del9.yaml` and `source/Del10.yaml` were parsed and reviewed before implementation. `CODEX_INSTRUCTIONS.md` still names Del 5–7; its shared architectural, visual, permission and source-fidelity requirements have been applied to this request for Del 8–10.

- `DEL8_9_10_SOURCE_AUDIT.json` retains source DataCards and all child control properties, including grouped-header text, Default, OnChange/Onchange, DisplayMode/Displaymode, Visible, Items and controller references.
- `DEL8_9_10_INITIALIZATION.json` captures each root screen's OnVisible expression. Only 9C explicitly creates an initial blank language row in these exports. Del 8 collections start empty unless records are supplied to the shared store.
- `DEL8_9_10_RULES.json` preserves numeric properties, row actions, conditional modes and visibility expressions.
- `DEL8_9_10_CHECKLIST.json` maps each fixed field to its question number, column, optional column group, source screen, source control, calculation terms and read-only status. It also inventories missing backend calculations and every referenced controller ID.
- Reproducible scripts: `audit-del8-10.mjs`, `review-del8-10-rules.mjs`, `review-language-initialization.mjs`, `generate-language-screens.mjs`; then `generate-imported-translations.mjs`.

Existing shared section frames, dark-blue headers, compact tables, field-state logic, help drawer, permissions, school/year store and validation subscription are reused. New `LanguageCollectionTable` and `languageCollections` define the repeatable source tables without flattening them into fixed numeric questions. Technical identifiers remain internal. No screen-specific language state is introduced. Del 10 is inserted between Del 9 and Del 17 in navigation; earlier section IDs and saved data keys remain unchanged.

## Verified source structure

| Section | Source header reference | Structure and fields |
| --- | --- | --- |
| 8A Særskilt norskopplæring | GG_H33_U78 | Grades 1–10 and sum row. Separate columns for særskilt norskopplæring (GG_335–345) and grunnleggende norsk for språklige minoriteter (GG_346–356). |
| 8B Egne undervisningsgrupper | GG_H34_U80 | Two questions, each Gutter/Jenter/Sum: group pupils GG_357–359, and asylum-seekers among them GG_360–362. |
| 8C Morsmåls-/tospråklig opplæring | GG_H35_U82 | Repeatable Morsmål selector GG_869; four separate count columns GG_870–873; row total GG_874, column totals, grand total, delete and add. Uses actual ColGG8SpC bindings. |
| 8D Andre kommuner | GG_H65_U134 | Repeatable Kommune GG_916, Elever GG_917, delete, add and calculated total, in ColGG8SpD. |
| 9A Opplæringsspråk | GG_H36_U87 | Grades 1–10 and sum row. Grouped Bokmål/Nynorsk/Samisk/Andre/Sum columns; separate read-only pupil-count group linked to Del 3 A. Local GG_368–422 bindings plus eleven direct Del 3 references. |
| 9B Elevgrupper med annet språk | GG_H37_U89 | Two questions and separate Elevgrupper/Elever columns: other Norwegian written language GG_423–424; Sami outside Sami districts GG_425–426. |
| 9C Samiske språk, kvensk og finsk | GG_H38_U122 | Repeatable language GG_915; ten separate grade columns GG_904–913; row total GG_914, grade totals, grand total, delete and add. Uses ColGG9SpC. The source locks a selected language and shows it read-only; it is not silently editable again. |
| 9D Fjernundervisning | GG_H63_U123 | Three rows: Sami first language, Sami second language, total; grade bands 1–4 / 5–7 / 8–10 and Sum. Exact bindings GG_932–943. Source guidance to also record pupils in 9C is retained. |
| 10A Fremmedspråk/fordypning/arbeidslivsfag | GG_H39_U136 | Thirteen source-numbered rows: Tysk, Fransk, Spansk, Italiensk, Russisk, Andre språk, Fordypning engelsk, Fordypning norsk, Fordypning samisk, Arbeidslivsfag, Fordypning matematikk, Fordypning i arbeid, total. Grouped grade 8/9/10 Gutter/Jenter/Sum columns and overall Sum 8–10 column. GG_537–656 and GG_984–993, preserving all 130 visible bindings. |
| 10B Uten fremmedspråk/fordypning/arbeidslivsfag | GG_H40 | One question with the same grade/sex/total groups; exact GG_657–666 bindings. |

Fixed view bindings: **Del 8: 28 (24 editable); Del 9: 82 (50 editable; 11 of the 82 are read-only Del 3 view bindings); Del 10: 140 (78 editable)**. Repeatable row properties are separate, not reused or mixed between collections.

## Implemented calculations and business rules

- Only supplied, resolvable arithmetic is evaluated as an imported fixed-field calculation: 8A GG_356 sums its ten grade inputs; 9A GG_422 sums the four language-column totals when those backend values exist; 9D GG_943 sums the three grade-band totals when those backend values exist. These correspond to actual control-reference formulas in the exports.
- Dynamic 8C and 9C row, column and overall sums recalculate immediately using the source formulas. 8D sums student counts. Derived row totals are stored with the source GG_874/GG_914 keys after a row mutation. Callers cannot supply their own calculated totals through the write service.
- Del 9's eleven Del 3 pupil-count cells read the same shared Del 3 answers and calculations. They cannot be edited through Del 9 or copied into a competing local source of truth.
- Grade-specific fixed fields and 9C grade cells use the existing Del 2 lowest/highest-grade applicability logic. Non-overlapping grade bands are blocked; bands are not prorated. Raw inapplicable answers are preserved, excluded from local mock calculations and numeric validation, and shown with the existing terracotta state and accessible explanation. Existing grade behavior in Del 3–7 is preserved.
- Fixed manual inputs use existing nonnegative four-digit integer handling. The source text inputs in 8C and 9C use `^[1-9]\\d*$` and MaxLength 4: blank is allowed where requiredness is absent, but entered zero, negative values, decimals and excessive digits are errors. As in the existing mock, invalid raw input remains available for correction instead of being destructively reset as in Power Apps.
- Numeric cells require a selected language/municipality. The explicit 8C exception is retained: its first count remains applicable with a blank language when any existing count is present. Other counts remain blocked. Source values are not cleared by choosing another option.
- Duplicate selector options are excluded. 8D also excludes the school's own municipality while retaining a stored selection so invalid legacy data can be explained and corrected. 9C's chosen language remains locked as specified by ShowCombobox; removal/addition remains permission guarded.
- All fixed and collection write paths check centralized demo role/status/unit access. Role 10 receives effective role 9 only for selected units with explicit `isKommunesentralt`; actual login roles are unchanged. Disabled cells, read-only fields and source-linked values are protected in the services as well as the UI. There are no real API, SQL, BOGIAPI, authorization or persistence changes.
- Local field/collection errors feed shared section findings, active and inactive sidebar badges, and Del 17 using readable collection/column labels. Unanswered municipality counts and missing choices with existing values remain nonblocking warnings because official requiredness is not supplied. Warnings remain nonblocking unless explicitly defined otherwise. Navigation stays soft and Del 18's existing completeness guard remains intact.

## Missing source information and unresolved calculations

1. **Official controllers:** definitions of `Kontroll_GG_*`, `nfKontrolleretable`, controller messages and severity/requiredness data are absent. Referenced controller inventories: 19 in Del 8, 26 in Del 9, 4 in Del 10. Some Fill expressions show partial comparisons, gated by missing controller booleans; those are not complete authoritative validation definitions. They are retained in the source audit, not silently marked as passing or replaced with invented full controllers.
2. **84 backend-only totals:** three in Del 8 (GG_345, GG_359, GG_362); nineteen in Del 9 (grade/language sums and remote-teaching totals); sixty-two in Del 10 (sex/grade/overall totals). These controls have direct record Defaults but no usable calculation formula. Exact keys are listed under `backendOwned` in the checklist. Values supplied in mock records display grey/read-only; absent values stay unavailable, not fabricated zeros. In particular Del 10's backend totals are **not claimed to recalculate locally**. Some 9D comments refer to legacy TextInput controls not present in the export, so those references cannot be safely resolved.
3. **Text and option lookups:** `nfViewSprak`, `ColTekstDiverse`, `nfViewSprakSvarAlternativer` (IDs 370 and 897) and help content are absent. Source comments/literal wording provide readable Norwegian fallbacks integrated with the current translation system. English and authoritative Bokmål/Nynorsk wording remain future data work. Language options are explicitly isolated demo fixtures, not a complete official catalog or official Verdi mapping. Existing municipality mock data supplies municipality choices. No technical missing-key notices or IDs are inserted into the UI.
4. **Custom numeric/helper implementations:** Local_Comp_Input_Number and HeltallsFilter internals are not supplied. Known properties, handlers and existing React numeric conventions are retained; no additional hidden validation rules are assumed.
5. **Initial external records and backend authority:** source collections normally load from Dataverse/SQL/global initialization. Those records are not supplied; mock row collections are scoped to the selected school/year and reset on reload. 9C has the explicitly supplied initial blank row; Del 8 starts empty. Connecting a real backend will require replacing the service boundary and supplying its authoritative calculated values, dictionaries and authorization. Client demo permissions are not backend permissions.

No fixed source property is knowingly omitted or remapped to a different question. Remaining mapping dependencies concern the missing official option values, helper internals, lookup text and backend/controller formulas above.

## Checks

`npx tsc --noEmit` and `npm run build` passed. Targeted ESLint checks passed for the new collection component, collection domain/validation, write service and test file. Vite reports a non-blocking main-bundle warning (approximately 771 kB minified, 160 kB gzip).

All **32 targeted Playwright tests** passed on dedicated port 5187: language screens (11), existing imported screens (5), staff screens (9), Del 7 source structure (3), and demo-status navigation (4). The 11 new-screen cases passed again after final adjustments. No test failed or was disabled. Initial console warnings caused by retranslating constructed accessible labels were corrected; labels now translate their constituent text before composition.

Tests cover source row/column contracts, every fixed editable binding, every dynamic count binding, readonly/source-linked fields, available arithmetic, explicit unsupported totals, add/remove/duplicate choices, role/status/unit guards, grade ranges 1–10, 1–7, 2–6 and 8–10, active badges, Del 3 linkage, responsive layout and scoped WCAG 2.1 A/AA axe checks. Existing Del 3–7, navigation and Del 17/18 regressions remain enabled. Full-suite testing, full-project lint and a full application accessibility audit were intentionally excluded. Automated axe checks do not replace manual keyboard/screen-reader verification or a complete UU audit.
