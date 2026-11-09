# GSI Grunnskole React — import Del 14, 15 og 16

## Authority and scope
Read `source/Del14.yaml`, `source/Del15.yaml`, and `source/Del16.yaml` in full before implementation. These are Power Apps screen exports, not database schemas. Treat active control definitions, OnChange formulas, default values, conditional visibility, and computed fields as the source of truth for UI structure. Treat commented-out formulas and controls with `Visible: =false` as inactive; do not reproduce legacy UI simply because it is present in the YAML. Where labels depend on `nfViewSprak` or `ColTekstDiverse`, prefer verified translations already available in React, then a clear Norwegian fallback; do not invent question meaning or SQL mappings.

## Screens
- **Del 14 — Skolefritidsordningen (SFO)**: source defines sections **14A–14E** (YAML order is not necessarily display order). Implement in the correct A–E order, preserving any conditional sections, grade-based matrices, financial arrangements and calculated values described by the export. Del 14 applicability is governed by the school-offers-SFO value `GG_230_Tilbyr_SFO` from Del 2. Follow the app's existing navigation/skip rules, and do not render a false error count for inapplicable SFO questions.
- **Del 15 — Pedagogisk-psykologisk tjeneste (PPT)**: **15A–15D**. Preserve the conditional questions for own municipal service, intermunicipal operation and participation, the municipality picker, staffing and linked records. In the original `15C` is shown if own-service OR operates-intermunicipal-service is Yes (`GG_946_Egen_Kommunal_Tjeneste` or `GG_947_Drifter_Interkommunal_Tjeneste`). Audit 15D conditional visibility from the actual YAML. Do not quietly drop dependent fields or treat an inapplicable section as mandatory. Analyze actual clearing logic carefully; only clear/reset values when the verified source requires it.
- **Del 16 — Fordrevne ukrainske elever**: source contains an **explicitly hidden legacy section** named `A.(Gammel) Fordrevne ukrainske elever`, plus active replacement **A. Fordrevne ukrainske elever**, **B. Forsterket opplæring i norsk** and **C. Egne undervisningsgrupper**. Implement active sections only, in A–C order, preserving grade breakdowns, sums, business rules and field mappings. Do not conflate hidden legacy data fields with active question bindings.

## Layout — use current React conventions, not Power Apps pixel widths
- Existing dark-blue headers, light-blue outer frame, 20–24 px spacing, compact 13 px content typography; no local language toggle.
- Consistent question number column and readable descriptive column; preserve all grouped headers and actual row/column structures. Use available width and avoid unnecessary horizontal scrolling; do not shrink text, remove columns or squeeze touch targets excessively. A single scroll region is acceptable when the table genuinely cannot fit.
- Use a subtle `#DCE5F3` divider between distinct subquestions (e.g. yes/no rows), not between ordinary compact table rows.
- Field state styling: blank editable `#FFFFFF`; filled user value `#F1F3F5`; computed/backend read-only `#D9DDE3`; blocked/not applicable `#EAF0F7` plus lock indicator and accessible explanation; error red border separately.
- Numeric calculated totals display **0** when their verified computation has no applicable inputs, never a dash; leave blank editable values blank. An unavailable backend value is not a calculated zero.
- All visible controls must be keyboard accessible with labels, accessible help, and error messages. No technical DB field names in normal UI. Show verified SQL field IDs in developer-only tooltips when the actual build configuration permits; not TEST/QA/PROD.

## Data, validation, permissions
- Use the existing shared mock store/field registry, question rendering and validation services. For missing backend or controller inputs, document unsupported rules and do not invent passing results.
- Keep source-to-field mappings explicit and audited. Respect input digit limits, integers/decimals, boolean `Ja/Nei` semantics, calculated sums, conditional visibility, and cross-section constraints. Do not rely on source control names as SQL column names.
- Del 2 `GG_230_Tilbyr_SFO` determines SFO applicability. Keep the existing rules for school grade range, role 9, role 10 with `IsKommunesentralt`, and the other established role permissions.
- Preserve red navigation validation badges (including current Del) with shared per-section counts. Inapplicable/hidden controls must not produce errors. Respect skipped navigation and Next/Previous routes.
- Reuse the existing Github Pages isolated DEMO configuration and mock users; do not change authentication or grant generic unrestricted access. Never send or persist mock actions to real endpoints.

## Required audit before and after coding
1. Enumerate all visible sections, headers, subquestions, columns, bound fields and visibility formulas for Del 14–16. Record where a label or rule references missing external data.
2. Implement new screens and navigation within existing architecture; do not rewrite Del 1–13/17–18.
3. Test SFO yes/no, applicable and inapplicable grade ranges, PPT own/intermunicipal configurations, Del16 active vs legacy controls, calculated zero behavior, per-Del validation counts, and read-only roles.
4. Review at 1920, 1440, 1280 px and narrow mobile. Eliminate avoidable table overflow.
5. Run TypeScript validation, automated tests available, and production build. Check isolated GitHub DEMO rendering as well as local DEV.
6. Provide file list and unresolved validations, SQL mappings, texts, or external dependencies. Never claim parity for a rule not implemented.

## Important file handling
The archive is **flat** at its root (`source/` plus this instruction file), without a nested `gsi-react-import/` folder. Extract into the existing `C:\ReactProjects\React_Demo_Grunnskole\gsi-react-import` directory. Do not delete or replace older exports. Keep `CODEX_INSTRUCTIONS.md` intact; this file is named `CODEX_INSTRUCTIONS_Del14_Del16.md`.
