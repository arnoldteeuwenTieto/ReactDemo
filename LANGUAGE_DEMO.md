# Bokmål / Nynorsk

`src/i18n.ts` initializes i18next/react-i18next with bundled `nb` and `nn`
resources and Bokmål fallback. No HTTP translation backend is registered.
`LanguageSwitch.tsx` adds the segmented switch to the Status overview and calls
`i18n.changeLanguage`. The app remains mounted; language is never part of a
school, section, question or form-state React key.

The preference is stored in localStorage as `gsi-demo-language` and restored
on startup. Unsupported/missing preferences use Bokmål. Disabled localStorage
does not prevent language switching. The document's `lang` follows the selection.

## Translation sources

- `src/locales/ui.ts`: static React UI labels, screen/navigation titles, buttons,
  filters, accessibility text, demo validation and save messages. Bokmål wording
  is used as the stable key; Nynorsk wording is a separate resource dictionary.
- `src/locales/gsi.ts`: dynamic demonstration question/answer/help records keyed
  by GSI identifier, with language, kind, text, optional title/format and a
  demonstration flag. `gsiHelp.ts` keeps the existing Bokmål help examples.
  GG-H82–GG-H86 have both languages; GG-H83 is plain text and GG-H84 is HTML.
- `src/services/gsiTranslationService.ts`: `GsiTranslationService.getTranslations`
  and a mock implementation. `loadGsiTranslations(service)` maps records into the
  `gsi` i18next namespace. A future BOGIAPI adapter implements this interface and
  loads its records before rendering. No database or real API is used today.
- `src/services/helpTextService.ts`: reads localized help records and retains the
  injectable HelpTextService contract. HelpDrawer refetches for the new language
  without remounting the modal. HelpTextContent still sanitizes HTML through the
  existing DOMPurify allowlist.

The exact field IDs remain unchanged, including GG_227_Skolens_Maalform and
GG_228_Laveste_Trinn_Paa_Skolen. Answer record keys append the existing stored
value to the field ID, e.g. `GG_227_Skolens_Maalform:Annet` or
`GG_230_Tilbyr_SFO:false`. Only labels change: `Annet` displays as `Anna` in
Nynorsk, but the stored answer remains `Annet`. Boolean SFO and numeric grades
also keep their original types and values.

`GG-H82.question` is a frontend question subkey associated with the existing
help ID; it is not presented as a new official GSI field. GG_H5/GG_H6 are retained
as clearly marked sample records, without assigning undocumented meanings.
All unavailable official wording is demonstration content, identified in the
page footer and help texts. No official validation formulas were invented.

## State and diagnostics

School/report identity, form status, filter values, sort state, answer state,
save queues and the mock store keep their original data. Only displayed labels
are translated. The API Debug JSON remains raw diagnostic data with unchanged
payload values, identifiers and simulated responses.

`ui()` and `gsi()` log each missing current-language key once in development,
including keys that successfully fall back to Bokmål. Look for `[i18n] Missing
translation` in the development console. Missing Nynorsk resources use the
Bokmål resource, not a guessed translation.

## Verification

Production build and lint were run. Automated DOM regression checks passed for
overview labels/counts, stable filter values, Nynorsk Introduction/Del 1/Del 2,
sections 3–9 navigation, validation/save labels, an entered målform retained
across language changes, unchanged school/section/status, plain and HTML help
in both languages, updating an already-open help drawer, Bokmål fallback,
preserved IDs and zero additional save calls from language/help changes.
A fresh initialization check verified persisted Nynorsk selection restoration.
Checks used temporary jsdom files/dependencies, not production dependencies.
Native browser verification stopped because the tool could not establish the
current URL confidently; no further browser automation was attempted.
