import sanitizeHtml from 'sanitize-html'

export function sanitizeInput(text: string | null | undefined): string {
  if (!text) return ''
  
  // Strip ALL HTML tags
  // Allow zero HTML in error inputs
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {}
  })
}

export function sanitizeEntry(data: {
  errorText?: string
  fixText?: string
  stackTrace?: string
  notes?: string
  appName?: string
  pageTitle?: string
}) {
  return {
    errorText: sanitizeInput(data.errorText),
    fixText: sanitizeInput(data.fixText),
    stackTrace: sanitizeInput(data.stackTrace),
    notes: sanitizeInput(data.notes),
    appName: sanitizeInput(data.appName),
    pageTitle: sanitizeInput(data.pageTitle)
  }
}
