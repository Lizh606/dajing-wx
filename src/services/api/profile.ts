import type {
  ContactInfo,
  EnterpriseProfile,
  InvoiceInfo,
  SampleAddress,
} from '@/types/business'
import { authRequest } from '@/services/http'

type ApiRecord = Record<string, any>
type InvoiceTypeCode = 1 | 2

export interface SaveInvoicePayload {
  bankAccount?: string
  bankName?: string
  id?: string | number
  invoiceType: InvoiceInfo['invoiceType']
  isDefault?: boolean
  registerAddress?: string
  registerPhone?: string
  taxNo?: string
  title: string
}

export interface SaveSampleAddressPayload {
  address: string
  contact: string
  detailAddress?: string
  id?: string | number
  isDefault?: boolean
  mobile: string
  region?: string
  tag?: string
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isObject(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }

  const numeric = toNumber(value)
  if (numeric !== undefined) {
    return numeric > 0
  }

  const text = toText(value).toLowerCase()
  if (!text) {
    return false
  }

  return text === 'true' || text === 'yes'
}

function resolveList(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
  }

  if (!isObject(raw)) {
    return []
  }

  const candidates = [raw.records, raw.list, raw.items, raw.content, raw.data, raw.result]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeInvoiceTypeCode(value: unknown): InvoiceTypeCode {
  return toNumber(value) === 2 ? 2 : 1
}

function normalizeInvoiceTypeLabel(value: unknown): InvoiceInfo['invoiceType'] {
  const code = normalizeInvoiceTypeCode(value)
  return code === 2 ? '增值税专票' : '增值税普票'
}

function resolveInvoiceTypeCode(invoiceType: InvoiceInfo['invoiceType']) {
  return invoiceType === '增值税专票' ? 2 : 1
}

function normalizeInvoice(raw: unknown): InvoiceInfo {
  const source = isObject(raw) ? raw : {}
  const invoiceTypeCode = normalizeInvoiceTypeCode(source.invoiceType ?? source.type)
  const title = toText(source.title || source.invoiceTitle)
  const taxNo = toText(source.taxNo || source.taxNumber)

  return {
    bankAccount: toText(source.bankAccount) || undefined,
    bankName: toText(source.bankName) || undefined,
    id: toText(source.id || source.invoiceId || source.key) || createId('invoice'),
    invoiceType: normalizeInvoiceTypeLabel(invoiceTypeCode),
    invoiceTypeCode,
    isDefault: toBoolean(source.isDefault),
    registerAddress: toText(source.registerAddress) || undefined,
    registerPhone: toText(source.registerPhone) || undefined,
    taxNo,
    title,
  }
}

function normalizeAddress(raw: unknown): SampleAddress {
  const source = isObject(raw) ? raw : {}
  const region = toText(source.region)
  const detailAddress = toText(source.detailAddress || source.address)
  const normalizedAddress = detailAddress || region || '-'
  const isDefault = toBoolean(source.isDefault)

  return {
    address: normalizedAddress,
    contact: toText(source.contactName || source.contact || source.name) || '-',
    detailAddress: detailAddress || undefined,
    id: toText(source.id || source.addressId || source.key) || createId('address'),
    isDefault,
    mobile: toText(source.contactPhone || source.mobile || source.phone) || '-',
    region: region || undefined,
    tag: toText(source.tag) || (isDefault ? '默认' : '常用'),
  }
}

function buildInvoiceRequestBody(payload: SaveInvoicePayload) {
  const invoiceType = resolveInvoiceTypeCode(payload.invoiceType)
  const isSpecial = invoiceType === 2

  return {
    bankAccount: isSpecial ? toText(payload.bankAccount) || undefined : undefined,
    bankName: isSpecial ? toText(payload.bankName) || undefined : undefined,
    invoiceType,
    isDefault: payload.isDefault === true,
    registerAddress: isSpecial ? toText(payload.registerAddress) || undefined : undefined,
    registerPhone: isSpecial ? toText(payload.registerPhone) || undefined : undefined,
    taxNo: isSpecial ? toText(payload.taxNo) || undefined : undefined,
    title: toText(payload.title),
  }
}

function buildAddressRequestBody(payload: SaveSampleAddressPayload) {
  const detailAddress = toText(payload.detailAddress) || toText(payload.address)

  return {
    contactName: toText(payload.contact),
    contactPhone: toText(payload.mobile),
    detailAddress,
    isDefault: payload.isDefault === true,
    region: toText(payload.region) || undefined,
  }
}

function resolveEnterpriseSource(raw: unknown): ApiRecord | null {
  if (isObject(raw)) {
    const candidates: unknown[] = [
      raw,
      raw.data,
      raw.result,
      raw.enterprise,
      raw.company,
      raw.organization,
      raw.org,
      raw.data?.enterprise,
      raw.result?.enterprise,
    ]

    for (const item of candidates) {
      if (isObject(item)) {
        return item
      }
    }
  }

  return null
}

