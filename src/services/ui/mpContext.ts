const APP_UI_PROVIDER_SELECTOR = '#app-ui-provider'

function resolveProvidedContext(context?: unknown) {
  return typeof context === 'function' ? context() : context
}

function getCurrentPageContext() {
  if (typeof getCurrentPages !== 'function') {
    return null
  }

  const pages = getCurrentPages()
  return pages[pages.length - 1] ?? null
}

export function resolveAppUiContext(context?: unknown) {
  const providedContext = resolveProvidedContext(context)

  if (providedContext) {
    return providedContext
  }

  const page = getCurrentPageContext()

  const pageWithSelector = page as { selectComponent?: (selector: string) => unknown } | null

  if (!pageWithSelector || typeof pageWithSelector.selectComponent !== 'function') {
    return page
  }

  return pageWithSelector.selectComponent(APP_UI_PROVIDER_SELECTOR) ?? page
}
