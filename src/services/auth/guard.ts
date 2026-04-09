import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

export function ensureLoggedInForSubmitAction(message = '请先登录') {
  const userStore = useUserStore()

  if (userStore.isLoggedIn) {
    return true
  }

  showAppToast({ message, icon: 'none' })
  return false
}
