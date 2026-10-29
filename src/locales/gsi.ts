import { nbHelpTexts } from './gsiHelp'
export type Language = 'nb' | 'nn'
export interface GsiTranslationRecord {
  id: string
  language: Language
  text: string
  kind: 'question' | 'answer' | 'help' | 'heading'
  title?: string
  format?: 'text' | 'html'
  demonstration: boolean
}

const questions = [
  ['GG-H82.question', 'A. Enhet', 'A. Eining'],
  ['GG_227_Skolens_Maalform', 'A. Skolens målform', 'A. Målforma til skulen'],
  ['GG_228_Laveste_Trinn_Paa_Skolen', 'B. Hva er normalt laveste trinn ved skolen?', 'B. Kva er normalt lågaste trinn ved skulen?'],
  ['GG_229_Hoeyeste_Trinn_Paa_Skolen', 'C. Hva er normalt høyeste trinn ved skolen?', 'C. Kva er normalt høgaste trinn ved skulen?'],
  ['GG_230_Tilbyr_SFO', 'D. Har skolen tilbud om SFO?', 'D. Har skulen tilbod om SFO?'],
] as const
const answers = [
  ['GG_227_Skolens_Maalform:Bokmål', 'Bokmål', 'Bokmål'],
  ['GG_227_Skolens_Maalform:Nynorsk', 'Nynorsk', 'Nynorsk'],
  ['GG_227_Skolens_Maalform:Samisk', 'Samisk', 'Samisk'],
  ['GG_227_Skolens_Maalform:Annet', 'Annet', 'Anna'],
  ['GG_230_Tilbyr_SFO:true', 'Ja', 'Ja'],
  ['GG_230_Tilbyr_SFO:false', 'Nei', 'Nei'],
] as const

const nnHelp = [
  ['GG-H82', 'Eining', 'Demonstrasjonstekst: Her blir opplysningar om vald skule viste. Sida er skriveverna. Namn og kommune byggjer på dei fiktive skuledataa i appen.\n\nManglande opplysningar blir viste som «Ikkje tilgjengeleg». Dette er ein plasshaldar, ikkje offisiell GSI-rettleiing. Ingen opplysningar blir henta frå eller lagra i NSR.', 'text'],
  ['GG-H83', 'Målforma til skulen', 'Demonstrasjonstekst: Vel målforma til skulen: Bokmål, Nynorsk, Samisk eller Anna.\n\nDette er ein plasshaldar, ikkje offisiell GSI-rettleiing.\nLinjeskift blir bevarte i denne teksten.', 'text'],
  ['GG-H84', 'Lågaste trinn ved skulen', '<p><strong>Demonstrasjonstekst</strong> – dette er ein plasshaldar, ikkje offisiell GSI-rettleiing.</p><h3>Vel lågaste trinn</h3><p>Vel det normalt <em>lågaste trinnet</em> ved skulen.</p><ul><li>Vel eit trinn frå lista.</li><li>Kontroller svaret mot det høgaste trinnet ved skulen.</li></ul><h3>Døme</h3><table><caption>Fiktive døme for demonstrasjon</caption><thead><tr><th scope="col">Skule</th><th scope="col">Lågaste trinn</th></tr></thead><tbody><tr><td>Barneskule</td><td>1. trinn</td></tr><tr><td>Ungdomsskule</td><td>8. trinn</td></tr></tbody></table><p>Sjå <a href="https://www.udir.no/" title="Utdanningsdirektoratet">nettstaden til Utdanningsdirektoratet</a> for generell informasjon.</p>', 'html'],
  ['GG-H85', 'Høgaste trinn ved skulen', 'Demonstrasjonstekst: Vel det normalt høgaste trinnet ved skulen. I demonstrasjonen må høgaste trinn vere større enn eller lik lågaste trinn. Dette er ein plasshaldar, ikkje offisiell GSI-rettleiing.', 'text'],
  ['GG-H86', 'Har skulen tilbod om SFO?', 'Demonstrasjonstekst: Vel Ja eller Nei for tilbodet om skulefritidsordning (SFO). Dette er ein plasshaldar, ikkje offisiell GSI-rettleiing.', 'text'],
] as const

export const mockGsiRecords: GsiTranslationRecord[] = (['nb', 'nn'] as const).flatMap(language => {
  const index = language === 'nb' ? 1 : 2
  const records: GsiTranslationRecord[] = [
    ...questions.map(row => ({ id: row[0], language, text: row[index], kind: 'question' as const, demonstration: true })),
    ...answers.map(row => ({ id: row[0], language, text: row[index], kind: 'answer' as const, demonstration: true })),
  ]
  for (const field of ['GG_228_Laveste_Trinn_Paa_Skolen', 'GG_229_Hoeyeste_Trinn_Paa_Skolen']) {
    for (let grade = 1; grade <= 10; grade++) records.push({ id: `${field}:${grade}`, language, text: `${grade}. trinn`, kind: 'answer', demonstration: true })
  }
  const help = language === 'nb' ? Object.values(nbHelpTexts).map(entry => ({ id: entry.hjelpetekstId, title: entry.overskrift, text: entry.tekst, format: entry.format }))
    : nnHelp.map(([id, title, text, format]) => ({ id, title, text, format }))
  records.push(...help.map(entry => ({ ...entry, language, kind: 'help' as const, demonstration: true })))
  // These source IDs are retained without assigning undocumented official meanings.
  for (const id of ['GG_H5', 'GG_H6']) records.push({ id, language, kind: 'heading', demonstration: true, text: `${language === 'nb' ? 'Demonstrasjonstekst' : 'Demonstrasjonstekst'} ${id}` })
  return records
})

export function recordsToResources(records: GsiTranslationRecord[]): Record<string, string> {
  return Object.fromEntries(records.flatMap(record => record.kind === 'help'
    ? [[`${record.id}.title`, record.title ?? ''], [`${record.id}.text`, record.text], [`${record.id}.format`, record.format ?? 'text']]
    : [[record.id, record.text]]))
}
