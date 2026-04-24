<template>
  <view class="page-service-manage">
    <scroll-view class="page-service-manage__scroll" scroll-y>
      <view class="page-service-manage__search-wrap">
        <AppSearchBarWithButton
          v-model="searchKeyword"
          button-text="搜索"
          placeholder="搜索服务名称、分类"
          @confirm="handleSearchSubmit"
          @search="handleSearchSubmit"
        />
      </view>

      <view v-if="isProvider" class="page-service-manage__filter-panel">
        <scroll-view class="page-service-manage__filter-scroll" scroll-x>
          <view class="page-service-manage__filter-row">
            <text
              v-for="tab in statusTabs"
              :key="tab.key"
              class="page-service-manage__chip"
              :class="{ 'page-service-manage__chip--active': activeStatusKey === tab.key }"
              @tap="activeStatusKey = tab.key"
            >{{ tab.label }}</text>
          </view>
        </scroll-view>
      </view>

      <view class="page-service-manage__stats">
        <view class="service-stat-card">
          <text class="service-stat-card__label">服务总数</text>
          <text class="service-stat-card__value">{{ stats.total }}</text>
        </view>
        <view class="service-stat-card service-stat-card--online">
          <text class="service-stat-card__label">已上架</text>
          <text class="service-stat-card__value">{{ stats.online }}</text>
        </view>
        <view class="service-stat-card service-stat-card--offline">
          <text class="service-stat-card__label">未上架</text>
          <text class="service-stat-card__value">{{ stats.offline }}</text>
        </view>
        <view class="service-stat-card service-stat-card--pending">
          <text class="service-stat-card__label">审核中</text>
          <text class="service-stat-card__value">{{ stats.pending }}</text>
        </view>
      </view>

      <view v-if="isGuest" class="page-service-manage__guest">
        <AppIcon color="#1E61FF" name="user-line" size="22" />
        <text class="page-service-manage__guest-title">当前为游客模式</text>
        <text class="page-service-manage__guest-desc">可先浏览首页与服务内容，按需登录后再管理服务。</text>
        <AppButton
          custom-style="min-height: 70rpx; margin-top: 16rpx;"
          round
          text="去登录"
          type="info"
          @click="goLogin"
        />
      </view>

      <view v-else-if="!isProvider" class="page-service-manage__forbidden">
        <AppIcon color="#1E61FF" name="warning" size="22" />
        <text class="page-service-manage__forbidden-title">仅服务提供方账号可管理服务</text>
        <text class="page-service-manage__forbidden-desc">请切换至服务机构账号（userType=2）后再进行上架、编辑等操作。</text>
      </view>

      <AppList v-else-if="isProvider" :finished="!loading" :finished-text="finishedText" :loading="loading">
        <view v-if="filteredServices.length > 0" class="service-card-grid">
          <ServiceCard
            v-for="service in filteredServices"
            :key="service.id"
            :cover-url="service.coverUrl"
            fallback-text="服务封面"
            :price-text="`¥${formatPrice(service.price)}`"
            :title="service.serviceName || '未命名服务'"
            :type-text="service.category || '未分类'"
            @click="goDetail(service)"
          >
            <template #media-extra>
              <text class="service-card__media-status" :class="statusClass(service.status)">{{ statusLabel(service.status) }}</text>
            </template>
            <template #price-right>
              <text class="service-card__sold">已售 {{ formatSoldCount(service.orderCount) }}</text>
            </template>
          </ServiceCard>
        </view>

        <view v-else class="page-service-manage__empty">
          <AppIcon color="#9ca3af" name="service" size="28" />
          <text class="page-service-manage__empty-title">暂无服务数据</text>
          <text class="page-service-manage__empty-desc">点击右下角 + 可新增服务项目</text>
        </view>
      </AppList>
      <view class="page-service-manage__bottom-spacer" />
    </scroll-view>

    <view v-if="isProvider" class="page-service-manage__fab" @tap="goCreate">
      <AppIcon color="#ffffff" name="plus" size="24" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import ServiceCard from '@/components/service/ServiceCard/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchBarWithButton from '@/components/ui/AppSearchBarWithButton/index.vue'
import * as serviceManageService from '@/services/api/serviceManage'
import type { ServiceItem, ServiceStatus } from '@/services/api/serviceManage'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

type StatusTabKey = 'all' | ServiceStatus

const userStore = useUserStore()
const loading = ref(false)
const searchKeyword = ref('')
const appliedSearchKeyword = ref('')
const activeStatusKey = ref<StatusTabKey>('all')
const services = ref<ServiceItem[]>([])
const hasShownForbiddenToast = ref(false)

const statusTabs: Array<{ key: StatusTabKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 1, label: '已上架' },
  { key: 0, label: '未上架' },
  { key: 2, label: '审核中' },
]

const isGuest = computed(() => !userStore.isLoggedIn)
const isProvider = computed(() => userStore.accountType === 2)

const filteredServices = computed(() => {
  const keyword = appliedSearchKeyword.value.trim().toLowerCase()

  const list = activeStatusKey.value === 'all'
    ? services.value
    : services.value.filter((item) => item.status === activeStatusKey.value)

  if (!keyword) {
    return list
  }

  return list.filter((item) => {
    const name = `${item.serviceName || ''}`.toLowerCase()
    const category = `${item.category || ''}`.toLowerCase()
    return name.includes(keyword) || category.includes(keyword)
  })
})

const stats = computed(() => {
  const total = services.value.length
  const online = services.value.filter((item) => item.status === 1).length
  const offline = services.value.filter((item) => item.status === 0).length
  const pending = services.value.filter((item) => item.status === 2).length

  return { total, online, offline, pending }
})

