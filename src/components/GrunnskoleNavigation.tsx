import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useState } from 'react'
import { grunnskoleSections } from './grunnskoleSections'

interface GrunnskoleNavigationProps {
  activeSection: number
  onHome: () => void
  onSelectSection: (section: number) => void
}

export function GrunnskoleNavigation({
  activeSection,
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
                onClick={() => selectSection(section.number)}
              >
                <span className="section-navigation-number" aria-hidden="true">{section.number}</span>
                <span>{ui(section.title)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  )
}
