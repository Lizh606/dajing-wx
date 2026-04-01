// @ts-ignore
import Toast from '../../../wxcomponents/vant/toast/toast'

export interface AppToastOptions {
  context?: any
  duration?: number
  forbidClick?: boolean
  icon?: 'success' | 'none' | 'error' | 'fail' | 'loading'
  mask?: boolean
  message?: string
  position?: 'top' | 'middle' | 'bottom'
  title?: string
}

function normalizeOptions(options: string | AppToastOptions): Required<Pick<AppToastOptions, 'duration' | 'forbidClick' | 'mask' | 'position'>> & AppToastOptions {
  if (typeof options === 'string') {
    return {
      duration: 2000,
      forbidClick: false,
      mask: false,
      message: options,
      position: 'middle',
    }
  }

  return {
    duration: 2000,
    forbidClick: false,
    mask: false,
    position: 'middle',
    ...options,
  }
}

function resolveMessage(options: AppToastOptions) {
  return options.message ?? options.title ?? ''
}

function resolveType(icon: AppToastOptions['icon']) {
  if (icon === 'success') {
    return 'success'
  }

  if (icon === 'error' || icon === 'fail') {
    return 'fail'
  }

  if (icon === 'loading') {
    return 'loading'
  }

  return 'text'
}

export function showAppToast(options: string | AppToastOptions) {
  const normalized = normalizeOptions(options)
  const message = resolveMessage(normalized)

  // #ifdef MP-WEIXIN
  return Toast({
    context: normalized.context,
    duration: normalized.duration,
    forbidClick: normalized.forbidClick,
    mask: normalized.mask,
    message,
    position: normalized.position,
    type: resolveType(normalized.icon),
  })
  // #endif

  // #ifndef MP-WEIXIN
  let position: 'top' | 'center' | 'bottom' = 'center'

  if (normalized.position === 'top') {
    position = 'top'
  } else if (normalized.position === 'bottom') {
    position = 'bottom'
  }

  uni.showToast({
    duration: normalized.duration,
    icon: normalized.icon === 'success' ? 'success' : normalized.icon === 'loading' ? 'loading' : 'none',
    mask: normalized.mask,
    position,
    title: message,
  })
  return undefined
  // #endif
}

export function showSuccessToast(message: string, options: Omit<AppToastOptions, 'icon' | 'message' | 'title'> = {}) {
  return showAppToast({ ...options, icon: 'success', message })
}

export function showFailToast(message: string, options: Omit<AppToastOptions, 'icon' | 'message' | 'title'> = {}) {
  return showAppToast({ ...options, icon: 'fail', message })
}

export function showLoadingToast(message = '加载中...', options: Omit<AppToastOptions, 'icon' | 'message' | 'title'> = {}) {
  return showAppToast({ ...options, duration: 0, icon: 'loading', message })
}

export function clearAppToast() {
  // #ifdef MP-WEIXIN
  Toast.clear()
  // #endif
}
