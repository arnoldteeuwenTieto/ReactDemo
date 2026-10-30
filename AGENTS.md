# Development rules

1. When changing existing functionality, identify and update the affected Playwright tests.
2. When adding functionality, create appropriate automated tests based on the requirements.
3. After changes, run `npm run test:e2e` and report the results, including any errors or checks that could not be completed.
4. Do not modify application logic simply to make a failing test pass.
5. If tests fail, investigate and explain the cause. Distinguish application defects, test issues, and unclear requirements.
6. Keep existing passing regression tests unless requirements explicitly change.
7. Prefer accessible, stable Playwright locators and avoid arbitrary timeouts.
8. Keep documentation consistent with implemented requirements. Status badges with zero counts must be hidden.
9. Do not change application functionality or styling as part of this AGENTS.md task.
## Testing and accessibility policy

- All new or modified user-facing functionality must maintain WCAG 2.1 AA accessibility requirements.
- For small changes, run the relevant functional and accessibility tests rather than the entire suite.
- For changes to forms, navigation, interactive components, keyboard behavior, colors or layout, update and run the relevant Playwright and axe-core tests.
- For new screens or significant UI changes, run the full functional and accessibility test suite.
- Before deploying to production, run the complete test suite and perform relevant manual accessibility checks.
- Do not suppress accessibility violations or disable axe rules to make tests pass.
- Document new accessibility findings in UU_AUDIT.md.
- If tests are not run, explain why and identify the remaining verification required.