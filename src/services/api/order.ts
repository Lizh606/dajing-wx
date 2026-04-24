import type { EntrustOrder, OrderStatus } from '@/types/business'
import * as tradeOrderService from './tradeOrder'
import * as orderProgressService from './orderProgress'
import type { TradeOrderDirectServiceType } from './tradeOrder'

type ApiRecord = Record<string, any>

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

function toBooleanFlag(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }

  const numeric = toNumber(value)
  if (numeric !== undefined) {
    return numeric === 1
  }

  const text = toText(value).toLowerCase()
  if (!text) {
    return false
  }

  return text === 'true' || text === 'yes' || text === 'y'
}

function resolveOfflinePaymentVoucher(source: ApiRecord) {
  return toText(
    source.offlinePaymentVoucher
    || source.voucherUrl
    || source.paymentVoucher
    || source.offlineVoucherUrl
    || source.payVoucherUrl,
  ) || undefined
}

function normalizeCreatedAt(value: unknown) {
  const text = toText(value)

  if (!text) {
    return '-'
  }

  const matched = text.match(/\d{4}-\d{2}-\d{2}/)
  if (matched) {
    return matched[0]
  }

  return text
}

function normalizeStatus(status: unknown, statusDesc: string): OrderStatus {
  const numericStatus = toNumber(status)

  if (numericStatus !== undefined) {
    if (numericStatus === 0) {
      return 'pending_payment'
    }

    if (numericStatus === 1) {
      return 'pending_sample'
    }

    if (numericStatus === 2) {
      return 'sample_received'
    }

    if (numericStatus === 3) {
      return 'testing'
    }

    if (numericStatus === 4) {
      return 'reported'
    }

    if (numericStatus === 5) {
      return 'completed'
    }

    if (numericStatus === 6 || numericStatus === 7) {
      return 'cancelled'
    }

    if (numericStatus === 8) {
      return 'abnormal'
    }
  }

  const rawText = toText(status).toLowerCase()
  const normalizedText = rawText.replace(/[\s-]/g, '_')
  const legacyStatuses: OrderStatus[] = [
    'pending_quote',
    'pending_payment',
    'pending_sample',
    'sample_received',
    'testing',
    'reported',
    'cancelled',
    'abnormal',
    'completed',
  ]

  if (legacyStatuses.includes(normalizedText as OrderStatus)) {
    return normalizedText as OrderStatus
  }

  const statusHint = `${rawText} ${statusDesc}`.toLowerCase()
  if (statusHint.includes('报价') || statusHint.includes('quote')) {
    return 'pending_quote'
  }

  if (statusHint.includes('付款') || statusHint.includes('pay')) {
    return 'pending_payment'
  }

  if (statusHint.includes('寄样') || statusHint.includes('shipping')) {
    return 'pending_sample'
  }

  if (statusHint.includes('收样') || statusHint.includes('receive')) {
    return 'sample_received'
  }

  if (statusHint.includes('检测') || statusHint.includes('testing')) {
    return 'testing'
  }

  if (statusHint.includes('报告') || statusHint.includes('report')) {
    return 'reported'
  }

  if (statusHint.includes('取消') || statusHint.includes('退样') || statusHint.includes('cancel')) {
    return 'cancelled'
  }

  if (statusHint.includes('异常') || statusHint.includes('abnormal') || statusHint.includes('exception')) {
    return 'abnormal'
  }

  if (statusHint.includes('完成') || statusHint.includes('closed') || statusHint.includes('finish')) {
    return 'completed'
  }

  return 'pending_quote'
}

function normalizeQuoteItems(raw: unknown, amount: number) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ amount, label: '下单金额' }]
  }

  const normalized = raw.map((item, index) => {
    if (!isObject(item)) {
      return {
        amount: 0,
        label: `费用项${index + 1}`,
      }
    }

    return {
      amount: toNumber(item.amount) ?? 0,
      label: toText(item.label) || toText(item.name) || `费用项${index + 1}`,
    }
  })

  if (normalized.some((item) => item.amount > 0)) {
    return normalized
  }

  return [{ amount, label: '下单金额' }]
}

