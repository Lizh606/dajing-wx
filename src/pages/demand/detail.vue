<template>
  <view class="page-demand-detail">
    <view class="page-demand-detail__scroll">
      <view class="page-demand-detail__content">
        <view class="page-demand-detail__hero page-demand-detail__card">
          <view class="page-demand-detail__hero-top">
            <view class="page-demand-detail__hero-main">
              <view class="page-demand-detail__hero-title-row">
                <text class="page-demand-detail__hero-title">{{ detail.title }}</text>
                <view class="page-demand-detail__tag page-demand-detail__tag--primary">{{ detail.tag }}</view>
              </view>
              <text class="page-demand-detail__hero-meta">需求编号：{{ detail.demandNo }} · 发布时间：{{ detail.publishDate }}</text>
            </view>
            <view class="page-demand-detail__status">{{ detail.statusText }}</view>
          </view>
          <view class="page-demand-detail__stats">
            <view class="page-demand-detail__stats-item">
              <text class="page-demand-detail__stats-value">{{ detail.bidCountText }}</text>
              <text class="page-demand-detail__stats-label">已响应机构</text>
            </view>
            <view class="page-demand-detail__stats-item">
              <text class="page-demand-detail__stats-value">{{ detail.budgetText }}</text>
              <text class="page-demand-detail__stats-label">金额上限</text>
            </view>
            <view class="page-demand-detail__stats-item">
              <text class="page-demand-detail__stats-value">{{ detail.expectedFinishText }}</text>
              <text class="page-demand-detail__stats-label">期望完成</text>
            </view>
          </view>
        </view>

        <view class="page-demand-detail__card">
          <text class="page-demand-detail__card-title">需求详情</text>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">项目名称</text>
            <text class="page-demand-detail__detail-value">{{ detail.title }}</text>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">需求说明</text>
            <text class="page-demand-detail__detail-value">{{ detail.requirement }}</text>
          </view>

          <view class="page-demand-detail__detail-grid">
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">金额上限</text>
              <text class="page-demand-detail__detail-value">{{ detail.budgetText }}</text>
            </view>
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">是否加急</text>
              <text class="page-demand-detail__detail-value">{{ detail.urgentText }}</text>
            </view>
          </view>

          <view class="page-demand-detail__detail-grid">
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">联系人</text>
              <text class="page-demand-detail__detail-value">{{ detail.contactName }}</text>
            </view>
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">联系方式</text>
              <text class="page-demand-detail__detail-value">{{ detail.contactPhone }}</text>
            </view>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">联系地址</text>
            <text class="page-demand-detail__detail-value">{{ detail.contactAddress }}</text>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">资质要求</text>
            <text class="page-demand-detail__detail-value">{{ detail.qualification }}</text>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">期望完成时间</text>
            <text class="page-demand-detail__detail-value">{{ detail.expectedFinishText }}</text>
          </view>

          <view class="page-demand-detail__attachment">
            <text class="page-demand-detail__attachment-title">附件与备注</text>
            <text class="page-demand-detail__attachment-sub">{{ detail.attachmentSub }}</text>
            <text class="page-demand-detail__attachment-note">备注：{{ detail.attachmentNote }}</text>
          </view>
        </view>

        <view class="page-demand-detail__card">
          <view class="page-demand-detail__card-header">
            <text class="page-demand-detail__card-title page-demand-detail__card-title--no-margin">机构响应建议</text>
            <text class="page-demand-detail__card-link" @tap="openDemandHall">查看全部</text>
          </view>
          <view class="page-demand-detail__suggestion-list">
            <view v-for="item in suggestions" :key="`${item.title}-${item.desc}`" class="page-demand-detail__suggestion-item">
              <text class="page-demand-detail__suggestion-title">{{ item.title }}</text>
              <text class="page-demand-detail__suggestion-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="page-demand-detail__actions">
      <view class="page-demand-detail__actions-row">
        <AppButton
          block
          custom-style="min-height: 88rpx; border-radius: 16rpx; font-size: 28rpx;"
          plain
          text="联系"
          type="info"
          @click="contactDemand"
        />
        <AppButton
          block
          custom-style="min-height: 88rpx; border-radius: 16rpx; font-size: 28rpx;"
          text="提交方案"
          type="info"
          @click="submitPlan"
        />
      </view>
      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 16rpx; font-size: 28rpx; box-shadow: 0 14rpx 28rpx rgba(220, 38, 38, 0.28);"
        text="关闭需求"
        type="danger"
        @click="closeCurrentDemand"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import * as tradeDemandService from '@/services/api/tradeDemand'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'

