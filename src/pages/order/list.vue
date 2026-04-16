<template>
  <view class="page-order-list">
    <view class="page-order-list__header">
      <view class="page-order-list__search-box">
        <AppIcon class="page-order-list__search-icon" color="#94a3b8" name="search" size="18" />
        <AppField
          v-model="searchKeyword"
          class="page-order-list__search-input-wrap"
          :border="false"
          custom-style="height: 72rpx; min-height: 72rpx; padding: 0; border: none; background: transparent;"
          placeholder="搜索委托编号、项目名称、机构名称"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <view class="page-order-list__tabs-wrap">
      <AppTabs v-model="activeTab" layout="scroll">
        <AppTab
          v-for="tab in tabs"
          :key="tab.key"
          class="page-order-list__tab-pane"
          :name="tab.key"
          :title="tab.label"
        >
          <view class="page-order-list__content">
            <view class="page-order-list__content-inner">
              <AppList :finished="!loading" :loading="loading">
                <view
                  v-for="order in displayedOrders"
                  :key="order.id"
                  class="page-order-list__card"
                  @tap="goDetail(order.id)"
                >
                  <view class="page-order-list__card-top">
                    <view class="page-order-list__info">
                      <view class="page-order-list__title-row">
                        <text class="page-order-list__title">{{ order.projectName }}</text>
                        <text
                          class="page-order-list__status"
                          :class="`page-order-list__status--${getStatusTone(order.status)}`"
                        >{{ getStatusLabel(order.status) }}</text>
                      </view>
                      <text class="page-order-list__meta">委托编号：{{ order.orderNo }} · {{ order.institution }}</text>
                    </view>
                    <view class="page-order-list__amount-wrap">
                      <text class="page-order-list__amount">¥{{ order.amount.toLocaleString() }}</text>
                      <text class="page-order-list__date">{{ order.createdAt }}</text>
                    </view>
                  </view>

                  <view class="page-order-list__progress-track">
                    <view
                      class="page-order-list__progress-bar"
                      :class="`page-order-list__progress-bar--${getStatusTone(order.status)}`"
                      :style="{ width: `${getStatusProgress(order.status)}%` }"
                    ></view>
                  </view>

                  <text class="page-order-list__progress-text">当前进度：{{ order.progressText }}</text>

                  <view class="page-order-list__actions">
                    <AppButton
                      block
                      plain
                      preset="action"
                      text="查看详情"
                      type="default"
                      @click.stop="goDetail(order.id)"
                    />
                    <AppButton
                      v-if="order.status === 'pending_quote'"
                      block
                      preset="action"
                      text="查看报价"
                      type="info"
                      @click.stop="goDetail(order.id)"
                    />
                    <AppButton
                      v-else-if="order.status === 'pending_payment'"
                      block
                      preset="action"
                      text="立即支付"
                      type="info"
                      @click.stop="showComingSoon('支付能力建设中')"
                    />
                    <AppButton
                      v-else-if="order.status === 'pending_sample'"
                      block
                      preset="action"
                      text="去寄样"
                      type="info"
                      @click.stop="goSampleManage(order.id)"
                    />
                    <AppButton
                      v-else-if="order.status === 'sample_received' || order.status === 'testing'"
                      block
                      preset="action"
                      text="查看样品"
                      type="info"
                      @click.stop="goSampleManage(order.id)"
                    />
                    <AppButton
                      v-else
                      block
                      preset="action"
                      text="查看报告"
                      type="info"
                      @click.stop="goReport(order.reportId)"
                    />
                  </view>
                </view>
              </AppList>
              <view class="page-order-list__bottom-spacer"></view>
            </view>
          </view>
        </AppTab>
      </AppTabs>
    </view>

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'
import {
  buildOrderStatusTabs,
  filterOrdersByTab,
  getStatusLabel,
  getStatusProgress,
  getStatusTone,
  type OrderTabKey,
} from '@/services/api/order'
import * as orderService from '@/services/api/order'
import { showAppToast } from '@/services/ui/toast'
import type { EntrustOrder } from '@/types/business'

const loading = ref(false)
const orders = ref<EntrustOrder[]>([])
const tabs = buildOrderStatusTabs()
const activeTab = ref<OrderTabKey>('all')
const searchKeyword = ref('')

const currentOrders = computed(() => filterOrdersByTab(orders.value, activeTab.value))
const displayedOrders = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return currentOrders.value
  }

  return currentOrders.value.filter((item) => {
    const text = `${item.orderNo} ${item.projectName} ${item.institution}`.toLowerCase()
    return text.includes(keyword)
  })
})

onMounted(() => {
  loadOrders()
})

