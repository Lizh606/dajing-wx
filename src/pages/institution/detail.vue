<template>
  <view class="page-institution-detail">
    <scroll-view class="page-institution-detail__scroll" scroll-y>
      <view class="page-institution-detail__hero">
        <view class="page-institution-detail__hero-icon-wrap">
          <AppIcon color="#2563eb" name="institution" size="40" />
        </view>
        <text class="page-institution-detail__hero-title">{{ institution.name }}</text>
        <view class="page-institution-detail__tag-list">
          <text v-for="cert in institution.certs" :key="cert" class="page-institution-detail__tag">{{ cert }}</text>
        </view>
        <view class="page-institution-detail__hero-location">
          <AppIcon color="#64748b" name="location" size="14" />
          <text>{{ institution.location }}</text>
        </view>
        <view class="page-institution-detail__hero-rating">
          <text class="page-institution-detail__hero-score">{{ institution.score }}</text>
          <view class="page-institution-detail__hero-stars">
            <AppIcon v-for="star in 5" :key="star" color="#d97706" name="star" size="14" />
          </view>
          <text class="page-institution-detail__hero-count">（{{ institution.reviewCount }} 条评价）</text>
        </view>
      </view>

      <view class="page-institution-detail__card page-institution-detail__stats">
        <view class="page-institution-detail__stats-grid">
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">{{ institution.serviceCount }}</text>
            <text class="page-institution-detail__stats-label">服务项目</text>
          </view>
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">{{ institution.orderCount }}</text>
            <text class="page-institution-detail__stats-label">累计订单</text>
          </view>
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">{{ institution.avgDays }}天</text>
            <text class="page-institution-detail__stats-label">平均周期</text>
          </view>
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">{{ institution.responseTime }}</text>
            <text class="page-institution-detail__stats-label">响应时间</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__card">
        <text class="page-institution-detail__card-title">能力简介</text>
        <text class="page-institution-detail__paragraph">{{ institution.description }}</text>
      </view>

      <view class="page-institution-detail__card">
        <view class="page-institution-detail__card-header">
          <text class="page-institution-detail__card-title">服务项目</text>
          <text class="page-institution-detail__more" @tap="goServices">全部服务</text>
        </view>
        <view class="page-institution-detail__service-list">
          <view v-for="service in services" :key="service.name" class="page-institution-detail__service-item">
            <view class="page-institution-detail__service-icon" :style="{ background: service.iconBg }">
              <AppIcon :name="service.iconName" size="28" />
            </view>
            <view class="page-institution-detail__service-body">
              <text class="page-institution-detail__service-name">{{ service.name }}</text>
              <text class="page-institution-detail__service-desc">{{ service.desc }}</text>
            </view>
            <view class="page-institution-detail__service-side">
              <text class="page-institution-detail__service-price">¥{{ service.price }}起</text>
              <AppButton
                custom-style="min-height: 64rpx; height: 64rpx; min-width: 128rpx; padding: 0 24rpx; border-radius: 18rpx; font-size: 24rpx; font-weight: 600;"
                text="下单"
                type="info"
                @click="goOrder"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__card">
        <text class="page-institution-detail__card-title">履约表现</text>
        <view class="page-institution-detail__stats-grid page-institution-detail__stats-grid--performance">
          <view v-for="item in performance" :key="item.label" class="page-institution-detail__performance-item">
            <text class="page-institution-detail__performance-value" :style="{ color: item.color }">{{ item.value }}</text>
            <text class="page-institution-detail__performance-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__actions">
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          plain
          text="立即咨询"
          type="default"
          @click="goConsult"
        />
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          text="立即下单"
          type="info"
          @click="goOrder"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import { enterpriseService } from '@/services/api'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showFailToast } from '@/services/ui/toast'

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
    ['certs'],
    ['certList'],
    ['certNames'],
    ['qualifications'],
    ['certification'],
  ])

  if (Array.isArray(candidate)) {
    return candidate.map((item) => toText(item)).filter(Boolean).slice(0, 4)
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
  const name = toText(pickValue(source, [['enterpriseName'], ['companyName'], ['company'], ['name']])) || fallback.name
  const region = toText(pickValue(source, [['region'], ['area'], ['city'], ['province']]))
  const address = toText(pickValue(source, [['address']]))
  const location = [region, address].filter(Boolean).join(' ') || region || address || fallback.location
  const score = toNumber(pickValue(source, [['score'], ['rating'], ['rate']]))
  const reviewCount = toNumber(pickValue(source, [['reviewCount'], ['commentCount'], ['evaluateCount']]))
  const serviceCount = toNumber(pickValue(source, [['serviceCount'], ['projectCount'], ['serviceNum']]))
  const orderCount = toNumber(pickValue(source, [['orderCount'], ['orders'], ['orderNum']]))
  const avgDays = toNumber(pickValue(source, [['avgDays'], ['cycleDays'], ['serviceDays']]))
  const responseMinutes = toNumber(pickValue(source, [['responseMinutes'], ['responseTimeMinutes']]))
  const responseText = toText(pickValue(source, [['responseTime'], ['responseDuration']]))
  const description = toText(pickValue(source, [['description'], ['intro'], ['profile'], ['summary']])) || fallback.description

  return {
    avgDays: avgDays > 0 ? avgDays : fallback.avgDays,
    certs: parseCerts(source).length > 0 ? parseCerts(source) : fallback.certs,
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
    const detail = await enterpriseService.getDetail(detailId)
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

function goOrder() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/order/create' })
}

function goServices() {
  uni.navigateTo({ url: '/pages/institution/services' })
}
</script>

<style scoped lang="scss">
.page-institution-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-institution-detail__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.page-institution-detail__hero {
  margin-bottom: 16rpx;
  padding: 36rpx;
  border-radius: 24rpx;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-institution-detail__hero-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 20rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe;
}

.page-institution-detail__hero-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-institution-detail__tag-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.page-institution-detail__tag {
  @include pill-tag(24rpx, 8rpx, 6rpx 16rpx);
  @include pill-tag-tone(#2563eb, #dbeafe);
}

.page-institution-detail__hero-location {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-institution-detail__hero-rating {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
}

.page-institution-detail__hero-score {
  font-size: 40rpx;
  font-weight: 700;
  color: #d97706;
}

.page-institution-detail__hero-stars {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
}

.page-institution-detail__hero-count {
  font-size: 22rpx;
  color: #94a3b8;
}

.page-institution-detail__card {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-institution-detail__card-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-institution-detail__stats {
  padding: 24rpx;
}

.page-institution-detail__stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.page-institution-detail__stats-item {
  text-align: center;
}

.page-institution-detail__stats-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-institution-detail__stats-label {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-institution-detail__paragraph {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: #475569;
}

.page-institution-detail__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.page-institution-detail__more {
  font-size: 24rpx;
  color: #2563eb;
}

.page-institution-detail__service-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.page-institution-detail__service-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.page-institution-detail__service-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-institution-detail__service-body {
  flex: 1;
  min-width: 0;
}

.page-institution-detail__service-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-institution-detail__service-desc {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-institution-detail__service-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
  flex-shrink: 0;
}

.page-institution-detail__service-price {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #2563eb;
}

.page-institution-detail__stats-grid--performance {
  gap: 16rpx;
}

.page-institution-detail__performance-item {
  border-radius: 12rpx;
  text-align: center;
  padding: 20rpx 8rpx;
  background: #f8fafc;
}

.page-institution-detail__performance-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.page-institution-detail__performance-label {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-institution-detail__actions {
  margin-top: 8rpx;
  padding-bottom: 40rpx;
  display: flex;
  gap: 16rpx;

  :deep(.van-button),
  :deep(.app-button) {
    flex: 1 1 0;
    width: auto;
  }
}
</style>
