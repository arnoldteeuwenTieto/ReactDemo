import i18n from '../i18n'
import { mockGsiRecords, recordsToResources } from '../locales/gsi'
import type { GsiTranslationRecord, Language } from '../locales/gsi'

export interface GsiTranslationService {
  getTranslations: (language: Language) => Promise<GsiTranslationRecord[]>
}
export const mockGsiTranslationService: GsiTranslationService = {
  async getTranslations(language) {
    return mockGsiRecords.filter(record => record.language === language).map(record => ({ ...record }))
  },
}

// Future BOGIAPI adapters map their records to this interface. No HTTP backend
// is registered: current translations are bundled local demonstration records.
export async function loadGsiTranslations(service: GsiTranslationService) {
  const languages = ['nb', 'nn'] as const
  const records = await Promise.all(languages.map(language => service.getTranslations(language)))
  languages.forEach((language, index) => i18n.addResourceBundle(language, 'gsi', recordsToResources(records[index]), true, true))
}
