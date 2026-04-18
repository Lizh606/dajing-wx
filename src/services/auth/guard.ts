import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const LOGIN_PAGE_PATH = '/pages/auth/login'

function getCurrentRoute() {
  try {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1] as { route?: string } | undefined
    return current?.route ? `/${current.route}` : ''
  } catch {
    return ''
  }
}

function navigateToLoginPage() {
  if (getCurrentRoute() === LOGIN_PAGE_PATH) {
    return
  }

  uni.navigateTo({
    fail: () => {
      uni.reLaunch({ url: LOGIN_PAGE_PATH })
    },
    url: LOGIN_PAGE_PATH,
  })
}

export function ensureLoggedInForSubmitAction(
  message = '请先登录',
  options?: {
    redirectToLogin?: boolean
  },
) {
  const userStore = useUserStore()

  if (userStore.isLoggedIn) {
    return true
  }

  showAppToast({ message, icon: 'none' })

  if (options?.redirectToLogin ?? true) {
    setTimeout(() => {
      navigateToLoginPage()
    }, 80)
  }

  return false
}