type ApiRecord = Record<string, any>

interface SuggestionItem {
  desc: string
  title: string
}

interface DemandDetailView {
  attachmentNote: string
  attachmentSub: string
  bidCountText: string
  budgetText: string
  contactAddress: string
  contactName: string
  contactPhone: string
  demandNo: string
  expectedFinishText: string
  publishDate: string
  qualification: string
  requirement: string
  statusText: string
  tag: string
  title: string
  urgentText: string
}

const fallbackSuggestions: SuggestionItem[] = [
  { title: '建议上传历史样品参数', desc: '便于机构更快判断测试路径与实验资源排期。' },
  { title: '建议说明是否接受分批检测', desc: '可帮助机构提供更准确的报价与交付时间。' },
]

const fallbackDetail: DemandDetailView = {
  attachmentNote: '样品检测完成后需寄回，并优先安排本周检测。',
  attachmentSub: '上传样品图片 / 图纸 / 技术文件',
  bidCountText: '3家',
  budgetText: '¥80,000',
  contactAddress: '湖南省株洲市天元区栗雨工业园某制造基地',
  contactName: '张先生',
  contactPhone: '138****5620',
  demandNo: 'REQ20260418008',
  expectedFinishText: '2026-04-30 前',
  publishDate: '2026-04-18',
  qualification: '优先具备 CMA / CNAS 资质，支持新能源电池相关项目检测。',
  requirement: '拟开展新能源汽车电池包安全性能检测，重点关注挤压、热扩散、过充保护、短路保护等关键指标，期望机构提供检测方案、排期建议与报价明细。',
  statusText: '待机构响应',
  tag: '长期合作',
  title: '新能源汽车电池包安全性能检测需求',
  urgentText: '是',
}

const detail = ref<DemandDetailView>({ ...fallbackDetail })
const suggestions = ref<SuggestionItem[]>([...fallbackSuggestions])
const currentDemandId = ref('')

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

function unwrapCandidates(raw: unknown) {
  if (!isObject(raw)) {
    return [raw]
  }

  const candidates = [raw]
  const innerKeys = ['data', 'result', 'record', 'detail']

  for (const key of innerKeys) {
    if (raw[key] !== undefined) {
      candidates.push(raw[key])
    }
  }

  return candidates
}

function pickTextFromCandidates(candidates: unknown[], keys: string[]) {
  for (const candidate of candidates) {
    const next = pickText(candidate, keys)
    if (next) {
      return next
    }
  }

  return ''
}

function pickNumberFromCandidates(candidates: unknown[], keys: string[]) {
  for (const candidate of candidates) {
    const next = pickNumber(candidate, keys)
    if (next !== undefined) {
      return next
    }
  }

  return undefined
}

function formatDateDisplay(value: string) {
  if (!value) {
    return ''
  }

  const exact = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (exact) {
    return `${exact[1]}-${exact[2]}-${exact[3]}`
  }

  const loose = value.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (!loose) {
    return value
  }

  const [, year, month, day] = loose
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatMoney(amount: number) {
  return `¥${amount.toLocaleString()}`
}

function resolveStatusText(status?: number) {
  if (status === 0) {
    return '草稿'
  }

  if (status === 1) {
    return '发布中'
  }

  if (status === 2) {
    return '竞价中'
  }

  if (status === 3) {
    return '已成交'
  }

  if (status === 4) {
    return '已关闭'
  }

  return ''
}

function resolveBidList(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is ApiRecord => isObject(item))
  }

  if (!isObject(raw)) {
    return []
  }

  const candidates = [raw.list, raw.items, raw.records, raw.data, raw.result]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is ApiRecord => isObject(item))
    }
  }

  return []
}

