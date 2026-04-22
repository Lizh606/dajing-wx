import type { AuthSession } from '@/services/api/auth'
import { enterpriseService, userService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'

export const AUTH_BRAND_TITLE = 'AI质享·质量基础创新中心'

interface UserStoreLike {
  company?: string
  nickname?: string
  setEnterpriseContext: (payload: {
    company?: string
    enterpriseId?: string
    userType?: 'personal' | 'enterprise'
  }) => void
  setPendingProfileCompletion: (pending: boolean) => void
  setProfile: (payload: {
    accountType?: number
    avatar?: string
    company?: string
    nickname?: string
    userType?: 'personal' | 'enterprise'
  }) => void
  setSession: (payload: {
    accountType?: number
    avatar?: string
    company?: string
    enterpriseId?: string
    nickname?: string
    refreshToken?: string
    token: string
    userType?: 'personal' | 'enterprise'
  }) => void
}

export function resolveStoreUserType(userType?: number, accountType?: number) {
  const value = userType ?? accountType

  if (value === undefined || value === null) {
    return undefined
  }

  return value === 0 ? 'personal' : 'enterprise'
}

export function applyAuthSession(userStore: UserStoreLike, session: AuthSession, fallbackName: string) {
  if (!session.token) {
    throw new Error('登录成功，但未获取到认证凭证')
  }

  userStore.setSession({
    accountType: session.accountType,
    avatar: session.avatar,
    company: session.company,
    enterpriseId: session.enterpriseId,
    nickname: session.nickname ?? fallbackName,
    refreshToken: session.refreshToken,
    token: session.token,
    userType: session.userType,
  })
  userStore.setPendingProfileCompletion(false)
}

export async function syncCurrentUserProfile(userStore: UserStoreLike) {
  try {
    const currentUser = await userService.getCurrentUser()

    userStore.setProfile({
      accountType: currentUser.userType ?? currentUser.accountType,
      avatar: currentUser.avatar,
      company: currentUser.enterpriseName,
      nickname: currentUser.nickname,
      userType: resolveStoreUserType(currentUser.userType, currentUser.accountType),
    })

    if (currentUser.enterpriseId || currentUser.enterpriseName) {
      userStore.setEnterpriseContext({
        company: currentUser.enterpriseName,
        enterpriseId: currentUser.enterpriseId,
        userType: resolveStoreUserType(currentUser.userType, currentUser.accountType),
      })
    }
  } catch {
    // 用户详情拉取失败时不阻断流程
  }
}

export async function syncEnterpriseProfile(userStore: UserStoreLike) {
  try {
    const enterprise = normalizeEnterpriseContext(await enterpriseService.getMy())

    if (!enterprise) {
      return
    }

    userStore.setEnterpriseContext({
      company: enterprise.company,
      enterpriseId: enterprise.enterpriseId,
      userType: 'enterprise',
    })

    if (enterprise.contactName && !userStore.nickname) {
      userStore.setProfile({ nickname: enterprise.contactName })
    }
  } catch {
    // 个人用户或企业资料未建立时忽略
  }
}

export async function completePostLogin(userStore: UserStoreLike, session: AuthSession, fallbackName: string) {
  applyAuthSession(userStore, session, fallbackName)
  await syncCurrentUserProfile(userStore)
  await syncEnterpriseProfile(userStore)
}

export function buildAutoRegisterPassword(phone: string, smsCode: string) {
  const phoneTail = phone.trim().slice(-4) || '0000'
  const codeTail = smsCode.trim().slice(-2) || '00'
  return `Aizx@${phoneTail}${codeTail}`
}
