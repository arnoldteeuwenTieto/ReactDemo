import i18n, { gsi } from '../i18n'
import type { Language } from '../locales/gsi'
export interface HelpText {
  hjelpetekstId: string
  overskrift: string
  tekst: string
  format: 'text' | 'html'
}
export interface HelpTextService {
  getHelpText: (hjelpetekstId: string, language?: Language) => Promise<HelpText>
}
export const mockHelpTextService: HelpTextService = {
  async getHelpText(hjelpetekstId, language = i18n.language === 'nn' ? 'nn' : 'nb') {
    if (!i18n.exists(hjelpetekstId + '.text', { ns: 'gsi', lng: language })) throw new Error('Unknown help ID')
    return {
      hjelpetekstId,
      overskrift: gsi(hjelpetekstId + '.title', language),
      tekst: gsi(hjelpetekstId + '.text', language),
      format: gsi(hjelpetekstId + '.format', language) === 'html' ? 'html' : 'text',
    }
  },
}
