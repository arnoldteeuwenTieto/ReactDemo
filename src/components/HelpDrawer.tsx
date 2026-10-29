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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [entry, setEntry] = useState<HelpText | null>(null)
  const [error, setError] = useState(false)

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
    service.getHelpText(helpId).then(result => {
      if (!cancelled) setEntry(result)
    }).catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [helpId, service])

  return createPortal(<dialog ref={dialogRef} className="help-drawer" aria-labelledby={titleId} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
    <div className="help-drawer-shell">
      <header className="help-drawer-header">
        <p>Hjelpetekst</p>
        <button ref={closeRef} type="button" className="help-drawer-close" aria-label="Lukk hjelpetekst" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      </header>
      <div className="help-drawer-content" tabIndex={0}>
        <p className="help-drawer-id">{helpId} · Demonstrasjon</p>
        <h2 id={titleId}>{entry?.overskrift ?? 'Hjelpetekst'}</h2>
        {error ? <p role="status">Hjelpeteksten kunne ikke hentes. Lukk panelet og prøv igjen.</p> : entry ? <HelpTextContent tekst={entry.tekst} format={entry.format} /> : <p role="status">Henter hjelpetekst...</p>}
      </div>
      <footer className="help-drawer-footer"><button type="button" onClick={onClose}>Lukk</button></footer>
    </div>
  </dialog>, document.body)
}
