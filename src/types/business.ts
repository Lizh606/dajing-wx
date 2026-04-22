export type OrderStatus =
  | 'pending_quote'
  | 'pending_payment'
  | 'pending_sample'
  | 'sample_received'
  | 'testing'
  | 'reported'
  | 'cancelled'
  | 'abnormal'
  | 'completed'

export interface OrderProgressNode {
  done: boolean
  key: OrderStatus
  time: string
  title: string
}

export interface OrderQuoteItem {
  amount: number
  label: string
}

export interface EntrustOrder {
  amount: number
  buyerContactName?: string
  buyerContactPhone?: string
  canDownloadReport: boolean
  createdAt: string
  demandUserName?: string
  demandUserPhone?: string
  id: string
  institution: string
  offlinePaymentConfirmed?: boolean
  offlinePaymentVoucher?: string
  orderNo: string
  progressText: string
  projectName: string
  quoteItems: OrderQuoteItem[]
  reportId?: string
  serviceStandard: string
  status: OrderStatus
}

export type SampleStatus =
  | 'pending_dispatch'
  | 'in_transit'
  | 'received'
  | 'testing'
  | 'retained'
  | 'returned'
  | 'abnormal'

export interface SampleTrackItem {
  note: string
  status: SampleStatus
  time: string
}

export interface SampleRecord {
  currentStatus: SampleStatus
  id: string
  latestNote: string
  orderId: string
  retained: boolean
  sampleName: string
  sampleNo: string
  tracks: SampleTrackItem[]
}

export interface ReportVersionRecord {
  action: 'create' | 'reissue' | 'void'
  actor: string
  note: string
  time: string
  version: string
}

export interface ReportRecord {
  antiFakeCode: string
  antiFakeQr: string
  createdAt: string
  id: string
  institution: string
  orderId: string
  orderNo: string
  reportName: string
  reportNo: string
  status: 'valid' | 'void'
  version: string
  versionRecords: ReportVersionRecord[]
}

export interface ReportVerifyResult {
  canView: boolean
  message: string
  report?: ReportRecord
  verifiedAt: string
}

export interface ProviderCodeInfo {
  code: string
  enterpriseId: string
  enterpriseName: string
  updatedAt: string
}

export interface ContactInfo {
  id: string
  mobile: string
  name: string
  role: string
}

export interface InvoiceInfo {
  bankAccount?: string
  bankName?: string
  id: string | number
  invoiceType: '增值税专票' | '增值税普票'
  invoiceTypeCode?: 1 | 2
  isDefault?: boolean
  registerAddress?: string
  registerPhone?: string
  taxNo: string
  title: string
}

export interface SampleAddress {
  detailAddress?: string
  id: string | number
  isDefault?: boolean
  region?: string
  address: string
  contact: string
  mobile: string
  tag: string
}

export interface EnterpriseProfile {
  contactName: string
  contactPhone: string
  creditCode: string
  enterpriseName: string
  legalPerson: string
  region: string
}
