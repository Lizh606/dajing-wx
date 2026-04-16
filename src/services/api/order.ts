import type { EntrustOrder, OrderStatus } from '@/types/business'
import { mockOrders } from './mockBusiness'

function cloneOrders() {
  return mockOrders.map((item) => ({ ...item, quoteItems: item.quoteItems.map((quote) => ({ ...quote })) }))
}

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
}

export interface ConfirmEntrustPayload {
  contactName: string
  dispatchType: 'self' | 'door'
  needDoorService: boolean
  needInvoice: boolean
  receiveAddress: string
}

export async function getList() {
  return wait(cloneOrders())
}

export async function getDetail(id: string) {
  const next = cloneOrders().find((item) => item.id === id)
  return wait(next ?? null)
}

export async function confirmEntrust(orderId: string, payload: ConfirmEntrustPayload) {
  const target = mockOrders.find((item) => item.id === orderId)

  if (!target) {
    throw new Error('订单不存在')
  }

  target.status = 'pending_payment'
  target.progressText = `委托已确认（${payload.contactName}），待付款`
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
