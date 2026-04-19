import { apiConfig, getApiBaseUrl } from '@/config/api'
import { readStoredState, useUserStore } from '@/stores/user'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions<TBody = unknown> {
  authExpiredBehavior?: 'default' | 'toast'
  body?: TBody
  headers?: Record<string, string>
  method?: HttpMethod
  path: string
  pathParams?: Record<string, QueryValue>
  query?: Record<string, QueryValue | QueryValue[]>
  timeout?: number
}

export interface RequestMeta<T> {
  data: T
  headers: Record<string, any>
  raw: any
  statusCode: number
}

export interface UploadFileOptions {
  authExpiredBehavior?: 'default' | 'toast'
  fieldName?: string
  filePath: string
  formData?: Record<string, QueryValue>
  headers?: Record<string, string>
  path: string
  pathParams?: Record<string, QueryValue>
  query?: Record<string, QueryValue | QueryValue[]>
  timeout?: number
}

type ApiRecord = Record<string, any>

export class ApiError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

const SUCCESS_CODES = new Set([0, 200, '0', '200', 'OK', 'ok', true])
const REFRESH_PATH = '/api/user/auth/refresh'
const LOGIN_PAGE_PATH = '/pages/auth/login'
const ACCESS_TOKEN_PATHS = [
  ['token'],
  ['accessToken'],
  ['access_token'],
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

let refreshingTokenTask: Promise<boolean> | null = null
let lastAuthExpiredHandledAt = 0

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function compactValue<T>(value: T): T | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return value
}

function compactRecord(record?: Record<string, any>) {
  if (!isObject(record)) {
    return record
  }

  return Object.entries(record).reduce<Record<string, any>>((accumulator, [key, value]) => {
    const nextValue = compactValue(value)

    if (nextValue === undefined) {
      return accumulator
    }

    accumulator[key] = nextValue
    return accumulator
  }, {})
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

function replacePathParams(path: string, pathParams?: Record<string, QueryValue>) {
  return path.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = pathParams?.[key]

    if (value === undefined || value === null || value === '') {
      throw new ApiError(`缺少路径参数：${key}`)
    }

    return encodeURIComponent(String(value))
  })
}

function buildQueryString(query?: Record<string, QueryValue | QueryValue[]>) {
  if (!query) {
    return ''
  }

  const search = Object.entries(query).flatMap(([key, rawValue]) => {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue]

    return values
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  })

  return search.length > 0 ? `?${search.join('&')}` : ''
}

function buildUrl(path: string, pathParams?: Record<string, QueryValue>, query?: Record<string, QueryValue | QueryValue[]>) {
  const normalizedPath = replacePathParams(path, pathParams)
  const prefix = normalizedPath.startsWith('/') ? '' : '/'
  return `${getApiBaseUrl()}${prefix}${normalizedPath}${buildQueryString(query)}`
}

function normalizeBusinessData<T>(payload: any): T {
  if (!isObject(payload)) {
    return payload as T
  }

  if (payload.success === false || payload.ok === false) {
    throw new ApiError(resolveMessage(payload) || '请求失败')
  }

  if ('code' in payload && !SUCCESS_CODES.has(payload.code)) {
    throw new ApiError(resolveMessage(payload) || '请求失败')
  }

  const looksLikeEnvelope = 'code' in payload
    || 'success' in payload
    || 'ok' in payload
    || 'msg' in payload
    || 'message' in payload
    || 'error' in payload

  if (looksLikeEnvelope) {
    if ('data' in payload) {
      return payload.data as T
    }

    if ('result' in payload) {
      return payload.result as T
    }
  }

  return payload as T
}

function resolveMessage(payload: any) {
  if (!isObject(payload)) {
    return typeof payload === 'string' ? payload : ''
  }

  return [
    payload.message,
    payload.msg,
    payload.error,
    payload.errMsg,
    payload.detail,
    payload.title,
  ].find((value) => typeof value === 'string' && value.trim())
}