function normalizeOrder(order: unknown): EntrustOrder {
  const source = isObject(order) ? order : {}
  const amount = toNumber(source.amount) ?? 0
  const statusDesc = toText(source.statusDesc)
  const status = normalizeStatus(source.status, statusDesc)
  const orderNo = toText(source.orderNo) || toText(source.id) || '-'
  const id = toText(source.id) || orderNo
  const projectName = toText(source.demandTitle) || toText(source.projectName) || toText(source.title) || '检测服务'
  const institution = toText(source.institutionName) || toText(source.institution) || '未知机构'
  const progressText = statusDesc || getStatusLabel(status)

  return {
    amount,
    buyerContactName: toText(source.buyerContactName) || toText(source.demandUserName) || undefined,
    buyerContactPhone: toText(source.buyerContactPhone) || toText(source.demandUserPhone) || undefined,
    canDownloadReport: Boolean(source.reportId) || status === 'reported' || status === 'completed',
    createdAt: normalizeCreatedAt(source.createTime ?? source.createdAt),
    demandUserName: toText(source.demandUserName) || undefined,
    demandUserPhone: toText(source.demandUserPhone) || undefined,
    id,
    institution,
    offlinePaymentConfirmed: toBooleanFlag(
      source.offlinePaymentConfirmed ?? source.paymentConfirmed ?? source.payConfirmed,
    ),
    offlinePaymentVoucher: resolveOfflinePaymentVoucher(source),
    orderNo,
    progressText,
    projectName,
    quoteItems: normalizeQuoteItems(source.quoteItems, amount),
    reportId: toText(source.reportId) || undefined,
    serviceStandard: toText(source.serviceStandard) || toText(source.testStandard) || '-',
    status,
  }
}

function normalizeOrderList(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
  }

  if (!isObject(raw)) {
    return []
  }

  const candidates = [raw.records, raw.list, raw.items, raw.content]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function toTradeOrderId(orderId: string) {
  return toText(orderId)
}

export const DEFAULT_OFFLINE_VOUCHER_URL = 'https://qip.hauchet.cn/static/mock/offline-voucher.png'

function resolveEvaluationId(value: unknown): string {
  if (Array.isArray(value)) {
    for (const item of value) {
      const id: string = resolveEvaluationId(item)
      if (id) {
        return id
      }
    }

    return ''
  }

  if (!isObject(value)) {
    return toText(value)
  }

  return toText(value.id || value.evaluationId || value.recordId)
}

export interface ConfirmEntrustPayload {
  contactName: string
  contactPhone?: string
  dispatchType: 'self' | 'door'
  expressCompany?: string
  expressNo?: string
  needDoorService: boolean
  needInvoice: boolean
  receiveAddress: string
  shippingVoucher?: string
}

export interface CreateDirectOrderPayload {
  amount?: number
  estimatedDays?: number
  institution?: string
  institutionId?: string | number
  requirement?: string
  serviceType: TradeOrderDirectServiceType
  title?: string
}

function resolveCreatedOrderId(raw: unknown) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(raw)
  }

  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim()
  }

  if (!isObject(raw)) {
    return ''
  }

  return toText(
    raw.orderId
      || raw.id
      || raw.data?.orderId
      || raw.data?.id
      || raw.result?.orderId
      || raw.result?.id,
  )
}

export interface ConfirmOrderPayload {
  bidId: string | number
  invoiceInfoId?: string | number
  ndaAgreed: boolean
  orderRemark?: string
  serviceAgreementAgreed: boolean
  shippingAddressId: string | number
  shippingMethod: 1 | 2
}

export async function createDirectOrder(payload: CreateDirectOrderPayload) {
  const serviceType = payload.serviceType
  const title = payload.title?.trim() || serviceType || '检测服务'
  const requirement = payload.requirement?.trim() || undefined
  const institutionId = toText(payload.institutionId)
  const amount = toNumber(payload.amount) ?? 0
  const estimatedDays = Math.max(1, Math.round(toNumber(payload.estimatedDays) ?? 1))

  if (!institutionId) {
    throw new Error('缺少机构ID，无法创建直单')
  }

  const response = await tradeOrderService.createDirectOrder({
    amount,
    estimatedDays,
    institutionId,
    requirement,
    sampleDesc: requirement,
    serviceType,
    title,
  })

  const createdOrderId = resolveCreatedOrderId(response)
  if (!createdOrderId) {
    throw new Error('下单成功，但未返回订单号')
  }

  return createdOrderId
}