function resolveAttachmentSub(attachmentsText: string) {
  if (!attachmentsText) {
    return fallbackDetail.attachmentSub
  }

  try {
    const parsed = JSON.parse(attachmentsText)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const values = parsed.map((item) => toText(item)).filter(Boolean)
      if (values.length > 0) {
        return `已上传附件：${values.slice(0, 2).join('、')}${values.length > 2 ? ' 等' : ''}`
      }
    }
  } catch {
    // ignore parse error
  }

  return `已上传附件：${attachmentsText}`
}

function resolveDemandId(raw: unknown) {
  if (!isObject(raw)) {
    return ''
  }

  return toText(raw.id || raw.demandId || raw.data?.id || raw.data?.demandId || raw.result?.id || raw.result?.demandId)
}

function parseBudgetAmountFromText(text: string) {
  const normalized = text.replace(/[^\d.]/g, '')
  if (!normalized) {
    return 0
  }

  const next = Number(normalized)
  return Number.isFinite(next) ? next : 0
}

function resolveDemandList(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
  }

  if (!isObject(raw)) {
    return []
  }

  const candidates = [raw.list, raw.records, raw.items, raw.data, raw.result]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function buildSuggestionList(bids: ApiRecord[]): SuggestionItem[] {
  if (bids.length === 0) {
    return [...fallbackSuggestions]
  }

  return bids.map((bid, index) => {
    const title = pickText(bid, ['institutionName', 'companyName', 'institution', 'contactName']) || `机构报价 #${index + 1}`
    const quoteAmount = pickNumber(bid, ['quoteAmount', 'amount', 'price'])
    const estimatedDays = pickNumber(bid, ['estimatedDays', 'days'])
    const testPlan = pickText(bid, ['testPlan', 'plan'])
    const remark = pickText(bid, ['remark', 'note'])

    const segments: string[] = []
    if (quoteAmount !== undefined) {
      segments.push(`报价 ${formatMoney(quoteAmount)}`)
    }
    if (estimatedDays !== undefined) {
      segments.push(`预计 ${estimatedDays} 天`)
    }
    if (testPlan) {
      segments.push(testPlan)
    } else if (remark) {
      segments.push(remark)
    }

    return {
      desc: segments.join(' · ') || '已提交报价，等待需求方确认。',
      title,
    }
  })
}

