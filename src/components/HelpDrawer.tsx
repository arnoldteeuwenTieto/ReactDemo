import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { mockHelpTextService } from '../services/helpTextService'
import type { HelpText, HelpTextService } from '../services/helpTextService'
import { HelpTextContent } from './HelpTextContent'

interface HelpDrawerProps {
  helpId: string
  onClose: () => void
  returnFocusTo: HTMLButtonElement
  service?: HelpTextService
}

// Mount one drawer for the active help ID. Native modal dialog provides focus
// containment and makes the rest of the document inert, including for AT users.
export function HelpDrawer({ helpId, onClose, returnFocusTo, service = mockHelpTextService }: HelpDrawerProps) {
  const { i18n } = useTranslation('ui')
  const language = i18n.language === 'nn' ? 'nn' : 'nb'
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [loaded, setEntry] = useState<{ entry: HelpText; language: string } | null>(null)
  const entry = loaded?.language === language ? loaded.entry : null
  const [errorLanguage, setError] = useState<string | null>(null)
  const error = errorLanguage === language

  useEffect(() => {
    const dialog = dialogRef.current!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    closeRef.current?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (returnFocusTo.isConnected) returnFocusTo.focus({ preventScroll: true })
    }
  }, [returnFocusTo])

  useEffect(() => {
    let cancelled = false
    service.getHelpText(helpId, language).then(result => {
      if (!cancelled) { setEntry({ entry: result, language }); setError(null) }
    }).catch(() => { if (!cancelled) setError(language) })
    return () => { cancelled = true }
  }, [helpId, service, language])

  return createPortal(<dialog ref={dialogRef} className="help-drawer" aria-labelledby={titleId} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
    <div className="help-drawer-shell">
      <header className="help-drawer-header">
        <p>{ui("Hjelpetekst")}</p>
        <button ref={closeRef} type="button" className="help-drawer-close" aria-label={ui("Lukk hjelpetekst")} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      </header>
      <div className="help-drawer-content" tabIndex={0}>
        <p className="help-drawer-id">{helpId} {ui("· Demonstrasjon")}</p>
        <h2 id={titleId}>{entry?.overskrift ?? ui("Hjelpetekst")}</h2>
        {error ? <p role="status">{ui("Hjelpeteksten kunne ikke hentes. Lukk panelet og prøv igjen.")}</p> : entry ? <HelpTextContent tekst={entry.tekst} format={entry.format} /> : <p role="status">{ui("Henter hjelpetekst...")}</p>}
      </div>
      <footer className="help-drawer-footer"><button type="button" onClick={onClose}>{ui("Lukk")}</button></footer>
    </div>
  </dialog>, document.body)
}
