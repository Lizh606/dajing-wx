import { authRequest } from '@/services/http'

export interface OrderProgressRecord {
  createTime?: string
  id?: number
  isDeleted?: number
  node?: string
  operatorId?: number
  orderId?: number
  photos?: string
  remark?: string
  updateTime?: string
}

export interface AddOrderProgressPayload {
  node: string
  photos?: string | string[]
  remark?: string
}

function normalizePhotos(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(',') || undefined
  }

  return value?.trim() || undefined
}

export function getOrderProgressList(orderId: string | number) {
  return authRequest<OrderProgressRecord[]>({
    method: 'GET',
    path: '/api/trade/order-progress/{orderId}',
    pathParams: { orderId },
  })
}

export function addOrderProgressNode(orderId: string | number, payload: AddOrderProgressPayload) {
  return authRequest<void>({
    method: 'POST',
    path: '/api/trade/order-progress/{orderId}/add',
    pathParams: { orderId },
    query: {
      node: payload.node,
      photos: normalizePhotos(payload.photos),
      remark: payload.remark,
    },
  })
}