async function loadOrders() {
  loading.value = true

  try {
    orders.value = await orderService.getList()
  } finally {
    loading.value = false
  }
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

function goSampleManage(orderId?: string) {
  if (!orderId) {
    uni.navigateTo({ url: '/pages/sample/manage' })
    return
  }

  uni.navigateTo({ url: `/pages/sample/manage?orderId=${orderId}` })
}

function goReport(reportId?: string) {
  if (!reportId) {
    showComingSoon('报告正在生成中')
    return
  }

  uni.navigateTo({ url: `/pages/report/detail?id=${reportId}` })
}

function showComingSoon(message: string) {
  showAppToast({ message, icon: 'none' })
}

function handleSearch() {}
</script>

<style scoped lang="scss">
.page-order-list {
  min-height: 100vh;
  background: #f8fafc;
}

.page-order-list__header {
  position: relative;
  top: 0;
  z-index: 30;
  padding: 24rpx 24rpx 14rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

/* #ifdef H5 */
.page-order-list__header {
  padding-top: calc(24rpx + env(safe-area-inset-top));
}
/* #endif */

.page-order-list__search-box {
  height: 72rpx;
  min-height: 72rpx;
  border-radius: 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
}

.page-order-list__search-icon {
  flex-shrink: 0;
  margin-right: 10rpx;
}

.page-order-list__search-input-wrap {
  flex: 1;
}

:deep(.page-order-list__search-input-wrap .van-field__control),
:deep(.page-order-list__search-input-wrap .app-field__control) {
  height: 72rpx;
  min-height: 72rpx;
  padding: 0;
  font-size: 24rpx;
  color: #0f172a;
}

:deep(.page-order-list__search-input-wrap .app-field) {
  border: none;
  background: transparent;
}

.page-order-list__tabs-wrap {
  padding-bottom: 24rpx;
}

.page-order-list__tabs-wrap :deep(.app-tabs) {
  display: block;
}

.page-order-list__tabs-wrap :deep(.app-tabs__nav) {
  gap: 12rpx;
  padding: 18rpx 24rpx 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: #ffffff;
}

.page-order-list__tabs-wrap :deep(.app-tabs__nav--scroll) {
  overflow-x: auto;
  white-space: nowrap;
}

.page-order-list__tabs-wrap :deep(.app-tabs__nav-item) {
  padding: 10rpx 24rpx;
  border-radius: 12rpx;
  color: #334155;
  background: #f1f5f9;
  border: 1rpx solid transparent;
  font-size: 22rpx;
}

.page-order-list__tabs-wrap :deep(.app-tabs__nav-item--active) {
  color: #ffffff;
  background: #2563eb;
}

.page-order-list__tabs-wrap :deep(.app-tabs__content) {
  min-height: 0;
}

.page-order-list__tabs-wrap :deep(.app-tab[hidden]) {
  display: none !important;
}

.page-order-list__content {
  box-sizing: border-box;
  padding-bottom: 56rpx;
}

.page-order-list__content-inner {
  padding: 16rpx 24rpx 0;
}

/* #ifdef H5 */
.page-order-list__content {
  padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}
/* #endif */

.page-order-list__bottom-spacer {
  height: 24rpx;
}

.page-order-list__card {
  margin-bottom: 16rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.page-order-list__card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.page-order-list__info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.page-order-list__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.page-order-list__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-order-list__status {
  @include status-chip(20rpx, 8rpx, 4rpx 14rpx);
}

.page-order-list__status--rose {
  background: #fff1f2;
  color: #be123c;
}

.page-order-list__status--amber,
.page-order-list__status--orange {
  background: #fffbeb;
  color: #b45309;
}

.page-order-list__status--cyan {
  background: #ecfeff;
  color: #0f766e;
}

.page-order-list__status--blue {
  background: #eff6ff;
  color: #1d4ed8;
}

.page-order-list__status--violet {
  background: #f5f3ff;
  color: #6d28d9;
}

.page-order-list__status--green {
  background: #ecfdf5;
  color: #047857;
}

.page-order-list__meta {
  display: block;
  font-size: 22rpx;
  color: #64748b;
}

.page-order-list__amount-wrap {
  flex-shrink: 0;
  text-align: right;
}

.page-order-list__amount {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #2563eb;
}

.page-order-list__date {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #94a3b8;
}

.page-order-list__progress-track {
  margin-bottom: 10rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #f1f5f9;
  height: 10rpx;
}

.page-order-list__progress-bar {
  height: 100%;
  border-radius: 999rpx;
  transition: width 0.3s;
}

.page-order-list__progress-bar--rose {
  background: #e11d48;
}

.page-order-list__progress-bar--amber,
.page-order-list__progress-bar--orange {
  background: #d97706;
}

.page-order-list__progress-bar--cyan {
  background: #0891b2;
}

.page-order-list__progress-bar--blue {
  background: #2563eb;
}

.page-order-list__progress-bar--violet {
  background: #7c3aed;
}

.page-order-list__progress-bar--green {
  background: #059669;
}

.page-order-list__progress-text {
  display: block;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-order-list__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.page-order-list__actions :deep(.app-button),
.page-order-list__actions :deep(.van-button) {
  width: 100%;
}
</style>
