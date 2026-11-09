import type { Del2Data } from '../domain/del2'

export const grunnskoleSections = [
  { number: 1, title: 'Enhetsopplysninger' },
  { number: 2, title: 'Om skolen' },
  { number: 3, title: 'Elever og timer' },
  { number: 4, title: 'Årstimer' },
  { number: 5, title: 'Lærere og assistenter' },
  { number: 6, title: 'Årsverk og ansatte' },
  { number: 7, title: 'Spesialundervisning' },
  { number: 8, title: 'Særskilt språkopplæring' },
  { number: 9, title: 'Opplæringsspråk' },
  { number: 10, title: 'Fremmedspråk, fordypning eller arbeidslivsfag' },
  { number: 11, title: 'Valgfag' },
  { number: 12, title: 'Fysisk aktivitet og leksehjelp' },
  { number: 13, title: 'Andre opplysninger' },
  { number: 14, title: 'Skolefritidsordningen (SFO)' },
  { number: 15, title: 'Pedagogisk-psykologisk tjeneste (PPT)' },
  { number: 16, title: 'Fordrevne ukrainske elever' },
  { number: 17, title: 'Kontroller' },
  { number: 18, title: 'Fullfør' },
] as const

export type SectionApplicability = { state: 'available' | 'unresolved' | 'not-applicable'; explanation?: string }
// Whole-section applicability is independent of user access and group visibility.
export function sectionApplicability(section: number, del2: Del2Data | null): SectionApplicability {
  if (section !== 14) return { state: 'available' }
  if (del2?.GG_230_Tilbyr_SFO === true) return { state: 'available' }
  if (del2?.GG_230_Tilbyr_SFO === false) return { state: 'not-applicable', explanation: 'Del 14 er ikke aktuell fordi skolen ikke tilbyr SFO (se Del 2).' }
  return { state: 'unresolved', explanation: 'SFO-tilbudet er ikke avklart. Velg Ja eller Nei i Del 2.' }
}