export async function confirmOrder(payload: ConfirmOrderPayload) {
  const response = await tradeOrderService.confirmOrder({
    bidId: payload.bidId,
    invoiceInfoId: payload.invoiceInfoId,
    ndaAgreed: payload.ndaAgreed,
    orderRemark: payload.orderRemark?.trim() || undefined,
    serviceAgreementAgreed: payload.serviceAgreementAgreed,
    shippingAddressId: payload.shippingAddressId,
    shippingMethod: payload.shippingMethod,
  })

  const createdOrderId = resolveCreatedOrderId(response)
  if (!createdOrderId) {
    throw new Error('下单成功，但未返回订单号')
  }

  return createdOrderId
}

export async function getList() {
  const response = await tradeOrderService.getMyList({
    page: 1,
    size: 100,
  })

  const records = normalizeOrderList(response)
  return records.map(normalizeOrder)
}

export async function getDetail(id: string) {
  const response = await tradeOrderService.getDetail(id)
  return normalizeOrder(response)
}

function buildShippingPayload(orderId: string, payload: ConfirmEntrustPayload): tradeOrderService.TradeOrderShippingPayload {
  const normalizedOrderId = toTradeOrderId(orderId)
  const shippingMethod = payload.dispatchType === 'door' ? 2 : 1

  if (shippingMethod === 2) {
    return {
      orderId: normalizedOrderId,
      pickupAddress: payload.receiveAddress.trim(),
      pickupContact: payload.contactName.trim(),
      pickupPhone: payload.contactPhone?.trim() || undefined,
      shippingMethod,
    }
  }

  return {
    expressCompany: payload.expressCompany?.trim() || undefined,
    expressNo: payload.expressNo?.trim() || undefined,
    orderId: normalizedOrderId,
    shippingMethod,
    shippingVoucher: payload.shippingVoucher?.trim() || undefined,
  }
}

export async function confirmEntrust(orderId: string, payload: ConfirmEntrustPayload) {
  await tradeOrderService.submitShipping(buildShippingPayload(orderId, payload))
  return getDetail(orderId)
}

export async function confirmPayment(orderId: string, query: tradeOrderService.TradeOrderPayCallbackQuery = {}) {
  await tradeOrderService.payCallback(toTradeOrderId(orderId), {
    outTradeNo: query.outTradeNo,
    payChannel: query.payChannel,
  })
  return getDetail(orderId)
}

export async function submitOfflinePaymentVoucher(orderId: string, voucherUrl = DEFAULT_OFFLINE_VOUCHER_URL) {
  const normalizedVoucherUrl = voucherUrl.trim() || DEFAULT_OFFLINE_VOUCHER_URL
  const normalizedOrderId = toTradeOrderId(orderId)

  await tradeOrderService.uploadOfflinePaymentVoucher(normalizedOrderId, normalizedVoucherUrl)
  return getDetail(orderId)
}

export async function confirmOfflinePayment(orderId: string) {
  const normalizedOrderId = toTradeOrderId(orderId)
  await tradeOrderService.confirmOfflinePayment(normalizedOrderId)
  return getDetail(orderId)
}

export async function confirmReport(orderId: string) {
  const normalizedOrderId = toTradeOrderId(orderId)
  await tradeOrderService.confirmReport(normalizedOrderId)
  return getDetail(orderId)
}

export async function updateStatus(orderId: string, status: OrderStatus, progressText: string) {
  const normalizedOrderId = toTradeOrderId(orderId)
  const normalizedProgressText = progressText?.trim() || getStatusLabel(status)

  if (status === 'reported') {
    await tradeOrderService.confirmReport(normalizedOrderId)
  }

  await orderProgressService.addOrderProgressNode(normalizedOrderId, {
    node: normalizedProgressText,
    remark: `订单状态更新为${getStatusLabel(status)}`,
  })

  return getDetail(orderId)
}

export async function cancelOrder(orderId: string, reason?: string) {
  const normalizedReason = reason?.trim() || '需求方主动取消'
  await tradeOrderService.cancelOrder(toTradeOrderId(orderId), normalizedReason)
  return getDetail(orderId)
}

