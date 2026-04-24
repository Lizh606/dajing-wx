import { authRequest, request } from '@/services/http'

type ApiRecord = Record<string, any>

export type ServiceStatus = 0 | 1 | 2

export interface ServiceItem {
  category?: string
  coverUrl?: string
  createTime?: string
  cycleDays?: number
  defaultStd?: string
  description?: string
  enterpriseId?: number
  id?: string
  inspectionItemId?: number
  institutionId?: number
  isDeleted?: number
  orderCount?: number
  price?: number
  sampleType?: string
  serviceName?: string
  sort?: number
  status?: ServiceStatus
  supportCma?: number
  supportCnas?: number
  supportUrgent?: number
  updateTime?: string
  urgentExtraFee?: number
  viewCount?: number
}

export interface ServiceItemCreatePayload {
  category: string
  cycleDays: number
  price: number
  serviceName: string
  coverUrl?: string
  defaultStd?: string
  description?: string
  inspectionItemId?: number
  sampleType?: string
  sort?: number
  supportCma?: number
  supportCnas?: number
  supportUrgent?: number
  urgentExtraFee?: number
}

export interface ServiceItemListQuery {
  page?: number
  size?: number
  status?: ServiceStatus
}

export interface InstitutionServiceItemListQuery {
  category?: string
  keyword?: string
  page?: number
  size?: number
}

export interface InstitutionServicePublicListQuery extends InstitutionServiceItemListQuery {
  institutionId?: number | string
  institutionType?: number
}

export interface ServiceItemPageResult {
  current: number
  pages: number
  records: ServiceItem[]
  size: number
  total: number
}

function isObject(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return fallback
}

function toServiceStatus(value: unknown): ServiceStatus | undefined {
  const normalized = toNumber(value, -1)
  if (normalized === 0 || normalized === 1 || normalized === 2) {
    return normalized
  }
  return undefined
}

function toId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return undefined
}

function normalizeServiceItem(raw: unknown): ServiceItem {
  if (!isObject(raw)) {
    return {}
  }

  return {
    category: typeof raw.category === 'string' ? raw.category : undefined,
    coverUrl: typeof raw.coverUrl === 'string' ? raw.coverUrl : undefined,
    createTime: typeof raw.createTime === 'string' ? raw.createTime : undefined,
    cycleDays: toNumber(raw.cycleDays, 0) || undefined,
    defaultStd: typeof raw.defaultStd === 'string' ? raw.defaultStd : undefined,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    enterpriseId: toNumber(raw.enterpriseId, 0) || undefined,
    id: toId(raw.id),
    inspectionItemId: toNumber(raw.inspectionItemId, 0) || undefined,
    institutionId: toNumber(raw.institutionId, 0) || undefined,
    isDeleted: toNumber(raw.isDeleted, 0) || undefined,
    orderCount: toNumber(raw.orderCount, 0) || undefined,
    price: toNumber(raw.price, 0) || undefined,
    sampleType: typeof raw.sampleType === 'string' ? raw.sampleType : undefined,
    serviceName: typeof raw.serviceName === 'string' ? raw.serviceName : undefined,
    sort: toNumber(raw.sort, 0) || undefined,
    status: toServiceStatus(raw.status),
    supportCma: toNumber(raw.supportCma, 0) || undefined,
    supportCnas: toNumber(raw.supportCnas, 0) || undefined,
    supportUrgent: toNumber(raw.supportUrgent, 0) || undefined,
    updateTime: typeof raw.updateTime === 'string' ? raw.updateTime : undefined,
    urgentExtraFee: toNumber(raw.urgentExtraFee, 0) || undefined,
    viewCount: toNumber(raw.viewCount, 0) || undefined,
  }
}

function unwrapPageResult(raw: unknown): ServiceItemPageResult {
  const source = isObject(raw) && isObject(raw.data) ? raw.data : raw

  if (!isObject(source)) {
    return { current: 1, pages: 1, records: [], size: 10, total: 0 }
  }

  const recordsRaw = Array.isArray(source.records)
    ? source.records
    : Array.isArray(source.list)
      ? source.list
      : []

  return {
    current: toNumber(source.current, 1),
    pages: toNumber(source.pages, 1),
    records: recordsRaw.map((item) => normalizeServiceItem(item)),
    size: toNumber(source.size, 10),
    total: toNumber(source.total, recordsRaw.length),
  }
}

function resolveIdFromResponse(raw: unknown) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw
  }

  if (!isObject(raw)) {
    return undefined
  }

  if (typeof raw.id === 'number' && Number.isFinite(raw.id)) {
    return raw.id
  }

  if (typeof raw.data === 'number' && Number.isFinite(raw.data)) {
    return raw.data
  }

  if (isObject(raw.data) && typeof raw.data.id === 'number' && Number.isFinite(raw.data.id)) {
    return raw.data.id
  }

  return undefined
}

export async function getMyList(query: ServiceItemListQuery = {}) {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/base/institution/service/my',
    query: {
      page: query.page,
      size: query.size,
      status: query.status,
    },
  })

  return unwrapPageResult(response)
}

export async function listByInstitution(
  institutionId: string | number,
  query: InstitutionServiceItemListQuery = {},
) {
  const response = await request<unknown>({
    method: 'GET',
    path: '/api/base/institution/{institutionId}/service/list',
    pathParams: { institutionId },
    query: {
      category: query.category,
      keyword: query.keyword,
      page: query.page,
      size: query.size,
    },
  })

  return unwrapPageResult(response)
}

export async function listAll(query: InstitutionServicePublicListQuery = {}) {
  const response = await request<unknown>({
    method: 'GET',
    path: '/api/base/institution/service/list',
    query: {
      category: query.category,
      institutionId: query.institutionId,
      institutionType: query.institutionType,
      keyword: query.keyword,
      page: query.page,
      size: query.size,
    },
  })

  return unwrapPageResult(response)
}

export async function create(payload: ServiceItemCreatePayload) {
  const response = await authRequest<unknown>({
    body: payload,
    method: 'POST',
    path: '/api/base/institution/service',
  })

  return resolveIdFromResponse(response)
}

export async function getDetail(id: string | number) {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/base/institution/service/{id}',
    pathParams: { id },
  })

  return normalizeServiceItem(response)
}

export async function getPublicDetail(id: string | number) {
  const response = await request<unknown>({
    method: 'GET',
    path: '/api/base/institution/service/{id}',
    pathParams: { id },
  })

  return normalizeServiceItem(response)
}

export function update(id: string | number, payload: ServiceItemCreatePayload) {
  return authRequest<void>({
    body: payload,
    method: 'PUT',
    path: '/api/base/institution/service/{id}',
    pathParams: { id },
  })
}

export function remove(id: string | number) {
  return authRequest<void>({
    method: 'DELETE',
    path: '/api/base/institution/service/{id}',
    pathParams: { id },
  })
}

export function shelve(id: string | number) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/base/institution/service/{id}/shelve',
    pathParams: { id },
  })
}

export function unshelve(id: string | number) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/base/institution/service/{id}/unshelve',
    pathParams: { id },
  })
}
