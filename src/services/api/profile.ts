import type {
  ContactInfo,
  EnterpriseProfile,
  InvoiceInfo,
  SampleAddress,
} from '@/types/business'
import { authRequest } from '@/services/http'
import {
  mockContacts,
  mockEnterpriseProfile,
} from './mockBusiness'

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

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
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

export async function getEnterpriseProfile() {
  return wait({ ...mockEnterpriseProfile })
}

export async function saveEnterpriseProfile(payload: EnterpriseProfile) {
  mockEnterpriseProfile.enterpriseName = payload.enterpriseName
  mockEnterpriseProfile.creditCode = payload.creditCode
  mockEnterpriseProfile.legalPerson = payload.legalPerson
  mockEnterpriseProfile.region = payload.region
  mockEnterpriseProfile.contactName = payload.contactName
  mockEnterpriseProfile.contactPhone = payload.contactPhone
  return wait({ ...mockEnterpriseProfile })
}

export async function getContacts() {
  return wait(mockContacts.map((item) => ({ ...item })))
}

export async function saveContact(payload: Omit<ContactInfo, 'id'> & { id?: string }) {
  if (payload.id) {
    const target = mockContacts.find((item) => item.id === payload.id)
    if (target) {
      target.name = payload.name
      target.mobile = payload.mobile
      target.role = payload.role
      return wait({ ...target })
    }
  }

  const created: ContactInfo = {
    id: createId('contact'),
    name: payload.name,
    mobile: payload.mobile,
    role: payload.role,
  }
  mockContacts.unshift(created)
  return wait({ ...created })
}

export async function deleteContact(id: string) {
  const index = mockContacts.findIndex((item) => item.id === id)

  if (index >= 0) {
    mockContacts.splice(index, 1)
  }

  return wait(true)
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
