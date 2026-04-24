import { authRequest, getErrorMessage } from '@/services/http'
import { useUserStore } from '@/stores/user'

type ApiRecord = Record<string, any>
type PrizeLevel = 'FIRST' | 'SECOND' | 'THIRD'
type LotteryIneligibleReason =
  | 'ALREADY_DRAWN'
  | 'CAMPAIGN_ENDED'
  | 'CAMPAIGN_NOT_STARTED'
  | 'NEED_LOGIN'
  | 'NOT_TODAY_REGISTERED'
  | 'RISK_REJECTED'
  | 'SYSTEM_BUSY'
  | 'UNKNOWN'

const ENABLE_LOTTERY_MOCK = false
const LOTTERY_CAMPAIGN_ID = 'LIVE-LOTTERY-20260423'
const LOTTERY_MOCK_STORAGE_KEY = 'marketing:lottery:mock:v1'

const PRIZE_NAME_MAP: Record<PrizeLevel, string> = {
  FIRST: '一等奖',
  SECOND: '二等奖',
  THIRD: '三等奖',
}

const THIRD_LEVEL_SECTOR_INDICES = [1, 3, 4, 5, 6, 7, 9, 10, 11]
const SECOND_LEVEL_SECTOR_INDICES = [2, 8]
const FIRST_LEVEL_SECTOR_INDICES = [0]

export interface LotteryPrizeConfig {
  issued?: number
  level: PrizeLevel
  min?: number
  name: string
  remain?: number
  total?: number
  unlimited?: boolean
}

export interface LotteryCampaignCurrent {
  campaignId: string
  eligible: boolean
  endAt: string
  ineligibleReason?: LotteryIneligibleReason
  name: string
  prizes: LotteryPrizeConfig[]
  registerDate?: string
  status?: 'ENDED' | 'NOT_STARTED' | 'RUNNING'
  startAt: string
  timezone?: string
  userHasDrawn?: boolean
  drawRule?: {
    accountLimitOnce?: boolean
    enterpriseDimensionKey?: string
    enterpriseLimitEnabled?: boolean
  }
  wheel?: {
    segmentCount?: number
    segmentPrizeLevels?: PrizeLevel[]
  }
}

export interface LotteryMyResult {
  campaignId: string
  claimCode: string
  drawAt: string
  drawId: string
  hasDrawn: boolean
  prizeLevel?: PrizeLevel
  prizeName?: string
  redeemAt?: string
  redeemed: boolean
  wheelStopIndex?: number
}

export interface LotteryEnterpriseDimension {
  key: string
  value: string
}

export interface LotteryDrawPayload {
  campaignId: string
  enterpriseDimension?: LotteryEnterpriseDimension | null
}

export interface LotteryDrawResult extends LotteryMyResult {
  prizeLevel: PrizeLevel
  prizeName: string
  wheelStopIndex: number
}

export interface LotteryRedeemPayload {
  campaignId: string
  claimCode: string
}

export interface LotteryRedeemResult {
  campaignId: string
  claimCode: string
  prizeLevel?: PrizeLevel
  prizeName?: string
  redeemAt?: string
  redeemed: boolean
  // 兼容历史 mock 字段，优先使用 redeemAt
  redeemedAt?: string
}

interface LotteryMockRecord {
  campaignId: string
  claimCode: string
  drawAt: string
  drawId: string
  prizeLevel: PrizeLevel
  redeemed: boolean
  wheelStopIndex: number
}

interface LotteryMockState {
  drawSequence: number
  firstIssued: number
  registrations: Record<string, string>
  recordsByUser: Record<string, LotteryMockRecord>
  secondIssued: number
}

function wait<T>(value: T, delay = 220) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), delay)
  })
}

function now() {
  return new Date()
}