function normalizeEnterpriseProfile(source: ApiRecord): EnterpriseProfile {
  return {
    contactName: toText(source.contactName || source.contact) || '-',
    contactPhone: toText(source.contactPhone || source.phone || source.mobile) || '-',
    creditCode: toText(source.unifiedCreditCode || source.creditCode) || '',
    enterpriseName: toText(source.enterpriseName || source.companyName || source.name) || '-',
    legalPerson: toText(source.legalPerson || source.principalName || source.ownerName) || '-',
    region: toText(source.region || source.area || source.address) || '-',
  }
}

function resolveEnterpriseId(source: ApiRecord | null) {
  if (!source) {
    return ''
  }

  return toText(source.id || source.enterpriseId || source.enterpriseID || source.companyId)
}

export const CONTACTS_API_READY = false

export async function getEnterpriseProfile() {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/enterprise/my',
  })
  const source = resolveEnterpriseSource(response)

  if (!source) {
    throw new Error('未获取到企业信息')
  }

  return normalizeEnterpriseProfile(source)
}

export async function saveEnterpriseProfile(payload: EnterpriseProfile) {
  const current = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/enterprise/my',
  })
  const source = resolveEnterpriseSource(current)
  const enterpriseId = resolveEnterpriseId(source)

  if (!enterpriseId) {
    throw new Error('缺少企业ID，无法保存企业资料')
  }

  await authRequest<void>({
    body: {
      contactName: toText(payload.contactName),
      contactPhone: toText(payload.contactPhone),
      enterpriseName: toText(payload.enterpriseName),
      legalPerson: toText(payload.legalPerson),
      region: toText(payload.region) || undefined,
      unifiedCreditCode: toText(payload.creditCode) || undefined,
    },
    method: 'PUT',
    path: '/api/user/enterprise/{enterpriseId}',
    pathParams: { enterpriseId },
  })

  return getEnterpriseProfile()
}

export async function getContacts() {
  return []
}

export async function saveContact(payload: Omit<ContactInfo, 'id'> & { id?: string }) {
  void payload
  throw new Error('联系人接口暂未接入')
}

export async function deleteContact(id: string) {
  void id
  throw new Error('联系人接口暂未接入')
}

export async function getInvoices() {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/invoice-info',
  })

  return resolveList(response).map(normalizeInvoice)
}

export async function getDefaultInvoice() {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/invoice-info/default',
  })

  if (!isObject(response) || !toText(response.id || response.invoiceId)) {
    return null
  }

  return normalizeInvoice(response)
}

export async function saveInvoice(payload: SaveInvoicePayload) {
  const body = buildInvoiceRequestBody(payload)
  const id = toText(payload.id)

  if (id) {
    await authRequest<void>({
      body,
      method: 'PUT',
      path: '/api/user/invoice-info/{id}',
      pathParams: { id },
    })
    return id
  }

  return authRequest<string | number>({
    body,
    method: 'POST',
    path: '/api/user/invoice-info',
  })
}

export async function deleteInvoice(id: string | number) {
  await authRequest<void>({
    method: 'DELETE',
    path: '/api/user/invoice-info/{id}',
    pathParams: { id },
  })
}

export async function setDefaultInvoice(id: string | number) {
  await authRequest<void>({
    method: 'PUT',
    path: '/api/user/invoice-info/{id}/default',
    pathParams: { id },
  })
}

export async function getSampleAddresses() {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/shipping-address',
  })

  return resolveList(response).map(normalizeAddress)
}

export async function getDefaultSampleAddress() {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/shipping-address/default',
  })

  if (!isObject(response) || !toText(response.id || response.addressId)) {
    return null
  }

  return normalizeAddress(response)
}

export async function saveSampleAddress(payload: SaveSampleAddressPayload) {
  const body = buildAddressRequestBody(payload)
  const id = toText(payload.id)

  if (id) {
    await authRequest<void>({
      body,
      method: 'PUT',
      path: '/api/user/shipping-address/{id}',
      pathParams: { id },
    })
    return id
  }

  return authRequest<string | number>({
    body,
    method: 'POST',
    path: '/api/user/shipping-address',
  })
}

export async function deleteSampleAddress(id: string | number) {
  await authRequest<void>({
    method: 'DELETE',
    path: '/api/user/shipping-address/{id}',
    pathParams: { id },
  })
}

export async function setDefaultSampleAddress(id: string | number) {
  await authRequest<void>({
    method: 'PUT',
    path: '/api/user/shipping-address/{id}/default',
    pathParams: { id },
  })
}
