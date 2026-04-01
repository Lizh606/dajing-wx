import type { InjectionKey } from 'vue'

export type StyleObject = Record<string, string | number | null | undefined>
export type StyleValue = string | StyleObject | undefined

export interface AppTabMeta {
  uid: number
  name: string | number
  title: string
  disabled: boolean
}

export interface AppTabsContext {
  upsertTab: (tab: AppTabMeta) => void
  removeTab: (uid: number) => void
  isActive: (name: string | number) => boolean
}

export const APP_TABS_CONTEXT: InjectionKey<AppTabsContext> = Symbol('app-tabs-context')

export function extractEventDetail<T = any>(event: any): T {
  if (event && typeof event === 'object' && 'detail' in event) {
    return event.detail as T
  }

  return event as T
}

export function extractEventValue<T = any>(event: any): T {
  const detail = extractEventDetail<any>(event)

  if (detail && typeof detail === 'object' && 'value' in detail) {
    return detail.value as T
  }

  return detail as T
}

export function toUnit(value?: string | number | null): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (token) => `-${token.toLowerCase()}`)
}

export function stringifyStyle(style?: StyleValue): string {
  if (!style) {
    return ''
  }

  if (typeof style === 'string') {
    return style
  }

  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${toKebabCase(key)}: ${value}`)
    .join('; ')
}
