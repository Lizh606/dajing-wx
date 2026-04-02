import { defineStore } from 'pinia'

type UserType = 'personal' | 'enterprise'

interface UserState {
  avatar: string
  company: string
  isLoggedIn: boolean
  nickname: string
  userType: UserType
}

const USER_STORAGE_KEY = 'dajing-user-state'

function getDefaultState(): UserState {
  return {
    avatar: '',
    company: '深圳先进电子有限公司',
    isLoggedIn: true,
    nickname: '张工',
    userType: 'enterprise',
  }
}

function readStoredState(): UserState {
  const fallback = getDefaultState()

  try {
    const stored = uni.getStorageSync(USER_STORAGE_KEY)

    if (!stored || typeof stored !== 'object') {
      return fallback
    }

    return {
      ...fallback,
      ...stored,
      isLoggedIn: stored.isLoggedIn === true,
      userType: stored.userType === 'enterprise' ? 'enterprise' : 'personal',
    }
  } catch {
    return fallback
  }
}

export const useUserStore = defineStore('user', {
  state: (): UserState => readStoredState(),
  actions: {
    persistState() {
      uni.setStorageSync(USER_STORAGE_KEY, {
        avatar: this.avatar,
        company: this.company,
        isLoggedIn: this.isLoggedIn,
        nickname: this.nickname,
        userType: this.userType,
      })
    },
    login(type: UserType) {
      this.isLoggedIn = true
      this.userType = type
      this.persistState()
    },
    logout() {
      this.isLoggedIn = false
      this.userType = 'personal'
      this.persistState()
    },
    setUserType(type: UserType) {
      this.userType = type
      this.persistState()
    },
  },
})
