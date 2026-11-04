import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ui } from '../i18n'

// A focusable explanation for native disabled controls, without expanding rows.
export function FieldAvailability({ id, label, reason }: { id: string; label: string; reason: string }) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  useEffect(() => {
    if (!anchor) return
    const close = () => setAnchor(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close) }
  }, [anchor])
  return <>
    <span className="visually-hidden" id={id}>{reason}</span>
    <button className="field-rule-info" type="button" aria-label={`${ui('Hvorfor er feltet utilgjengelig?')} ${label}`} aria-describedby={id}
      onFocus={event => setAnchor(event.currentTarget.getBoundingClientRect())} onBlur={() => setAnchor(null)}
      onMouseEnter={event => setAnchor(event.currentTarget.getBoundingClientRect())}
      onMouseLeave={event => { if (document.activeElement !== event.currentTarget) setAnchor(null) }}
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setAnchor(null) } }}
      onClick={event => setAnchor(event.currentTarget.getBoundingClientRect())}>
      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M6 8V5a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
    </button>
    {anchor && createPortal(<div role="tooltip" className="field-rule-tooltip" style={{
      left: Math.max(8, Math.min(anchor.right - 280, window.innerWidth - 288)),
      top: anchor.bottom + 108 > window.innerHeight ? Math.max(8, anchor.top - 100) : anchor.bottom + 8,
    }}>{reason}</div>, document.body)}
  </>
}
