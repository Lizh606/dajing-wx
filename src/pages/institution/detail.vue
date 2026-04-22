<template>
  <view class="page-institution-detail">
    <view class="page-institution-detail__scroll">
      <view class="page-institution-detail__hero">
        <view class="page-institution-detail__hero-top">
          <view class="page-institution-detail__hero-main">
            <view class="page-institution-detail__hero-title-row">
              <text class="page-institution-detail__hero-title">{{ institution.name || '机构详情' }}</text>
              <text class="page-institution-detail__hero-badge">{{ institution.institutionTypeLabel }}</text>
            </view>
            <text class="page-institution-detail__hero-sub">简称：{{ institution.shortName || '-' }}</text>
            <text class="page-institution-detail__hero-sub">所在地：{{ institution.locationText }}</text>
          </view>
          <view class="page-institution-detail__hero-logo-wrap">
            <image
              v-if="institution.logo"
              class="page-institution-detail__hero-logo"
              :src="institution.logo"
              mode="aspectFill"
            />
            <AppIcon v-else color="#1E61FF" name="institution" size="30" />
          </view>
        </view>

        <view class="page-institution-detail__hero-stats">
          <view class="page-institution-detail__hero-stat">
            <text class="page-institution-detail__hero-stat-value">{{ institution.avgScoreText }}</text>
            <text class="page-institution-detail__hero-stat-label">综合评分</text>
          </view>
          <view class="page-institution-detail__hero-stat">
            <text class="page-institution-detail__hero-stat-value">{{ institution.serviceCountText }}</text>
            <text class="page-institution-detail__hero-stat-label">上架服务</text>
          </view>
          <view class="page-institution-detail__hero-stat">
            <text class="page-institution-detail__hero-stat-value">{{ institution.orderCountText }}</text>
            <text class="page-institution-detail__hero-stat-label">历史订单</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__content">
        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">机构简介</text>
          </view>
          <text class="page-institution-detail__intro">{{ institution.introduction || '暂无机构简介' }}</text>
        </view>

        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">机构能力</text>
          </view>

          <view class="page-institution-detail__capability-block">
            <text class="page-institution-detail__capability-label">资质认证</text>
            <view v-if="institution.qualificationTags.length > 0" class="page-institution-detail__tag-list">
              <text
                v-for="tag in institution.qualificationTags"
                :key="`qualification-${tag}`"
                class="page-institution-detail__tag"
              >
                {{ tag }}
              </text>
            </view>
            <text v-else class="page-institution-detail__empty-text">暂无资质认证信息</text>
          </view>

          <view class="page-institution-detail__capability-block">
            <text class="page-institution-detail__capability-label">服务范围</text>
            <view v-if="institution.serviceRangeTags.length > 0" class="page-institution-detail__tag-list">
              <text
                v-for="tag in institution.serviceRangeTags"
                :key="`service-range-${tag}`"
                class="page-institution-detail__tag page-institution-detail__tag--soft"
              >
                {{ tag }}
              </text>
            </view>
            <text v-else class="page-institution-detail__empty-text">暂无服务范围信息</text>
          </view>
        </view>

        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">基础信息</text>
          </view>
          <view class="page-institution-detail__info-list">
            <view v-for="item in basicInfoRows" :key="item.label" class="page-institution-detail__info-row">
              <text class="page-institution-detail__info-label">{{ item.label }}</text>
              <text class="page-institution-detail__info-value">{{ item.value || '-' }}</text>
            </view>
          </view>
        </view>

        <view class="page-institution-detail__card">
          <view class="page-institution-detail__card-header">
            <text class="page-institution-detail__card-title">服务方案</text>
            <text class="page-institution-detail__service-count">{{ institutionServices.length }}项</text>
          </view>

          <view v-if="institutionServicesLoading" class="page-institution-detail__service-loading">
            <text>服务方案加载中...</text>
          </view>

          <view v-else-if="institutionServices.length > 0" class="service-card-grid">
            <ServiceCard
              v-for="service in institutionServices"
              :key="service.id"
              :cover-url="service.coverUrl"
              fallback-text="服务封面"
              :price-text="formatServicePrice(service.price)"
              :right-text="formatServiceRightText(service)"
              :title="service.serviceName || '未命名服务'"
              :type-text="service.category || ''"
              @click="goServiceDetail(service)"
            />
          </view>

          <view v-else class="page-institution-detail__service-empty">
            <AppIcon color="#9CA3AF" name="service" size="28" />
            <text class="page-institution-detail__service-empty-title">当前机构暂无上架服务</text>
            <text class="page-institution-detail__service-empty-desc">可先发起咨询获取服务方案</text>
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
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ServiceCard from '@/components/service/ServiceCard/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppIcon from '@/components/AppIcon/index.vue'
import * as institutionService from '@/services/api/institution'
import * as serviceManageService from '@/services/api/serviceManage'
import type { ServiceItem } from '@/services/api/serviceManage'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showFailToast } from '@/services/ui/toast'

