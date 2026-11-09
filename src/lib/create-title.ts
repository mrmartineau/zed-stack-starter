import { CONTENT, TITLE_SEPARATOR } from '@/constants'

/**
 * Builds a document title: `"<page> — <app name>"`, or the app name alone.
 * `pageName` is a `CONTENT` key, or plain text when it is not one.
 */
export const createTitle = (pageName?: string) => {
  if (!pageName) return CONTENT.appName
  const pageTitle =
    pageName in CONTENT ? CONTENT[pageName as keyof typeof CONTENT] : pageName
  return `${pageTitle}${TITLE_SEPARATOR}${CONTENT.appName}`
}
