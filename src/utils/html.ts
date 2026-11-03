import DOMPurify from 'dompurify'

/** Makes CMS-authored HTML safe for v-html (drops scripts, event handlers, etc.). */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

/** Plain-text version of HTML for one-line previews. */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}
