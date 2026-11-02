# Light section validation

## State and lifecycle

`App` owns `useSectionValidation()`. The hook stores visited flags and issue arrays
per report and section in React state, keyed by the existing mock API ID
`demo:<school-id>:<year>`. A ref holds the latest answer snapshot for light checks;
it is not a new answer store or persistence layer. `OmSkolen` and the existing
mock API still own answer editing/saving/loading. Validation state is session-only
and resets on reload; switching reports does not mix badge totals.

Entering a reporting section marks it visited. Del 2 reports loaded/edited answer
snapshots to the hook. Inline reminders and counts update using only its required
answer/local rules. Next, Previous, side-menu selection and Home refresh light
validation for the section being left. All navigation remains allowed.

If Del 2 is left before its data finishes loading, the hook obtains a read-only
snapshot asynchronously, without blocking navigation or replacing newer edits.
No count is fabricated when source data cannot be loaded. Revisiting a form
refreshes validation from its existing loaded answers; validation does not change
save/retry/permission behavior or turn failed saves into successful saves.

## Issue counting

`src/domain/sectionValidation.ts` returns an array of issues with stable IDs,
section, field, kind and message. One unanswered required question is one issue.
Boolean `false` (SFO “Nei”) is an answered value, not an unanswered question.

Del 2 has four required questions. Its local demo rule requires 2C >= 2B. If both
grades are answered and C < B, it adds **one** issue attached to 2C:

> Verdien i 2C må være lik eller høyere enn 2B.

It is not counted twice for the two fields. Equality and higher C values pass.
For example: missing målform + missing SFO + B=8/C=7 gives three issues; answering
målform leaves two; answering SFO leaves one; setting C=8 leaves zero.

`GrunnskoleNavigation` receives counts derived from each issue array's length.
Only visited/leave-attempted sections have results. Positive counts render a small
red badge; zero counts render no badge. The number is visually explicit and its
meaning is supplied to the unchanged menu button name via `aria-describedby`.
The badge uses existing red and white tokens; the rest of the menu is unchanged.

Del 1 is read-only, and sections 3–9 are placeholders without implemented required
questions or local checks. No rules or errors are invented for those sections.
Absence of a badge is not a statement that a full cross-form controller run passed.

## Validation modes

`runValidation` has explicit `light` and `full` modes. All current UI paths use
`light` and identify the current section. Full validation deliberately throws an
unimplemented error; there is no fake success or “Kontroller svar” action yet.
That future action can receive a separate controller implementation behind the
same mode boundary. No full/advanced controller set runs on entry, editing or
navigation. Existing mock save operations and dependent-clear behavior are unchanged.

## Changed components

- `App`: owns validation state, routes section-entry/leave events and snapshot updates.
- `OmSkolen`: uses the light issue list for existing inline reminders and publishes
  loaded/edited answer snapshots. Existing local saving and permissions remain.
- `GrunnskoleLayout`: passes section counts to the menu.
- `GrunnskoleNavigation`: adds the conditional badge and accessible description.
- `src/App.css`: only the small `.section-issue-badge` style was added.
- `src/locales/ui.ts`: Bokmål/Nynorsk rule and badge-description text.

The required/local validator moved out of `domain/del2.ts` into the explicit-mode
module. The old grade-consistency message on both B and C was replaced with the
requested C-specific wording and a single controller issue. Existing affected
functional/axe expectations were updated for this requirement change.

Tests in `e2e/section-validation.spec.ts` cover visit gating, counts, non-blocking
navigation, equality/higher values, per-school/year isolation, read-only reports,
rapid navigation, zero-count hiding and the unimplemented full-mode boundary.

## Verification

`npm run lint` passed. `npm run test:e2e` passed all 103 tests, including the five
new section-validation tests and 24 accessibility scenarios. The suite used a
dedicated E2E port and also built and checked the production application. Badge
text contrast is 7.97:1 using the existing red token against white.
