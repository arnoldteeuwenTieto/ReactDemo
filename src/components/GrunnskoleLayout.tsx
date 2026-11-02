import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import type { ReactNode } from 'react'
import { GrunnskoleNavigation } from './GrunnskoleNavigation'

interface GrunnskoleLayoutProps {
  activeSection: number
  sectionIssueCounts: Record<number, number>
  onHome: () => void
  onSelectSection: (section: number) => void
  children: ReactNode
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export function GrunnskoleLayout({
  activeSection,
  sectionIssueCounts,
  onHome,
  onSelectSection,
  children,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: GrunnskoleLayoutProps) {
  useTranslation('ui')
  return (
    <div className="section-layout">
      <GrunnskoleNavigation
        activeSection={activeSection}
        sectionIssueCounts={sectionIssueCounts}
        onHome={onHome}
        onSelectSection={onSelectSection}
      />
      <div className="section-content">
        <div className="section-body">{children}</div>
        <nav className="section-pagination" aria-label={ui("Forrige og neste skjerm")}>
          <button className="gsi-button open-button" type="button" onClick={onPrevious} disabled={!canGoPrevious}>
            <span aria-hidden="true">←</span> {ui("Forrige")} </button>
          <button className="gsi-button open-button" type="button" onClick={onNext} disabled={!canGoNext}>{ui("Neste")} <span aria-hidden="true">→</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