interface InstitutionDetailView {
  address: string
  avgScoreText: string
  contactPhone: string
  createTime: string
  id: string
  institutionTypeLabel: string
  introduction: string
  locationText: string
  logo: string
  name: string
  orderCountText: string
  qualificationTags: string[]
  region: string
  serviceCountText: string
  serviceRangeTags: string[]
  shortName: string
  updateTime: string
  website: string
}

function createEmptyInstitution(): InstitutionDetailView {
  return {
    address: '',
    avgScoreText: '--',
    contactPhone: '',
    createTime: '',
    id: '',
    institutionTypeLabel: '机构',
    introduction: '',
    locationText: '-',
    logo: '',
    name: '',
    orderCountText: '0',
    qualificationTags: [],
    region: '',
    serviceCountText: '0',
    serviceRangeTags: [],
    shortName: '',
    updateTime: '',
    website: '',
  }
}

const institution = ref<InstitutionDetailView>(createEmptyInstitution())
const institutionServices = ref<ServiceItem[]>([])
const institutionServicesLoading = ref(false)

const basicInfoRows = computed(() => [
  { label: '机构 ID', value: institution.value.id },
  { label: '联系电话', value: institution.value.contactPhone },
  { label: '官方网站', value: institution.value.website },
  { label: '所属地区', value: institution.value.region },
  { label: '详细地址', value: institution.value.address },
  { label: '创建时间', value: institution.value.createTime },
  { label: '更新时间', value: institution.value.updateTime },
])

onLoad((query) => {
  const detailId = resolveQueryId(query?.id)

  if (!detailId) {
    return
  }

  void loadInstitutionDetail(detailId)
  void loadInstitutionServices(detailId)
})

function resolveQueryId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0].trim()
  }

  return ''
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

