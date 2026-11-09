import type { SectionApplicability } from './grunnskoleSections'
import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useState } from 'react'
import { grunnskoleSections } from './grunnskoleSections'

interface GrunnskoleNavigationProps {
  activeSection: number
  sectionIssueCounts: Record<number, number>
  onHome: () => void
  onSelectSection: (section: number) => void
  applicability: Record<number, SectionApplicability>
}

export function GrunnskoleNavigation({
  activeSection,
  sectionIssueCounts,
  onHome,
  onSelectSection,
  applicability,
}: GrunnskoleNavigationProps) {
  useTranslation('ui')
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedReason, setDismissedReason] = useState<number | null>(null)

  function goHome() {
    setIsOpen(false)
    onHome()
  }

  function selectSection(section: number) {
    setIsOpen(false)
    onSelectSection(section)
  }

  return (
    <aside className="section-navigation">
      <button
        className="section-navigation-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="grunnskole-section-menu"
        onClick={() => setIsOpen(open => !open)}
      >
        {isOpen ? ui("Skjul navigasjon") : ui("Vis navigasjon")}
      </button>
      <nav
        id="grunnskole-section-menu"
        className={`section-navigation-menu${isOpen ? ' is-open' : ''}`}
        aria-label={ui("Grunnskoleseksjoner")}
      >
        <button className="section-navigation-home" type="button" onClick={goHome}>
          <span aria-hidden="true">←</span>
          <span>{ui("Hjem")}</span>
        </button>
        <ol>
          {grunnskoleSections.map(section => (
            <li key={section.number} className={`section-navigation-entry${dismissedReason === section.number ? ' reason-dismissed' : ''}`}
              onMouseEnter={() => setDismissedReason(null)}
              onFocus={() => setDismissedReason(null)}
              onKeyDown={event => { if (event.key === 'Escape') setDismissedReason(section.number) }}>
              <button
                className={`section-navigation-item${activeSection === section.number ? ' is-active' : ''}${applicability[section.number].state === 'not-applicable' ? ' is-inapplicable' : ''}`}
                type="button"
                aria-disabled={applicability[section.number].state === 'not-applicable' || undefined}
                data-applicability={applicability[section.number].state}
                aria-current={activeSection === section.number ? 'page' : undefined}
                aria-describedby={[applicability[section.number].explanation ? `section-${section.number}-reason` : '', sectionIssueCounts[section.number] > 0 && applicability[section.number].state !== 'not-applicable' ? `section-${section.number}-issues` : ''].filter(Boolean).join(' ') || undefined}
                onClick={() => { if (applicability[section.number].state !== 'not-applicable') selectSection(section.number) }}
              >
                <span className="section-navigation-number" aria-hidden="true">{section.number}</span>
                <span>{ui(section.title)}</span>
                {applicability[section.number].state === 'unresolved' && <span aria-hidden="true">?</span>}
                {sectionIssueCounts[section.number] > 0 && applicability[section.number].state !== 'not-applicable' && <span className="section-issue-badge" aria-hidden="true">{sectionIssueCounts[section.number]}</span>}
              </button>
              {applicability[section.number].explanation && <span className="section-navigation-reason" role="tooltip" id={`section-${section.number}-reason`}>{ui(applicability[section.number].explanation!)}</span>}
              {sectionIssueCounts[section.number] > 0 && applicability[section.number].state !== 'not-applicable' && <span className="visually-hidden" id={`section-${section.number}-issues`}>{ui('{{count}} problemer i seksjonen', { count: String(sectionIssueCounts[section.number]) })}</span>}
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  )
}
