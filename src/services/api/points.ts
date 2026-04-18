import { authRequest, request } from '@/services/http'

type ApiRecord = Record<string, any>

export interface PointsSummary {
  availablePoints: number
  memberLevel?: number
  totalPoints: number
}

export interface PointsHistoryQuery {
  page?: number
  size?: number
}

export interface PointsHistoryItem {
  afterPoints?: number
  beforePoints?: number
  changePoints: number
  createdAt?: string
  id?: string
  remark?: string
  ruleCode?: string
  scene?: string
}

export interface PointsHistoryPage {
  list: PointsHistoryItem[]
  page: number
  size: number
  total: number
}

export interface PointsRuleItem {
  description?: string
  points?: number
  ruleCode?: string
  scene?: string
  title: string
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

function pickNumber(source: unknown, keys: string[]) {
  if (!isObject(source)) {
    return undefined
  }

  for (const key of keys) {
    if (!(key in source)) {
      continue
    }

    const nextValue = toNumber(source[key])
    if (nextValue !== undefined) {
      return nextValue
    }
  }

  return undefined
}

function pickText(source: unknown, keys: string[]) {
  if (!isObject(source)) {
    return ''
  }

  for (const key of keys) {
    if (!(key in source)) {
      continue
    }

    const nextValue = toText(source[key])
    if (nextValue) {
      return nextValue
    }
  }

  return ''
}

function unwrapCandidates(raw: unknown) {
  if (!isObject(raw)) {
    return [raw]
  }

  const candidates = [raw]
  const valueKeys = ['data', 'result', 'summary', 'points', 'userPoints']

  for (const key of valueKeys) {
    const nextValue = raw[key]

    if (nextValue !== undefined) {
      candidates.push(nextValue)
    }
  }

  return candidates
}

function normalizePointsSummary(raw: unknown): PointsSummary {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return {
      availablePoints: raw,
      totalPoints: raw,
    }
  }

  const candidates = unwrapCandidates(raw)
  let totalPoints = 0
  let availablePoints = 0
  let memberLevel: number | undefined

  for (const candidate of candidates) {
    const nextTotal = pickNumber(candidate, [
      'totalPoints',
      'points',
      'currentPoints',
      'availablePoints',
      'balance',
      'score',
      'total',
      'value',
    ])

    if (nextTotal !== undefined) {
      totalPoints = nextTotal
      break
    }
  }

  for (const candidate of candidates) {
    const nextAvailable = pickNumber(candidate, [
      'availablePoints',
      'currentPoints',
      'balance',
      'points',
      'totalPoints',
      'score',
      'value',
    ])

    if (nextAvailable !== undefined) {
      availablePoints = nextAvailable
      break
    }
  }

  for (const candidate of candidates) {
    const nextMemberLevel = pickNumber(candidate, ['memberLevel', 'level', 'vipLevel'])

    if (nextMemberLevel !== undefined) {
      memberLevel = nextMemberLevel
      break
    }
  }

  return {
    availablePoints,
    memberLevel,
    totalPoints,
  }
}

function resolveListLike(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
  }

  if (!isObject(raw)) {
    return []
  }

  const candidates = [raw.list, raw.items, raw.records, raw.content, raw.data, raw.result]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }

    if (isObject(candidate)) {
      const nestedCandidates = [candidate.list, candidate.items, candidate.records, candidate.content]
      for (const nested of nestedCandidates) {
        if (Array.isArray(nested)) {
          return nested
        }
      }
    }
  }

  return []
}

function normalizeHistoryItem(raw: unknown): PointsHistoryItem {
  const changePoints = pickNumber(raw, ['changePoints', 'delta', 'pointsChange', 'change', 'points']) ?? 0
  return {
    afterPoints: pickNumber(raw, ['afterPoints', 'balance', 'currentPoints', 'points']),
    beforePoints: pickNumber(raw, ['beforePoints']),
    changePoints,
    createdAt: pickText(raw, ['createdAt', 'createTime', 'time']) || undefined,
    id: pickText(raw, ['id', 'recordId', 'logId']) || undefined,
    remark: pickText(raw, ['remark', 'reason', 'description']) || undefined,
    ruleCode: pickText(raw, ['ruleCode', 'code']) || undefined,
    scene: pickText(raw, ['scene', 'type']) || undefined,
  }
}

function normalizeHistoryPage(raw: unknown, query: PointsHistoryQuery): PointsHistoryPage {
  const candidates = unwrapCandidates(raw)

  let page = query.page ?? 1
  let size = query.size ?? 20
  let total = 0

  for (const candidate of candidates) {
    const nextPage = pickNumber(candidate, ['page', 'pageNum', 'current'])
    if (nextPage !== undefined) {
      page = nextPage
      break
    }
  }

  for (const candidate of candidates) {
    const nextSize = pickNumber(candidate, ['size', 'pageSize'])
    if (nextSize !== undefined) {
      size = nextSize
      break
    }
  }

  for (const candidate of candidates) {
    const nextTotal = pickNumber(candidate, ['total', 'totalCount', 'count'])
    if (nextTotal !== undefined) {
      total = nextTotal
      break
    }
  }

  const list = resolveListLike(raw).map((item) => normalizeHistoryItem(item))
  if (!total && list.length > 0) {
    total = list.length
  }

  return {
    list,
    page,
    size,
    total,
  }
}

function normalizeRuleItem(raw: unknown): PointsRuleItem | null {
  const title = pickText(raw, ['title', 'name', 'ruleName', 'ruleTitle', 'content'])
  if (!title) {
    return null
  }

  return {
    description: pickText(raw, ['description', 'desc', 'remark']) || undefined,
    points: pickNumber(raw, ['points', 'score', 'value']),
    ruleCode: pickText(raw, ['ruleCode', 'code', 'id']) || undefined,
    scene: pickText(raw, ['scene', 'type', 'category']) || undefined,
    title,
  }
}

function normalizeRules(raw: unknown): PointsRuleItem[] {
  const listLike = resolveListLike(raw)
  if (listLike.length > 0) {
    return listLike
      .map((item) => normalizeRuleItem(item))
      .filter((item): item is PointsRuleItem => Boolean(item))
  }

  if (Array.isArray(raw)) {
    return raw
      .map((item) => normalizeRuleItem(item))
      .filter((item): item is PointsRuleItem => Boolean(item))
  }

  return []
}

export async function getMy() {
  const raw = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/points/my',
  })

  return normalizePointsSummary(raw)
}

export async function getUserPoints(userId: string | number) {
  const raw = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/points/user/{userId}',
    pathParams: { userId },
  })

  return normalizePointsSummary(raw)
}

export async function getMyHistory(query: PointsHistoryQuery = {}) {
  const raw = await authRequest<unknown>({
    method: 'GET',
    path: '/api/user/points/my/history',
    query: {
      page: query.page,
      size: query.size,
    },
  })

  return normalizeHistoryPage(raw, query)
}

export async function getRules() {
  const raw = await request<unknown>({
    method: 'GET',
    path: '/api/user/points/rules',
  })

  return normalizeRules(raw)
}
