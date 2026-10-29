import DOMPurify from 'dompurify'
import type { HelpText } from '../services/helpTextService'

type HelpTextContentProps = Pick<HelpText, 'tekst' | 'format'>

export function HelpTextContent({ tekst, format }: HelpTextContentProps) {
  if (format !== 'html') {
    // React escapes plain text; HTML-looking text remains literal text.
    return <div className="help-text-content help-text-plain">{tekst}</div>
  }

  // Only this sanitized result reaches innerHTML. No database styles, classes,
  // event handlers, scripts, frames, forms, SVG or other active content allowed.
  const sanitizedHtml = DOMPurify.sanitize(tekst, {
    ALLOWED_TAGS: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a',
      'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'scope', 'colspan', 'rowspan', 'start'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    // DOMPurify also filters unsafe URL protocols such as javascript:.
  })

  return <div className="help-text-content help-text-html" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}
