import { authRequest } from '@/services/http'

type ApiRecord = Record<string, any>

export interface CurrentUserProfile {
  accountId?: string
  accountType?: number
  avatar?: string
  enterpriseId?: string
  enterpriseName?: string
  id?: string
  memberLevel?: number
  nickname?: string
  phone?: string
  points?: number
  realNameStatus?: number
  status?: number
  userType?: number
  username?: string
}

function toText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return undefined
}

export async function getCurrentUser() {
  let raw: ApiRecord

  try {
    raw = await authRequest<ApiRecord>({
      method: 'GET',
      path: '/api/user/user/me',
    })
  } catch {
    raw = await authRequest<ApiRecord>({
      method: 'GET',
      path: '/api/user/user/current',
    })
  }

  return {
    accountId: toText(raw.accountId) || undefined,
    accountType: toNumber(raw.accountType),
    avatar: toText(raw.avatar) || undefined,
    enterpriseId: toText(raw.enterpriseId) || undefined,
    enterpriseName: toText(raw.enterpriseName) || undefined,
    id: toText(raw.id) || undefined,
    memberLevel: toNumber(raw.memberLevel),
    nickname: toText(raw.nickname) || undefined,
    phone: toText(raw.phone) || undefined,
    points: toNumber(raw.points),
    realNameStatus: toNumber(raw.realNameStatus),
    status: toNumber(raw.status),
    userType: toNumber(raw.userType),
    username: toText(raw.username) || undefined,
  } satisfies CurrentUserProfile
}

export function updateNickname(nickname: string) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/user/user/nickname',
    query: { nickname },
  })
}

export function updateAvatar(avatarUrl: string) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/user/user/avatar',
    query: { avatarUrl },
  })
}
