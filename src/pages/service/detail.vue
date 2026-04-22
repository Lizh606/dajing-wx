<template>
  <view class="page-service-detail">
    <scroll-view class="page-service-detail__scroll" scroll-y>
      <view v-if="loading" class="service-skeleton">
        <view class="service-skeleton__media" />
        <view class="service-skeleton__line service-skeleton__line--lg" />
        <view class="service-skeleton__line" />
        <view class="service-skeleton__line service-skeleton__line--sm" />
      </view>

      <template v-else>
        <view class="service-hero card card--animated">
          <view class="service-hero__media-wrap" @tap="previewCurrentMedia">
            <image
              v-if="mainMediaUrl"
              class="service-hero__media"
              :src="mainMediaUrl"
              mode="aspectFill"
            />
            <view v-else class="service-hero__media-fallback">
              <AppIcon color="#94a3b8" name="service" size="42" />
              <text>暂无服务图片</text>
            </view>

            <text class="service-hero__status" :class="statusClass(service.status)">
              {{ statusLabel(service.status) }}
            </text>
          </view>

          <view class="service-hero__content">
            <text class="service-hero__title">{{ service.serviceName || '--' }}</text>

            <view class="service-hero__meta">
              <text>{{ categoryText }}</text>
              <text>·</text>
              <text>检测周期 {{ cycleDaysText }}</text>
            </view>

            <view v-if="serviceBadges.length > 0" class="service-hero__tag-row">
              <text
                v-for="tag in serviceBadges"
                :key="tag"
                class="service-hero__tag"
              >
                {{ tag }}
              </text>
            </view>

            <view class="service-hero__price-row">
              <view class="service-hero__price-block">
                <text class="service-hero__price-label">参考价格</text>
                <text class="service-hero__price">¥{{ formatPrice(service.price) }}</text>
                <text v-if="showUrgentFee" class="service-hero__urgent">加急 +¥{{ formatPrice(service.urgentExtraFee) }}</text>
              </view>

              <view v-if="!isProviderView" class="service-hero__consult" @tap="goConsult">
                <AppIcon color="#1E61FF" name="consult" size="18" />
                <text>咨询</text>
              </view>
            </view>

            <view class="service-hero__stats">
              <view class="service-hero__stat">
                <text class="service-hero__stat-value">{{ formatCount(service.orderCount) }}</text>
                <text class="service-hero__stat-label">已选购</text>
              </view>
              <view class="service-hero__stat">
                <text class="service-hero__stat-value">{{ formatCount(service.viewCount) }}</text>
                <text class="service-hero__stat-label">浏览量</text>
              </view>
              <view class="service-hero__stat">
                <text class="service-hero__stat-value">{{ updateTimeText }}</text>
                <text class="service-hero__stat-label">最近更新</text>
              </view>
            </view>
          </view>
        </view>

        <view class="card card--animated" style="animation-delay: 70ms;">
          <text class="section-title">服务简介</text>
          <text class="section-content">{{ serviceDescription }}</text>
        </view>

        <view class="card card--animated" style="animation-delay: 120ms;">
          <text class="section-title">服务要求</text>
          <view class="kv-list">
            <view class="kv-row">
              <text class="kv-row__label">样品类型</text>
              <text class="kv-row__value">{{ sampleTypeText }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">默认标准</text>
              <text class="kv-row__value">{{ defaultStdText }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">检测周期</text>
              <text class="kv-row__value">{{ cycleDaysText }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">资质支持</text>
              <text class="kv-row__value">{{ qualificationText }}</text>
            </view>
          </view>
        </view>

        <view class="card card--animated" style="animation-delay: 160ms;">
          <text class="section-title">送样信息</text>
          <view class="kv-list">
            <view class="kv-row">
              <text class="kv-row__label">机构名称</text>
              <text class="kv-row__value">{{ institutionName }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">样品邮寄地址</text>
              <text class="kv-row__value">{{ deliveryAddress }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">联系方式</text>
              <text class="kv-row__value">{{ contactPhone }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">官方网站</text>
              <text class="kv-row__value">{{ websiteText }}</text>
            </view>
          </view>
        </view>
      </template>

      <view class="page-service-detail__spacer" />
    </scroll-view>

    <view v-if="!isProviderView" class="page-service-detail__actions">
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        plain
        text="咨询机构"
        type="default"
        @click="goConsult"
      />
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        text="立即下单"
        type="info"
        @click="goOrder"
      />
    </view>

    <view v-else-if="providerActions.length > 0" class="page-service-detail__actions page-service-detail__actions--provider">
      <AppButton
        v-for="action in providerActions"
        :key="action.key"
        :class="{
          'page-service-detail__provider-action--full': isProviderActionFullRow(action.key),
        }"
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        :loading="operatingAction === action.key"
        :plain="action.key === 'delete'"
        :text="action.text"
        :type="providerActionType(action.key)"
        @click="handleProviderAction(action.key)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import * as institutionService from '@/services/api/institution'
import * as serviceManageService from '@/services/api/serviceManage'
import type { ServiceItem, ServiceStatus } from '@/services/api/serviceManage'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showAppConfirm } from '@/services/ui/dialog'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

type AnyRecord = Record<string, any>
type ProviderActionKey = 'shelve' | 'unshelve' | 'delete'

const loading = ref(true)
const service = ref<ServiceItem>({})
const institution = ref<institutionService.Institution | null>(null)
const isProviderView = ref(false)
const operatingAction = ref<ProviderActionKey | ''>('')

const mainMediaUrl = computed(() => normalizeUrl(service.value.coverUrl))
const showUrgentFee = computed(() => service.value.supportUrgent === 1 && typeof service.value.urgentExtraFee === 'number')
const categoryText = computed(() => service.value.category?.trim() || '--')
const sampleTypeText = computed(() => service.value.sampleType?.trim() || '--')
const defaultStdText = computed(() => service.value.defaultStd?.trim() || '--')
const cycleDaysText = computed(() => {
  if (typeof service.value.cycleDays === 'number' && Number.isFinite(service.value.cycleDays)) {
    return `${service.value.cycleDays} 天`
  }

  return '--'
})

const serviceBadges = computed(() => {
  const badges: string[] = []

  if (service.value.supportCma === 1) {
    badges.push('支持 CMA')
  }

  if (service.value.supportCnas === 1) {
    badges.push('支持 CNAS')
  }

  if (service.value.supportUrgent === 1) {
    badges.push('支持加急')
  }

  if (service.value.defaultStd) {
    badges.push('标准可定制')
  }

  return badges
})

const serviceDescription = computed(() => service.value.description?.trim() || '--')

const qualificationText = computed(() => {
  const labels: string[] = []

  if (service.value.supportCma === 1) {
    labels.push('CMA')
  }

  if (service.value.supportCnas === 1) {
    labels.push('CNAS')
  }

  if (service.value.supportUrgent === 1) {
    labels.push('可加急')
  }

  return labels.join(' / ') || '--'
})

const updateTimeText = computed(() => {
  const time = service.value.updateTime || service.value.createTime

  if (typeof time !== 'string' || !time.trim()) {
    return '--'
  }

  const normalized = time.replace('T', ' ')
  return normalized.slice(0, 10)
})

const institutionName = computed(() => institution.value?.name?.trim() || '--')
const deliveryAddress = computed(() => {
  const region = institution.value?.region?.trim() || ''
  const address = institution.value?.address?.trim() || ''
  return [region, address].filter(Boolean).join(' ') || '--'
})
const contactPhone = computed(() => institution.value?.contactPhone?.trim() || '--')
const websiteText = computed(() => institution.value?.website?.trim() || '--')
const providerActions = computed<Array<{ key: ProviderActionKey; text: string }>>(() => {
  if (!isProviderView.value) {
    return []
  }

  if (service.value.status === 1) {
    return [{ key: 'unshelve', text: '下架' }]
  }

  if (service.value.status === 0) {
    return [
      { key: 'shelve', text: '上架' },
      { key: 'delete', text: '删除' },
    ]
  }

  return []
})

function providerActionType(action: ProviderActionKey): 'info' | 'danger' {
  return action === 'unshelve' || action === 'delete' ? 'danger' : 'info'
}

function isProviderActionFullRow(action: ProviderActionKey) {
  return action === 'unshelve'
}

onLoad((query) => {
  const id = resolveQueryId(query?.id)
  isProviderView.value = resolveBooleanQuery(query?.providerView)

  if (!id) {
    loading.value = false
    showFailToast('缺少服务ID，无法查看详情')
    return
  }

  void loadDetail(id)
})

function isObject(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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

function resolveBooleanQuery(value: unknown): boolean {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === '1' || normalized === 'true' || normalized === 'yes'
  }

  if (Array.isArray(value) && value.length > 0) {
    return resolveBooleanQuery(value[0])
  }

  return false
}

function normalizeUrl(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function formatPrice(price?: number) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return '--'
  }

  return Number(price).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function formatCount(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return '--'
  }

  return value.toLocaleString('zh-CN')
}

function statusLabel(status?: ServiceStatus) {
  if (status === 1) {
    return '已上架'
  }

  if (status === 2) {
    return '审核中'
  }

  if (status === 0) {
    return '未上架'
  }

  return '--'
}

function statusClass(status?: ServiceStatus) {
  if (status === 1) {
    return 'service-hero__status--online'
  }

  if (status === 2) {
    return 'service-hero__status--pending'
  }

  if (status === 0) {
    return 'service-hero__status--offline'
  }

  return ''
}

async function loadDetail(id: string) {
  loading.value = true

  try {
    const detail = isProviderView.value
      ? await serviceManageService.getDetail(id)
      : await serviceManageService.getPublicDetail(id)
    service.value = detail

    if (detail.serviceName?.trim()) {
      uni.setNavigationBarTitle({ title: detail.serviceName.trim() })
    }

    if (detail.institutionId) {
      try {
        institution.value = await institutionService.getDetail(detail.institutionId)
      } catch {
        institution.value = null
      }
    }
  } catch (error) {
    showFailToast(getErrorMessage(error, '服务详情加载失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}

function previewCurrentMedia() {
  const current = mainMediaUrl.value
  if (!current) {
    return
  }

  uni.previewImage({
    current,
    urls: [current],
  })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  const id = isObject(institution.value) && institution.value.id ? String(institution.value.id) : ''
  uni.navigateTo({ url: `/pages/institution/consult${id ? `?id=${encodeURIComponent(id)}` : ''}` })
}

function goOrder() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  const params: string[] = []
  const serviceName = service.value.serviceName?.trim()
  if (serviceName) {
    params.push(`service=${encodeURIComponent(serviceName)}`)
  }

  if (service.value.id) {
    params.push(`serviceId=${encodeURIComponent(String(service.value.id))}`)
  }

  if (service.value.institutionId) {
    params.push(`institutionId=${encodeURIComponent(String(service.value.institutionId))}`)
  }

  if (institutionName.value && institutionName.value !== '--') {
    params.push(`institutionName=${encodeURIComponent(institutionName.value)}`)
  }

  const query = params.length > 0 ? `?${params.join('&')}` : ''
  uni.navigateTo({ url: `/pages/order/create${query}` })
}

async function handleProviderAction(action: ProviderActionKey) {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (!service.value.id) {
    showFailToast('服务ID缺失，无法操作')
    return
  }

  if (operatingAction.value) {
    return
  }

  operatingAction.value = action

  try {
    if (action === 'shelve') {
      await serviceManageService.shelve(service.value.id)
      showSuccessToast('服务已上架')
      await loadDetail(service.value.id)
      return
    }

    if (action === 'unshelve') {
      await serviceManageService.unshelve(service.value.id)
      showSuccessToast('服务已下架')
      await loadDetail(service.value.id)
      return
    }

    try {
      await showAppConfirm({
        title: '确认删除',
        message: '删除后不可恢复，确认删除该服务吗？',
      })
    } catch {
      return
    }

    await serviceManageService.remove(service.value.id)
    showSuccessToast('服务已删除')
    uni.navigateBack()
  } catch (error) {
    showFailToast(getErrorMessage(error, '操作失败，请稍后重试'))
  } finally {
    operatingAction.value = ''
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-service-detail {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, $brand-50 0%, $bg-page 180rpx, $bg-page 100%);
}

.page-service-detail__scroll {
  height: 100%;
  box-sizing: border-box;
  padding: 18rpx 24rpx calc(124rpx + env(safe-area-inset-bottom));
}

.card {
  border: 1rpx solid $border-light;
  background: $bg-card;
  border-radius: 20rpx;
  box-shadow: $shadow-soft;
  padding: 18rpx;
  margin-bottom: 14rpx;
}

.card--animated {
  animation: card-enter 260ms ease-out both;
}

.service-skeleton {
  border: 1rpx solid $border-light;
  border-radius: 20rpx;
  background: $bg-card;
  padding: 18rpx;
}

.service-skeleton__media,
.service-skeleton__line {
  background: linear-gradient(90deg, #f3f4f6 0%, #eceff3 45%, #f3f4f6 100%);
  background-size: 220% 100%;
  animation: skeleton-shimmer 1.1s infinite;
  border-radius: 12rpx;
}

.service-skeleton__media {
  height: 360rpx;
}

.service-skeleton__line {
  margin-top: 14rpx;
  height: 24rpx;
}

.service-skeleton__line--lg {
  width: 80%;
}

.service-skeleton__line--sm {
  width: 56%;
}

.service-hero__media-wrap {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
}

.service-hero__media {
  width: 100%;
  height: 360rpx;
  display: block;
  background: #eef2f7;
}

.service-hero__media-fallback {
  height: 360rpx;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  color: $text-muted;
  font-size: $font-sm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.service-hero__status {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  border-radius: $radius-pill;
  padding: 6rpx 14rpx;
  font-size: $font-xs;
  border: 1rpx solid transparent;
}

.service-hero__status--online {
  color: #047857;
  background: $accent-green-bg;
  border-color: #a7f3d0;
}

.service-hero__status--pending {
  color: #b45309;
  background: $accent-orange-bg;
  border-color: #fed7aa;
}

.service-hero__status--offline {
  color: $brand-500;
  background: $brand-50;
  border-color: #bfdbfe;
}

.service-hero__content {
  margin-top: 14rpx;
}

.service-hero__title {
  color: $text-primary;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.4rpx;
}

.service-hero__meta {
  margin-top: 8rpx;
  color: $text-secondary;
  font-size: $font-sm;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.service-hero__tag-row {
  margin-top: 10rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.service-hero__tag {
  border-radius: 8rpx;
  background: #f3f8ff;
  border: 1rpx solid #dbeafe;
  color: $brand-500;
  padding: 5rpx 12rpx;
  font-size: $font-2xs;
}

.service-hero__price-row {
  margin-top: 16rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12rpx;
}

.service-hero__price-block {
  min-width: 0;
}

.service-hero__price-label {
  display: block;
  color: $text-muted;
  font-size: $font-xs;
}

.service-hero__price {
  display: block;
  margin-top: 4rpx;
  color: $accent-orange;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.1;
  font-family: 'DIN Alternate', 'Inter', 'Roboto', sans-serif;
}

.service-hero__urgent {
  display: block;
  margin-top: 4rpx;
  color: #b45309;
  font-size: $font-xs;
}

.service-hero__consult {
  width: 90rpx;
  height: 90rpx;
  border-radius: 999rpx;
  border: 1rpx solid #bfdbfe;
  background: #eff6ff;
  color: $brand-500;
  font-size: $font-xs;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.service-hero__stats {
  margin-top: 14rpx;
  border: 1rpx solid $border-light;
  border-radius: 14rpx;
  padding: 14rpx 10rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
  background: #fafcff;
}

.service-hero__stat {
  text-align: center;
}

.service-hero__stat-value {
  display: block;
  color: $text-primary;
  font-size: $font-base;
  font-weight: 700;
}

.service-hero__stat-label {
  display: block;
  margin-top: 4rpx;
  color: $text-muted;
  font-size: $font-2xs;
}

.section-title {
  display: block;
  color: $text-primary;
  font-size: 30rpx;
  font-weight: 700;
}

.section-content {
  margin-top: 10rpx;
  display: block;
  color: $text-secondary;
  font-size: $font-sm;
  line-height: 1.6;
}

.kv-list {
  margin-top: 10rpx;
  border: 1rpx solid $border-light;
  border-radius: 14rpx;
  overflow: hidden;
}

.kv-row {
  padding: 14rpx 14rpx;
  background: #ffffff;
  display: grid;
  grid-template-columns: 170rpx minmax(0, 1fr);
  column-gap: 10rpx;
  align-items: flex-start;
}

.kv-row + .kv-row {
  border-top: 1rpx solid $border-light;
}

.kv-row__label {
  color: $text-muted;
  font-size: $font-xs;
  line-height: 1.5;
}

.kv-row__value {
  color: $text-secondary;
  font-size: $font-sm;
  line-height: 1.55;
  word-break: break-all;
}

.page-service-detail__spacer {
  height: 20rpx;
}

.page-service-detail__actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  border-top: 1rpx solid $border-light;
  padding: 12rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 12rpx;
  z-index: 30;
}

.page-service-detail__actions--provider {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.page-service-detail__provider-action--full {
  grid-column: 1 / -1;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(12rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card--animated,
  .service-skeleton__media,
  .service-skeleton__line {
    animation: none !important;
  }
}
</style>