function resolveRuntimeErrMsg(error: unknown) {
  if (isObject(error)) {
    const errMsg = error.errMsg

    if (typeof errMsg === 'string' && errMsg.trim()) {
      return errMsg.trim()
    }
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  return ''
}

export function getErrorMessage(error: unknown, fallback = '请求失败，请稍后再试') {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message || fallback
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}

function normalizeToken(value: string) {
  return value.startsWith('Bearer ') ? value.slice(7) : value
}

function toBearerToken(value: string) {
  const normalized = normalizeToken(value.trim())
  return normalized ? `Bearer ${normalized}` : ''
}

function resolveStoredToken() {
  try {
    const store = useUserStore()
    if (store.token) {
      return normalizeToken(store.token)
    }
  } catch {
    // ignore pinia bootstrap timing
  }

  const stored = readStoredState()
  return stored.token ? normalizeToken(stored.token) : ''
}

function resolveStoredRefreshToken() {
  const normalize = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      return normalizeToken(value.trim())
    }

    return ''
  }

  try {
    const store = useUserStore()
    const fromStore = normalize(store.refreshToken)
    if (fromStore) {
      return fromStore
    }
  } catch {
    // ignore pinia bootstrap timing
  }

  const stored = readStoredState()
  return normalize(stored.refreshToken)
}

function getCurrentRoute() {
  try {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1] as { route?: string } | undefined
    return current?.route ? `/${current.route}` : ''
  } catch {
    return ''
  }
}

function handleAuthExpired(behavior: 'default' | 'toast' = 'default') {
  const now = Date.now()

  if (now - lastAuthExpiredHandledAt < 1500) {
    return
  }

  lastAuthExpiredHandledAt = now

  uni.showToast({
    icon: 'none',
    title: '登录状态已过期，请重新登录',
  })

  if (behavior === 'toast') {
    return
  }

  try {
    const store = useUserStore()
    store.clearSession()
  } catch {
    // ignore pinia bootstrap timing
  }

  if (getCurrentRoute() === LOGIN_PAGE_PATH) {
    return
  }

  setTimeout(() => {
    uni.reLaunch({
      fail: () => {
        uni.navigateTo({ url: LOGIN_PAGE_PATH })
      },
      url: LOGIN_PAGE_PATH,
    })
  }, 80)
}

function resolveRefreshedSession(data: unknown, raw: unknown) {
  const sources = [data, raw]
  const token = normalizeToken(resolveStringValue(sources, ACCESS_TOKEN_PATHS))

  if (!token) {
    return null
  }

  return {
    refreshToken: resolveStringValue(sources, REFRESH_TOKEN_PATHS) || undefined,
    token,
  }
}

function persistRefreshedSession(session: { refreshToken?: string; token: string }) {
  try {
    const store = useUserStore()
    store.setSession({
      refreshToken: session.refreshToken,
      token: session.token,
    })
  } catch {
    // ignore pinia bootstrap timing
  }
}

function shouldTryRefresh(withAuth: boolean, path: string, allowRetry: boolean) {
  if (!withAuth || !allowRetry) {
    return false
  }

  return path !== REFRESH_PATH
}

function createHeaders(headers: Record<string, string> | undefined, withAuth: boolean) {
  const resolvedHeaders: Record<string, string> = { ...(headers ?? {}) }
  const explicitAuthorization = resolvedHeaders.Authorization

  if (typeof explicitAuthorization === 'string' && explicitAuthorization.trim()) {
    resolvedHeaders.Authorization = toBearerToken(explicitAuthorization)
  }

  if (withAuth) {
    const token = resolveStoredToken()

    if (token) {
      resolvedHeaders.Authorization = resolvedHeaders.Authorization ?? toBearerToken(token)
    }
  }

  return resolvedHeaders
}

function createRequestTask(url: string, options: RequestOptions, withAuth: boolean) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...createHeaders(options.headers, withAuth),
  }

  return new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
    uni.request({
      data: compactRecord(options.body as Record<string, any>),
      fail: (error) => {
        reject(new ApiError(resolveRuntimeErrMsg(error) || '网络请求失败'))
      },
      header: headers,
      method: options.method ?? 'GET',
      success: (response) => {
        resolve(response)
      },
      timeout: options.timeout ?? apiConfig.timeout,
      url,
    })
  })
}

function createUploadTask(url: string, options: UploadFileOptions, withAuth: boolean) {
  const headers = createHeaders(options.headers, withAuth)

  return new Promise<UniApp.UploadFileSuccessCallbackResult>((resolve, reject) => {
    uni.uploadFile({
      fail: (error) => {
        reject(new ApiError(resolveRuntimeErrMsg(error) || '文件上传失败'))
      },
      filePath: options.filePath,
      formData: compactRecord(options.formData as Record<string, any>),
      header: headers,
      name: options.fieldName ?? 'file',
      success: (response) => {
        resolve(response)
      },
      timeout: options.timeout ?? apiConfig.timeout,
      url,
    })
  })
}

