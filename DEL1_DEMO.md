# Del 1 – Enhetsopplysninger

Section 1 now uses `src/components/Enhetsopplysninger.tsx`. It is read-only and
uses QuestionCard's new `kind="content"` variant and the existing HelpDrawer with
GG-H82. The input variant used by Del 2 keeps the same markup and behavior.
Shared styles in App.css provide content-driven grid panels with equal-height
desktop addresses, stacked mobile addresses and wrapping labels/values.

## Source mappings

Exact Power Apps field names supplied in the conversation are preserved in
`src/domain/schoolDetails.ts`. No screenshot was available in this session;
the layout follows the supplied visual requirements and existing GSI styling.

| Display | Source |
| --- | --- |
| Selected organisation number | `vargblGallerySelectedSkole.Organisasjonsnummer` → `selectedSchool.Organisasjonsnummer` from `school.organizationNumber` |
| Reporting year (identity/bar) | `vargblGallerySelectedSkole.Ar` → `selectedSchool.Ar` from `school.year` |
| Selected school identity | Existing `school.id`, retained separately as `selectedSchool.schoolId` |
| School name | `nfLookupNSR.Navn` → `nsr.Navn` |
| Visiting address | `nfLookupNSR.BeliggenhetsadresseAdresse` |
| Visiting postcode | `nfLookupNSR.BeliggenhetsadressePostnummer` |
| Visiting postal place | `nfLookupNSR.BeliggenhetsadressePoststed` |
| Postal address | `nfLookupNSR.PostadresseAdresse` |
| Postal postcode | `nfLookupNSR.PostadressePostnummer` |
| Postal place | `nfLookupNSR.PostadressePoststed` |
| Owner organisation number | If numeric `vargblSkjemaStatusId > 0`, `nfApiSelectedRecord.NsrEnhet.EierOrganisasjonsnummer`; otherwise `nfLookupNSR.EierOrganisasjonsnummer` |
| Operating responsibility | `nfLookupNSR.Driftsansvar` |
| Telephone | `nfLookupNSR.Telefon` |
| Email | `nfLookupNSR.Epost` |
| Municipality number/name | `nfLookupNSR.Kommunenummer` / `Kommunenavn` |
| County number/name | `nfLookupNSR.Fylkesnummer` / `Fylkesnavn` |

The GSI record ID is represented by `formRecord.skjemaStatusId`; existing demo
IDs such as `demo:1:2026` are not treated as positive persisted record IDs.
If a positive GSI record ID has no owner value, the UI displays `Ikke tilgjengelig`
without silently substituting the NSR value.

## Mock data and future API

`src/services/schoolInformationService.ts` defines `SchoolInformationService`.
Its local mock keeps NSR records (organisation key) and GSI records (school/year
key) separate. NSR-shaped demo name and municipality name are seeded from the
existing fictional selected-school context. Organisation number and year also
come from that context. All other missing fields remain null: no addresses,
postcodes, telephone/email, owner numbers or geographic codes were fabricated.
The page explicitly labels the data as fictional demonstration information.
Identifier/code/postcode fields are strings, including any leading zeros.

For future BOGIAPI/NSR integration, implement `getSchoolDetails(school)` and inject
that service into Enhetsopplysninger. Map the NSR response into `nsr`, numeric
form record ID and `NsrEnhet` into `formRecord`, and retain the selected identity
separately. The UI and the owner-source rule need no rewrite. No save/PATCH
method is defined or called by this page; the Del 2 API/store is untouched.

## Verification

Build/lint checked with Node 22/npm 10. Browser component checks at 996px and
386px verified four panels, matching desktop address heights, stacked mobile
addresses, no horizontal overflow with long test-only addresses/emails, GG-H82,
read-only controls, missing-value display and zero save API calls. Source-rule
checks verified NSR fallback, positive-ID GSI precedence, missing GSI owner and
leading-zero preservation. Temporary browser fixtures were removed afterward.
