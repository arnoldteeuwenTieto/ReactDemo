import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useState } from 'react'
import { grunnskoleSections } from './grunnskoleSections'

interface GrunnskoleNavigationProps {
  activeSection: number
  sectionIssueCounts: Record<number, number>
  onHome: () => void
  onSelectSection: (section: number) => void
}

export function GrunnskoleNavigation({
  activeSection,
  sectionIssueCounts,
  onHome,
  onSelectSection,
}: GrunnskoleNavigationProps) {
  useTranslation('ui')
  const [isOpen, setIsOpen] = useState(false)

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
            <li key={section.number}>
              <button
                className={`section-navigation-item${activeSection === section.number ? ' is-active' : ''}`}
                type="button"
                aria-current={activeSection === section.number ? 'page' : undefined}
                aria-describedby={activeSection !== section.number && sectionIssueCounts[section.number] > 0 ? `section-${section.number}-issues` : undefined}
                onClick={() => selectSection(section.number)}
              >
                <span className="section-navigation-number" aria-hidden="true">{section.number}</span>
                <span>{ui(section.title)}</span>
                {activeSection !== section.number && sectionIssueCounts[section.number] > 0 && <span className="section-issue-badge" aria-hidden="true">{sectionIssueCounts[section.number]}</span>}
              </button>
              {activeSection !== section.number && sectionIssueCounts[section.number] > 0 && <span className="visually-hidden" id={`section-${section.number}-issues`}>{ui('{{count}} problemer i seksjonen', { count: String(sectionIssueCounts[section.number]) })}</span>}
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  )
}
