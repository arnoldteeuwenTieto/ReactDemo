# Del 7 correction audit

## Cause and source authority

The earlier importer treated commented header letters as section identities and ignored DataCard names containing spaces or punctuation. Several comments are stale. The export's DataCard names and Y positions establish A, B, C, D, E, F, G, H (Y=3 through 10), although the YAML declarations are not in visual order. The parser now retains those names. `DEL7_SOURCE_AUDIT.json` records all properties of every source DataCard/control, including Default, OnChange, DisplayMode, Visible, calculations and controller references. The generated checklist retains source-card identities, text-reference IDs and controller IDs per group.

The latest user-supplied F/G/H wording overrides stale comments. No existing numeric properties were renamed or reused for different questions. The same 114 unique fixed bindings remain, now in the correct sections; existing values survive navigation. Repeated source views of GG_925 are one data value, not extra questions.

| Section | Source DataCard / header reference | Rows and columns | Fixed bindings |
| --- | --- | --- | --- |
| 7A | A. Hvor mange elever… / GG_H26_U60 | 10 grades + total; Gutter/Jenter/Sum | GG_232–264 |
| 7B | 7B / GG_H32_U77 | 2 source-numbered rows; grouped with/without individually adapted education, each Gutter/Jenter/Sum, plus overall total | GG_920–931, GG_1018–1019 |
| 7C | C. Faste avdelinger… / GG_H27_U61 | 1 row; grades 1–7 / 8–10, Gutter/Jenter/Sum | GG_265–269 |
| 7D | D. Alternativ opplæringsarena / GG_H28_U62 | 1 row; grades 1–7 / 8–10, Gutter/Jenter/Sum | GG_270–274 |
| 7E | E. Organisering… / GG_H29_U63 | 4 rows: ordinary class, group of 6+, group of 2–5, alone; Gutter/Jenter/Sum | GG_275–286 |
| 7F | F. Tildelte timer…undervisningspersonale / GG_H30_U67 | 4 hour bands + total; grades 1–4 / 5–7 / 8–10, Gutter/Jenter/Sum | GG_287–316 |
| 7G | G. Tildelte timer…assistent / GG_H31_U72 | 4 hour bands + total; Gutter/Jenter/Sum | GG_317–331 |
| 7H | 7H / GG_H62_U135 | Repeatable municipality/student rows, delete, add and total | GG_918 municipality, GG_919 students in ColGG7SpH |

## Calculations, types and rules

- Fixed manual counts and H students are nonnegative integers with four-digit source limits. Known sums retain the explicit source control-reference arithmetic, not field-number guesses. All sums/backend-owned fields remain grey/read-only.
- Examples: F row 1 sums GG_287+288+289 into GG_292; F column totals sum the four hour bands; GG_316 sums the three grade-band totals. G row 1 is GG_317+318=319; GG_329 and GG_330 are column totals; GG_331 is their sum. Independent tests exercise asymmetric values across grade/sex columns.
- A uses the existing React pupil-grade applicability rule from Del 2. Grades 1–10, 1–7 and 2–6 retain unavailable values, exclude those pupil inputs from totals, and suppress errors for inapplicable inputs. There is no verified additional grade restriction or prorating rule for B–G, so none is invented.
- No source DataCard-level conditional hide rule was found. Responsive/drawer/control-window conditions are presentation rules. H student input is disabled until a municipality is chosen; source municipality options exclude own municipality and duplicate selections. All add/change/delete operations also require central role/status/unit edit permission. Selected-unit `isKommunesentralt` remains authoritative for the demo effective-role calculation.
- H now has an explicit `SupportMunicipalityRow` data type with its actual GG_918/GG_919 properties. The shared Del 3E table receives a view adapter only. The section-7 store already used those actual source properties, so existing mock records do not need destructive migration.
- Known invalid counts and invalid/missing H selections/counts feed the shared section findings, active sidebar badge and Del 17. No full official controller set runs on normal navigation. Unknown requiredness remains a warning, not an invented blocking rule. Inapplicable blanks do not create errors.

## Unresolved source information — not claimed as implemented

1. **Text lookups:** the YAML refers to `nfViewSprak` / `ColTekstDiverse`, but those lookup records are not supplied. H explanatory text is only `LookUp(nfViewSprak, BeregnetId = "GG_H62_U135").UndersporsmalTekst`; its actual wording cannot be recovered. The visible explanatory fallback is “Registrer kommune og antall elever med individuell tilrettelegging fra andre kommuner.” It is not claimed to be the original wording.
2. **7B text:** the header comment about foreign languages conflicts with its adapted-education fields and is stale. The current neutral heading is “B. Individuell tilrettelegging”. Source row labels are only GG_H32_U130 and GG_H32_U131 lookups; they are shown as “Antall elever – spørsmål 1/2”, not invented official meanings or “Elevgruppe”. Group labels describe the actual with/without bindings; their official lookup wording remains unavailable. Other missing official heading/row/explanatory translations retain readable source-comment fallbacks. All available source text references are inventoried, including GG_H26_U132 guidance and GG_H27_U133 explanation.
3. **7B backend totals:** GG_922, GG_925, GG_928, GG_931, GG_1018 and GG_1019 bind directly to backend values without a supplied calculation formula. They remain grey/read-only, show provided mock/backend values when present, and otherwise stay unavailable. No guessed sums are marked successful.
4. **Official controllers:** the source references `Kontroll_GG_*`, but does not include the official formulas/messages or `nfKontrolleretable`. All referenced checks remain explicitly unsupported in Del 17 and are never counted as passing. IDs remain in developer metadata; no technical IDs are rendered as question text.
5. **Custom numeric component:** only the supplied positive/nonnegative/digit/Displaymode/Onchange properties are available. The missing component internals are not replaced with invented business rules.

## Verification

Targeted source-contract tests assert the independent binding ranges above, every editable field's stored property, readonly totals, F/G arithmetic, H typed records and permission guards, all section/table row counts, active badges, Del 17 linkage and narrow layouts. Existing tests cover Del 1–6 navigation/state, grade ranges, authorized/read-only/central-owner users, Del 17/18 workflow, Del 3E and scoped WCAG 2.1 A/AA checks.

Final TypeScript check (`npx tsc --noEmit`) and production build passed. Vite retains a non-blocking warning for the main JavaScript bundle exceeding 500 kB (approximately 629 kB minified).

All 40 targeted tests passed across the final runs on port 5187: Del 7 source structure (3), staff screens (9), imported screens (5), field states (9), municipality financing (4), demo-status navigation (4), section validation (5), smoke (1). Scoped axe checks passed. The first run passed 38/40 and caught one implementation oversight (H header still said “Antall elever”) and one new-test issue (wrong existing Del 17 controller-button label). Both were corrected; all 16 tests in the affected source/staff/municipality files passed on rerun. No existing test was removed or disabled.

The complete Playwright suite, full accessibility audit and lint were intentionally excluded; verification was targeted to changed reporting metadata, shared tables, validation and affected regressions. Automated checks do not replace manual screen-reader verification.
