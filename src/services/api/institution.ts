import { authRequest, request } from '@/services/http'

type ApiRecord = Record<string, any>

export interface Institution {
  address?: string
  avgScore?: number
  contactPhone?: string
  createTime?: string
  enterpriseId?: number
  id?: number
  institutionType?: number
  introduction?: string
  isDeleted?: number
  logo?: string
  name?: string
  orderCount?: number
  serviceCount?: number
  qualification?: string
  region?: string
  serviceRange?: string
  shortName?: string
  status?: number
  updateTime?: string
  website?: string
}

export interface InstitutionListQuery {
  keyword?: string
  page?: number
  region?: string
  size?: number
  type?: number
}

export interface InstitutionPageResult {
  current?: number
  pages?: number
  records?: Institution[]
  size?: number
  total?: number
}

export interface InstitutionServiceUpdateQuery {
  contactPhone?: string
  introduction?: string
  serviceRange?: string
}

export interface InstitutionAdminUpdateQuery extends InstitutionServiceUpdateQuery {
  status?: number
}

export interface InstitutionEnrollPayload {
  enterpriseId: number | string
  name: string
  address?: string
  contactPhone?: string
  institutionType?: number
  introduction?: string
  qualification?: string
  region?: string
  serviceRange?: string
  shortName?: string
}

export function getList(query: InstitutionListQuery = {}) {
  return request<InstitutionPageResult>({
    method: 'GET',
    path: '/api/base/institution/list',
    query: {
      keyword: query.keyword,
      page: query.page,
      region: query.region,
      size: query.size,
      type: query.type,
    },
  })
}

export function search(query: InstitutionListQuery = {}) {
  return request<Institution[]>({
    method: 'GET',
    path: '/api/base/institution/search',
    query: {
      keyword: query.keyword,
      page: query.page,
      region: query.region,
      size: query.size,
      type: query.type,
    },
  })
}

export function getDetail(id: string | number) {
  return request<Institution>({
    method: 'GET',
    path: '/api/base/institution/{id}',
    pathParams: { id },
  })
}

export function updateService(id: string | number, query: InstitutionServiceUpdateQuery) {
  return authRequest<ApiRecord>({
    method: 'PUT',
    path: '/api/base/institution/{id}/service',
    pathParams: { id },
    query: {
      contactPhone: query.contactPhone,
      introduction: query.introduction,
      serviceRange: query.serviceRange,
    },
  })
}

export function updateAdmin(id: string | number, query: InstitutionAdminUpdateQuery) {
  return authRequest<ApiRecord>({
    method: 'PUT',
    path: '/api/base/institution/{id}/admin',
    pathParams: { id },
    query: {
      contactPhone: query.contactPhone,
      introduction: query.introduction,
      serviceRange: query.serviceRange,
      status: query.status,
    },
  })
}

export function enroll(payload: InstitutionEnrollPayload) {
  return authRequest<ApiRecord>({
    body: payload,
    method: 'POST',
    path: '/api/base/institution/enroll',
  })
}