export async function amendEntrust(orderId: string, payload: {
  remark?: string
  testProject?: string
  testStandard?: string
}) {
  await tradeOrderService.amendEntrust(toTradeOrderId(orderId), {
    remark: payload.remark?.trim() || undefined,
    testProject: payload.testProject?.trim() || undefined,
    testStandard: payload.testStandard?.trim() || undefined,
  })
  return getDetail(orderId)
}

export async function submitSampleSupplement(orderId: string, expressNo: string, expressCompany?: string) {
  const normalizedExpressNo = expressNo.trim()
  const normalizedExpressCompany = expressCompany?.trim() || undefined

  await tradeOrderService.submitSampleSupplement(
    toTradeOrderId(orderId),
    normalizedExpressNo,
    normalizedExpressCompany,
  )
  return getDetail(orderId)
}

export async function applySampleReturn(orderId: string, reason?: string) {
  const normalizedReason = reason?.trim() || undefined

  await tradeOrderService.applySampleReturn(toTradeOrderId(orderId), normalizedReason)
  return getDetail(orderId)
}

export async function confirmReceive(orderId: string, payload: {
  normal?: boolean
  receivePhotos?: string[] | string
  receiveRemark?: string
} = {}) {
  const normal = payload.normal ?? true
  const receivePhotos = Array.isArray(payload.receivePhotos)
    ? JSON.stringify(payload.receivePhotos)
    : payload.receivePhotos

  await tradeOrderService.confirmReceive({
    normal,
    orderId: toTradeOrderId(orderId),
    receivePhotos,
    receiveRemark: payload.receiveRemark?.trim() || undefined,
  })
  return getDetail(orderId)
}

export async function createEvaluation(orderId: string, score: number, content?: string) {
  const normalizedScore = Number.isFinite(score) ? score : 5
  const normalizedContent = content?.trim() || undefined

  return tradeOrderService.createEvaluation({
    content: normalizedContent,
    orderId: toTradeOrderId(orderId),
    score: normalizedScore,
  })
}

export async function getEvaluationByOrder(orderId: string) {
  return tradeOrderService.getEvaluationByOrder(toTradeOrderId(orderId))
}

export async function deleteEvaluation(evaluationId: string | number) {
  const normalizedId = toText(evaluationId)
  await tradeOrderService.deleteEvaluation(normalizedId)
  return true
}

export async function deleteLatestEvaluation(orderId: string) {
  const evaluation = await getEvaluationByOrder(orderId)
  const evaluationId = resolveEvaluationId(evaluation)

  if (!evaluationId) {
    return false
  }

  return deleteEvaluation(evaluationId)
}

export function getStatusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending_quote: '待报价',
    pending_payment: '待付款',
    pending_sample: '待寄样',
    sample_received: '待收样',
    testing: '检测中',
    reported: '已出报告',
    cancelled: '已取消',
    abnormal: '异常',
    completed: '已完成',
  }

  return map[status]
}

export function getStatusProgress(status: OrderStatus) {
  const map: Record<OrderStatus, number> = {
    pending_quote: 8,
    pending_payment: 20,
    pending_sample: 36,
    sample_received: 54,
    testing: 72,
    reported: 90,
    cancelled: 100,
    abnormal: 100,
    completed: 100,
  }

  return map[status]
}

export function getStatusTone(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending_quote: 'rose',
    pending_payment: 'amber',
    pending_sample: 'orange',
    sample_received: 'cyan',
    testing: 'blue',
    reported: 'violet',
    cancelled: 'slate',
    abnormal: 'rose',
    completed: 'green',
  }

  return map[status]
}

export function buildOrderStatusTabs() {
  return [
    { key: 'all', label: '全部' },
    { key: 'pending_quote', label: '待报价' },
    { key: 'pending_payment', label: '待付款' },
    { key: 'pending_sample', label: '待寄样' },
    { key: 'sample_received', label: '待收样' },
    { key: 'testing', label: '检测中' },
    { key: 'reported', label: '已出报告' },
    { key: 'cancelled', label: '已取消' },
    { key: 'abnormal', label: '异常' },
    { key: 'completed', label: '已完成' },
  ] as const
}

export type OrderTabKey = ReturnType<typeof buildOrderStatusTabs>[number]['key']

export function filterOrdersByTab(orders: EntrustOrder[], tab: OrderTabKey) {
  if (tab === 'all') {
    return orders
  }

  return orders.filter((item) => item.status === tab)
}