const finishedText = computed(() => {
  if (loading.value) {
    return '加载中...'
  }

  return filteredServices.value.length > 0 ? '没有更多服务了' : '暂无服务数据'
})

onShow(() => {
  if (!userStore.isLoggedIn) {
    services.value = []
    hasShownForbiddenToast.value = false
    return
  }

  if (!isProvider.value) {
    if (!hasShownForbiddenToast.value) {
      hasShownForbiddenToast.value = true
      showAppToast({ icon: 'none', message: '当前账号非服务提供方，暂不可管理服务' })
    }
    services.value = []
    return
  }

  hasShownForbiddenToast.value = false
  void loadAllServices()
})

function formatPrice(price?: number) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return '--'
  }

  return Number(price).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function statusLabel(status?: ServiceStatus) {
  if (status === 1) {
    return '已上架'
  }

  if (status === 2) {
    return '审核中'
  }

  return '未上架'
}

function statusClass(status?: ServiceStatus) {
  if (status === 1) {
    return 'service-card__media-status--online'
  }

  if (status === 2) {
    return 'service-card__media-status--pending'
  }

  return 'service-card__media-status--offline'
}

function goCreate() {
  uni.navigateTo({ url: '/pages/service/form' })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}

function formatSoldCount(value?: number) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value.toLocaleString('zh-CN')
  }

  return '0'
}

function handleSearchSubmit(keyword?: string) {
  appliedSearchKeyword.value = (keyword ?? searchKeyword.value).trim()
}

function goDetail(service: ServiceItem) {
  if (!service.id) {
    showFailToast('服务ID缺失，无法查看详情')
    return
  }

  uni.navigateTo({ url: `/pages/service/detail?id=${service.id}&providerView=1` })
}

async function loadAllServices() {
  if (loading.value) {
    return
  }

  loading.value = true

  try {
    const merged: ServiceItem[] = []
    const size = 50
    let page = 1
    let pages = 1

    do {
      const result = await serviceManageService.getMyList({ page, size })
      merged.push(...(Array.isArray(result.records) ? result.records : []))
      pages = result.pages > 0 ? result.pages : 1
      page += 1
    } while (page <= pages && page <= 50)

    services.value = merged
  } catch (error) {
    services.value = []
    showFailToast(getErrorMessage(error, '服务列表加载失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-service-manage {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: $bg-page;
}

.page-service-manage__scroll {
  height: 100%;
  padding: 18rpx 24rpx calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.page-service-manage__search-wrap {
  margin-bottom: 2rpx;
}

.page-service-manage__filter-panel {
  margin-top: 16rpx;
}

.page-service-manage__filter-scroll {
  white-space: nowrap;
}

.page-service-manage__filter-row {
  display: flex;
  gap: 12rpx;
  padding-bottom: 12rpx;
}

.page-service-manage__chip {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 22rpx;
}

.page-service-manage__chip--active {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1E61FF;
}

.page-service-manage__stats {
  margin-top: 4rpx;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10rpx;
}

.service-stat-card {
  padding: 14rpx 10rpx;
  border-radius: 14rpx;
  background: #ffffff;
  border: 1rpx solid $border-light;
  text-align: center;
}

.service-stat-card__label {
  display: block;
  color: $text-muted;
  font-size: 20rpx;
}

.service-stat-card__value {
  display: block;
  margin-top: 6rpx;
  color: $text-primary;
  font-size: 30rpx;
  font-weight: 600;
}

.service-stat-card--online .service-stat-card__value {
  color: $accent-green;
}

.service-stat-card--offline .service-stat-card__value {
  color: #1d4ed8;
}

.service-stat-card--pending .service-stat-card__value {
  color: $accent-orange;
}

.page-service-manage__forbidden {
  margin-top: 18rpx;
  border-radius: 18rpx;
  border: 1rpx solid #dbeafe;
  background: #ffffff;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.page-service-manage__guest {
  margin-top: 18rpx;
  border-radius: 18rpx;
  border: 1rpx solid #dbeafe;
  background: #ffffff;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.page-service-manage__guest-title {
  color: $text-primary;
  font-size: 28rpx;
  font-weight: 600;
}

.page-service-manage__guest-desc {
  color: $text-muted;
  font-size: 22rpx;
  line-height: 1.6;
}

.page-service-manage__forbidden-title {
  color: $text-primary;
  font-size: 28rpx;
  font-weight: 600;
}

.page-service-manage__forbidden-desc {
  color: $text-muted;
  font-size: 22rpx;
  line-height: 1.6;
}

.service-card-grid {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.service-card__media-status {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  z-index: 2;
  border-radius: 999rpx;
  border: 1rpx solid transparent;
  padding: 6rpx 14rpx;
  font-size: 20rpx;
  font-weight: 500;
  line-height: 1.2;
}

.service-card__media-status--online {
  color: #047857;
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.service-card__media-status--offline {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.service-card__media-status--pending {
  color: #b45309;
  background: #fff7ed;
  border-color: #fed7aa;
}

.service-card__sold {
  flex-shrink: 0;
  color: #64748b;
  font-size: 20rpx;
}

.page-service-manage__empty {
  margin-top: 22rpx;
  padding: 50rpx 24rpx;
  border-radius: 18rpx;
  border: 1rpx dashed #dbe2ee;
  background: #ffffff;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.page-service-manage__empty-title {
  color: $text-primary;
  font-size: 26rpx;
  font-weight: 600;
}

.page-service-manage__empty-desc {
  color: $text-muted;
  font-size: 22rpx;
}

.page-service-manage__fab {
  position: fixed;
  right: 30rpx;
  bottom: calc(34rpx + env(safe-area-inset-bottom));
  width: 92rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: #1E61FF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(30, 97, 255, 0.32);
  z-index: 30;
}

.page-service-manage__bottom-spacer {
  height: 20rpx;
}
</style>