function toTagList(value: unknown) {
  const text = toText(value)
  if (!text) {
    return []
  }

  return text
    .split(/[\s,，、;；/|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDateTime(value: unknown) {
  const text = toText(value)
  if (!text) {
    return ''
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) {
    return text
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

function normalizeInstitutionType(typeValue: unknown) {
  const type = toNumber(typeValue)
  if (type === 1) {
    return '检测机构'
  }

  if (type === 2) {
    return '认证机构'
  }

  if (type === 3) {
    return '计量机构'
  }

  return '机构'
}

function normalizeInstitutionDetail(source: institutionService.Institution, detailId: string): InstitutionDetailView {
  const region = toText(source.region)
  const address = toText(source.address)
  const locationText = [region, address].filter(Boolean).join(' ') || '-'

  const avgScore = toNumber(source.avgScore)
  const serviceCount = toNumber(source.serviceCount) ?? 0
  const orderCount = toNumber(source.orderCount) ?? 0

  return {
    address,
    avgScoreText: typeof avgScore === 'number' ? avgScore.toFixed(1) : '--',
    contactPhone: toText(source.contactPhone),
    createTime: formatDateTime(source.createTime),
    id: toText(source.id) || detailId,
    institutionTypeLabel: normalizeInstitutionType(source.institutionType),
    introduction: toText(source.introduction),
    locationText,
    logo: toText(source.logo),
    name: toText(source.name),
    orderCountText: orderCount.toLocaleString('zh-CN'),
    qualificationTags: toTagList(source.qualification),
    region,
    serviceCountText: serviceCount.toLocaleString('zh-CN'),
    serviceRangeTags: toTagList(source.serviceRange),
    shortName: toText(source.shortName),
    updateTime: formatDateTime(source.updateTime),
    website: toText(source.website),
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
    institution.value = {
      ...createEmptyInstitution(),
      id: detailId,
    }
    showFailToast(getErrorMessage(error, '机构详情加载失败'))
  }
}

async function loadInstitutionServices(detailId: string) {
  institutionServicesLoading.value = true

  try {
    const merged: ServiceItem[] = []
    const size = 20
    let page = 1
    let pages = 1

    do {
      const result = await serviceManageService.listByInstitution(detailId, { page, size })
      merged.push(...(Array.isArray(result.records) ? result.records : []))
      pages = result.pages > 0 ? result.pages : 1
      page += 1
    } while (page <= pages && page <= 50)

    institutionServices.value = merged
  } catch (error) {
    institutionServices.value = []
    showFailToast(getErrorMessage(error, '机构服务方案加载失败'))
  } finally {
    institutionServicesLoading.value = false
  }
}

function formatServicePrice(price?: number) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return '¥--'
  }

  return `¥${price.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function formatSoldCount(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return '0'
  }

  return value.toLocaleString('zh-CN')
}

function formatServiceRightText(service: ServiceItem) {
  return `已售 ${formatSoldCount(service.orderCount)}`
}

function goServiceDetail(service: ServiceItem) {
  if (!service.id) {
    showFailToast('服务ID缺失，无法查看详情')
    return
  }

  uni.navigateTo({ url: `/pages/service/detail?id=${service.id}` })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  const query: string[] = []
  if (institution.value.id) {
    query.push(`institutionId=${encodeURIComponent(institution.value.id)}`)
  }

  if (institution.value.name) {
    query.push(`institutionName=${encodeURIComponent(institution.value.name)}`)
  }

  const suffix = query.length > 0 ? `?${query.join('&')}` : ''
  uni.navigateTo({ url: `/pages/institution/consult${suffix}` })
}
</script>

<style scoped lang="scss">
.page-institution-detail {
  --page-bg: #edf3ff;
  --card-bg: #ffffff;
  --text-main: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --line-soft: #dbe6ff;
  --primary: #1e61ff;
  --primary-soft: #e9f1ff;

  min-height: 100vh;
  background:
    radial-gradient(circle at 84% -10%, rgba(30, 97, 255, 0.16) 0%, rgba(30, 97, 255, 0) 52%),
    radial-gradient(circle at -12% 16%, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 45%),
    var(--page-bg);
  color: var(--text-main);
}

.page-institution-detail__scroll {
  padding-top: 20rpx;
  padding-bottom: 24rpx;
}

.page-institution-detail__hero {
  margin: 0 20rpx 0;
  padding: 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(145deg, #f8fbff 0%, #edf3ff 48%, #e4edff 100%);
  border: 1rpx solid #d7e4ff;
  box-shadow: 0 12rpx 28rpx rgba(29, 78, 216, 0.08);
}

.page-institution-detail__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
}

.page-institution-detail__hero-main {
  flex: 1;
  min-width: 0;
}

.page-institution-detail__hero-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.page-institution-detail__hero-title {
  color: var(--text-main);
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.35;
}

.page-institution-detail__hero-badge {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  border: 1rpx solid #bfdbfe;
  background: rgba(255, 255, 255, 0.88);
  color: #1d4ed8;
  font-size: 18rpx;
  font-weight: 600;
}

.page-institution-detail__hero-sub {
  display: block;
  margin-top: 8rpx;
  color: var(--text-secondary);
  font-size: 22rpx;
  line-height: 1.45;
}

.page-institution-detail__hero-logo-wrap {
  width: 94rpx;
  height: 94rpx;
  border-radius: 22rpx;
  border: 1rpx solid #dbeafe;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1rpx rgba(191, 219, 254, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.page-institution-detail__hero-logo {
  width: 100%;
  height: 100%;
}

.page-institution-detail__hero-stats {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.page-institution-detail__hero-stat {
  border-radius: 16rpx;
  padding: 14rpx 8rpx;
  background: rgba(255, 255, 255, 0.86);
  border: 1rpx solid #dce8ff;
  text-align: center;
}

.page-institution-detail__hero-stat-value {
  display: block;
  color: var(--text-main);
  font-size: 30rpx;
  font-weight: 700;
}

.page-institution-detail__hero-stat-label {
  display: block;
  margin-top: 2rpx;
  color: var(--text-tertiary);
  font-size: 20rpx;
}

.page-institution-detail__content {
  margin-top: 14rpx;
  padding: 0 20rpx;
}

.page-institution-detail__card {
  margin-bottom: 14rpx;
  padding: 22rpx;
  border-radius: 22rpx;
  background: var(--card-bg);
  border: 1rpx solid var(--line-soft);
  box-shadow: 0 8rpx 20rpx rgba(30, 64, 175, 0.05);
}

.page-institution-detail__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.page-institution-detail__card-title {
  color: var(--text-main);
  font-size: 30rpx;
  font-weight: 700;
}

.page-institution-detail__intro {
  color: #1e293b;
  font-size: 24rpx;
  line-height: 1.65;
}

.page-institution-detail__capability-block {
  margin-top: 12rpx;
  padding: 14rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fbff;
}

.page-institution-detail__capability-label {
  display: block;
  color: var(--text-tertiary);
  font-size: 20rpx;
}

.page-institution-detail__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.page-institution-detail__tag {
  border-radius: 999rpx;
  padding: 6rpx 12rpx;
  background: #e6efff;
  color: #1d4ed8;
  font-size: 20rpx;
}

.page-institution-detail__tag--soft {
  background: #eef6ff;
  color: #1e40af;
}

.page-institution-detail__empty-text {
  display: block;
  margin-top: 8rpx;
  color: #94a3b8;
  font-size: 20rpx;
}

.page-institution-detail__info-list {
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
}

.page-institution-detail__info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
  padding: 16rpx;
  background: #ffffff;
}

.page-institution-detail__info-row:nth-child(odd) {
  background: #f8fbff;
}

.page-institution-detail__info-label {
  flex: 0 0 148rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.5;
}

.page-institution-detail__info-value {
  flex: 1;
  min-width: 0;
  color: #0f172a;
  font-size: 22rpx;
  line-height: 1.5;
  text-align: right;
  word-break: break-all;
}

.page-institution-detail__service-count {
  color: var(--text-tertiary);
  font-size: 20rpx;
}

.page-institution-detail__service-loading {
  border-radius: 16rpx;
  border: 1rpx dashed #dbe5f6;
  background: #f8fbff;
  padding: 28rpx 20rpx;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 22rpx;
}

.service-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.page-institution-detail__service-empty {
  border-radius: 18rpx;
  border: 1rpx dashed #dbe5f6;
  background: #ffffff;
  text-align: center;
  padding: 42rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.page-institution-detail__service-empty-title {
  color: var(--text-main);
  font-size: 26rpx;
  font-weight: 600;
}

.page-institution-detail__service-empty-desc {
  color: var(--text-tertiary);
  font-size: 22rpx;
}

.page-institution-detail__actions {
  padding: 18rpx 20rpx calc(28rpx + env(safe-area-inset-bottom));
}
</style>
