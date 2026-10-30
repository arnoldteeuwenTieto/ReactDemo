import { useTranslation } from 'react-i18next'
import { useDemoUser } from '../demoUserContext'
import { ui } from '../i18n'
import { DemoUserHeader, type DemoUserHeaderProps } from './DemoUserHeader'
import { buildInfo } from '../buildInfo'

export interface SignedInUser { displayName: string; email?: string | null; role?: string | null }

// Only a real session owner may supply signedInUser. Never derive it from the
// selected demo profile. This prototype currently has no authenticated session.
export function AppHeader({ signedInUser = null, ...demoProps }: DemoUserHeaderProps & { signedInUser?: SignedInUser | null }) {
  useTranslation('ui')
  const { enabled } = useDemoUser()
  return <header className="site-header has-context-bar">
    <div className={`header-inner${enabled ? '' : ' header-inner--standard'}`}>
      <div className="header-title">
        <div className="brand-mark" aria-hidden="true">GSI</div>
        <div className="header-title-copy"><p className="eyebrow">{ui('Grunnskolens informasjonssystem')}</p><h1>{ui('Grunnskole')}</h1></div>
      </div>
      <DemoUserHeader {...demoProps} />
      <section className="header-build" aria-label={ui('Miljø og versjon')}>
        <dl>
          <div><dt>{ui('Miljø')}</dt><dd>{buildInfo.environment}</dd></div>
          <div><dt>{ui('Versjon')}</dt><dd>{buildInfo.version}</dd></div>
          <div><dt>{ui('Bygg')}</dt><dd>{buildInfo.buildNumber}</dd></div>
          <div><dt>{ui('Commit')}</dt><dd title={buildInfo.commitSha}>{buildInfo.shortCommitSha}</dd></div>
        </dl>
      </section>
      <section className="header-identity" aria-label={ui('Innlogget bruker')}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" focusable="false">
          <circle cx="12" cy="7" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" />
        </svg>
        <div className="header-identity-fields"><p className="header-identity-label">{ui(signedInUser ? 'Innlogget bruker' : 'Ingen innlogget bruker')}</p>
          <dl>
            <div><dt>{ui('Navn')}</dt><dd>{signedInUser?.displayName.trim() || ui('Ikke tilgjengelig')}</dd></div>
            <div><dt>{ui('E-post')}</dt><dd>{signedInUser?.email?.trim() || ui('Ikke tilgjengelig')}</dd></div>
            <div><dt>{ui('Rolle')}</dt><dd>{signedInUser?.role?.trim() || ui('Ikke tilgjengelig')}</dd></div>
          </dl>
        </div>
      </section>
    </div>
  </header>
}