function parseResponseData(raw: unknown) {
  if (typeof raw !== 'string') {
    return raw
  }

  const text = raw.trim()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return raw
  }
}

async function performRequest<T>(options: RequestOptions, withAuth: boolean) {
  return performRequestInternal<T>(options, withAuth, true)
}

async function tryRefreshAccessToken() {
  if (refreshingTokenTask) {
    return refreshingTokenTask
  }

  refreshingTokenTask = (async () => {
    const refreshToken = resolveStoredRefreshToken()

    if (!refreshToken) {
      return false
    }

    try {
      const refreshResponse = await performRequestInternal<ApiRecord>({
        method: 'POST',
        path: REFRESH_PATH,
        query: { refreshToken },
      }, true, false)

      const refreshedSession = resolveRefreshedSession(refreshResponse.data, refreshResponse.raw)
      if (!refreshedSession) {
        return false
      }

      persistRefreshedSession(refreshedSession)
      return true
    } catch {
      return false
    } finally {
      refreshingTokenTask = null
    }
  })()

  return refreshingTokenTask
}

async function performRequestInternal<T>(options: RequestOptions, withAuth: boolean, allowRetry: boolean) {
  const url = buildUrl(options.path, options.pathParams, options.query)
  let response = await createRequestTask(url, options, withAuth)
  let statusCode = Number(response.statusCode ?? 0)

  if (statusCode === 401 && shouldTryRefresh(withAuth, options.path, allowRetry)) {
    const refreshed = await tryRefreshAccessToken()

    if (refreshed) {
      response = await createRequestTask(url, options, withAuth)
      statusCode = Number(response.statusCode ?? 0)
    }
  }

  if (statusCode < 200 || statusCode >= 300) {
    if (statusCode === 401 && withAuth && options.path !== REFRESH_PATH) {
      handleAuthExpired(options.authExpiredBehavior)
    }

    throw new ApiError(resolveMessage(response.data) || `请求失败（${statusCode}）`, statusCode)
  }

  return {
    data: normalizeBusinessData<T>(response.data),
    headers: (response.header ?? {}) as Record<string, any>,
    raw: response.data,
    statusCode,
  }
}

async function performUpload<T>(options: UploadFileOptions, withAuth: boolean) {
  return performUploadInternal<T>(options, withAuth, true)
}

async function performUploadInternal<T>(options: UploadFileOptions, withAuth: boolean, allowRetry: boolean) {
  const url = buildUrl(options.path, options.pathParams, options.query)
  let response = await createUploadTask(url, options, withAuth)
  let statusCode = Number(response.statusCode ?? 0)
  let parsedData = parseResponseData(response.data)

  if (statusCode === 401 && shouldTryRefresh(withAuth, options.path, allowRetry)) {
    const refreshed = await tryRefreshAccessToken()

    if (refreshed) {
      response = await createUploadTask(url, options, withAuth)
      statusCode = Number(response.statusCode ?? 0)
      parsedData = parseResponseData(response.data)
    }
  }

  if (statusCode < 200 || statusCode >= 300) {
    if (statusCode === 401 && withAuth && options.path !== REFRESH_PATH) {
      handleAuthExpired(options.authExpiredBehavior)
    }

    throw new ApiError(resolveMessage(parsedData) || `请求失败（${statusCode}）`, statusCode)
  }

  return {
    data: normalizeBusinessData<T>(parsedData),
    headers: (response.header ?? {}) as Record<string, any>,
    raw: parsedData,
    statusCode,
  }
}

export function requestWithMeta<T>(options: RequestOptions) {
  return performRequest<T>(options, false)
}

export function authRequestWithMeta<T>(options: RequestOptions) {
  return performRequest<T>(options, true)
}

export function uploadFileWithMeta<T>(options: UploadFileOptions) {
  return performUpload<T>(options, false)
}

export function authUploadFileWithMeta<T>(options: UploadFileOptions) {
  return performUpload<T>(options, true)
}

export async function request<T>(options: RequestOptions) {
  const response = await requestWithMeta<T>(options)
  return response.data
}

export async function authRequest<T>(options: RequestOptions) {
  const response = await authRequestWithMeta<T>(options)
  return response.data
}

export async function uploadFile<T>(options: UploadFileOptions) {
  const response = await uploadFileWithMeta<T>(options)
  return response.data
}

export async function authUploadFile<T>(options: UploadFileOptions) {
  const response = await authUploadFileWithMeta<T>(options)
  return response.data
}
