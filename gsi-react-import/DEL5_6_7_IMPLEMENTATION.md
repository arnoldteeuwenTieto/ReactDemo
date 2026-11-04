# Del 5–7 import: implementation and source limitations

The reviewed sources are `source/Del5.yaml`, `source/Del6.yaml` and `source/Del7.yaml`. `DEL5_6_7_SOURCE_REVIEW.json` records relevant source properties; `DEL5_6_7_CHECKLIST.json` inventories active fields, hidden legacy bindings, repeated views, backend-owned values and referenced controller IDs. Regenerate runtime metadata with `node scripts/generate-staff-screens.mjs` and labels with `node scripts/generate-imported-translations.mjs`.

## Implemented

- Canonical navigation: **5 Lærere og assistenter**, **6 Årsverk og ansatte**, **7 Spesialundervisning**. Section IDs and saved mock data keys have not been swapped.
- Source groups 5A–E, 6A–D, 7A–H are presented in canonical order with the existing shared question frame and compact numbered tables. 5D combines both competency/grade bands in one table with grouped column headings and separate field bindings; 7B combines the with/without-support groups and overall total in one table; 7H contains municipality rows. Legacy `Visible=false` fields remain hidden and excluded from local validation. Responsive source declarations do not hide reporting data.
- Active unique bindings: 63 in Del 5, 11 in Del 6, 114 in Del 7, plus the repeatable 7H municipality/count records. Internal identifiers remain in bindings, not visible labels.
- Explicit source arithmetic is calculated locally; calculated fields are grey and read-only. Direct backend-owned values can be supplied through the mock store; unknown values remain blank, not fabricated zeros.
- Del 6 manual FTE inputs accept comma or dot decimals, require values greater than zero and at most 9999, and normalize to two decimals on blur. Annual frames retain their integer rules. Instead of destructively resetting invalid input as Power Apps does, the mock retains it for correction and exposes a blocking local validation error. The four-character Power Apps control limit is not applied to decimal strings because that would conflict with its numeric range/precision checks.
- Shared validation feeds active and inactive navigation badges and Del 17. Missing numeric answers remain nonblocking warnings where requiredness is not supplied; known invalid numeric values and municipality errors are blocking. Inapplicable fields do not produce errors. Normal navigation remains soft.
- Del 7A uses the existing pupil-grade applicability rule from Del 2: excluded raw answers are preserved, unavailable grades are terracotta/locked, and excluded pupil inputs do not contribute to totals. No grade restriction is invented for staff competency or staffing tables in Del 5/6, or other Del 7 groups without a verified rule. Grade bands are not prorated.
- Del 7H uses isolated section-7 state with actual GG_918/GG_919 bindings; an adapter reuses the existing municipality table. Own municipality and duplicates are excluded; count editing requires a selected municipality. Add, edit, remove, totals and validation update immediately.
- All writes retain centralized role/status/unit-access guards and selected-unit `isKommunesentralt`. No new login role or school-name detection, real API writes, SQL calls or persistence were introduced.

## Unavailable source requirements

1. **Official controllers:** `nfKontrolleretable` formulas/messages are absent. Every referenced controller ID is inventoried in `DEL5_6_7_CHECKLIST.json`; these checks remain unsupported in Del 17, never passed or converted into invented errors.
2. **Backend calculations:** No executable authoritative formula is supplied for Del 5's GG_1080 and GG_1025; Del 6's GG_1049, GG_1050, GG_1051 and GG_944; or Del 7B's GG_922, GG_925, GG_928, GG_931, GG_1018 and GG_1019. These stay read-only. Del 6 contains conflicting commented historical formulas and calls `dboUpdateSummationsGrunnskoleDel6Arsverk`; its SQL implementation is absent and is not simulated by guessing ratios.
3. **Text tables:** `nfViewSprak`/`ColTekstDiverse` and official translations are missing. Norwegian source comments and readable fallback labels use the existing translation resources. In particular the two 7B row descriptions use neutral numbered-question fallbacks; their official meanings cannot be recovered from the available export. No screen-specific language state was added.
4. **Custom components:** The implementation of the Power Apps numeric component is missing. Only its supplied properties/handlers (positive/nonnegative integers, digit limits, read-only modes) are reproduced; no additional component validation is assumed.
5. **Complete submission:** Existing mock submission remains guarded against claiming full validation while official checks and other reporting sections are unsupported. Del 18 behavior and backend authorization remain unchanged.

## Verification

TypeScript checking, `npm run build` and `npm run lint` passed. Vite reports a non-blocking bundle-size warning (main JavaScript approximately 621 kB minified).

Thirty targeted Playwright tests passed across the final runs on dedicated port 5187: new staff screens (8), existing imported screens (5), field states (9), municipality financing (4), and demo-status navigation (4). Scoped WCAG 2.1 A/AA axe checks passed for all three new screens. Desktop and 390 px viewports were checked. The full suite and full application accessibility audit were intentionally not run.

The initial run had 29 passes and one test-fixture failure: the existing completed-report fixture populated only Del 3/4, so newly included Del 5–7 generated unanswered warnings. The fixture now populates all implemented numeric sections with valid values (including decimals), and asserts 230 available numeric checks. All 13 new/imported-screen tests passed on rerun. Lint initially found one unused import in the affected field-state test; it was removed and lint passed.

Targeted tests are in `e2e/staff-screens.spec.ts`; existing imported-screen, field-state, financing and navigation regressions are retained. These include grade ranges 1–10, 1–7 and 2–6, read-only and school-leader profiles, role 10 with explicit central-unit flag/access, decimal/range cases, arithmetic, active badges, readonly calculations, municipality deletion, narrow layouts and scoped WCAG 2.1 A/AA axe checks. Automated axe checks do not replace manual keyboard/screen-reader verification.

The corrected Del 7 source-card mapping and remaining text/formula gaps are detailed in `DEL7_CORRECTION_AUDIT.md`.
