# Del 2 – Om skolen

`src/App.tsx` selects `OmSkolen` only for section 2. Existing school context,
status, introduction and previous/next/home navigation are preserved.

Del 2 starts with question A beneath its heading; the former school-details card
and introductory demo explanations have been removed. The green school bar stays.
The school table and green selected-school bar use the same `FormStatusBadge`,
supplied only by numeric `school.statusId`. Labels, order and tones for IDs 0–8
live in `src/domain/formStatus.ts`; palette variables live in theme.css.
The compact summary counts the same filtered school list by ID and always shows
all nine categories. Filter option values are IDs (including valid ID 0), while
labels are translated. Status sorting still compares display labels.
The existing demo records were explicitly migrated once by user instruction:
Ikke påbegynt→0, Under arbeid→1, Levert→2, Godkjent→4 (municipality approval).
Future records must provide an explicit ID. Missing/invalid IDs show
`Status ukjent`; labels such as `Godkjent` never imply an approval level.
The status is display-only and independent of per-question save indicators.

- `src/components/OmSkolen.tsx`: React form state (`form`), shared onChange/save
  handler (`save`), one-field `payload`, retry and per-field request versions.
- `src/components/QuestionCard.tsx`: reusable accessible radio/dropdown question,
  blue header and white answer area, help trigger, validation,
  saving/saved/error status and retry.
- `src/components/HelpDrawer.tsx`: reusable right-side modal drawer with native
  dialog focus containment, inert background, Escape/backdrop/X/Lukk dismissal,
  focus restoration, scrollable content and reduced-motion support.
- `src/services/helpTextService.ts`: asynchronous replaceable `HelpTextService`
  interface and centralized demo entries for GG-H83–GG-H86.
- `src/components/HelpTextContent.tsx`: plain text with preserved line breaks,
  or DOMPurify-sanitized HTML with an explicit tag/attribute allowlist.
- `src/domain/del2.ts`: typed fields, documented mock language values (the option
  labels themselves), demo grades 1–10, required/grade-consistency validation,
  supplied source help/validation IDs, and reusable dependent-clear rules.
- `src/services/grunnskoleApi.ts`: asynchronous `getGsiSkjemaStatus` and
  `grunnskoleSave(mockId, 2, payload)`, in-memory `store`, per-school/year queues,
  and debug request/response logs. Sections are nested under school/year keys.
- `src/App.css`: shared question and debug panel styles.

No network calls, credentials, real session IDs or external storage are used.
Answers survive section navigation but reset on browser refresh. Every seventh
save attempt fails before modifying the store; retry resends the current field.
Different fields/schools keep separate state. Queues serialize edits and dependent
updates; per-field versions prevent stale responses changing current save status.
Reads wait for pending saves, including when returning to a section.

Changing either grade clears the four supplied Del 12 fields to null when the
current lowest grade > 7 or highest grade < 5. SFO false triggers the Del 14 clear
mechanism, but its field list is deliberately empty: exact names were not supplied.
The response reports this limitation rather than pretending a clear succeeded.
Populate `dependentFields[14]` with source names when available. Each logical edit
has exactly one Del 2 save; dependent operations are part of the same simulation.

Expand **API Debug** beneath the questions to inspect the selected school, mock
SkjemaStatusId, section, operation, JSON payload, result, timestamps and dependent
operations. Required/consistency checks are demonstration rules; referenced
official validation formulas and official help content are not available.

## Reusing questions and help

Pass QuestionCard its field value, options, save status/handlers and help ID.
Its `onHelp(id, trigger)` callback selects a single help request in the reporting
screen. Render one HelpDrawer keyed by that ID and pass the triggering button
for focus restoration. HelpDrawer accepts an optional `service` implementing
`getHelpText(id): Promise<HelpText>`, so replacing the mock with an API requires
no QuestionCard changes. Help never calls the save service or edits form state.

### Text and HTML help

HelpText includes `hjelpetekstId`, `overskrift`, `tekst` and `format: 'text' | 'html'`.
GG-H83 demonstrates multiline plain text; GG-H84 demonstrates HTML paragraphs,
headings, a list, link and table. GG-H85/GG-H86 remain plain text with their IDs.
All content is explicitly demonstration text.

HelpTextContent renders text through React escaping. For HTML, it calls
`DOMPurify.sanitize` immediately before the sole `dangerouslySetInnerHTML` use.
Only text formatting, headings, lists, links and table markup are allowed.
Event handlers, inline styles, classes, IDs, scripts, frames, SVG, images and
forms are excluded. Unsafe URL protocols are filtered by DOMPurify. Links use
normal same-tab navigation; database-supplied target attributes are disallowed.
Styles come exclusively from App.css, with white underlined links and visible
focus on the blue drawer. Wide HTML content scrolls inside its content area.

For a future API, implement `HelpTextService.getHelpText` and map its response
to HelpText, then inject it into HelpDrawer. If the backend has no format column,
keep a trusted frontend mapping per ID and default unspecified entries to `text`:
`format: configuredFormats[id] ?? 'text'`. No database schema change is needed.
The same rendering-time sanitization applies to both mock and API HTML.

Browser checks passed for plain-text escaping/line breaks, allowed HTML structure,
all four IDs, and rejection of script, iframe, style, event-handler, SVG/image
and javascript-URL attack examples. The temporary test fixture was removed.

## Visual update verification

Build and lint passed using the temporary Node 22 runtime (the system default
Node 10 is too old for this project's tools). Checked in Edge against the local
Vite app: all four help IDs/titles, one modal at a time, X, Lukk, Escape and
backdrop dismissal. Visually checked blue card headers, white answer areas,
the 375px drawer, overlay and restored help-button focus ring. Selecting Bokmål
still saved successfully and persisted through opening/closing help. Other
questions remained unchanged. Narrow layout and long-content scrolling are
implemented in CSS; they have not been separately checked in a mobile browser.
