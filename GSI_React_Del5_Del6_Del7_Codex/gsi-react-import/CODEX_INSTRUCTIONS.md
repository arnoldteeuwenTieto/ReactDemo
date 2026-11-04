# GSI Grunnskole React mockup — import Del 5, Del 6 and Del 7

## Source of truth

The `source/Del5.yaml`, `source/Del6.yaml`, and `source/Del7.yaml` files are Power Apps YAML exports. Read them **in full**, including conditional `Visible`, `DisplayMode`, `Default`, `OnChange`, helper formulas and validation references. They are reference specifications, **not** code to run in React. Use the existing React project as the source of truth for component architecture, CSS tokens, mock data, routing, translations, user roles and app shell.

## Goal

Implement/replace the corresponding React screens so they follow the **current polished Del 3 / Del 4 style**, rather than the original Power Apps layout:

- **Del 5 — Lærere og assistenter**: export contains sections 5A–5E. Preserve their underlying structure, fields and sequence, including teachers, assistant/adviser counts, sub-totals and any conditional sections.
- **Del 6 — Årsverk og ansatte**: export contains sections 6A–6D. Include administrative/pedagogical FTE and teaching annual-frame figures. Some FTE inputs permit decimals; follow each individual control's format/range rules, not a blanket integer-only rule.
- **Del 7 — Spesialundervisning**: export contains sections 7A–7H (section declarations may appear in a different YAML order). Include grade-by-grade student tables, sex breakdowns, group/subtotals, conditional sections, and teaching/assistant hour questions where specified.

**Navigation mapping check:** The Power Apps exports define 5 = Lærere og assistenter, 6 = Årsverk og ansatte. An earlier React screenshot appeared to reverse these descriptions. Inspect current React mapping, route IDs, data keys and sidebar labels; make all consistent with the above canonical numbering without inadvertently changing saved mock data. Keep the existing user-facing naming for Del 7 if the project has intentionally adopted a newer term, but report any discrepancy.

## Match the current UI exactly

1. Reuse the same section wrapper as Del 2–4: dark steel-blue section header, help icon, **thick light-blue external frame**, white body, and 20–24px of white space between sections. Reuse existing shared CSS and components; do not invent new shades.
2. Use compact tabular layout, one question per row, with a separate narrow **Nr.** column when numbered, spacious question-description column, and fixed, consistent numeric columns such as Menn/Kvinner/Sum, Gutter/Jenter/Sum, or grade bands where appropriate. Adapt widths to each table rather than forcing inappropriate columns.
3. Preserve source question numbers (including subtotal row positions). Align numeric values right. Hide all technical field IDs (`GG_...`), `nfViewSprak` IDs and fallback/debug text from user-facing UI; retain IDs internally for data bindings and controls.
4. **No per-screen Bokmål/Nynorsk selector**. Use the existing app-level translation selection. Where text tables `nfViewSprak` and `ColTekstDiverse` are missing, use the explicit Norwegian commentary/labels found in the export, with readable fallbacks; do not fabricate official wording.
5. White = editable; grey = calculated or backend-owned/read-only; muted terracotta (#F8E7E0 with #D9A58F border) and accessible lock/explanation = inapplicable due to a supported business rule; red outline = validation problem. Do not count intentionally inapplicable blanks as missing values.
6. For sum/total fields, recompute mock values from underlying inputs **only where the calculation is supported by the export or existing application logic**. Maintain a clear distinction between a calculated mock and an authoritative future BOGIAPI value. Preserve precision/rounding instructions; do not convert decimal årsverk to integers.
7. Apply school grade bounds from Del 2 (`GG_228_Laveste_Trinn_Paa_Skolen` / `GG_229_Hoeyeste_Trinn_Paa_Skolen`, or their React equivalents) to grade-specific fields in Del 5–7 **only if the related business rules support this restriction**. Retain inapplicable values in state unless a verified rule clears them; exclude them from calculations only when the source specifies it.
8. Retain all existing role/access behaviors including effective school-leader permissions for role 10 with backend `IsKommunesentralt === true`. Do not check school names. Never allow input if the selected form/status/role is read-only.
9. Integrate known validation checks with existing shared validation state and sidebar red error badges; show badge on active section too. Do not invent missing `nfKontrolleretable` formulas: clearly report unsupported controller IDs for developers (not large user-facing diagnostics) and do not silently count them as passed or failed.
10. Only show field validation messages when relevant (field interaction or form validation), preserving accessible messaging and compact rows. Keep help triggers accessible; use actual help text if available, otherwise clearly mark help content as unavailable without surfacing technical IDs.
11. Maintain source question order and visibility conditions, including special tables and dynamic rows. Never render a raw dump of fields or generic form generator that flattens conditional subsections.
12. Preserve navigation, demo-user controls, status logic, header/footer and existing Del 1–4/17/18 functionality. Do not add duplicated headers or language switches.

## Workflow

1. Inspect existing React screens/components, especially the current Del 3 and Del 4 implementations and shared layout/style/validation utilities.
2. Read all three exports in full; make a checklist of source sections, question rows, field types, read-only totals, visibility rules, business rules and controller references. Preserve the checklist in a developer-facing file if useful.
3. Implement or replace Del 5, 6 and 7 in the current architecture. Keep mock values in the same shared state conventions as Del 3/4; integrate with Del 17 checks where formulas are available.
4. Verify calculated totals immediately update, tabular columns do not overlap and conditional disabled fields are visually distinct.
5. Test editing and read-only roles, effective role 10+IsKommunesentralt, grade ranges 1–10, 1–7 and 2–6, active-section navigation badges, and responsive layouts.
6. Run the TypeScript check, existing tests and production build; fix failures. Summarize changed files, tests and **unimplemented rules/source text** accurately.

## Safety of the demo

This is a **React mockup**, not a connected reporting system. Do not issue real SQL/Dataverse/Power Apps/BOGIAPI mutations. Do not imply that mock submissions or validations are authoritative. Do not overwrite work already completed in other screens.
