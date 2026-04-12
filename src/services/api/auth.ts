import { AUTH_DEVICE } from '@/config/api'
import type { UserType } from '@/stores/user'
import { request, requestWithMeta } from '@/services/http'

type ApiRecord = Record<string, any>

export interface SendSmsCodePayload {
  phone: string
  scene?: string
}

export interface SmsLoginPayload {
  device?: string
  phone: string
  smsCode: string
}

export interface PasswordLoginPayload {
  account: string
  device?: string
  password: string
}

export interface RegisterAccountPayload {
  device?: string
  email?: string
  nickname?: string
  password: string
  phone: string
  smsCode: string
}

export interface AuthSession {
  avatar?: string
  company?: string
  enterpriseId?: string
  nickname?: string
  raw: unknown
  refreshToken?: string
  token?: string
  userType: UserType
}

const TOKEN_PATHS = [
  ['token'],
  ['accessToken'],
  ['access_token'],
  ['jwt'],
  ['authorization'],
  ['Authorization'],
  ['data', 'token'],
  ['data', 'accessToken'],
  ['result', 'token'],
  ['result', 'accessToken'],
]

const REFRESH_TOKEN_PATHS = [
  ['refreshToken'],
  ['refresh_token'],
  ['data', 'refreshToken'],
  ['result', 'refreshToken'],
]

const NICKNAME_PATHS = [
  ['nickname'],
  ['nickName'],
  ['username'],
  ['userName'],
  ['name'],
  ['data', 'nickname'],
  ['data', 'name'],
]

const AVATAR_PATHS = [
  ['avatar'],
  ['avatarUrl'],
  ['headImg'],
  ['headImage'],
  ['data', 'avatar'],
]

const COMPANY_PATHS = [
  ['company'],
  ['companyName'],
  ['enterpriseName'],
  ['data', 'company'],
  ['data', 'companyName'],
  ['data', 'enterpriseName'],
]

const ENTERPRISE_ID_PATHS = [
  ['enterpriseId'],
  ['enterpriseID'],
  ['companyId'],
  ['orgId'],
  ['organizationId'],
  ['data', 'enterpriseId'],
]

function isObject(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getValueByPath(source: unknown, path: string[]) {
  let current: unknown = source

  for (const key of path) {
    if (!isObject(current) || !(key in current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

function resolveStringValue(sources: unknown[], paths: string[][]) {
  for (const source of sources) {
    for (const path of paths) {
      const value = getValueByPath(source, path)

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }

      if (typeof value === 'number') {
        return String(value)
      }
    }
  }

  return ''
}

function normalizeUserType(value: unknown): UserType | null {
  if (typeof value === 'number') {
    return value === 2 ? 'enterprise' : 'personal'
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return null
  }

  if (
    normalized.includes('enterprise')
    || normalized.includes('company')
    || normalized.includes('org')
    || normalized.includes('agency')
    || normalized.includes('institution')
    || normalized.includes('企业')
    || normalized.includes('机构')
  ) {
    return 'enterprise'
  }

  if (
    normalized.includes('personal')
    || normalized.includes('user')
    || normalized.includes('member')
    || normalized.includes('个人')
  ) {
    return 'personal'
  }

  return null
}

function resolveUserType(sources: unknown[], fallback: UserType): UserType {
  const candidatePaths = [
    ['userType'],
    ['accountType'],
    ['role'],
    ['roleType'],
    ['type'],
    ['data', 'userType'],
    ['data', 'role'],
  ]

  for (const source of sources) {
    for (const path of candidatePaths) {
      const nextType = normalizeUserType(getValueByPath(source, path))

      if (nextType) {
        return nextType
      }
    }
  }

  const company = resolveStringValue(sources, COMPANY_PATHS)
  const enterpriseId = resolveStringValue(sources, ENTERPRISE_ID_PATHS)

  if (company || enterpriseId) {
    return 'enterprise'
  }

  return fallback
}

function normalizeToken(value: string) {
  return value.startsWith('Bearer ') ? value.slice(7).trim() : value
}

function resolveAuthSession(data: unknown, raw: unknown, fallback: UserType, requireToken: boolean) {
  const sources = [data, raw]
  const token = normalizeToken(resolveStringValue(sources, TOKEN_PATHS))

  if (requireToken && !token) {
    throw new Error('登录成功，但后端未返回 token')
  }

  return {
    avatar: resolveStringValue(sources, AVATAR_PATHS) || undefined,
    company: resolveStringValue(sources, COMPANY_PATHS) || undefined,
    enterpriseId: resolveStringValue(sources, ENTERPRISE_ID_PATHS) || undefined,
    nickname: resolveStringValue(sources, NICKNAME_PATHS) || undefined,
    raw,
    refreshToken: resolveStringValue(sources, REFRESH_TOKEN_PATHS) || undefined,
    token: token || undefined,
    userType: resolveUserType(sources, fallback),
  } satisfies AuthSession
}

export async function sendSmsCode(payload: SendSmsCodePayload) {
  await request<void>({
    body: {
      phone: payload.phone,
      scene: payload.scene ?? 'LOGIN',
    },
    method: 'POST',
    path: '/api/user/auth/sms/send',
  })
}

export async function loginBySms(payload: SmsLoginPayload) {
  const response = await requestWithMeta<ApiRecord>({
    body: {
      device: payload.device ?? AUTH_DEVICE,
      phone: payload.phone,
      smsCode: payload.smsCode,
    },
    method: 'POST',
    path: '/api/user/auth/login',
  })

  return resolveAuthSession(response.data, response.raw, 'personal', true)
}

export async function loginByPassword(payload: PasswordLoginPayload) {
  const response = await requestWithMeta<ApiRecord>({
    body: {
      account: payload.account,
      device: payload.device ?? AUTH_DEVICE,
      password: payload.password,
    },
    method: 'POST',
    path: '/api/user/auth/login/password',
  })

  return resolveAuthSession(response.data, response.raw, 'personal', true)
}

export async function registerAccount(payload: RegisterAccountPayload) {
  const response = await requestWithMeta<ApiRecord>({
    body: {
      device: payload.device ?? AUTH_DEVICE,
      email: payload.email,
      nickname: payload.nickname,
      password: payload.password,
      phone: payload.phone,
      smsCode: payload.smsCode,
    },
    method: 'POST',
    path: '/api/user/auth/register',
  })

  return resolveAuthSession(response.data, response.raw, 'personal', false)
}
