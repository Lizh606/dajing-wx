import { authRequest } from '@/services/http'

type ApiRecord = Record<string, any>

export interface TradeOrderListQuery {
  page?: number
  size?: number
  status?: number
}

export interface TradeOrderPayCallbackQuery {
  outTradeNo?: string
  payChannel?: string
}

export interface TradeOrderEvaluatePayload {
  content?: string
  orderId: string | number
  score: number
}

export interface TradeOrderShippingPayload {
  expressCompany?: string
  expressNo?: string
  orderId: string | number
  pickupAddress?: string
  pickupContact?: string
  pickupPhone?: string
  pickupTime?: string
  shippingMethod: 1 | 2 | number
  shippingVoucher?: string
}

export interface TradeOrderReceiveConfirmPayload {
  normal: boolean
  orderId: string | number
  receivePhotos?: string
  receiveRemark?: string
}

export interface TradeOrderDirectPayload {
  amount?: number
  attachments?: string
  estimatedDays?: number
  institutionId: string | number
  requirement?: string
  sampleDesc?: string
  serviceType: string
  shippingMethod?: 1 | 2 | number
  title: string
}

export interface TradeOrderConfirmPayload {
  bidId: string | number
  invoiceInfoId?: string | number
  ndaAgreed: boolean
  orderRemark?: string
  serviceAgreementAgreed: boolean
  shippingAddressId: string | number
  shippingMethod: 1 | 2 | number
}

export function releaseEscrow(orderId: string | number) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/release-escrow',
    pathParams: { orderId },
  })
}

export function payCallback(orderId: string | number, query: TradeOrderPayCallbackQuery = {}) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/pay-callback',
    pathParams: { orderId },
    query: {
      outTradeNo: query.outTradeNo,
      payChannel: query.payChannel,
    },
  })
}

export function uploadOfflinePaymentVoucher(orderId: string | number, voucherUrl: string) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/offline-payment',
    pathParams: { orderId },
    query: { voucherUrl },
  })
}

export function confirmReport(orderId: string | number) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/confirm-report',
    pathParams: { orderId },
  })
}

export function confirmOfflinePayment(orderId: string | number) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/confirm-offline-payment',
    pathParams: { orderId },
  })
}

export function cancelOrder(orderId: string | number, reason?: string) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/cancel',
    pathParams: { orderId },
    query: { reason },
  })
}

export function amendEntrust(orderId: string | number, query: {
  remark?: string
  testProject?: string
  testStandard?: string
}) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/trade/order/{orderId}/amend-entrust',
    pathParams: { orderId },
    query: {
      remark: query.remark,
      testProject: query.testProject,
      testStandard: query.testStandard,
    },
  })
}

export function submitSampleSupplement(orderId: string | number, expressNo: string, expressCompany?: string) {
  return authRequest<void>({
    method: 'POST',
    path: '/api/trade/order/{orderId}/sample-supplement',
    pathParams: { orderId },
    query: {
      expressCompany,
      expressNo,
    },
  })
}

export function applySampleReturn(orderId: string | number, reason?: string) {
  return authRequest<void>({
    method: 'POST',
    path: '/api/trade/order/{orderId}/sample-return',
    pathParams: { orderId },
    query: { reason },
  })
}

export function submitShipping(payload: TradeOrderShippingPayload) {
  return authRequest<void>({
    body: payload,
    method: 'POST',
    path: '/api/trade/order/shipping',
  })
}

export function confirmReceive(payload: TradeOrderReceiveConfirmPayload) {
  return authRequest<void>({
    body: payload,
    method: 'POST',
    path: '/api/trade/order/receive-confirm',
  })
}

export function createEvaluation(payload: TradeOrderEvaluatePayload) {
  return authRequest<void>({
    body: payload,
    method: 'POST',
    path: '/api/trade/order/evaluate',
  })
}

export function confirmBid(bidId: string | number) {
  return authRequest<ApiRecord>({
    method: 'POST',
    path: '/api/trade/order/confirm/{bidId}',
    pathParams: { bidId },
  })
}

export function confirmOrder(payload: TradeOrderConfirmPayload) {
  return authRequest<ApiRecord>({
    body: payload,
    method: 'POST',
    path: '/api/trade/order/confirm',
  })
}

export function getDetail(orderId: string | number) {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/order/{orderId}',
    pathParams: { orderId },
  })
}

export function getMyList(query: TradeOrderListQuery = {}) {
  return authRequest<ApiRecord>({
    authExpiredBehavior: 'toast',
    method: 'GET',
    path: '/api/trade/order/my',
    query: {
      page: query.page,
      size: query.size,
      status: query.status,
    },
  })
}

export function getEvaluationByOrder(orderId: string | number) {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/order/evaluate/{orderId}',
    pathParams: { orderId },
  })
}

export function deleteEvaluation(evaluationId: string | number) {
  return authRequest<void>({
    method: 'DELETE',
    path: '/api/trade/order/evaluate/{evaluationId}',
    pathParams: { evaluationId },
  })
}

export function createDirectOrder(payload: TradeOrderDirectPayload) {
  return authRequest<ApiRecord>({
    body: payload,
    method: 'POST',
    path: '/api/trade/order/direct',
  })
}
