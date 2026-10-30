import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'

interface FooterLink { label: string; href?: string }
// Add real URLs here when available. Unconfigured links do not navigate.
const footerLinks: FooterLink[] = ['Om GSI', 'Kontakt', 'Personsvernerklæring', 'Tilgjengelighetserklæring'].map(label => ({ label }))

export function AppFooter() {
  useTranslation('ui')
  return <footer className="app-footer">
    <div className="app-footer-inner">
      <nav aria-label={ui('Lenker i bunntekst')}>
        {footerLinks.map(link => <a key={link.label} href={link.href} role={link.href ? undefined : 'link'}
          aria-disabled={link.href ? undefined : true} tabIndex={link.href ? undefined : 0}>{link.label}</a>)}
      </nav>
      <span className="footer-logo-placeholder" aria-label={ui('Plassholder for fremtidig logo')}>{ui('Logo')}</span>
    </div>
  </footer>
}
