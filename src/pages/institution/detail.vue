<template>
  <view class="page-institution-detail">
    <view class="page-institution-detail__scroll">
      <view class="page-institution-detail__hero">
        <view class="page-institution-detail__hero-top">
          <view class="page-institution-detail__hero-main">
            <view class="page-institution-detail__hero-title-row">
              <text class="page-institution-detail__hero-title">{{ institution.name }}</text>
              <text class="page-institution-detail__hero-badge">简介</text>
            </view>
            <text class="page-institution-detail__hero-sub">入驻 5 年 · 综合评分 {{ institution.score }} · 平均响应 {{ institution.responseTime }}</text>
            <view class="page-institution-detail__tag-list">
              <text v-for="cert in institution.certs" :key="cert" class="page-institution-detail__tag">{{ cert }}</text>
            </view>
          </view>
          <view class="page-institution-detail__hero-icon-wrap">🏭</view>
        </view>

        <view class="page-institution-detail__hero-stats">
          <view class="page-institution-detail__hero-stat">
            <text class="page-institution-detail__hero-stat-value">98%</text>
            <text class="page-institution-detail__hero-stat-label">履约率</text>
          </view>
          <view class="page-institution-detail__hero-stat">
            <text class="page-institution-detail__hero-stat-value">{{ institution.avgDays }}天</text>
            <text class="page-institution-detail__hero-stat-label">平均周期</text>
          </view>
          <view class="page-institution-detail__hero-stat">
            <text class="page-institution-detail__hero-stat-value">{{ institution.orderCount }}</text>
            <text class="page-institution-detail__hero-stat-label">历史订单</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__content">
        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">服务能力</text>
          </view>
          <view class="page-institution-detail__ability-list">
            <view class="page-institution-detail__ability-item">
              <text class="page-institution-detail__ability-label">服务项目</text>
              <text class="page-institution-detail__ability-link" @tap="showComingSoon('机构能力说明能力建设中')">机构能力说明</text>
            </view>
            <text class="page-institution-detail__ability-content">{{ institution.description }}</text>
          </view>

          <view class="page-institution-detail__ability-list">
            <view class="page-institution-detail__ability-item">
              <text class="page-institution-detail__ability-label">下单决策信息</text>
              <text class="page-institution-detail__ability-link" @tap="showComingSoon('历史报告样例入口能力建设中')">历史报告样例</text>
            </view>
            <view class="page-institution-detail__decision-tags">
              <text v-for="tag in decisionTags" :key="tag" class="page-institution-detail__decision-tag">{{ tag }}</text>
            </view>
          </view>
        </view>

        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">企业展示</text>
          </view>
          <scroll-view class="page-institution-detail__gallery-scroll" scroll-x>
            <view class="page-institution-detail__gallery">
              <view
                v-for="item in galleryBlocks"
                :key="item.title"
                class="page-institution-detail__gallery-item"
                :style="{ background: item.bg }"
              >
                <text class="page-institution-detail__gallery-icon">📷</text>
                <text class="page-institution-detail__gallery-title">{{ item.title }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">用户评价</text>
          </view>
          <view class="page-institution-detail__review-filters">
            <text
              v-for="item in reviewFilters"
              :key="item"
              class="page-institution-detail__review-filter"
              :class="activeReviewFilter === item ? 'page-institution-detail__review-filter--active' : ''"
              @tap="activeReviewFilter = item"
            >
              {{ item }}
            </text>
          </view>
          <view class="page-institution-detail__review-list">
            <view v-for="item in reviews" :key="item.user" class="page-institution-detail__review-item">
              <view class="page-institution-detail__review-head">
                <text class="page-institution-detail__review-user">{{ item.user }}</text>
                <text class="page-institution-detail__review-score">★ 4.8</text>
              </view>
              <text class="page-institution-detail__review-content">{{ item.content }}</text>
              <text class="page-institution-detail__review-meta">{{ item.meta }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="page-institution-detail__actions">
      <AppButton
        custom-style="min-height: 84rpx; height: 84rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
        block
        text="立即咨询"
        type="info"
        @click="goConsult"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import * as institutionService from '@/services/api/institution'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast } from '@/services/ui/toast'

type AnyRecord = Record<string, any>

interface InstitutionDetail {
  avgDays: number
  certs: string[]
  description: string
  id: string
  location: string
  name: string
  orderCount: string
  responseTime: string
  reviewCount: string
  score: string
  serviceCount: number
}

function createFallbackInstitution(): InstitutionDetail {
  return {
    avgDays: 3,
    certs: ['CMA', 'CNAS', 'ILAC'],
    description: '该机构暂未同步完整简介信息，可先发起咨询获取服务能力与报价详情。',
    id: '',
    location: '地区待完善',
    name: '机构详情',
    orderCount: '0',
    responseTime: '-',
    reviewCount: '0',
    score: '-',
    serviceCount: 0,
  }
}

const institution = ref<InstitutionDetail>(createFallbackInstitution())

const services = [
  { name: '金属材料成分检测', desc: 'CMA · 3天出报告', iconName: 'lab', iconBg: '#dbeafe', price: 980 },
  { name: '机械性能测试', desc: 'CMA/CNAS · 5天出报告', iconName: 'automation', iconBg: '#fef3c7', price: 1200 },
  { name: '化学成分分析', desc: 'CNAS · 4天出报告', iconName: 'chemistry', iconBg: '#d1fae5', price: 850 },
]

const performance = [
  { value: '98.6%', label: '准时交付率', color: '#059669' },
  { value: '99.1%', label: '质量合格率', color: '#2563eb' },
  { value: '4.9', label: '客户评分', color: '#d97706' },
  { value: '0件', label: '投诉纠纷', color: '#64748b' },
]

const decisionTags = [
  '可做项目：材料检测/环境可靠性/电气安全',
  '支持标准：GB/T、ISO、IEC',
  '样品类型：固体/液体/电子部件',
  '支持 CMA/CNAS 报告',
  '支持加急',
  '寄样地址/上门范围：长沙市及周边',
]

const galleryBlocks = [
  { title: '产品/样品图', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
  { title: '企业资质图', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
  { title: '专业设备图', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
  { title: '场地布景图', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
]

const reviewFilters = ['按时效', '按沟通', '按专业度']
const activeReviewFilter = ref('按时效')
const reviews = [
  { user: '株洲某制造企业', content: '样品签收和检测反馈很及时，过程透明。', meta: '按时效 · 2026-04-10' },
  { user: '长沙某贸易公司', content: '沟通响应快，需求确认一次到位。', meta: '按沟通 · 2026-04-07' },
  { user: '深圳某新能源企业', content: '报告说明专业，结论清晰，复检建议明确。', meta: '按专业度 · 2026-04-04' },
]

onLoad((query) => {
  const detailId = resolveQueryId(query?.id)

  if (!detailId) {
    return
  }

  loadInstitutionDetail(detailId)
})

function isObject(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pickValue(source: unknown, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = source

    for (const key of path) {
      if (!isObject(current) || !(key in current)) {
        current = undefined
        break
      }

      current = current[key]
    }

    if (current !== undefined && current !== null) {
      return current
    }
  }

  return undefined
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

  return 0
}

function parseCerts(source: unknown) {
  const candidate = pickValue(source, [
    ['qualification'],
    ['certs'],
    ['certList'],
    ['certNames'],
    ['qualifications'],
    ['certification'],
  ])

  if (Array.isArray(candidate)) {
    return candidate
      .map((item) => {
        if (isObject(item)) {
          return toText(item.certName || item.certType || item.name || item.label)
        }

        return toText(item)
      })
      .filter(Boolean)
      .slice(0, 4)
  }

  if (typeof candidate === 'string') {
    return candidate
      .split(/[,\s/|、]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4)
  }

  return []
}

function resolveQueryId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0].trim()
  }

  return ''
}

function normalizeInstitutionDetail(source: unknown, detailId: string): InstitutionDetail {
  const fallback = createFallbackInstitution()
  const name = toText(pickValue(source, [['name'], ['shortName'], ['enterpriseName'], ['companyName'], ['company']])) || fallback.name
  const region = toText(pickValue(source, [['region'], ['area'], ['city'], ['province']]))
  const address = toText(pickValue(source, [['address']]))
  const location = [region, address].filter(Boolean).join(' ') || region || address || fallback.location
  const score = toNumber(pickValue(source, [['avgScore'], ['score'], ['rating'], ['rate']]))
  const reviewCount = toNumber(pickValue(source, [['reviewCount'], ['commentCount'], ['evaluateCount']]))
  const serviceCount = toNumber(pickValue(source, [['serviceCount'], ['projectCount'], ['serviceNum']]))
    || toText(pickValue(source, [['serviceRange']]))
      .split(/[,\s/|、，；;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .length
  const orderCount = toNumber(pickValue(source, [['orderCount'], ['orders'], ['orderNum']]))
  const avgDays = toNumber(pickValue(source, [['avgDays'], ['cycleDays'], ['serviceDays']]))
  const responseMinutes = toNumber(pickValue(source, [['responseMinutes'], ['responseTimeMinutes']]))
  const responseText = toText(pickValue(source, [['responseTime'], ['responseDuration']]))
  const description = toText(pickValue(source, [['introduction'], ['serviceRange'], ['description'], ['intro'], ['profile'], ['summary']])) || fallback.description
  const certs = parseCerts(source)

  return {
    avgDays: avgDays > 0 ? avgDays : fallback.avgDays,
    certs: certs.length > 0 ? certs : fallback.certs,
    description,
    id: detailId,
    location,
    name,
    orderCount: orderCount > 0 ? orderCount.toLocaleString() : fallback.orderCount,
    responseTime: responseText || (responseMinutes > 0 ? `${responseMinutes}分钟` : fallback.responseTime),
    reviewCount: reviewCount > 0 ? reviewCount.toLocaleString() : fallback.reviewCount,
    score: score > 0 ? score.toFixed(1) : fallback.score,
    serviceCount: serviceCount > 0 ? serviceCount : fallback.serviceCount,
  }
}

async function loadInstitutionDetail(detailId: string) {
  try {
    const detail = await institutionService.getDetail(detailId)
    institution.value = normalizeInstitutionDetail(detail, detailId)

    if (institution.value.name) {
      uni.setNavigationBarTitle({ title: institution.value.name })
    }
  } catch (error) {
    institution.value.id = detailId
    showFailToast(getErrorMessage(error, '机构详情加载失败，已展示默认信息'))
  }
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}

function showComingSoon(message: string) {
  showAppToast({ message, icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-institution-detail {
  min-height: 100vh;
  background: #f8fafc;
}

.page-institution-detail__scroll {
  padding: 0 0 20rpx;
  box-sizing: border-box;
}

.page-institution-detail__hero {
  padding: 28rpx 24rpx 30rpx;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%);
  border-bottom: 1rpx solid #bfdbfe;
  border-bottom-left-radius: 28rpx;
  border-bottom-right-radius: 28rpx;
}

.page-institution-detail__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.page-institution-detail__hero-main {
  min-width: 0;
  flex: 1;
}

.page-institution-detail__hero-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.page-institution-detail__hero-title {
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
}

.page-institution-detail__hero-badge {
  border-radius: 10rpx;
  border: 1rpx solid #bfdbfe;
  background: rgba(255, 255, 255, 0.86);
  color: #2563eb;
  padding: 4rpx 12rpx;
  font-size: 18rpx;
}

.page-institution-detail__hero-sub {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
}

.page-institution-detail__hero-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  flex-shrink: 0;
}

.page-institution-detail__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.page-institution-detail__tag {
  border-radius: 8rpx;
  padding: 4rpx 10rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 18rpx;
}

.page-institution-detail__hero-stats {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.page-institution-detail__hero-stat {
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
  padding: 14rpx 8rpx;
}

.page-institution-detail__hero-stat-value {
  display: block;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.page-institution-detail__hero-stat-label {
  display: block;
  margin-top: 2rpx;
  color: #64748b;
  font-size: 20rpx;
}

.page-institution-detail__content {
  margin-top: -10rpx;
  padding: 0 24rpx 20rpx;
}

.page-institution-detail__card {
  margin-bottom: 14rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #ffffff;
  border: 1rpx solid #e8edf5;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.05);
}

.page-institution-detail__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.page-institution-detail__card-title {
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.page-institution-detail__ability-list {
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 16rpx;
  margin-bottom: 10rpx;
}

.page-institution-detail__ability-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.page-institution-detail__ability-label {
  color: #64748b;
  font-size: 20rpx;
}

.page-institution-detail__ability-link {
  color: #2563eb;
  font-size: 20rpx;
}

.page-institution-detail__ability-content {
  display: block;
  margin-top: 8rpx;
  color: #1e293b;
  font-size: 24rpx;
  line-height: 1.55;
}

.page-institution-detail__decision-tags {
  margin-top: 10rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.page-institution-detail__decision-tag {
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
  font-size: 19rpx;
  color: #1d4ed8;
  background: #eff6ff;
}

.page-institution-detail__gallery-scroll {
  white-space: nowrap;
}

.page-institution-detail__gallery {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 220rpx;
  gap: 12rpx;
  min-width: max-content;
}

.page-institution-detail__gallery-item {
  height: 150rpx;
  border-radius: 18rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.page-institution-detail__gallery-icon {
  font-size: 34rpx;
}

.page-institution-detail__gallery-title {
  color: #0f172a;
  font-size: 22rpx;
  font-weight: 600;
}

.page-institution-detail__review-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.page-institution-detail__review-filter {
  padding: 8rpx 16rpx;
  border-radius: 10rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 20rpx;
}

.page-institution-detail__review-filter--active {
  background: #2563eb;
  color: #ffffff;
}

.page-institution-detail__review-list {
  display: grid;
  gap: 10rpx;
}

.page-institution-detail__review-item {
  padding: 14rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
}

.page-institution-detail__review-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10rpx;
}

.page-institution-detail__review-user {
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.page-institution-detail__review-score {
  color: #d97706;
  font-size: 22rpx;
  font-weight: 600;
}

.page-institution-detail__review-content {
  display: block;
  margin-top: 4rpx;
  color: #334155;
  font-size: 23rpx;
}

.page-institution-detail__review-meta {
  display: block;
  margin-top: 4rpx;
  color: #94a3b8;
  font-size: 20rpx;
}

.page-institution-detail__actions {
  padding: 18rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
  display: block;
}
</style>
