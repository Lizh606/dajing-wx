// @ts-ignore
import Dialog from '../../../wxcomponents/vant/dialog/dialog'
import { resolveAppUiContext } from './mpContext'

export interface AppDialogOptions {
  cancelButtonText?: string
  closeOnClickOverlay?: boolean
  confirmButtonText?: string
  content?: string
  context?: any
  message?: string
  title?: string
}

function normalizeOptions(options: string | AppDialogOptions): Required<Pick<AppDialogOptions, 'cancelButtonText' | 'closeOnClickOverlay' | 'confirmButtonText' | 'title'>> & AppDialogOptions {
  if (typeof options === 'string') {
    return {
      cancelButtonText: '取消',
      closeOnClickOverlay: false,
      confirmButtonText: '确认',
      message: options,
      title: '',
    }
  }

  return {
    cancelButtonText: '取消',
    closeOnClickOverlay: false,
    confirmButtonText: '确认',
    title: '',
    ...options,
  }
}

function resolveMessage(options: AppDialogOptions) {
  return options.message ?? options.content ?? ''
}

export function showAppAlert(options: string | AppDialogOptions) {
  const normalized = normalizeOptions(options)
  const message = resolveMessage(normalized)

  // #ifdef MP-WEIXIN
  return Dialog.alert({
    closeOnClickOverlay: normalized.closeOnClickOverlay,
    confirmButtonText: normalized.confirmButtonText,
    context: resolveAppUiContext(normalized.context),
    message,
    title: normalized.title,
  })
  // #endif

  // #ifndef MP-WEIXIN
  return new Promise((resolve) => {
    uni.showModal({
      content: message,
      showCancel: false,
      success: () => resolve(true),
      title: normalized.title,
    })
  })
  // #endif
}

export function showAppConfirm(options: string | AppDialogOptions) {
  const normalized = normalizeOptions(options)
  const message = resolveMessage(normalized)

  // #ifdef MP-WEIXIN
  return Dialog.confirm({
    cancelButtonText: normalized.cancelButtonText,
    closeOnClickOverlay: normalized.closeOnClickOverlay,
    confirmButtonText: normalized.confirmButtonText,
    context: resolveAppUiContext(normalized.context),
    message,
    title: normalized.title,
  })
  // #endif

  // #ifndef MP-WEIXIN
  return new Promise((resolve, reject) => {
    uni.showModal({
      cancelText: normalized.cancelButtonText,
      confirmText: normalized.confirmButtonText,
      content: message,
      success: (result) => {
        if (result.confirm) {
          resolve(true)
          return
        }

        reject(result)
      },
      title: normalized.title,
    })
  })
  // #endif
}

export function closeAppDialog() {
  // #ifdef MP-WEIXIN
  Dialog.close()
  // #endif
}
