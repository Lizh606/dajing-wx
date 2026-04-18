import { authRequest } from '@/services/http'

export interface CertificationAgency {
  address?: string
  avgScore?: number
  certTypes?: string
  contactPhone?: string
  createTime?: string
  id?: number
  introduction?: string
  isDeleted?: number
  logo?: string
  name?: string
  qualification?: string
  region?: string
  shortName?: string
  status?: number
  updateTime?: string
  website?: string
}

export interface CertificationAgencyListQuery {
  keyword?: string
  page?: number
  region?: string
  size?: number
}

export interface CertificationAgencyPageResult {
  current?: number
  pages?: number
  records?: CertificationAgency[]
  size?: number
  total?: number
}

export interface CertGuide {
  certType?: string
  content?: string
  costRange?: string
  createTime?: string
  duration?: string
  id?: number
  isDeleted?: number
  status?: number
  title?: string
  updateTime?: string
}

export function getCertificationAgencyList(query: CertificationAgencyListQuery = {}) {
  return authRequest<CertificationAgencyPageResult>({
    method: 'GET',
    path: '/api/base/certification/agency/list',
    query: {
      keyword: query.keyword,
      page: query.page,
      region: query.region,
      size: query.size,
    },
  })
}

export function getCertificationAgencyDetail(id: string | number) {
  return authRequest<CertificationAgency>({
    method: 'GET',
    path: '/api/base/certification/agency/{id}',
    pathParams: { id },
  })
}

export function getCertificationGuideList(certType?: string) {
  return authRequest<CertGuide[]>({
    method: 'GET',
    path: '/api/base/certification/guide/list',
    query: { certType },
  })
}

export function getCertificationGuideDetail(id: string | number) {
  return authRequest<CertGuide>({
    method: 'GET',
    path: '/api/base/certification/guide/{id}',
    pathParams: { id },
  })
}
