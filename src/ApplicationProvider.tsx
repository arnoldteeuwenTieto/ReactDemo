import { useEffect, useState, type ReactNode } from 'react'
import { ApplicationContext } from './applicationContext'
import { createApplicationConfiguration, initializeApplication, type ApplicationConfiguration } from './services/applicationInitialization'
import { demoUsersEnabled } from './demoUserContext'
import { buildInfo } from './buildInfo'
import { useTranslation } from 'react-i18next'
import { ui } from './i18n'

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation('ui')
  const [configuration, setConfiguration] = useState<ApplicationConfiguration | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    void initializeApplication({ async load() {
      return createApplicationConfiguration({ environment: buildInfo.environment, year: import.meta.env.VITE_REPORTING_YEAR,
        startsAt: import.meta.env.VITE_REPORTING_START, endsAt: import.meta.env.VITE_REPORTING_END,
        newFeature: import.meta.env.VITE_ENABLE_NEW_FEATURE === 'true', demoPeriodOverride: import.meta.env.VITE_ALLOW_DEMO_PERIOD_OVERRIDE === 'true', demoEnabled: demoUsersEnabled })
    } }).then(result => { if (active) setConfiguration(result) }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Kunne ikke starte applikasjonen.') })
    return () => { active = false }
  }, [])
  if (error) return <main><p role="alert">{ui(error)}</p></main>
  if (!configuration) return <main><p role="status">{ui('Starter applikasjonen…')}</p></main>
  return <ApplicationContext.Provider value={{ ...configuration, language: i18n.language === 'nn' ? 'nn' : 'nb' }}>{children}</ApplicationContext.Provider>
}