function buildDetailView(raw: unknown, bidCountFromBids?: number): DemandDetailView {
  const candidates = unwrapCandidates(raw)
  const title = pickTextFromCandidates(candidates, ['title', 'projectName', 'demandTitle', 'sampleName']) || fallbackDetail.title
  const tag = pickTextFromCandidates(candidates, ['category', 'demandType', 'typeName', 'sampleType']) || fallbackDetail.tag
  const demandNo = pickTextFromCandidates(candidates, ['demandNo', 'demandCode', 'orderNo', 'id', 'demandId']) || fallbackDetail.demandNo
  const publishDate = formatDateDisplay(
    pickTextFromCandidates(candidates, ['publishTime', 'publishedAt', 'createdAt', 'createTime', 'gmtCreate']),
  ) || fallbackDetail.publishDate
  const statusNumber = pickNumberFromCandidates(candidates, ['status'])
  const statusText = pickTextFromCandidates(candidates, ['statusText', 'statusName']) || resolveStatusText(statusNumber) || fallbackDetail.statusText
  const budgetAmount = pickNumberFromCandidates(candidates, ['budgetAmount', 'budgetMax', 'budget', 'amount'])
  const budgetText = budgetAmount !== undefined ? formatMoney(budgetAmount) : fallbackDetail.budgetText
  const expectedFinishText = formatDateDisplay(
    pickTextFromCandidates(candidates, ['expectedFinishDate', 'expectedDate', 'deadline', 'expectFinishDate']),
  ) || fallbackDetail.expectedFinishText
  const requirement = pickTextFromCandidates(candidates, ['sampleDesc', 'requirement', 'description', 'testProject']) || fallbackDetail.requirement
  const additionalReq = pickTextFromCandidates(candidates, ['additionalReq'])
  const urgentValue = pickTextFromCandidates(candidates, ['urgentText', 'urgent'])
  const urgentNumber = pickNumberFromCandidates(candidates, ['isUrgent', 'urgent'])
  const urgentText = additionalReq.includes('加急')
    ? '是'
    : urgentValue
      ? urgentValue
      : urgentNumber !== undefined
        ? (urgentNumber > 0 ? '是' : '否')
        : fallbackDetail.urgentText
  const contactName = pickTextFromCandidates(candidates, ['contactName', 'name']) || fallbackDetail.contactName
  const contactPhone = pickTextFromCandidates(candidates, ['contactPhone', 'phone', 'mobile']) || fallbackDetail.contactPhone
  const contactAddress = pickTextFromCandidates(candidates, ['contactAddress', 'address', 'region']) || fallbackDetail.contactAddress
  const qualification = pickTextFromCandidates(candidates, ['qualification', 'testStandard']) || fallbackDetail.qualification
  const attachmentsText = pickTextFromCandidates(candidates, ['attachments', 'attachmentUrls', 'files'])
  const attachmentSub = resolveAttachmentSub(attachmentsText)
  const attachmentNote = pickTextFromCandidates(candidates, ['remark', 'memo', 'note']) || fallbackDetail.attachmentNote
  const bidCount = bidCountFromBids ?? pickNumberFromCandidates(candidates, ['bidCount', 'bidsCount', 'responseCount', 'quoteCount']) ?? 0

  return {
    attachmentNote,
    attachmentSub,
    bidCountText: `${bidCount}家`,
    budgetText,
    contactAddress,
    contactName,
    contactPhone,
    demandNo,
    expectedFinishText,
    publishDate,
    qualification,
    requirement,
    statusText,
    tag,
    title,
    urgentText,
  }
}

onLoad(async (query) => {
  const id = typeof query?.id === 'string' ? query.id.trim() : ''

  if (!id) {
    return
  }

  currentDemandId.value = id

  const [detailResult, bidsResult] = await Promise.allSettled([
    tradeDemandService.getDemand(id),
    tradeDemandService.getDemandBids(id),
  ])

  const bids = bidsResult.status === 'fulfilled' ? resolveBidList(bidsResult.value) : []
  suggestions.value = buildSuggestionList(bids)

  if (detailResult.status === 'fulfilled') {
    const nextId = resolveDemandId(detailResult.value)
    if (nextId) {
      currentDemandId.value = nextId
    }

    detail.value = buildDetailView(detailResult.value, bids.length || undefined)
    return
  }

  detail.value = { ...fallbackDetail }
  showAppToast({
    icon: 'none',
    message: getErrorMessage(detailResult.reason, '需求详情加载失败，已展示默认信息'),
  })
})

function contactDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  showAppToast({ message: '已发起联系，请前往消息中心查看', icon: 'none' })
}

function submitPlan() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  void submitBid()
}

async function submitBid() {
  const demandIdText = currentDemandId.value.trim()
  const demandId = Number(demandIdText)

  if (!demandIdText || Number.isNaN(demandId)) {
    showFailToast('当前需求ID无效，无法提交方案')
    return
  }

  const budgetAmount = parseBudgetAmountFromText(detail.value.budgetText)
  const quoteAmount = budgetAmount > 0 ? Math.max(1, Math.round(budgetAmount * 0.9)) : 1000

  try {
    await tradeDemandService.submitBid({
      demandId,
      estimatedDays: 7,
      quoteAmount,
      remark: '来自需求详情页的快捷提交',
      testPlan: detail.value.requirement,
    })
    showSuccessToast('方案已提交，已通知需求方查看')
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/message/index' })
    }, 800)
  } catch (error) {
    showFailToast(getErrorMessage(error, '提交方案失败'))
  }
}

function closeCurrentDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (!currentDemandId.value.trim()) {
    showFailToast('需求ID缺失，无法关闭')
    return
  }

  uni.showModal({
    content: '确认关闭当前需求吗？',
    success: async (result) => {
      if (!result.confirm) {
        return
      }

      try {
        await tradeDemandService.closeDemand(currentDemandId.value)
        detail.value.statusText = '已关闭'
        showSuccessToast('需求已关闭')
      } catch (error) {
        showFailToast(getErrorMessage(error, '关闭需求失败'))
      }
    },
    title: '关闭需求',
  })
}

async function openDemandHall() {
  const category = encodeURIComponent(detail.value.tag || '')
  uni.navigateTo({ url: `/pages/demand/hall?category=${category}` })
}
</script>

<style scoped lang="scss">
.page-demand-detail {
  min-height: 100vh;
  background: #f8fafc;
}

.page-demand-detail__scroll {
  box-sizing: border-box;
}

.page-demand-detail__content {
  padding: 24rpx;
  padding-bottom: 24rpx;
  box-sizing: border-box;
}

.page-demand-detail__card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  border: 1rpx solid #f1f5f9;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-demand-detail__hero {
  padding: 28rpx;
}

.page-demand-detail__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.page-demand-detail__hero-main {
  flex: 1;
  min-width: 0;
}

.page-demand-detail__hero-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12rpx;
}

.page-demand-detail__hero-title {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.5;
  color: #0f172a;
}

.page-demand-detail__hero-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.page-demand-detail__status {
  flex-shrink: 0;
  white-space: nowrap;
  border-radius: 10rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #92400e;
  background: #fffbeb;
}

.page-demand-detail__stats {
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.page-demand-detail__stats-item {
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  background: #f8fafc;
}

.page-demand-detail__stats-value {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-demand-detail__stats-label {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-demand-detail__card-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-detail__card-title--no-margin {
  margin-bottom: 0;
}

.page-demand-detail__detail-item {
  margin-bottom: 12rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
}

.page-demand-detail__detail-item--last {
  margin-bottom: 0;
}

.page-demand-detail__detail-item--compact {
  margin-bottom: 0;
}

.page-demand-detail__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.page-demand-detail__detail-label {
  display: block;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-demand-detail__detail-value {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.6;
  color: #0f172a;
}

.page-demand-detail__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.page-demand-detail__tag--primary {
  color: #1E61FF;
  background: #eff6ff;
}

.page-demand-detail__attachment {
  border: 1rpx dashed #bfdbfe;
  border-radius: 12rpx;
  background: #eff6ff;
  padding: 20rpx;
}

.page-demand-detail__attachment-title {
  display: block;
  font-size: 25rpx;
  font-weight: 600;
  color: #1d4ed8;
}

.page-demand-detail__attachment-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #1E61FF;
}

.page-demand-detail__attachment-note {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #475569;
  line-height: 1.5;
}

.page-demand-detail__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.page-demand-detail__card-link {
  font-size: 22rpx;
  font-weight: 500;
  background: #1E61FF;
  color: #ffffff;
  border-radius: 999rpx;
  padding: 4rpx 16rpx;
}

.page-demand-detail__suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.page-demand-detail__suggestion-item {
  border-radius: 12rpx;
  background: #f8fafc;
  padding: 20rpx;
}

.page-demand-detail__suggestion-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-detail__suggestion-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #64748b;
}

.page-demand-detail__actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 0 24rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.page-demand-detail__actions-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

@media (max-width: 360px) {
  .page-demand-detail__detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
