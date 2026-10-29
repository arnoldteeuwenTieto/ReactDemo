import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { nbUi, nnUi } from './locales/ui'
import { mockGsiRecords, recordsToResources } from './locales/gsi'

export const languageStorageKey = 'gsi-demo-language'
function savedLanguage() {
  try { return localStorage.getItem(languageStorageKey) === 'nn' ? 'nn' : 'nb' } catch { return 'nb' }
}

void i18n.use(initReactI18next).init({
  lng: savedLanguage(), fallbackLng: 'nb', supportedLngs: ['nb', 'nn'],
  ns: ['ui', 'gsi'], defaultNS: 'ui', keySeparator: false, nsSeparator: false,
  initAsync: false,
  react: { bindI18nStore: 'added removed' },
  interpolation: { escapeValue: false },
  resources: {
    nb: { ui: nbUi, gsi: recordsToResources(mockGsiRecords.filter(record => record.language === 'nb')) },
    nn: { ui: nnUi, gsi: recordsToResources(mockGsiRecords.filter(record => record.language === 'nn')) },
  },
})

function persistLanguage(language: string) {
  document.documentElement.lang = language
  try { localStorage.setItem(languageStorageKey, language) } catch { /* Storage can be disabled. */ }
}
persistLanguage(i18n.language)
i18n.on('languageChanged', persistLanguage)

const warned = new Set<string>()
function reportMissing(namespace: string, key: string, language = i18n.language) {
  if (import.meta.env.DEV && i18n.getResource(language, namespace, key) === undefined) {
    const id = `${language}/${namespace}/${key}`
    if (!warned.has(id)) { warned.add(id); console.warn(`[i18n] Missing translation: ${id}; falling back to Bokmål.`) }
  }
}
export function ui(key: string, options?: Record<string, string | number>) {
  reportMissing('ui', key)
  return i18n.t(key, { ns: 'ui', ...options })
}
export function gsi(key: string, language = i18n.language) {
  reportMissing('gsi', key, language)
  return i18n.t(key, { ns: 'gsi', lng: language })
}
export default i18n
