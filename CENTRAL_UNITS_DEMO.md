# Fictional municipality-central reporting units

All five records report for 2026 with initial status 1 (Under behandling).
Organization numbers are fictional demonstration values, not valid identifiers.

| ID | Unit | Municipality | Fictional organization number |
| --- | --- | --- | --- |
| 16 | Oslo kommune sentralt | Oslo | 000200001 |
| 17 | Bergen kommune sentralt | Bergen | 000200002 |
| 18 | Stavanger kommune sentralt | Stavanger | 000200003 |
| 19 | Trondheim kommune sentralt | Trondheim | 000200004 |
| 20 | Drammen kommune sentralt | Drammen | 000200005 |

All five central units have explicit `isKommunesentralt: true`; existing regular
school records have `false`. Names are display data only. Effective roles use:

```ts
const effectiveRoleId = user.roleId === 10 && school.isKommunesentralt === true
  ? 9 : user.roleId
```

The flag corresponds to BOGIAPI `IsKommunesentralt`, not the profile central flag.
Matrix capabilities require demo mode and explicit report access. The preserved
baseline editing guard still requires status 1 and its earlier role/profile flag
conditions; see the documented conflict in DEMO_USERS.md. No backend permissions
are granted. Production must obtain the unit flag from BOGIAPI and enforce all
authorization on the server, independently of client-controlled values.

Birk Vik (`demo-owner-central`) gains explicit report ID 17 in his existing
Bergen scope. Existing access to reports 1, 9 and 13 is preserved. His assigned
municipality remains unchanged. The ordinary non-central role 10 profile gains
no access; its existing regular-school access still does not permit editing.
The Udir administrator/support profiles include IDs 16–20 to preserve their
existing all-fictional-reports scopes; they remain read-only under the baseline.
No dedicated central-owner profiles are added for the other municipalities.

Existing schools, reporting questions, permission rules and UI styling are unchanged.
Targeted tests cover fixture values, unique numbers, the explicit unit flag, overview
search/filter/sort/status counts, navigation and explicit demo edit access.

Boolean-flag correction: all nine targeted tests passed, including contradictory
names/flags, unit switching, actual-role preservation, access denial and matrix
coverage. Full suite, full audit, lint, TypeScript checks and build were skipped.

Initial dataset verification: 36 targeted Playwright tests passed (central units, Skoleoversikt,
demo-user context and demo permissions). A missing scope-description translation
reported during the run was added and inspected afterward. The full suite,
accessibility audit, lint and production build were intentionally skipped under
the targeted local verification policy.