function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateTime(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const sec = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${sec}`
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

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (normalized === 'true' || normalized === '1') {
      return true
    }

    if (normalized === 'false' || normalized === '0') {
      return false
    }
  }

  return fallback
}

function normalizePrizeLevel(value: unknown): PrizeLevel | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value === 1) {
      return 'FIRST'
    }

    if (value === 2) {
      return 'SECOND'
    }

    if (value === 3) {
      return 'THIRD'
    }
  }

  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const text = value.trim()
  const normalized = text.toUpperCase().replace(/[-\s]/g, '_')

  if (
    normalized === 'FIRST'
    || normalized === 'FIRST_PRIZE'
    || normalized === '一等奖'
    || normalized === '一等'
    || normalized === '1'
    || normalized === '1ST'
  ) {
    return 'FIRST'
  }

  if (
    normalized === 'SECOND'
    || normalized === 'SECOND_PRIZE'
    || normalized === '二等奖'
    || normalized === '二等'
    || normalized === '2'
    || normalized === '2ND'
  ) {
    return 'SECOND'
  }

  if (
    normalized === 'THIRD'
    || normalized === 'THIRD_PRIZE'
    || normalized === '三等奖'
    || normalized === '三等'
    || normalized === '3'
    || normalized === '3RD'
  ) {
    return 'THIRD'
  }

  if (text === 'FIRST' || text === 'SECOND' || text === 'THIRD') {
    return text
  }

  return undefined
}

function normalizeWheelStopIndex(value: unknown) {
  const wheelStopIndex = toNumber(value)

  if (typeof wheelStopIndex !== 'number' || Number.isNaN(wheelStopIndex)) {
    return undefined
  }

  const normalized = Math.round(wheelStopIndex) % 12
  return normalized >= 0 ? normalized : normalized + 12
}

function resolvePrizeName(prizeLevel?: PrizeLevel, fallbackName?: string) {
  if (prizeLevel) {
    return PRIZE_NAME_MAP[prizeLevel]
  }

  if (fallbackName?.trim()) {
    return fallbackName.trim()
  }

  return undefined
}

function normalizeIneligibleReason(value: unknown): LotteryIneligibleReason | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const reason = value.trim() as LotteryIneligibleReason

  if (
    reason === 'ALREADY_DRAWN'
    || reason === 'CAMPAIGN_ENDED'
    || reason === 'CAMPAIGN_NOT_STARTED'
    || reason === 'NEED_LOGIN'
    || reason === 'NOT_TODAY_REGISTERED'
    || reason === 'RISK_REJECTED'
    || reason === 'SYSTEM_BUSY'
    || reason === 'UNKNOWN'
  ) {
    return reason
  }

  return undefined
}

function normalizePrizeConfig(raw: unknown): LotteryPrizeConfig | null {
  if (!isObject(raw)) {
    return null
  }

  const level = normalizePrizeLevel(raw.level)

  if (!level) {
    return null
  }

  const total = toNumber(raw.total)
  const remain = toNumber(raw.remain)
  const min = toNumber(raw.min)
  const issued = toNumber(raw.issued)
  const unlimited = typeof raw.unlimited === 'boolean'
    ? raw.unlimited
    : level === 'THIRD' && total === undefined && remain === undefined

  return {
    issued,
    level,
    min,
    name: toText(raw.name) || PRIZE_NAME_MAP[level],
    remain,
    total,
    unlimited,
  }
}

function normalizeCampaignCurrent(raw: unknown): LotteryCampaignCurrent {
  const record = isObject(raw) ? raw : {}
  const prizes = Array.isArray(record.prizes)
    ? record.prizes.map((item) => normalizePrizeConfig(item)).filter(Boolean) as LotteryPrizeConfig[]
    : []

  const segmentPrizeLevels = Array.isArray(record.wheel?.segmentPrizeLevels)
    ? record.wheel.segmentPrizeLevels
      .map((item: unknown) => normalizePrizeLevel(item))
      .filter(Boolean) as PrizeLevel[]
    : undefined
  const status = toText(record.status)
  const normalizedStatus = status === 'NOT_STARTED' || status === 'RUNNING' || status === 'ENDED'
    ? status
    : undefined

  return {
    campaignId: toText(record.campaignId),
    drawRule: isObject(record.drawRule)
      ? {
        accountLimitOnce: toBoolean(record.drawRule.accountLimitOnce),
        enterpriseDimensionKey: toText(record.drawRule.enterpriseDimensionKey) || undefined,
        enterpriseLimitEnabled: toBoolean(record.drawRule.enterpriseLimitEnabled),
      }
      : undefined,
    eligible: toBoolean(record.eligible),
    endAt: toText(record.endAt),
    ineligibleReason: normalizeIneligibleReason(record.ineligibleReason),
    name: toText(record.name) || '现场抽奖',
    prizes,
    registerDate: toText(record.registerDate) || undefined,
    startAt: toText(record.startAt),
    status: normalizedStatus,
    timezone: toText(record.timezone) || undefined,
    userHasDrawn: toBoolean(record.userHasDrawn),
    wheel: isObject(record.wheel)
      ? {
        segmentCount: toNumber(record.wheel.segmentCount),
        segmentPrizeLevels,
      }
      : undefined,
  }
}

function normalizeMyResult(raw: unknown, fallbackCampaignId = ''): LotteryMyResult {
  const record = isObject(raw) ? raw : {}
  const wheelStopIndex = normalizeWheelStopIndex(record.wheelStopIndex)
  const prizeLevel = normalizePrizeLevel(
    record.prizeLevel
    ?? record.level
    ?? record.awardLevel
    ?? record.prizeType
    ?? record.prizeName,
  )
  const prizeName = resolvePrizeName(prizeLevel, toText(record.prizeName ?? record.awardName) || undefined)
  const redeemAt = toText(record.redeemAt ?? record.redeemedAt) || undefined

  return {
    campaignId: toText(record.campaignId) || fallbackCampaignId,
    claimCode: toText(record.claimCode),
    drawAt: toText(record.drawAt),
    drawId: toText(record.drawId),
    hasDrawn: toBoolean(record.hasDrawn),
    prizeLevel,
    prizeName,
    redeemAt,
    redeemed: toBoolean(record.redeemed),
    wheelStopIndex,
  }
}

function normalizeDrawResult(raw: unknown, fallbackCampaignId = ''): LotteryDrawResult {
  const base = normalizeMyResult(raw, fallbackCampaignId)
  const prizeLevel = base.prizeLevel

  if (!prizeLevel) {
    throw new Error('抽奖结果缺少奖项等级，请稍后重试')
  }

  if (typeof base.wheelStopIndex !== 'number') {
    throw new Error('抽奖结果缺少转盘落点，请稍后重试')
  }

  const prizeName = resolvePrizeName(prizeLevel, base.prizeName) || PRIZE_NAME_MAP[prizeLevel]
  const wheelStopIndex = base.wheelStopIndex

  return {
    ...base,
    hasDrawn: true,
    prizeLevel,
    prizeName,
    redeemed: base.redeemed,
    wheelStopIndex,
  }
}

function normalizeRedeemResult(raw: unknown, fallbackCampaignId = '', fallbackClaimCode = ''): LotteryRedeemResult {
  const record = isObject(raw) ? raw : {}
  const redeemAt = toText(record.redeemAt ?? record.redeemedAt) || undefined
  const prizeLevel = normalizePrizeLevel(record.prizeLevel ?? record.level ?? record.prizeName)
  const prizeName = resolvePrizeName(prizeLevel, toText(record.prizeName ?? record.awardName) || undefined)

  return {
    campaignId: toText(record.campaignId) || fallbackCampaignId,
    claimCode: toText(record.claimCode) || fallbackClaimCode,
    prizeLevel,
    prizeName,
    redeemAt,
    redeemed: toBoolean(record.redeemed, Boolean(redeemAt)),
    redeemedAt: redeemAt,
  }
}

function resolveCampaignTimeRange() {
  const current = now()
  const dayText = formatDate(current)
  const startAt = `${dayText} 00:00:00`
  const endAt = `${dayText} 23:59:59`
  return {
    dayText,
    endAt,
    startAt,
  }
}

function readMockState(): LotteryMockState {
  try {
    const stored = uni.getStorageSync(LOTTERY_MOCK_STORAGE_KEY)

    if (!stored || typeof stored !== 'object') {
      return {
        drawSequence: 0,
        firstIssued: 0,
        registrations: {},
        recordsByUser: {},
        secondIssued: 0,
      }
    }

    return {
      drawSequence: typeof stored.drawSequence === 'number' ? stored.drawSequence : 0,
      firstIssued: typeof stored.firstIssued === 'number' ? stored.firstIssued : 0,
      registrations: typeof stored.registrations === 'object' && stored.registrations ? stored.registrations : {},
      recordsByUser: typeof stored.recordsByUser === 'object' && stored.recordsByUser ? stored.recordsByUser : {},
      secondIssued: typeof stored.secondIssued === 'number' ? stored.secondIssued : 0,
    }
  } catch {
    return {
      drawSequence: 0,
      firstIssued: 0,
      registrations: {},
      recordsByUser: {},
      secondIssued: 0,
    }
  }
}

function persistMockState(state: LotteryMockState) {
  uni.setStorageSync(LOTTERY_MOCK_STORAGE_KEY, state)
}

function resolveMockUserId() {
  const userStore = useUserStore()
  const token = userStore.token?.trim()

  if (token) {
    return `token:${token.slice(0, 20)}`
  }

  if (userStore.enterpriseId?.trim()) {
    return `enterprise:${userStore.enterpriseId.trim()}`
  }

  if (userStore.nickname?.trim()) {
    return `nickname:${userStore.nickname.trim()}`
  }

  return ''
}

function resolvePrizeLevel(state: LotteryMockState) {
  if (state.firstIssued < 3) {
    const random = Math.random()

    if (random < 0.025 || state.drawSequence % 80 === 0) {
      return 'FIRST' as PrizeLevel
    }
  }

  if (state.secondIssued < 20) {
    const random = Math.random()

    if (random < 0.15 || state.drawSequence % 12 === 0) {
      return 'SECOND' as PrizeLevel
    }
  }

  return 'THIRD' as PrizeLevel
}

function randomPick<T>(values: T[]) {
  if (values.length === 0) {
    throw new Error('抽奖配置异常：缺少可用扇区')
  }

  const index = Math.floor(Math.random() * values.length)
  return values[index]
}

function resolveWheelStopIndex(level: PrizeLevel) {
  if (level === 'FIRST') {
    return randomPick(FIRST_LEVEL_SECTOR_INDICES)
  }

  if (level === 'SECOND') {
    return randomPick(SECOND_LEVEL_SECTOR_INDICES)
  }

  return randomPick(THIRD_LEVEL_SECTOR_INDICES)
}

function buildClaimCode(sequence: number) {
  const dayText = formatDate(now()).replace(/-/g, '')
  return `L${dayText}-${String(sequence).padStart(6, '0')}`
}

function resolvePrizeConfigs(firstIssued: number, secondIssued: number, thirdIssued: number): LotteryPrizeConfig[] {
  return [
    {
      issued: firstIssued,
      level: 'FIRST',
      name: PRIZE_NAME_MAP.FIRST,
      remain: Math.max(3 - firstIssued, 0),
      total: 3,
      unlimited: false,
    },
    {
      issued: secondIssued,
      level: 'SECOND',
      name: PRIZE_NAME_MAP.SECOND,
      remain: Math.max(20 - secondIssued, 0),
      total: 20,
      unlimited: false,
    },
    {
      issued: thirdIssued,
      level: 'THIRD',
      min: 250,
      name: PRIZE_NAME_MAP.THIRD,
      unlimited: true,
    },
  ]
}

function resolveMockCampaign(state: LotteryMockState, userId: string): LotteryCampaignCurrent {
  const { dayText, endAt, startAt } = resolveCampaignTimeRange()
  const userRecord = state.recordsByUser[userId]
  const registeredDate = state.registrations[userId] ?? dayText
  const currentTimeText = formatDateTime(now())
  const eligibleTime = currentTimeText >= startAt && currentTimeText <= endAt
  const eligibleRegister = registeredDate === dayText
  const userHasDrawn = Boolean(userRecord)

  const ineligibleReason: LotteryIneligibleReason | undefined = !eligibleTime
    ? currentTimeText < startAt
      ? 'CAMPAIGN_NOT_STARTED'
      : 'CAMPAIGN_ENDED'
    : !eligibleRegister
      ? 'NOT_TODAY_REGISTERED'
      : userHasDrawn
        ? 'ALREADY_DRAWN'
        : undefined

  const thirdIssued = Object.values(state.recordsByUser).filter((item) => item.prizeLevel === 'THIRD').length

  return {
    campaignId: LOTTERY_CAMPAIGN_ID,
    eligible: !ineligibleReason,
    endAt,
    ineligibleReason,
    name: '现场注册抽奖',
    prizes: resolvePrizeConfigs(state.firstIssued, state.secondIssued, thirdIssued),
    startAt,
    userHasDrawn,
  }
}

function buildMyResult(record?: LotteryMockRecord): LotteryMyResult {
  if (!record) {
    return {
      campaignId: LOTTERY_CAMPAIGN_ID,
      claimCode: '',
      drawAt: '',
      drawId: '',
      hasDrawn: false,
      redeemed: false,
    }
  }

  return {
    campaignId: LOTTERY_CAMPAIGN_ID,
    claimCode: record.claimCode,
    drawAt: record.drawAt,
    drawId: record.drawId,
    hasDrawn: true,
    prizeLevel: record.prizeLevel,
    prizeName: PRIZE_NAME_MAP[record.prizeLevel],
    redeemed: record.redeemed,
    wheelStopIndex: record.wheelStopIndex,
  }
}

async function mockGetCurrentCampaign() {
  const userStore = useUserStore()

  if (!userStore.isLoggedIn) {
    const { endAt, startAt } = resolveCampaignTimeRange()
    return wait({
      campaignId: LOTTERY_CAMPAIGN_ID,
      eligible: false,
      endAt,
      ineligibleReason: 'NEED_LOGIN',
      name: '现场注册抽奖',
      prizes: resolvePrizeConfigs(0, 0, 0),
      startAt,
      userHasDrawn: false,
    } satisfies LotteryCampaignCurrent)
  }

  const state = readMockState()
  const userId = resolveMockUserId()

  if (!userId) {
    throw new Error('未识别当前用户，请重新登录后再试')
  }

  const { dayText } = resolveCampaignTimeRange()
  if (!state.registrations[userId]) {
    state.registrations[userId] = dayText
    persistMockState(state)
  }

  return wait(resolveMockCampaign(state, userId))
}

async function mockGetMyResult(campaignId: string) {
  if (campaignId !== LOTTERY_CAMPAIGN_ID) {
    return wait({
      campaignId,
      claimCode: '',
      drawAt: '',
      drawId: '',
      hasDrawn: false,
      redeemed: false,
    } satisfies LotteryMyResult)
  }

  const userId = resolveMockUserId()
  if (!userId) {
    return wait({
      campaignId,
      claimCode: '',
      drawAt: '',
      drawId: '',
      hasDrawn: false,
      redeemed: false,
    } satisfies LotteryMyResult)
  }

  const state = readMockState()
  return wait(buildMyResult(state.recordsByUser[userId]))
}

async function mockDraw(payload: LotteryDrawPayload) {
  if (payload.campaignId !== LOTTERY_CAMPAIGN_ID) {
    throw new Error('活动不存在或已结束')
  }

  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    throw new Error('请先登录后参与抽奖')
  }

  const userId = resolveMockUserId()
  if (!userId) {
    throw new Error('未识别当前用户，请重新登录后再试')
  }

  const state = readMockState()
  const campaign = resolveMockCampaign(state, userId)
  if (!campaign.eligible) {
    if (campaign.ineligibleReason === 'ALREADY_DRAWN') {
      throw new Error('你已完成抽奖，每个账号仅可抽取一次')
    }

    if (campaign.ineligibleReason === 'NOT_TODAY_REGISTERED') {
      throw new Error('仅限活动当天注册用户参与抽奖')
    }

    throw new Error('当前不满足抽奖条件，请稍后再试')
  }

  const nextSequence = state.drawSequence + 1
  const prizeLevel = resolvePrizeLevel(state)
  const wheelStopIndex = resolveWheelStopIndex(prizeLevel)
  const record: LotteryMockRecord = {
    campaignId: payload.campaignId,
    claimCode: buildClaimCode(nextSequence),
    drawAt: formatDateTime(now()),
    drawId: `draw-${nextSequence}`,
    prizeLevel,
    redeemed: false,
    wheelStopIndex,
  }

  state.drawSequence = nextSequence
  if (prizeLevel === 'FIRST') {
    state.firstIssued += 1
  } else if (prizeLevel === 'SECOND') {
    state.secondIssued += 1
  }
  state.recordsByUser[userId] = record
  persistMockState(state)

  return wait({
    ...buildMyResult(record),
    prizeLevel,
    prizeName: PRIZE_NAME_MAP[prizeLevel],
    wheelStopIndex,
  } satisfies LotteryDrawResult, 350)
}

async function mockRedeem(payload: LotteryRedeemPayload) {
  const state = readMockState()
  const record = Object.values(state.recordsByUser).find((item) => {
    return item.campaignId === payload.campaignId && item.claimCode === payload.claimCode
  })

  if (!record) {
    throw new Error('未找到对应中奖记录')
  }

  if (record.redeemed) {
    return wait({
      campaignId: payload.campaignId,
      claimCode: payload.claimCode,
      redeemAt: record.drawAt,
      redeemed: true,
      redeemedAt: record.drawAt,
    } satisfies LotteryRedeemResult)
  }

  record.redeemed = true
  persistMockState(state)

  return wait({
    campaignId: payload.campaignId,
    claimCode: payload.claimCode,
    redeemAt: formatDateTime(now()),
    redeemed: true,
    redeemedAt: formatDateTime(now()),
  } satisfies LotteryRedeemResult)
}

export async function getCurrentCampaign() {
  if (ENABLE_LOTTERY_MOCK) {
    return normalizeCampaignCurrent(await mockGetCurrentCampaign())
  }

  const response = await authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/marketing/lottery/campaign/current',
  })

  return normalizeCampaignCurrent(response)
}

export async function getMyResult(campaignId: string) {
  if (ENABLE_LOTTERY_MOCK) {
    return normalizeMyResult(await mockGetMyResult(campaignId), campaignId)
  }

  const response = await authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/marketing/lottery/my-result',
    query: { campaignId },
  })

  return normalizeMyResult(response, campaignId)
}

export async function draw(payload: LotteryDrawPayload) {
  if (ENABLE_LOTTERY_MOCK) {
    return normalizeDrawResult(await mockDraw(payload), payload.campaignId)
  }

  const response = await authRequest<ApiRecord>({
    body: payload,
    method: 'POST',
    path: '/api/marketing/lottery/draw',
  })

  return normalizeDrawResult(response, payload.campaignId)
}

export async function redeem(payload: LotteryRedeemPayload) {
  if (ENABLE_LOTTERY_MOCK) {
    return normalizeRedeemResult(await mockRedeem(payload), payload.campaignId, payload.claimCode)
  }

  const response = await authRequest<ApiRecord>({
    body: payload,
    method: 'POST',
    path: '/api/marketing/lottery/redeem',
  })

  return normalizeRedeemResult(response, payload.campaignId, payload.claimCode)
}

export function resolveIneligibleText(reason?: LotteryIneligibleReason) {
  const map: Record<LotteryIneligibleReason, string> = {
    ALREADY_DRAWN: '你已完成抽奖，每个账号仅可参与一次',
    CAMPAIGN_ENDED: '活动已结束，感谢关注',
    CAMPAIGN_NOT_STARTED: '活动尚未开始，请稍后参与',
    NEED_LOGIN: '请先登录后参与抽奖',
    NOT_TODAY_REGISTERED: '仅限活动当天注册用户参与抽奖',
    RISK_REJECTED: '当前账号暂不满足抽奖条件',
    SYSTEM_BUSY: '系统繁忙，请稍后重试',
    UNKNOWN: '当前不满足抽奖条件',
  }

  if (!reason) {
    return map.UNKNOWN
  }

  return map[reason] ?? map.UNKNOWN
}

export function resolveLotteryErrorMessage(error: unknown, fallback = '抽奖失败，请稍后再试') {
  return getErrorMessage(error, fallback)
}

export type { PrizeLevel, LotteryIneligibleReason, ApiRecord }
