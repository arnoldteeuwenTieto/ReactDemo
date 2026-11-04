# GSI Grunnskole React mockup — import Del 8, 9 and 10

## Purpose and authoritative sources

The three Power Apps YAML exports in `source/Del8.yaml`, `source/Del9.yaml` and `source/Del10.yaml` define the questions, subquestions, field identifiers, source order, dependencies and conditional behaviors. The existing React project defines the approved React architecture, component styles, app shell, mock-data conventions, navigation, accessibility, role/status permission logic and localization. Read EACH YAML export fully before changing its screen. The source contains Power Fx and unavailable connectors; use it as a specification, not executable React code.

**Implement/replace only:**
- Del 8 — Særskilt språkopplæring (source section A: Særskilt norskopplæring; B: elever i egne undervisningsgrupper for språklige minoriteter; C: morsmålsopplæring/tospråklig fagopplæring/tilrettelagt opplæring; D: forsterket opplæring fra andre kommuner). Read complete question wording and D section details from YAML; `8D` is an export card ID.
- Del 9 — Opplæringsspråk (source includes section A: Opplæringsspråk, section B: elevgrupper med annet språk, section C: samisk/kvensk/finsk, and additional export section `9D`). Inspect actual headings carefully: some exported Power Apps control *names* are copied from other screens and are misleading. Do not use a control name as a user-facing section heading if `Input_HeaderText` or its comment gives the actual heading.
- Del 10 — Fremmedspråk, språklig fordypning og arbeidslivsfag (source sections A and B). This export contains wide grouped tables, with subject rows and per-grade Gutter/Jenter/Sum inputs. Preserve the exact source structure, totals and subject types rather than collapsing to a few generic form fields.

## Absolute visual standards (reuse existing Del 3–7 React implementation)

1. Each A/B/C/... section uses the **same shared light-blue outer frame**, dark steel-blue title bar and help icon as Del 2–7; use the real project classes and tokens, not newly invented near-matching colors. Separate sections by 20–24px of white space.
2. Use compact rows and proportional columns. Display **Nr.** in a narrow separate column and meaningful Norwegian question descriptions; never display raw `GG_...`, `nfViewSprak`, `ColTekstDiverse` keys, debug labels or untranslated placeholders to ordinary users. Keep the IDs in the internal data model.
3. Preserve **all actual table dimensions** from the original YAML: grade groups, gender or language columns, row/column totals and group headers. Where a table has related grade groups, prefer **one coherent table with grouped headers**, like the final approved Del 5D adjustment; do not split it into separate vertical tables or accidentally omit groups. One horizontal scrollbar around an entire genuinely wide table on small viewports only; desktop should avoid scrolling if possible.
4. White inputs for editable values, light grey for calculated/backend-only values (read-only), terracotta (#F8E7E0 / #D9A58F) for fields blocked by an actual business rule with accessible reason, red outline for validation errors. Input permission (user/status) and field applicability (business rules) are independent.
5. No new screen-specific language switch. Use only the existing app-level language infrastructure. Use exact visible labels/comments in the exports as fallbacks where referenced `nfViewSprak` or `ColTekstDiverse` tables are unavailable. Do not invent official texts, help copy or formulas.
6. Calculated mock totals update immediately where the formula is supported by source or current code. Render sum fields read-only; keep backend-authoritative values distinct from locally calculated demo values.
7. Reuse shared validations and navigation error-count badges, including when a section is selected. Unsupported controllers are tracked/reportable in developer notes, never silently reported as successful or made into invented hard errors. Inapplicable blank fields must not produce mandatory-field errors.
8. Honor existing role/status edit gating and effective school-leader rights for role 10 when the backend field `IsKommunesentralt` is true. NEVER use school-name detection. Preserve existing screens Del 1–7, 17 and 18 and header/sidebar/demo controls.
9. Follow numerical constraints on each input (e.g. positive integer counts, zero semantics, max digits). Provide accessible input labels and validation. Keep user-facing tables compact by displaying inline error messages only when meaningful.

## Screen-specific integration checklist

### Del 8
- Inspect each of sections A, B, C, D in full: per-grade student counts and totals, related school totals in Del 3, and any required special tables/multirow data.
- Respect existing minimum/maximum grade from Del 2 **where the Power Fx business rules support grade applicability**. Explain disabled inputs; never erase their underlying mock values unless the source explicitly says so.
- Some Power Apps validations compare reported student counts with corresponding grade totals from Del 3 (`GG-F59` and related references). Implement only grounded conditions and connect to shared validation.
- If sections have dynamic municipality rows, use the compact row editor from Del 3E / corrected Del 7H: municipality selector, number, small accessible × remove control, add-row control, grey total and permissions.

### Del 9
- Section A is the per-grade distribution of opplæringsmålform (Bokmål, Nynorsk, Samisk, Andre, sum) with an **additional read-only reference column showing the student count from Del 3A**. Do not confuse the content columns with an app-language toggle. The source references `GG-F9` through `GG-F18` comparing totals for each grade: preserve these as cross-section validations where supported.
- Inspect sections B, C and `9D` from source before coding. Section C uses repeatable child records from `GrunnskoleOpplaeringssprakSamiskKvenskFinsk` / `ColGG9SpC` / `ShadowColGG9SpC` and fields `GG_904`–`GG_915`. Model repeatable rows with stable client IDs, selectable language, grade counts and derived total based on source. Provide edit/delete only where original behaviors allow; do not create actual backend child records in the mock.
- Prevent data loss when switching sections; keep one shared mock store per school and year. Retain correct locale-specific labels and grade applicability.

### Del 10
- Preserve all original A/B question groups, every subject row and per-grade gender breakdowns, and correct totals. Source uses nested wide tables; do not replace with generic Gutter/Jenter/Sum across all grades if the original has separate grade groups.
- Source validation references include `GG-A19`, `GG-F20`, `GG-F21`, `GG-F22`; derive rules only from actual formulas if present and include supported cross-checks against Del 3 for grades 8–10.
- Apply grade-range inapplicability only where source behavior supports it, especially for content normally applicable to grades 8–10. Do not fabricate other business rules.

## Mandatory quality-control pass — avoid previous Del 7 mismatch

Before rendering, create a private-to-project development checklist mapping each YAML section to its actual heading, visible question rows, grouped table headers, editable data fields, computed/grey fields, validation references, and conditional/dynamic sections. Verify full source, not just the first page. **Do not infer a section's meaning from a numbered control name** (`9D`, reused A names, etc.). Explicitly cross-check the final React rendered structure against the source for *every* A/B/C/D section, since the first Del 7 import previously mixed sections F/G/H.

Test at least: a school with grades 1–10; grades 1–7; grades 2–6; edit vs read-only users; effective role 10 + `IsKommunesentralt`; blank and zero values; sum changes; navigation badge updates; responsive wide-table layout; child-row add/delete and preservation. Run project TypeScript/lint/tests as available and a production build. Fix regressions. Report changed files, test results, unsupported formulas, and source-dependent labels needing future central localization.

## Constraints

This is a **mock app**. No real SQL / Dataverse / BOGIAPI / Power Apps writes; do not wire new network calls, create real records or falsely imply production validations. Do not delete old source exports from `gsi-react-import/source` or alter any currently accepted screens unnecessarily.
