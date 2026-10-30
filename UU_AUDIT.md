# Initial Universal Design / Universell utforming audit

Audit date: 30 October 2026 (Europe/Oslo). Scope: this React GSI prototype, not real GSI/BOGIAPI authentication or a legal compliance assessment.

## Current blue-header refinement — 30 October 2026

The original blue header surface is restored using `--header-background`, which
resolves to **#4E6689**. Original GSI branding, the system-name eyebrow and the
`Grunnskole` heading are restored. The four desktop sections remain horizontal.
Demo selectors share one row, with an explicit **KUN DEV** label describing the
whole section; the context disclosure and status reset remain keyboard accessible.
Production removes the whole demo section and reflows to three columns.

The authenticated-user panel remains beige (#F1E6D6) and now contains a definition
list for **Navn, E-post and Rolle**. Its values come only from a separate nullable
session input. In this prototype, no session exists: the panel says “Ingen
innlogget bruker” and each field shows “Ikke tilgjengelig”, never demo profile data.

### Current measurements and accessibility verification

- Desktop height: **97.3125px** at 1280, 1440 and 1920px viewport widths.
- Previous measured compact reference: **96px**; increase **1.37%**, within the
  requested −10% / +5% tolerance against that measurable reference. The original
  screenshot's exact CSS height cannot be established reliably from a scaled
  image without its browser zoom/device scale, so no exact screenshot height is
  claimed. The earlier 319px expanded demo header is not the compact reference.
- Narrow layouts: 286.8125px at 768px width and 332.3125px at 375/320px. Responsive
  rows are intentional; no page overflow or control overlap was found in tests.
- White labels, reset text, context toggle, DEV label and focus ring against blue:
  **5.856568819960737:1**. This exceeds 4.5:1 for normal text and 3:1 for the authored
  focus indicator. The outline uses the existing `--surface` token, 3px solid with
  3px offset. The old dark-on-blue UU-01 failure is not reintroduced.
- Dark identity text against beige: **10.702969901375672:1**. Footer focus styling
  is unchanged and still measures **17.9278402530276:1**.
- `npm run test:e2e`, dedicated port **60447**: **95 passed, no failures (1.7m)**,
  including the production build, all functional regressions, layout checks,
  keyboard checks and all 24 axe scans. No axe rules were suppressed. Existing
  manual-review findings remain open; this is not a full conformance certification.

Visual evidence: [desktop](artifacts/header-layout/blue-header-1280.png),
[narrow](artifacts/header-layout/blue-header-375.png),
[measurements](artifacts/header-layout/blue-header.json),
[axe evidence](artifacts/header-layout/blue-header-axe.json).

CSS classes/selectors changed or added in `src/App.css`:
`.site-header`, `.header-title`, `.header-title .brand-mark`, `.header-title-copy`,
`.header-title .eyebrow`, `.header-title h1`, `.header-demo`, `.header-dev-label`,
`.header-user-demo`, `.demo-status-reset`, `.demo-user-details summary`,
`.demo-user-popover`, `.header-identity`, `.header-identity-fields`,
`.header-identity-label`, `.header-identity dl`, `.header-identity dl > div`,
`.header-identity dt`, `.header-identity dd`, and `.header-demo :focus-visible`.
No reporting rules, navigation, translations, build metadata sources or other
application styling were changed. Header-name expectations and placeholder-field,
DEV-only visibility, blue-background and contrast assertions were updated in the
header/production Playwright tests. The existing axe and focus thresholds remain.

## Previous white-header remediation (historical) — 30 October 2026

**UU-01 is now resolved.** The original confirmed failure was the **header
demonstration-user selector's focus outline**, not a footer failure. The exact
control is the select labelled `Demonstrasjonsbruker DEMO` in `DemoUserHeader`.
The compact header now follows the supplied reference's white control area,
blue build panel and beige signed-in-user panel. The existing `--focus` token
(`#9D5038`) and 3px solid outline/3px offset are retained against `--surface`
(`#FFFFFF`), yielding **5.772102922128844:1**, above the WCAG 1.4.11 AA 3:1
threshold. `.header-demo :focus-visible` explicitly maintains that focus treatment.

The footer was independently checked: its existing focus styling uses
`--surface` (`#FFFFFF`) against `--footer-background` (`#171717`), yielding
**17.9278402530276:1** on the `Om GSI` link. Footer styling was therefore left
unchanged. The new identity panel uses `--text` (`#303030`) against the reusable
`--header-user-background` token (`#F1E6D6`), yielding **10.702969901375672:1**
for normal text (WCAG 1.4.3 AA threshold 4.5:1).

### Current validation

`npm run test:e2e` on dedicated E2E port **63329**: **95 passed, 0 failed (1.9 minutes)**.
The configured production web server ran `npm run build` (TypeScript and Vite)
successfully. The run includes all existing regressions, 24 axe scans, six
supplementary accessibility checks and nine new header layout/contrast checks.
The previous UU-01 test now passes with its original 3:1 threshold intact.
Production tests verify the demo section is absent and uses three grid tracks,
with no reserved fourth column. No failures or suppressed axe rules remain in
this run; the initial audit's manual-review items remain open.

The initial machine-readable baseline below is preserved in
`UU_AUDIT_RESULTS.json`. Current axe evidence is in
[artifacts/header-layout/uu-after.json](artifacts/header-layout/uu-after.json).
The current focus and identity/footer measurements are retained in the generated
test-result JSON attachments. The current scan still requires manual follow-up;
passing automated tests does not establish full WCAG conformance.

### Header measurements and behavior

Measured `.site-header` heights at an unchanged 900px browser viewport height:

| Viewport width | Before | After |
| ---: | ---: | ---: |
| 1280px | 319px | **96px** |
| 1440px | 319px | **96px** |
| 1920px | 319px | **96px** |
| 768px | 388.39px | 248.59px |
| 375px | 352px | 309px |
| 320px | 382px | 335px |

Desktop height was reduced by **223px (approximately 70%)**. The nine layout
tests cover 1024–1920px desktop and 320/375/768px responsive widths; desktop
selectors share one horizontal row, status overrides and opening `Demokontekst`
do not increase header height, and no measured page overflow was introduced.
Narrow layouts intentionally use additional rows to preserve usable controls.

Measurements: [before.json](artifacts/header-layout/before.json),
[after.json](artifacts/header-layout/after.json). Visuals:
[before desktop](artifacts/header-layout/before-1280.png),
[after desktop](artifacts/header-layout/after-1280.png),
[after narrow](artifacts/header-layout/after-375.png).

The right panel does not impersonate the simulated user. No real authenticated
session exists in the repository, so it correctly displays “Ingen innlogget
bruker”; `AppHeader` accepts a separate nullable session input for a future real
integration. Deployment configuration supplies the environment label; `package.json`
supplies the version, and the workflow supplies build number and commit SHA (see
[BUILD_VERSION.md](BUILD_VERSION.md)). None are copied from the screenshot.
There is no service-version source.
The demo selectors use their existing state, per-report overrides, permission
function and development-only guard. Role details are available in the compact
disclosure rather than permanently adding header rows.

Implementation files: `src/components/AppHeader.tsx`,
`src/components/DemoUserHeader.tsx`, `src/App.tsx`, `src/App.css`,
`src/styles/theme.css`, `src/locales/ui.ts`, `src/vite-env.d.ts`, `vite.config.js`.
Updated/new verification: `e2e/header-layout.spec.ts`,
`e2e/demo-production.spec.ts`, `e2e/demo-users.spec.ts`,
`e2e/accessibility.spec.ts`, `scripts/measure-header.mjs` and the audit evidence
generator's optional output path. Related documentation: this file and
`DEMO_USERS.md`. No reporting rules, data, Del 1/Del 2 behavior or unrelated
application styling were changed.

## Initial audit outcome (historical baseline — before remediation)

One confirmed accessibility defect was measured outside axe: the authored keyboard-focus outline on the demonstration-user selector has **1.0146:1** contrast against the header, below the **3:1** requirement for that focus state. Prioritize this correction.

The 24 axe scans reported **zero definite WCAG 2.1 A/AA violations**, **zero additional WCAG 2.2 AA violations**, and **zero definite best-practice violations**. They also returned three kinds of **incomplete / needs-review** findings. These are recorded below and are not treated as either passes or confirmed violations. A clean axe violation list does not establish WCAG conformance.

No application components, CSS, mock records, permission rules or styling were changed during this audit. Existing regression tests were retained. `@axe-core/playwright` 4.13.0 was already installed; the audit uses its axe-core 4.13.0 engine.

### Final execution results

Command: `npm run test:e2e`, dedicated port **64285**, actual base URL `http://localhost:64285/ReactDemo/`. **85 passed, 1 failed, 86 total (1.7 minutes)**; process exit code 1.

| Test group | Passed | Failed |
| --- | ---: | ---: |
| Existing functional/regression tests, including production safeguards | 56 | 0 |
| Axe screen/state audits, including separate WCAG 2.2 assertions and narrow-page reflow checks | 24 | 0 |
| Supplementary keyboard/focus checks | 5 | 1 |
| **Total** | **85** | **1** |

The failed test is `demo-user keyboard focus indicator has at least 3:1 contrast against the solid header`: expected at least 3, measured 1.014633470499646. This is UU-01, not an infrastructure error. [Focus screenshot](test-results/accessibility-accessibilit-567df-st-against-the-solid-header-chromium/keyboard-focus.png) and [trace](test-results/accessibility-accessibilit-567df-st-against-the-solid-header-chromium/trace.zip) are retained until the next run.

| Run | Dedicated port | Result | Failure investigation |
| --- | ---: | --- | --- |
| Initial | 54100 | 83 passed / 3 failed | Focus contrast UU-01; overly prescriptive skip-link and native-dialog focus assertions |
| Investigation | 62459 | 84 passed / 2 failed | Focus contrast UU-01; skip-link draft still incorrectly expected filter reset before the main language controls |
| Final | 64285 | 85 passed / 1 failed | Focus contrast UU-01 only; assertions now measure actual keyboard outcomes |

Only harmless `NO_COLOR` / `FORCE_COLOR` environment warnings accompanied the final run. TypeScript validation and production build completed through the configured production web server. No axe finding was removed to obtain these results.

## Method and reproducibility

Tests: [e2e/accessibility.spec.ts](e2e/accessibility.spec.ts). Machine-readable evidence: [UU_AUDIT_RESULTS.json](UU_AUDIT_RESULTS.json). The JSON snapshot includes each scan's environment, viewport, applied/passed rule IDs, findings, affected selectors, HTML, check messages and source-artifact paths.

- Browser: Playwright Chromium, Chrome 156.0.8078.4 on Windows; default viewport 1280 × 720 and narrow viewport 320 × 800.
- Explicitly enabled local demo mode; default school leader with access to Fjordgløtt 2026, except the scenario selecting Udir support to exercise role-disabled answers.
- WCAG 2.1 tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.
- Additional WCAG 2.2 AA tag: `wcag22aa`, reported separately. `best-practice` results are also retained separately.
- No axe rules were disabled; no elements were excluded; no violation baselines, allowlists or expected-failure annotations were used. Assertions check both WCAG result categories independently.
- Reports retain `incomplete` findings rather than hiding them. Automated text contrast does not cover all focus states, graphics, overlays, disabled controls or assistive-technology behavior.
- Screenshots, full per-scenario reports and failing-test traces are in `test-results/`. These generated artifacts are overwritten by subsequent test runs; the root JSON file preserves this audit snapshot.

Use a dedicated available development-server port without changing Vite settings:

```powershell
$uuListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$uuListener.Start()
$env:E2E_PORT = [string]$uuListener.LocalEndpoint.Port
$uuListener.Stop()
npm run test:a11y
# Full audit plus all existing regression tests:
npm run test:e2e
# After the run, regenerate the permanent axe evidence snapshot:
node scripts/summarize-uu-audit.mjs
```

The existing configuration also builds and serves a production preview on its configured preview port. It must be available. Neither an existing developer server nor the user's browser session was stopped. The audit is intentionally expected to return a nonzero exit code until the measured focus defect is corrected.

## Screen and state coverage

Every row below passed its axe assertions: no definite violations in the selected WCAG 2.1 or additional 2.2 rule sets. Review findings remain open.

| Screen / state | Scans | Additional observations |
| --- | ---: | --- |
| Skoleoversikt, Bokmål | 1 | Labels, search, sortable headers, table structure, badges and footer |
| Skoleoversikt, Nynorsk | 1 | `html[lang="nn"]` asserted; translation completeness still requires review |
| Skoleoversikt, unmatched search | 1 | Empty-state message visible; empty-table semantics flagged for review |
| Innledning | 1 | Heading, illustration name, navigation buttons and current-school badge |
| Del 1 Enhetsopplysninger | 1 | Waited for information to load; read-only definition lists and headings |
| Del 1 help dialog | 1 | Loaded dialog content and accessible name |
| Del 2, unanswered validation | 1 | Four visible validation messages, radio groups and select labels |
| Del 2, cross-field validation | 1 | Lowest grade 8 / highest grade 7; both error messages visible |
| Del 2, plain-text help | 1 | Modal dialog and loaded help content |
| Del 2, HTML help | 1 | Headings, list, table, caption and link inside the modal |
| Del 2, role-disabled at status 1 | 1 | Udir support; answer controls disabled while help remains available |
| Del 2, each demonstration status 0–8 | 9 | All nine badge labels/styles; status 1 editable, others read-only for the chosen profile |
| 320px Skoleoversikt, Innledning, Del 1, Del 2 | 4 | No page-level horizontal overflow in these samples; table can scroll internally |
| **Total** | **24** | Narrow-view tests do not replace actual browser zoom/text-spacing testing |

## Confirmed finding from supplementary automation

Severity: **High** = substantial access barrier; **Medium** = material issue or potentially substantial risk pending verification; **Low** = limited impact or improvement. Axe's own `serious` impact below is an engine label for its review item, not a confirmed audit severity.

| ID | Severity / status | Screen / component | Criterion | Evidence | Recommended correction |
| --- | --- | --- | --- | --- | --- |
| UU-01 | **High — confirmed measured defect** | Shared header, demonstration-user selector; `src/index.css` global `:focus-visible`, `src/App.css` header colors | WCAG 2.1 **1.4.11 Non-text Contrast (AA)**; also review **2.4.7 Focus Visible (AA)** | Keyboard Tab reaches the control. Authored solid outline is `rgb(157,80,56)` / `#9D5038`, width 3px, offset 3px, against header `rgb(78,102,137)` / `#4E6689`. Computed ratio **1.014633470499646:1**, required minimum **3:1**. The dedicated focus test fails intentionally. | Use an authored focus treatment with at least 3:1 against adjacent header colors, such as a suitably contrasting light outline or a tested two-color treatment. Check the status selector, reset action and every other header control in all enabled states. Retest forced colors and zoom. Do not merely remove the failing assertion. |

The measurement concerns the authored outline, not text contrast, and is not an axe `color-contrast` violation. Only the measured control is confirmed by the automated focus test; other controls using the same styles require verification.

## Axe findings requiring manual verification

Occurrence counts are repeated rendered nodes across scenarios, **not unique defects**. All instances and exact selectors are retained in the evidence JSON.

| ID | Status / potential severity | Affected screen / component | Rule / criterion | Evidence and recommended correction |
| --- | --- | --- | --- | --- |
| UU-02 | Needs review; potential **Medium**; axe impact `serious` | `FormStatusBadge` in overview rows, summary and open-school bar; `AppFooter` logo placeholder | `aria-prohibited-attr`; **4.1.2 Name, Role, Value (A)** where applicable; also examine **1.3.1 Info and Relationships (A)** | 21 scans / 69 node occurrences. Axe reports that `aria-label` is not well supported on a `span` without a valid role. Status text remains visible, so this is not proof that the status disappears for screen readers. Test actual spoken output in NVDA and VoiceOver. Prefer meaningful visible/screen-reader text for static badges; if a named container is necessary, choose semantics appropriate to its actual purpose. Do not add `role="alert"` to every static badge. Remove or replace the placeholder logo's unsupported naming as appropriate. |
| UU-03 | Needs review; potential **Medium**; axe impact `serious` | Sort arrows, previous/next/open arrows, Innledning SVG text `SKOLE`, plain-text help content | `color-contrast`; **1.4.3 Contrast (Minimum) (AA)** for meaningful text; **1.4.11 (AA)** for meaningful graphics | 23 scans / 127 node occurrences. Reasons: content consists only of non-text characters; overlapping elements prevent determining the background; help content partly overlaps other elements. Inspect the final rendered colors and backgrounds, including focus/hover and selected sorting. Decorative arrows with a sufficient textual button name may be exempt; document that decision. Check SVG text in context and determine whether the illustration is decorative or informative. Measure help text against the actual solid background. Do not label all these occurrences confirmed contrast failures. |
| UU-04 | Needs review; potential **Low**; axe impact `serious` | Skoleoversikt after unmatched search, `SchoolTable` | `th-has-data-cells`; **1.3.1 Info and Relationships (A)** | One scan / one table occurrence: headers remain with no data rows. The explicit “Ingen skoler funnet” message is present. Test empty-state announcements and table navigation with a screen reader. If confusing, improve the empty-result relationship/caption or render a clearly associated empty state; preserving headers is not automatically a failure. |

No definite best-practice violations were returned. Useful passed automated checks included form/select/button naming, radio labels and fieldset structure, document language validity, table/header markup, heading order, one main landmark, visible page heading and target-size checks where applicable. These passes apply only to the rendered states and rules actually evaluated.

## Supplementary keyboard results and test investigations

These checks are Playwright interaction tests, **not axe findings**.

| Check | Scope and limitation |
| --- | --- |
| Skip link | First Tab reaches the visible skip link; Enter targets `#main`; the next Tab must enter main content. This tests bypassing the header rather than requiring the non-focusable `<main>` itself to become `activeElement`. |
| Overview keyboard actions | Focused sort and open-report buttons respond to Enter; Innledning's heading receives programmatic focus. This samples actions, not the entire tab order. |
| Radio groups | Space selects an answer; ArrowRight selects the next radio and the existing local save reports success. |
| Disabled inputs | At status 0, Tab skips disabled answer controls and reaches the next help button; Enter still opens help. |
| Native modal dialog | Initial close-button focus, forward/reverse Tab boundary, Escape dismissal, and return to trigger are checked. Chromium may visit browser chrome at a native dialog's Tab boundary; the test permits that only when the document has lost focus, then requires focus to return inside the dialog. Background document controls must not receive focus. |
| Focus contrast | **Fails** for UU-01. This remains a real failed accessibility test; no application fix was made. |

Initial-run failures were investigated instead of silently changing the app. The first skip-link assertion incorrectly required focus on `<main>` itself; its next draft incorrectly assumed the filter-reset button preceded the language controls. The test now checks the actual bypass outcome. The original modal assertion incorrectly required immediate wrapping to the close button without allowing browser chrome; native Chromium behavior was verified and the assertion corrected. These are test-model corrections, not suppressed axe findings or application fixes. The final run results are recorded below.

## Manual verification still required

The following are **not completed** and must not be described as passes or established failures.

| Priority / potential severity | Screen / component | Criteria to verify | Procedure and recommended response |
| --- | --- | --- | --- |
| P1 / High if blocked | All four screens, full navigation | **2.1.1 Keyboard**, **2.1.2 No Keyboard Trap**, **2.4.3 Focus Order**, **2.4.7 Focus Visible** | Complete the whole workflow with Tab, Shift+Tab, Enter, Space and arrow keys, without a pointer. Check every row selection, filter, reset, user/status switch, report section and help action. Inspect clipped focus outlines and horizontal table scrolling, including on narrow screens. Repair any unreachable actions before cosmetic issues. |
| P1 / High if information is missing | Overview tables/status summaries; Del 1 details; Del 2 questions/help | **1.3.1**, **1.3.2 Meaningful Sequence**, **2.4.6 Headings and Labels**, **4.1.2** | Test NVDA with Chrome/Firefox and VoiceOver with Safari. Review landmark/heading navigation, table row/column association, group/legend announcements, selected/disabled states, and modal title/content. Axe cannot judge whether names, reading order or descriptions are useful. |
| P1 / High if errors are not discoverable | Del 2 validation and local saves | **3.3.1 Error Identification**, **3.3.2 Labels or Instructions**, **3.3.3 Error Suggestion**, **4.1.3 Status Messages** | Check unanswered and invalid grade-range messages, save success, predictable seventh-save error, retry, and switching to read-only. The current source links validation via fieldset `aria-describedby`; verify whether the specific error is announced when focusing each input. Check live-region timing and whether an appropriate error summary or direct input descriptions are needed. Status/live-region markup alone cannot prove announcements. |
| P2 / Medium | Repeated question help buttons | **2.4.6**, **4.1.2** | Every help button has the same name “Vis hjelpetekst”; section headings provide context, but button-list navigation can be ambiguous. Test with screen readers; consider names that include the associated question while retaining clear visible context. Not classified as a confirmed violation here. |
| P2 / Medium | All text, focus treatments, badges and controls | **1.4.1 Use of Color**, **1.4.3**, **1.4.11** | Measure outstanding axe contrast cases and hover/focus/selected states; inspect forced colors/high contrast. Status badges already include text, which helps avoid color-only status distinctions, but confirm spoken and visual usability. Inactive controls have contrast exceptions; do not apply those exceptions to active read-only information. |
| P2 / Medium | All screens and help drawer | **1.4.4 Resize Text**, **1.4.10 Reflow**, **1.4.12 Text Spacing**, **1.3.4 Orientation** | Test actual 200% text/400% browser zoom, text-spacing overrides, portrait/landscape and mobile keyboards. The 320px samples show no page overflow but are not proof of complete reflow conformance. Data tables can need two-dimensional scrolling; surrounding content must remain usable. |
| P2 / Medium | Bokmål/Nynorsk UI, help and demo metadata | **3.1.1 Language of Page**, **3.1.2 Language of Parts** | `lang="nb"` is declared and switching to Nynorsk sets `nn`. Verify real content language, pronunciation, untranslated fallback content and meaningful language changes inside help. Valid metadata alone does not prove accurate language markup. |
| P2 / Medium | Innledning illustration and any future logos | **1.1.1 Non-text Content** | Determine the illustration's purpose with content owners, then assess the alternative text or decorative treatment. A nonempty accessible image name is not proof of an equivalent alternative. |
| P3 / Low–Medium | Footer and page title | **2.4.2 Page Titled**, **2.4.4 Link Purpose**, **3.2.3 Consistent Navigation** | The document title stays “GSI Grunnskole – Statusside” across forms. Consider screen-specific titles. Footer destinations are explicitly disabled prototype placeholders, including accessibility/privacy links. Review label clarity and whether unavailable links should remain in the tab order; do not claim working destinations or a completed accessibility statement. |

No real authentication, document downloads, media, time limits or production integrations were audited. Their requirements must be assessed when implemented. This audit does not establish compliance with Norwegian UU regulations or EN 301 549 as a whole.

## Additional WCAG 2.2 AA improvements — separate from WCAG 2.1 findings

No definite `wcag22aa` axe violations were returned. This is a narrow automated result, not coverage of every new 2.2 criterion.

| Criterion | Current evidence / next action |
| --- | --- |
| **2.4.11 Focus Not Obscured (Minimum), AA** | Manually follow focus at narrow widths, high zoom, in scrolled question cards and in the drawer. Ensure author-created content never entirely hides the focused control. This differs from the existing 2.1 focus-color defect UU-01. |
| **2.5.8 Target Size (Minimum), AA** | Axe's `target-size` check passed where applicable. Manually check actual clickable bounds and spacing for compact demo reset/status controls, footer links, radios and small-screen navigation. Minimum is 24 × 24 CSS px subject to specified exceptions; this is not a blanket 44px AA requirement. |
| **2.5.7 Dragging Movements, AA** | No application dragging interaction was identified in the four audited screens. Reassess if draggable widgets are added; provide a non-dragging single-pointer alternative. |
| **3.3.7 Redundant Entry, A** | Included when reviewing full WCAG 2.2 AA conformance because AA includes A. Review complete future reporting journeys for repeated information and reuse/prepopulation. Not established by these screen snapshots. |
| **3.3.8 Accessible Authentication (Minimum), AA** | Real authentication is absent and out of scope. Reassess BOGIAPI/identity-provider login before production; do not treat the demo-user selector as an authentication test. |

**2.4.13 Focus Appearance is AAA**, not an additional AA obligation. A stronger focus design can still be a useful improvement. The demo must continue to keep simulated roles/statuses separate from backend authorization.

## Recommended correction order

1. Correct UU-01 and manually check focus treatments on all header controls. Then rerun the failing focus test without weakening its contrast threshold.
2. Perform the P1 keyboard and screen-reader workflows. Any discovered inability to navigate, identify a question/error, or recover from failure takes priority over lower-impact refinements. No critical barrier was confirmed by this initial automated audit; manual testing may identify one.
3. Resolve UU-02 naming semantics and Del 2 error/live-region behavior based on assistive-technology evidence. Make help-button names more specific if needed.
4. Resolve UU-03 and UU-04 review items, validate zoom/spacing/forced-colors behavior, and complete WCAG 2.2 AA focus/target checks.
5. Improve titles, translations and prototype footer destinations, then repeat automated checks and arrange inclusive user testing. Record manual evidence before making a conformance claim.

## Sources

- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing): axe integration and limits of automation.
- [W3C WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/): criteria, levels and full assessment scope.
- [W3C: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): authored visual states and the 3:1 threshold.
- [W3C: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html): additional WCAG 2.2 AA requirement.
- [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24px minimum and exceptions.
- [Deque axe rule descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md); actual installed-engine findings and tags are preserved in the local JSON evidence.
