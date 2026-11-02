# Development rules

1. When changing existing functionality, identify and update the affected Playwright tests.
2. When adding functionality, create appropriate automated tests based on the requirements.
3. After changes, apply the testing levels below and report checks executed, skipped, failed, or unable to complete.
4. Do not modify application logic simply to make a failing test pass.
5. If tests fail, investigate and explain the cause. Distinguish application defects, test issues, and unclear requirements.
6. Keep existing passing regression tests unless requirements explicitly change.
7. Prefer accessible, stable Playwright locators and avoid arbitrary timeouts.
8. Keep documentation consistent with implemented requirements. Status badges with zero counts must be hidden.
9. Do not change application functionality or styling as part of this AGENTS.md task.
## Testing policy

Choose the level according to the behavior and risk affected, not the size of the diff. Explicit verification requests take precedence over the default local checks below.

### Level 1 — Minor visual or content changes

Examples: CSS, colors, spacing, margins, wording and non-functional layout changes.

- Verify through code inspection.
- Do not automatically run Playwright tests, full accessibility audits, production builds or linting.
- Report that automated checks were intentionally skipped under Level 1.

### Level 2 — Functional changes

Examples: React state, navigation, filtering, sorting, forms and component behavior.

- Update relevant automated tests when necessary.
- Run only tests directly affected by the change, using targeted test files or cases rather than the entire Playwright suite.
- Do not run a full accessibility audit unless the change directly affects accessibility.

### Level 3 — Critical functionality

Examples: numeric validation, cross-field controllers, authentication, authorization, API integration and data saving.

- Update and execute relevant targeted tests, including appropriate edge cases.
- Run additional checks only when justified by the risk of the change; explain the justification.

### Level 4 — Full verification

Run comprehensive Playwright tests, accessibility checks, linting, TypeScript checks and the production build only when:

- Explicitly requested.
- Preparing for a release or deployment.
- A change affects multiple core application systems.
- A specific issue requires broader regression testing.

### Execution and reporting

- Never run the full Playwright suite automatically for minor changes.
- Avoid repeated test runs for small adjustments; rerun affected checks when a new change, failure or unresolved concern justifies it.
- Keep existing tests; do not delete or disable them. When requirements explicitly change, update affected expectations rather than removing coverage.
- These levels govern local development verification. Keep GitHub CI/CD validation separate; do not weaken CI/CD checks to match reduced local checks.
- Always summarize which checks were executed and which were skipped, with reasons. Include errors, incomplete checks and any remaining verification required.

## Accessibility and quality standards

- All new or modified user-facing functionality must maintain WCAG 2.1 AA accessibility requirements.
- Do not weaken accessibility, coding, code-quality or security requirements. Reduced local verification does not relax implementation standards.
- For functional changes directly affecting accessibility, update and run relevant targeted Playwright and axe-core tests. Purely visual or content changes follow Level 1 unless broader verification is explicitly requested or justified under Level 4.
- New screens and significant UI changes follow the applicable risk level; they do not automatically require the full suite unless a Level 4 condition applies.
- Before a release or deployment, perform Level 4 verification and relevant manual accessibility checks.
- Do not suppress accessibility violations or disable axe rules to make tests pass.
- Document new accessibility findings in UU_AUDIT.md.
