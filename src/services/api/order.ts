import type { EntrustOrder, OrderStatus } from '@/types/business'
import { mockOrders } from './mockBusiness'
import * as tradeOrderService from './tradeOrder'

type ApiRecord = Record<string, any>
type EvaluationRecord = {
  content?: string
  id: string
  score: number
}

const mockEvaluations = new Map<string, EvaluationRecord>()

function cloneOrders() {
  return mockOrders.map((item) => ({ ...item, quoteItems: item.quoteItems.map((quote) => ({ ...quote })) }))
}

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
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
      return 'pending_sample'
    }

    if (numericStatus === 1) {
      return 'sample_received'
    }

    if (numericStatus === 2) {
      return 'testing'
    }

    if (numericStatus === 3 || numericStatus === 4) {
      return 'completed'
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

  if (statusHint.includes('完成') || statusHint.includes('closed') || statusHint.includes('finish')) {
    return 'completed'
  }

  return 'pending_quote'
}

function normalizeQuoteItems(raw: unknown, amount: number) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ amount, label: '委托金额' }]
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

  return [{ amount, label: '委托金额' }]
}

function normalizeOrder(order: unknown): EntrustOrder {
  const source = isObject(order) ? order : {}
  const amount = toNumber(source.amount) ?? 0
  const statusDesc = toText(source.statusDesc)
  const status = normalizeStatus(source.status, statusDesc)
  const orderNo = toText(source.orderNo) || toText(source.id) || '-'
  const id = toText(source.id) || orderNo
  const projectName = toText(source.demandTitle) || toText(source.projectName) || toText(source.title) || '检测委托'
  const institution = toText(source.institutionName) || toText(source.institution) || '未知机构'
  const progressText = statusDesc || getStatusLabel(status)

  return {
    amount,
    canDownloadReport: Boolean(source.reportId) || status === 'reported' || status === 'completed',
    createdAt: normalizeCreatedAt(source.createTime ?? source.createdAt),
    id,
    institution,
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

function findMockOrder(orderId: string) {
  return cloneOrders().find((item) => item.id === orderId)
}

function toTradeOrderId(orderId: string) {
  return toNumber(orderId) ?? orderId
}

function saveMockEvaluation(orderId: string, score: number, content?: string) {
  const id = `mock-eva-${Date.now()}`
  const record: EvaluationRecord = {
    content,
    id,
    score,
  }

  mockEvaluations.set(orderId, record)
  return record
}

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
  institution?: string
  institutionId?: string | number
  requirement?: string
  serviceType: string
  title?: string
}

function resolveCreatedOrderId(raw: unknown) {
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

function createMockDirectOrder(payload: CreateDirectOrderPayload) {
  const now = Date.now()
  const id = `order-${now}`
  const createdAt = new Date(now).toISOString().slice(0, 10)
  const projectName = payload.title?.trim() || payload.serviceType.trim() || '检测委托'
  const institution = payload.institution?.trim() || '平台推荐机构'

  mockOrders.unshift({
    amount: 0,
    canDownloadReport: false,
    createdAt,
    id,
    institution,
    orderNo: `WT${createdAt.replace(/-/g, '')}${String(now).slice(-4)}`,
    progressText: '订单已创建，待提交寄样信息',
    projectName,
    quoteItems: [{ amount: 0, label: '待报价' }],
    serviceStandard: '-',
    status: 'pending_quote',
  })

  return id
}

export async function createDirectOrder(payload: CreateDirectOrderPayload) {
  const serviceType = payload.serviceType.trim()
  const title = payload.title?.trim() || serviceType || '检测委托'
  const requirement = payload.requirement?.trim() || undefined
  const institutionIdNumber = toNumber(payload.institutionId)
  const institutionIdText = toText(payload.institutionId)
  const institutionId = institutionIdNumber ?? institutionIdText

  if (institutionId !== undefined && institutionId !== '') {
    try {
      const response = await tradeOrderService.createDirectOrder({
        institutionId,
        requirement,
        sampleDesc: requirement,
        serviceType: serviceType || title,
        title,
      })

      const createdOrderId = resolveCreatedOrderId(response)
      if (createdOrderId) {
        return createdOrderId
      }
    } catch {
      // ignore and fallback to local mock
    }
  }

  return createMockDirectOrder(payload)
}

export async function getList() {
  try {
    const response = await tradeOrderService.getMyList({
      page: 1,
      size: 100,
    })

    const records = normalizeOrderList(response)
    return records.map(normalizeOrder)
  } catch {
    return wait(cloneOrders())
  }
}

export async function getDetail(id: string) {
  try {
    const response = await tradeOrderService.getDetail(id)
    return normalizeOrder(response)
  } catch {
    const next = findMockOrder(id)
    return wait(next ?? null)
  }
}

function buildShippingPayload(orderId: string, payload: ConfirmEntrustPayload): tradeOrderService.TradeOrderShippingPayload {
  const normalizedOrderId = toNumber(orderId) ?? orderId
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
  try {
    await tradeOrderService.submitShipping(buildShippingPayload(orderId, payload))

    try {
      const response = await tradeOrderService.getDetail(orderId)
      return normalizeOrder(response)
    } catch {
      const fallback = findMockOrder(orderId)
      if (fallback) {
        return wait(fallback)
      }
    }
  } catch {
    // fall through to mock fallback
  }

  const target = mockOrders.find((item) => item.id === orderId)

  if (!target) {
    throw new Error('订单不存在')
  }

  target.status = 'pending_sample'
  target.progressText = `已提交寄样信息（${payload.contactName}），待机构收样`
  return wait({ ...target })
}

export async function updateStatus(orderId: string, status: OrderStatus, progressText: string) {
  const target = mockOrders.find((item) => item.id === orderId)

  if (!target) {
    throw new Error('订单不存在')
  }

  target.status = status
  target.progressText = progressText
  return wait({ ...target })
}

export async function cancelOrder(orderId: string, reason?: string) {
  const normalizedReason = reason?.trim() || '需求方主动取消'

  try {
    await tradeOrderService.cancelOrder(toTradeOrderId(orderId), normalizedReason)
    return await getDetail(orderId)
  } catch {
    const target = mockOrders.find((item) => item.id === orderId)
    if (target) {
      target.status = 'completed'
      target.progressText = `订单已取消（${normalizedReason}）`
    }

    return await getDetail(orderId)
  }
}

export async function amendEntrust(orderId: string, payload: {
  remark?: string
  testProject?: string
  testStandard?: string
}) {
  try {
    await tradeOrderService.amendEntrust(toTradeOrderId(orderId), {
      remark: payload.remark?.trim() || undefined,
      testProject: payload.testProject?.trim() || undefined,
      testStandard: payload.testStandard?.trim() || undefined,
    })
  } catch {
    // mock 下保持静默，页面侧继续展示兜底数据
  }

  return await getDetail(orderId)
}

export async function submitSampleSupplement(orderId: string, expressNo: string, expressCompany?: string) {
  const normalizedExpressNo = expressNo.trim()
  const normalizedExpressCompany = expressCompany?.trim() || undefined

  try {
    await tradeOrderService.submitSampleSupplement(
      toTradeOrderId(orderId),
      normalizedExpressNo,
      normalizedExpressCompany,
    )
  } catch {
    // mock 下保持静默，页面侧继续展示兜底数据
  }

  return await getDetail(orderId)
}

export async function applySampleReturn(orderId: string, reason?: string) {
  const normalizedReason = reason?.trim() || undefined

  try {
    await tradeOrderService.applySampleReturn(toTradeOrderId(orderId), normalizedReason)
  } catch {
    // mock 下保持静默，页面侧继续展示兜底数据
  }

  return await getDetail(orderId)
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

  try {
    await tradeOrderService.confirmReceive({
      normal,
      orderId: toTradeOrderId(orderId),
      receivePhotos,
      receiveRemark: payload.receiveRemark?.trim() || undefined,
    })
  } catch {
    const target = mockOrders.find((item) => item.id === orderId)
    if (target) {
      target.status = 'reported'
      target.progressText = normal ? '已确认收样' : '已登记收样异常'
    }
  }

  return await getDetail(orderId)
}

export async function createEvaluation(orderId: string, score: number, content?: string) {
  const normalizedScore = Number.isFinite(score) ? score : 5
  const normalizedContent = content?.trim() || undefined

  try {
    return await tradeOrderService.createEvaluation({
      content: normalizedContent,
      orderId: toTradeOrderId(orderId),
      score: normalizedScore,
    })
  } catch {
    return saveMockEvaluation(orderId, normalizedScore, normalizedContent)
  }
}

export async function getEvaluationByOrder(orderId: string) {
  try {
    return await tradeOrderService.getEvaluationByOrder(toTradeOrderId(orderId))
  } catch {
    return mockEvaluations.get(orderId) ?? null
  }
}

export async function deleteEvaluation(evaluationId: string | number) {
  const normalizedId = toText(evaluationId)

  try {
    await tradeOrderService.deleteEvaluation(normalizedId)
    return true
  } catch {
    for (const [orderId, evaluation] of mockEvaluations.entries()) {
      if (evaluation.id === normalizedId) {
        mockEvaluations.delete(orderId)
        return true
      }
    }

    return false
  }
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
    sample_received: '已收样',
    testing: '检测中',
    reported: '已出报告',
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
    { key: 'sample_received', label: '已收样' },
    { key: 'testing', label: '检测中' },
    { key: 'reported', label: '已出报告' },
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
