import { defineStore } from 'pinia'

export type UserType = 'personal' | 'enterprise'

export interface UserState {
  avatar: string
  company: string
  enterpriseId: string
  isLoggedIn: boolean
  nickname: string
  refreshToken: string
  token: string
  userType: UserType
}

export interface UserSessionPayload {
  avatar?: string
  company?: string
  enterpriseId?: string | number
  nickname?: string
  refreshToken?: string
  token: string
  userType?: UserType
}

export const USER_STORAGE_KEY = 'dajing-user-state'

function getDefaultState(): UserState {
  return {
    avatar: '',
    company: '',
    enterpriseId: '',
    isLoggedIn: false,
    nickname: '',
    refreshToken: '',
    token: '',
    userType: 'personal',
  }
}

function normalizeUserType(value: unknown): UserType {
  return value === 'enterprise' ? 'enterprise' : 'personal'
}

export function readStoredState(): UserState {
  const fallback = getDefaultState()

  try {
    const stored = uni.getStorageSync(USER_STORAGE_KEY)

    if (!stored || typeof stored !== 'object') {
      return fallback
    }

    return {
      ...fallback,
      ...stored,
      company: typeof stored.company === 'string' ? stored.company : '',
      enterpriseId: stored.enterpriseId ? String(stored.enterpriseId) : '',
      isLoggedIn: stored.isLoggedIn === true && typeof stored.token === 'string' && stored.token.length > 0,
      nickname: typeof stored.nickname === 'string' ? stored.nickname : '',
      refreshToken: typeof stored.refreshToken === 'string' ? stored.refreshToken : '',
      token: typeof stored.token === 'string' ? stored.token : '',
      userType: normalizeUserType(stored.userType),
    }
  } catch {
    return fallback
  }
}

function resolveDisplayName(payload: Partial<UserSessionPayload>) {
  return payload.nickname ?? ''
}

export const useUserStore = defineStore('user', {
  state: (): UserState => readStoredState(),
  actions: {
    persistState() {
      uni.setStorageSync(USER_STORAGE_KEY, {
        avatar: this.avatar,
        company: this.company,
        enterpriseId: this.enterpriseId,
        isLoggedIn: this.isLoggedIn,
        nickname: this.nickname,
        refreshToken: this.refreshToken,
        token: this.token,
        userType: this.userType,
      })
    },
    clearSession() {
      const defaults = getDefaultState()
      this.avatar = defaults.avatar
      this.company = defaults.company
      this.enterpriseId = defaults.enterpriseId
      this.isLoggedIn = defaults.isLoggedIn
      this.nickname = defaults.nickname
      this.refreshToken = defaults.refreshToken
      this.token = defaults.token
      this.userType = defaults.userType
      this.persistState()
    },
    logout() {
      this.clearSession()
    },
    setEnterpriseContext(payload: {
      company?: string
      enterpriseId?: string | number
      userType?: UserType
    }) {
      if (payload.company !== undefined) {
        this.company = payload.company
      }

      if (payload.enterpriseId !== undefined) {
        this.enterpriseId = String(payload.enterpriseId)
      }

      if (payload.userType) {
        this.userType = payload.userType
      } else if (payload.company || payload.enterpriseId) {
        this.userType = 'enterprise'
      }

      this.persistState()
    },
    setProfile(payload: {
      avatar?: string
      company?: string
      nickname?: string
      userType?: UserType
    }) {
      if (payload.avatar !== undefined) {
        this.avatar = payload.avatar
      }

      if (payload.company !== undefined) {
        this.company = payload.company
      }

      if (payload.nickname !== undefined) {
        this.nickname = payload.nickname
      }

      if (payload.userType) {
        this.userType = payload.userType
      }

      this.persistState()
    },
    setSession(payload: UserSessionPayload) {
      this.token = payload.token
      this.refreshToken = payload.refreshToken ?? ''
      this.avatar = payload.avatar ?? this.avatar
      this.company = payload.company ?? this.company
      this.enterpriseId = payload.enterpriseId !== undefined ? String(payload.enterpriseId) : this.enterpriseId
      this.nickname = resolveDisplayName(payload) || this.nickname
      this.userType = payload.userType ?? (payload.company || payload.enterpriseId ? 'enterprise' : this.userType)
      this.isLoggedIn = Boolean(this.token)
      this.persistState()
    },
    setUserType(type: UserType) {
      this.userType = type
      this.persistState()
    },
  },
})
