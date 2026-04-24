import { authRequest, authUploadFile, request } from '@/services/http'

type ApiRecord = Record<string, any>

export interface EnterpriseRegisterPayload {
  address?: string
  authorizationLetter?: string
  businessLicense?: string
  certExpiry?: string
  certFileUrl?: string
  certNo?: string
  certScope?: string
  contactName: string
  contactPhone: string
  email?: string
  enterpriseName: string
  enterpriseType: number
  introduction?: string
  qualification?: string
  qualificationFiles?: QualificationFileItem[]
  legalPerson: string
  region?: string
  registeredCapital?: string
  serviceRange?: string
  unifiedCreditCode?: string
}

export interface QualificationFileItem {
  certName?: string
  certNo?: string
  expireDate?: string
  fileName?: string
  fileUrl: string
  remark?: string
}

export interface EnterpriseListQuery {
  enterpriseType?: number
  page: number
  region?: string
  size: number
}

export interface EnterpriseCertPayload {
  certFile: string
  certName: string
  certNo: string
  certType: string
  expireDate: string
}

export type EnterpriseUpdatePayload = Partial<EnterpriseRegisterPayload>

export interface EnterpriseContext {
  address?: string
  businessLicense?: string
  certStatus?: number
  company?: string
  contactName?: string
  contactPhone?: string
  enterpriseId?: string
  enterpriseType?: number
  legalPerson?: string
  rejectReason?: string
  region?: string
  unifiedCreditCode?: string
}

export interface FileUploadResult {
  fileKey?: string
  fileName?: string
  fileType?: string
  objectName?: string
  size?: number
  url?: string
}

export interface BusinessLicenseOcrResult {
  address?: string
  business?: string
  businessScope?: string
  capital?: string
  companyType?: string
  enterpriseName?: string
  imageObjectName?: string
  legalPerson?: string
  name?: string
  registerNumber?: string
  registeredAddress?: string
  registeredCapital?: string
  socialCreditCode?: string
  type?: string
}

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

function resolveStringValue(source: unknown, paths: string[][]) {
  for (const path of paths) {
    const value = getValueByPath(source, path)

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (typeof value === 'number') {
      return String(value)
    }
  }

  return ''
}

function resolveNumberValue(source: unknown, paths: string[][]) {
  for (const path of paths) {
    const value = getValueByPath(source, path)

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value)
    }
  }

  return undefined
}

export function normalizeEnterpriseContext(source: unknown): EnterpriseContext | null {
  if (!source) {
    return null
  }

  const resolvedSource = isObject(source)
    && ['enterprise', 'company', 'organization', 'org']
      .map((key) => source[key])
      .find((value) => isObject(value))

  const target = resolvedSource ?? source
  const company = resolveStringValue(target, [['enterpriseName'], ['companyName'], ['company'], ['name']])
  const enterpriseId = resolveStringValue(target, [['enterpriseId'], ['id'], ['enterpriseID'], ['companyId']])

  if (!company && !enterpriseId) {
    return null
  }

  return {
    address: resolveStringValue(target, [['address']]) || undefined,
    businessLicense: resolveStringValue(target, [['businessLicense'], ['licenseUrl']]) || undefined,
    certStatus: resolveNumberValue(target, [['certStatus'], ['status']]),
    company: company || undefined,
    contactName: resolveStringValue(target, [['contactName'], ['linkman'], ['contact']]) || undefined,
    contactPhone: resolveStringValue(target, [['contactPhone'], ['phone'], ['mobile']]) || undefined,
    enterpriseId: enterpriseId || undefined,
    enterpriseType: resolveNumberValue(target, [['enterpriseType'], ['type']]),
    legalPerson: resolveStringValue(target, [['legalPerson'], ['principalName'], ['ownerName']]) || undefined,
    rejectReason: resolveStringValue(target, [['rejectReason']]) || undefined,
    region: resolveStringValue(target, [['region'], ['area']]) || undefined,
    unifiedCreditCode: resolveStringValue(target, [['unifiedCreditCode'], ['creditCode']]) || undefined,
  }
}

export function register(payload: EnterpriseRegisterPayload) {
  return authRequest<ApiRecord>({
    body: payload,
    compactBody: false,
    method: 'POST',
    path: '/api/user/enterprise/register',
  })
}

export function getMy() {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/user/enterprise/my',
  })
}

export function getDetail(id: string | number) {
  return request<ApiRecord>({
    method: 'GET',
    path: '/api/user/enterprise/{enterpriseId}',
    pathParams: { enterpriseId: id },
  })
}

export function getList(query: EnterpriseListQuery) {
  return request<ApiRecord>({
    method: 'GET',
    path: '/api/user/enterprise/list',
    query: {
      enterpriseType: query.enterpriseType,
      page: query.page,
      region: query.region,
      size: query.size,
    },
  })
}

export function update(enterpriseId: string | number, payload: EnterpriseUpdatePayload) {
  return authRequest<ApiRecord>({
    body: payload,
    compactBody: false,
    method: 'PUT',
    path: '/api/user/enterprise/{enterpriseId}',
    pathParams: { enterpriseId },
  })
}

export function uploadLicense(filePath: string) {
  return authUploadFile<FileUploadResult>({
    filePath,
    path: '/api/user/file/upload/license',
  })
}

export function uploadCert(filePath: string) {
  return authUploadFile<FileUploadResult>({
    filePath,
    path: '/api/user/file/upload/cert',
  })
}

export function ocrBusinessLicense(filePath: string) {
  return authUploadFile<BusinessLicenseOcrResult>({
    filePath,
    path: '/api/user/enterprise/ocr/business-license',
  })
}

export function createCert(enterpriseId: string | number, payload: EnterpriseCertPayload) {
  return authRequest<ApiRecord>({
    body: payload,
    method: 'POST',
    path: '/api/user/enterprise/{enterpriseId}/cert',
    pathParams: { enterpriseId },
  })
}

export function getCertList(enterpriseId: string | number) {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/user/enterprise/{enterpriseId}/cert',
    pathParams: { enterpriseId },
  })
}

export function deleteCert(enterpriseId: string | number, certId: string | number) {
  return authRequest<ApiRecord>({
    method: 'DELETE',
    path: '/api/user/enterprise/{enterpriseId}/cert/{certId}',
    pathParams: { certId, enterpriseId },
  })
}
