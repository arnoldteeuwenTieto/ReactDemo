export interface HelpText {
  hjelpetekstId: string
  overskrift: string
  tekst: string
  format: 'text' | 'html'
}

export interface HelpTextService {
  getHelpText: (hjelpetekstId: string) => Promise<HelpText>
}

const helpTexts: Record<string, HelpText> = {
  'GG-H82': {
    hjelpetekstId: 'GG-H82', overskrift: 'Enhet', format: 'text',
    tekst: 'Demonstrasjonstekst: Her vises opplysninger om valgt skole. Siden er skrivebeskyttet. Navn og kommune i demoen bygger på de fiktive skoledataene som allerede finnes i appen.\n\nManglende opplysninger vises som «Ikke tilgjengelig». Dette er en plassholder og ikke offisiell GSI-veiledning. Ingen opplysninger hentes fra eller lagres i NSR.',
  },
  'GG-H83': {
    hjelpetekstId: 'GG-H83', overskrift: 'Skolens målform',
    format: 'text',
    tekst: 'Demonstrasjonstekst: Velg skolens målform blant alternativene Bokmål, Nynorsk, Samisk og Annet.\n\nDette er en plassholder og ikke den offisielle veiledningen fra GSI.\nLinjeskift beholdes i denne teksten.',
  },
  'GG-H84': {
    hjelpetekstId: 'GG-H84', overskrift: 'Laveste trinn ved skolen',
    format: 'html',
    tekst: `<p><strong>Demonstrasjonstekst</strong> – dette er en plassholder, ikke offisiell GSI-veiledning.</p>
      <h3>Velg laveste trinn</h3>
      <p>Velg det normalt <em>laveste trinnet</em> ved skolen.</p>
      <ul><li>Velg et trinn fra listen.</li><li>Kontroller svaret mot skolens høyeste trinn.</li></ul>
      <h3>Eksempler</h3>
      <table><caption>Fiktive eksempler for demonstrasjon</caption>
        <thead><tr><th scope="col">Skole</th><th scope="col">Laveste trinn</th></tr></thead>
        <tbody><tr><td>Barneskole</td><td>1. trinn</td></tr><tr><td>Ungdomsskole</td><td>8. trinn</td></tr></tbody>
      </table>
      <p>Se <a href="https://www.udir.no/" title="Utdanningsdirektoratet">Utdanningsdirektoratets nettsted</a> for generell informasjon.</p>`,
  },
  'GG-H85': {
    hjelpetekstId: 'GG-H85', overskrift: 'Høyeste trinn ved skolen',
    format: 'text',
    tekst: 'Demonstrasjonstekst: Velg det normalt høyeste trinnet ved skolen. I denne demonstrasjonen må høyeste trinn være større enn eller lik laveste trinn. Dette er en plassholder og ikke den offisielle veiledningen fra GSI.',
  },
  'GG-H86': {
    hjelpetekstId: 'GG-H86', overskrift: 'Har skolen tilbud om SFO?',
    format: 'text',
    tekst: 'Demonstrasjonstekst: Velg Ja eller Nei for skolens tilbud om skolefritidsordning (SFO). Dette er en plassholder og ikke den offisielle veiledningen fra GSI.',
  },
}

// Replace this implementation (or inject another service into HelpDrawer) for an API.
// QuestionCard only reports the requested help ID and never depends on the service.
export const mockHelpTextService: HelpTextService = {
  async getHelpText(hjelpetekstId) {
    const entry = helpTexts[hjelpetekstId]
    if (!entry) throw new Error('Hjelpeteksten er ikke tilgjengelig.')
    return { ...entry }
  },
}
