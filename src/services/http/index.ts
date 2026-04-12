import { apiConfig, getApiBaseUrl } from '@/config/api'
import { readStoredState, useUserStore } from '@/stores/user'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions<TBody = unknown> {
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

export class ApiError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

const SUCCESS_CODES = new Set([0, 200, '0', '200', 'OK', 'ok', true])

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

function createRequestTask(url: string, options: RequestOptions, withAuth: boolean) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (withAuth) {
    const token = resolveStoredToken()

    if (token) {
      headers.Authorization = headers.Authorization ?? `Bearer ${token}`
    }
  }

  return new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
    uni.request({
      data: compactRecord(options.body as Record<string, any>),
      fail: (error) => {
        reject(new ApiError(error?.errMsg || '网络请求失败'))
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

async function performRequest<T>(options: RequestOptions, withAuth: boolean) {
  const url = buildUrl(options.path, options.pathParams, options.query)
  const response = await createRequestTask(url, options, withAuth)
  const statusCode = Number(response.statusCode ?? 0)

  if (statusCode < 200 || statusCode >= 300) {
    throw new ApiError(resolveMessage(response.data) || `请求失败（${statusCode}）`, statusCode)
  }

  return {
    data: normalizeBusinessData<T>(response.data),
    headers: (response.header ?? {}) as Record<string, any>,
    raw: response.data,
    statusCode,
  }
}

export function requestWithMeta<T>(options: RequestOptions) {
  return performRequest<T>(options, false)
}

export function authRequestWithMeta<T>(options: RequestOptions) {
  return performRequest<T>(options, true)
}

export async function request<T>(options: RequestOptions) {
  const response = await requestWithMeta<T>(options)
  return response.data
}

export async function authRequest<T>(options: RequestOptions) {
  const response = await authRequestWithMeta<T>(options)
  return response.data
}
