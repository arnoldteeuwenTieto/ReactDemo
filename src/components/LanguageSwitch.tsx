import { useTranslation } from 'react-i18next'

export function LanguageSwitch() {
  const { t, i18n } = useTranslation('ui')
  return <div className="language-switch" role="group" aria-label={t('Språk')}>
    {(['nb', 'nn'] as const).map(language => <button key={language} type="button" lang={language}
      aria-pressed={i18n.resolvedLanguage === language} onClick={() => { void i18n.changeLanguage(language) }}>
      {language === 'nb' ? 'Bokmål' : 'Nynorsk'}
    </button>)}
  </div>
}
