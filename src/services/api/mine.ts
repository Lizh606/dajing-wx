import { authRequest } from '@/services/http'

type ApiRecord = Record<string, any>

export interface MineOverview {
  consultationCount?: number
  demandCount?: number
  orderCount?: number
  reportCount?: number
  unreadMessageCount?: number
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

function getByPath(source: unknown, path: string[]) {
  let current = source

  for (const key of path) {
    if (!isObject(current) || !(key in current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

function pickNumber(sources: unknown[], paths: string[][]) {
  for (const source of sources) {
    for (const path of paths) {
      const value = toNumber(getByPath(source, path))
      if (typeof value === 'number') {
        return value
      }
    }
  }

  return undefined
}

function unwrapCandidates(raw: unknown) {
  const candidates: unknown[] = [raw]

  if (!isObject(raw)) {
    return candidates
  }

  const nestedKeys = ['data', 'result', 'summary', 'overview', 'stats']
  for (const key of nestedKeys) {
    if (key in raw) {
      candidates.push(raw[key])
    }
  }

  return candidates
}

function normalizeOverview(raw: unknown): MineOverview {
  const sources = unwrapCandidates(raw)

  return {
    consultationCount: pickNumber(sources, [
      ['consultationCount'],
      ['consultCount'],
      ['consultCountTotal'],
      ['myConsultationCount'],
      ['myConsultCount'],
      ['inquiryCount'],
    ]),
    demandCount: pickNumber(sources, [
      ['demandCount'],
      ['myDemandCount'],
      ['myDemands'],
      ['demandTotal'],
    ]),
    orderCount: pickNumber(sources, [
      ['orderCount'],
      ['myOrderCount'],
      ['orderTotal'],
      ['totalOrderCount'],
    ]),
    reportCount: pickNumber(sources, [
      ['reportCount'],
      ['myReportCount'],
      ['reportTotal'],
      ['totalReportCount'],
    ]),
    unreadMessageCount: pickNumber(sources, [
      ['unreadMessageCount'],
      ['messageUnreadCount'],
      ['unreadCount'],
      ['unread'],
      ['unreadMsgCount'],
    ]),
  }
}

export async function getOverview() {
  const response = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/mine/overview',
  })

  return normalizeOverview(response)
}

