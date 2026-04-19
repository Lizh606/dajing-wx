import { defineStore } from 'pinia'

export type UserType = 'personal' | 'enterprise'

export interface UserState {
  accountType: number | null
  avatar: string
  company: string
  enterpriseId: string
  isLoggedIn: boolean
  nickname: string
  pendingProfileCompletion: boolean
  refreshToken: string
  token: string
  userType: UserType
}

export interface UserSessionPayload {
  accountType?: number
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
    accountType: null,
    avatar: '',
    company: '',
    enterpriseId: '',
    isLoggedIn: false,
    nickname: '',
    pendingProfileCompletion: false,
    refreshToken: '',
    token: '',
    userType: 'personal',
  }
}

function normalizeUserType(value: unknown): UserType {
  return value === 'enterprise' ? 'enterprise' : 'personal'
}

function normalizeAccountType(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return null
}

function resolveUserTypeFromAccountType(accountType: number) {
  return accountType === 0 ? 'personal' : 'enterprise'
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
      accountType: normalizeAccountType(stored.accountType),
      company: typeof stored.company === 'string' ? stored.company : '',
      enterpriseId: stored.enterpriseId ? String(stored.enterpriseId) : '',
      isLoggedIn: stored.isLoggedIn === true && typeof stored.token === 'string' && stored.token.length > 0,
      nickname: typeof stored.nickname === 'string' ? stored.nickname : '',
      pendingProfileCompletion: stored.pendingProfileCompletion === true,
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
        accountType: this.accountType,
        avatar: this.avatar,
        company: this.company,
        enterpriseId: this.enterpriseId,
        isLoggedIn: this.isLoggedIn,
        nickname: this.nickname,
        pendingProfileCompletion: this.pendingProfileCompletion,
        refreshToken: this.refreshToken,
        token: this.token,
        userType: this.userType,
      })
    },
    clearSession() {
      const defaults = getDefaultState()
      this.accountType = defaults.accountType
      this.avatar = defaults.avatar
      this.company = defaults.company
      this.enterpriseId = defaults.enterpriseId
      this.isLoggedIn = defaults.isLoggedIn
      this.nickname = defaults.nickname
      this.pendingProfileCompletion = defaults.pendingProfileCompletion
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
      accountType?: number
      avatar?: string
      company?: string
      nickname?: string
      userType?: UserType
    }) {
      if (payload.accountType !== undefined) {
        this.accountType = payload.accountType

        if (!payload.userType) {
          this.userType = resolveUserTypeFromAccountType(payload.accountType)
        }
      }

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
      this.accountType = payload.accountType ?? this.accountType
      this.token = payload.token
      this.refreshToken = payload.refreshToken ?? ''
      this.avatar = payload.avatar ?? this.avatar
      this.company = payload.company ?? this.company
      this.enterpriseId = payload.enterpriseId !== undefined ? String(payload.enterpriseId) : this.enterpriseId
      this.nickname = resolveDisplayName(payload) || this.nickname
      this.userType = payload.userType
        ?? (payload.accountType !== undefined
          ? resolveUserTypeFromAccountType(payload.accountType)
          : payload.company || payload.enterpriseId ? 'enterprise' : this.userType)
      this.isLoggedIn = Boolean(this.token)
      this.persistState()
    },
    setPendingProfileCompletion(pending: boolean) {
      this.pendingProfileCompletion = pending
      this.persistState()
    },
    setUserType(type: UserType) {
      this.userType = type
      this.persistState()
    },
  },
})
