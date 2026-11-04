# Shared section validation and field states

## Validation state and badges

`App` owns `useSectionValidation(context)`. The hook subscribes to the existing
in-memory report store and derives `issuesBySection` and `sectionIssueCounts` for
the selected school/year and current demo context. Del 2 retains its existing
optimistic answer snapshots; the form/API remain the owners of answer data.
Visits are recorded but no longer gate badge visibility. There is no separate
sidebar calculation or duplicated imported-section count in App.

Every known section with blocking errors shows its red count, including the
active section and previously unvisited sections. Counts update on edits, role/
status changes and grade-range changes; zero removes the badge and accessible
count description. Active styling and soft navigation are unchanged.

Del 2 required/local issues are blocking errors. Required issues are omitted when
its controls are permission-disabled. Applicable, already-invalid data can still
be reported to read-only users; lack of editing rights does not erase a data error.
Imported sections use `isBlockingFinding`: errors count; ordinary warnings and
unsupported controller references do not. A future warning counts only if its
source explicitly sets `blocking: true`. Missing required-field definitions are
not invented. Numeric blanks remain warnings, rather than red badge errors.

For repeatable municipality rows, a missing municipality is one required issue
for an editable row. Its dependent pupil count is business-disabled and does not
create another required issue until a municipality is selected. Read-only rows do
not produce missing-answer errors. Zero pupils remains a valid answered value.

## Shared applicability and field state

`src/domain/fieldState.ts` separates form editing rights, question applicability,
calculated/manual values and current validation error. `resolveFieldState` permits
editing only when authorized, applicable and not calculated. Permission-only
read-only controls are grey, with an explanation; they are not misrepresented as
a grade/business exclusion. A validation error is an accessible overlay on an
applicable editable/manual value, not a replacement for these independent facts.

`gradeApplicability` uses Del 2's actual answer fields:

- `GG_228_Laveste_Trinn_Paa_Skolen`
- `GG_229_Hoeyeste_Trinn_Paa_Skolen`

It recognizes the grade/grade-band bindings in the imported questions, including
case differences in the source. Single grades outside the offered range are
inapplicable. A grade band is available when it overlaps the offered range; no
proportional split or extra school-type rule is invented. Unknown/invalid range
answers do not disable all fields; Del 2's existing range validation remains.

For grades 2–6, grade 1 and grades 7–10 are disabled by business rule. Existing
values remain in the report store. Supported mock sums treat inapplicable manual
operands as zero without clearing their raw answers; invalid excluded answers do
not invalidate those sums. Re-enabling a grade restores the same stored answer
and its validation state. Unknown backend formulas still remain unknown rather
than receiving fabricated values. Save handlers also reject edits to inapplicable
or calculated fields; permissions are still required independently.

## Visual states and accessibility

Shared `.gsi-field` styles are used by Del 2 controls, imported numeric tables,
municipality fields, controller comments and completion remarks. Del 1 backend
values also use the shared calculated-value background. Header, sidebar geometry,
permissions and workflow transitions are unchanged.

- Editable: existing white surface and blue-grey control border.
- Calculated/backend-provided: existing light-grey token; read-only.
- Business-disabled: existing `#F8E7E0` token and `#D9A58F` border; native disabled
  control, retained value and a small focusable lock explanation.
- Error: existing red border token, `aria-invalid` and a linked message. Numeric
  messages show after interaction or an explicit local validation run. Existing
  Del 2 inline reminders remain for editable required questions.

`FieldAvailability` provides hover/keyboard explanations through a portal tooltip,
plus persistent visually hidden descriptions for assistive technology. Grade
explanations identify Del 2 B/C and the offered range; the municipality dependency
identifies Del 3 E. Escape, blur and scrolling dismiss the tooltip. Explanations
do not expand table rows or add new navigation behavior.

## Validation modes and scope

Normal entry/navigation runs only local per-section checks. Del 17 explicitly
runs `mockValidationOverview`: available local results plus transparent unsupported
controller references. It does not claim server validation or silently pass missing
rules. `runValidation(full)` remains unsupported; existing full-mock completeness/
submission safeguards are unchanged. A completion prerequisite is not automatically
reclassified as a red sidebar error.

Del 1 is read-only; sections 5–9 have no imported local question rules. Unsupported
rules do not receive invented error counts. Demo permissions remain separate from
real authentication/backend authorization, including the selected unit's explicit
`isKommunesentralt` flag. No name-based role inference is introduced.

## Verification

19 targeted tests passed: nine new field-state/grade scenarios, five affected
section-validation regressions and five imported-screen regressions. Tests cover
ranges 1–10, 1–7 and 2–6; school leaders; read-only support; central role 10 with
explicit unit access; active badges; corrections; state retention; calculation
exclusions; disabled required fields; tooltip keyboard access and scoped axe checks.
TypeScript and the production build passed. The dependent municipality error
presentation was then refined and its targeted scenarios rerun. Full Playwright
suite, full accessibility audit and lint were intentionally skipped under the
risk-based local testing policy.
