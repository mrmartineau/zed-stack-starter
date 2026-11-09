import { CONTENT, TITLE_SEPARATOR } from '@/constants'

/**
 * Builds a document title: `"<page> — <app name>"`, or the app name alone.
 * `pageName` is a `CONTENT` key, or plain text when it is not one.
 */
export const createTitle = (pageName?: string) => {
  if (!pageName) return CONTENT.appName
  // Object.hasOwn, not `in`: `in` also matches inherited names like `toString`.
  const pageTitle = Object.hasOwn(CONTENT, pageName)
    ? CONTENT[pageName as keyof typeof CONTENT]
    : pageName
  return `${pageTitle}${TITLE_SEPARATOR}${CONTENT.appName}`
}
