import type {
  ContactInfo,
  EnterpriseProfile,
  InvoiceInfo,
  SampleAddress,
} from '@/types/business'
import {
  mockContacts,
  mockEnterpriseProfile,
  mockInvoices,
  mockSampleAddresses,
} from './mockBusiness'

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
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
  return wait(mockInvoices.map((item) => ({ ...item })))
}

export async function saveInvoice(payload: Omit<InvoiceInfo, 'id'> & { id?: string }) {
  if (payload.id) {
    const target = mockInvoices.find((item) => item.id === payload.id)
    if (target) {
      target.title = payload.title
      target.taxNo = payload.taxNo
      target.invoiceType = payload.invoiceType
      return wait({ ...target })
    }
  }

  const created: InvoiceInfo = {
    id: createId('invoice'),
    title: payload.title,
    taxNo: payload.taxNo,
    invoiceType: payload.invoiceType,
  }
  mockInvoices.unshift(created)
  return wait({ ...created })
}

export async function deleteInvoice(id: string) {
  const index = mockInvoices.findIndex((item) => item.id === id)

  if (index >= 0) {
    mockInvoices.splice(index, 1)
  }

  return wait(true)
}

export async function getSampleAddresses() {
  return wait(mockSampleAddresses.map((item) => ({ ...item })))
}

export async function saveSampleAddress(payload: Omit<SampleAddress, 'id'> & { id?: string }) {
  if (payload.id) {
    const target = mockSampleAddresses.find((item) => item.id === payload.id)
    if (target) {
      target.contact = payload.contact
      target.mobile = payload.mobile
      target.address = payload.address
      target.tag = payload.tag
      return wait({ ...target })
    }
  }

  const created: SampleAddress = {
    id: createId('address'),
    contact: payload.contact,
    mobile: payload.mobile,
    address: payload.address,
    tag: payload.tag,
  }
  mockSampleAddresses.unshift(created)
  return wait({ ...created })
}

export async function deleteSampleAddress(id: string) {
  const index = mockSampleAddresses.findIndex((item) => item.id === id)

  if (index >= 0) {
    mockSampleAddresses.splice(index, 1)
  }

  return wait(true)
}
