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
        {isOpen ? 'Skjul navigasjon' : 'Vis navigasjon'}
      </button>
      <nav
        id="grunnskole-section-menu"
        className={`section-navigation-menu${isOpen ? ' is-open' : ''}`}
        aria-label="Grunnskoleseksjoner"
      >
        <button className="section-navigation-home" type="button" onClick={goHome}>
          <span aria-hidden="true">←</span>
          <span>Hjem</span>
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
                <span>{section.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  )
}
