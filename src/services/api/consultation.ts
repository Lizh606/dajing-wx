import { authRequest } from '@/services/http'

type ApiRecord = Record<string, any>

export interface ConsultationRecord {
  attachmentUrl?: string
  contactEmail?: string
  contactName?: string
  contactPhone?: string
  content?: string
  createTime?: string
  id?: number
  operatorId?: number
  replyContent?: string
  replyTime?: string
  reqType?: string
  status?: number
  updateTime?: string
  userId?: number
}

export interface ConsultationSubmitPayload {
  attachmentUrl?: string
  contactEmail?: string
  contactName: string
  contactPhone: string
  content: string
  reqType: string
}

function isObject(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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

export function submit(payload: ConsultationSubmitPayload) {
  return authRequest<number>({
    body: payload,
    method: 'POST',
    path: '/api/base/consultation/submit',
  })
}

export function getMyList() {
  return authRequest<ConsultationRecord[]>({
    method: 'GET',
    path: '/api/base/consultation/my',
  })
}

export function getDetail(id: string | number) {
  return authRequest<ConsultationRecord>({
    method: 'GET',
    path: '/api/base/consultation/{id}',
    pathParams: { id },
  })
}

export function normalizeConsultationStatus(status: unknown) {
  const value = toNumber(status)

  if (value === 1) {
    return '处理中'
  }

  if (value === 2) {
    return '已回复'
  }

  if (value === 3) {
    return '已关闭'
  }

  return '待处理'
}

export function ensureConsultationList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload as ConsultationRecord[]
  }

  if (isObject(payload) && Array.isArray(payload.records)) {
    return payload.records as ConsultationRecord[]
  }

  return []
}
