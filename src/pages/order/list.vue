<template>
  <view class="page-order-list">
    <view class="page-order-list__header">
      <AppSearchBarWithButton
        v-model="searchKeyword"
        class="page-order-list__search"
        placeholder="搜索委托编号、项目名称、机构名称"
        @confirm="handleSearch"
        @search="handleSearch"
      />

      <view class="page-order-list__filter-bar">
        <view
          class="page-order-list__filter-item"
          :class="{
            'page-order-list__filter-item--active': activeTab !== 'all',
            'page-order-list__filter-item--open': activeFilterSheet === 'status',
          }"
          @tap="openFilterSheet('status')"
        >
          <text class="page-order-list__filter-text">{{ statusFilterLabel }}</text>
          <view
            class="page-order-list__filter-arrow"
            :class="{ 'page-order-list__filter-arrow--open': activeFilterSheet === 'status' }"
          />
        </view>
        <view
          class="page-order-list__filter-item"
          :class="{
            'page-order-list__filter-item--active': orderSortKey !== 'latest',
            'page-order-list__filter-item--open': activeFilterSheet === 'sort',
          }"
          @tap="openFilterSheet('sort')"
        >
          <text class="page-order-list__filter-text">{{ sortFilterLabel }}</text>
          <view
            class="page-order-list__filter-arrow"
            :class="{ 'page-order-list__filter-arrow--open': activeFilterSheet === 'sort' }"
          />
        </view>
        <view
          class="page-order-list__filter-item"
          :class="{
            'page-order-list__filter-item--active': orderAmountFilter !== '全部金额',
            'page-order-list__filter-item--open': activeFilterSheet === 'amount',
          }"
          @tap="openFilterSheet('amount')"
        >
          <text class="page-order-list__filter-text">{{ orderAmountFilter }}</text>
          <view
            class="page-order-list__filter-arrow"
            :class="{ 'page-order-list__filter-arrow--open': activeFilterSheet === 'amount' }"
          />
        </view>
        <view
          class="page-order-list__filter-item"
          :class="{
            'page-order-list__filter-item--active': orderTimeFilter !== '全部时间',
            'page-order-list__filter-item--open': activeFilterSheet === 'time',
          }"
          @tap="openFilterSheet('time')"
        >
          <text class="page-order-list__filter-text">{{ orderTimeFilter }}</text>
          <view
            class="page-order-list__filter-arrow"
            :class="{ 'page-order-list__filter-arrow--open': activeFilterSheet === 'time' }"
          />
        </view>
      </view>
    </view>

    <view class="page-order-list__content">
      <view class="page-order-list__content-inner">
        <AppList :finished="!loading" :finished-text="orderFinishedText" :loading="loading">
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
          </view>
        </AppList>
        <view class="page-order-list__bottom-spacer"></view>
      </view>
    </view>

    <AppActionSheet
      cancel-text="取消"
      :actions="currentSheetActions"
      :show="showFilterSheet"
      :title="currentSheetTitle"
      :z-index="1300"
      @cancel="closeFilterSheet"
      @close="closeFilterSheet"
      @select="handleFilterSheetSelect"
      @update:show="handleFilterSheetVisibility"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppActionSheet, { type AppAction } from '@/components/ui/AppActionSheet/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchBarWithButton from '@/components/ui/AppSearchBarWithButton/index.vue'
import {
  buildOrderStatusTabs,
  filterOrdersByTab,
  getStatusLabel,
  getStatusProgress,
  getStatusTone,
  type OrderTabKey,
} from '@/services/api/order'
import * as orderService from '@/services/api/order'
import type { EntrustOrder } from '@/types/business'

type FilterSheetKey = 'status' | 'sort' | 'amount' | 'time' | ''
type OrderSortKey = 'latest' | 'amountDesc' | 'amountAsc'
type OrderAmountFilter = '全部金额' | '1千以下' | '1千-5千' | '5千以上'
type OrderTimeFilter = '全部时间' | '近7天' | '近30天' | '近90天'

const loading = ref(false)
const orders = ref<EntrustOrder[]>([])
const tabs = buildOrderStatusTabs()
const activeTab = ref<OrderTabKey>('all')
const searchKeyword = ref('')
const activeFilterSheet = ref<FilterSheetKey>('')
const orderSortKey = ref<OrderSortKey>('latest')
const orderAmountFilter = ref<OrderAmountFilter>('全部金额')
const orderTimeFilter = ref<OrderTimeFilter>('全部时间')

const sortOptions: Array<{ key: OrderSortKey, label: string }> = [
  { key: 'latest', label: '最新创建' },
  { key: 'amountDesc', label: '金额从高到低' },
  { key: 'amountAsc', label: '金额从低到高' },
]
const amountOptions: OrderAmountFilter[] = ['全部金额', '1千以下', '1千-5千', '5千以上']
const timeOptions: OrderTimeFilter[] = ['全部时间', '近7天', '近30天', '近90天']

const currentOrders = computed(() => filterOrdersByTab(orders.value, activeTab.value))
const showFilterSheet = computed(() => activeFilterSheet.value !== '')
const statusFilterLabel = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || '全部')
const sortFilterLabel = computed(() => sortOptions.find((item) => item.key === orderSortKey.value)?.label || '最新创建')
const orderFinishedText = computed(() => (displayedOrders.value.length > 0 ? '没有更多订单了' : '暂无订单数据'))
const currentSheetTitle = computed(() => {
  if (activeFilterSheet.value === 'status') {
    return '选择状态'
  }

  if (activeFilterSheet.value === 'sort') {
    return '选择排序'
  }

  if (activeFilterSheet.value === 'amount') {
    return '选择金额区间'
  }

  if (activeFilterSheet.value === 'time') {
    return '选择时间范围'
  }

  return ''
})
const currentSheetActions = computed<AppAction[]>(() => {
  if (activeFilterSheet.value === 'status') {
    return tabs.map((tab) => ({ name: tab.label }))
  }

  if (activeFilterSheet.value === 'sort') {
    return sortOptions.map((item) => ({ name: item.label }))
  }

  if (activeFilterSheet.value === 'amount') {
    return amountOptions.map((item) => ({ name: item }))
  }

  if (activeFilterSheet.value === 'time') {
    return timeOptions.map((item) => ({ name: item }))
  }

  return []
})

const displayedOrders = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const filtered = currentOrders.value.filter((item) => {
    if (!matchesOrderAmount(item.amount)) {
      return false
    }

    if (!matchesOrderTime(item.createdAt)) {
      return false
    }

    if (!keyword) {
      return true
    }

    const text = `${item.orderNo} ${item.projectName} ${item.institution}`.toLowerCase()
    return text.includes(keyword)
  })

  const sorted = [...filtered]
  if (orderSortKey.value === 'amountDesc') {
    return sorted.sort((a, b) => b.amount - a.amount)
  }

  if (orderSortKey.value === 'amountAsc') {
    return sorted.sort((a, b) => a.amount - b.amount)
  }

  return sorted.sort((a, b) => parseCreatedAtTimestamp(b.createdAt) - parseCreatedAtTimestamp(a.createdAt))
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

function parseCreatedAtTimestamp(createdAt: string) {
  const text = createdAt.trim()
  if (!text) {
    return 0
  }

  const normalized = text.replace(/\./g, '-').replace(/\//g, '-')
  const timestamp = Date.parse(normalized.length === 10 ? `${normalized}T00:00:00` : normalized)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function matchesOrderAmount(amount: number) {
  if (orderAmountFilter.value === '全部金额') {
    return true
  }

  if (orderAmountFilter.value === '1千以下') {
    return amount < 1000
  }

  if (orderAmountFilter.value === '1千-5千') {
    return amount >= 1000 && amount <= 5000
  }

  return amount > 5000
}

function matchesOrderTime(createdAt: string) {
  if (orderTimeFilter.value === '全部时间') {
    return true
  }

  const timestamp = parseCreatedAtTimestamp(createdAt)
  if (!timestamp) {
    return false
  }

  const daysMap: Record<Exclude<OrderTimeFilter, '全部时间'>, number> = {
    近7天: 7,
    近30天: 30,
    近90天: 90,
  }
  const days = daysMap[orderTimeFilter.value as Exclude<OrderTimeFilter, '全部时间'>]
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000
}

function openFilterSheet(sheet: Exclude<FilterSheetKey, ''>) {
  activeFilterSheet.value = sheet
}

function closeFilterSheet() {
  activeFilterSheet.value = ''
}

function handleFilterSheetVisibility(show: boolean) {
  if (!show) {
    closeFilterSheet()
  }
}

function handleFilterSheetSelect(action: AppAction) {
  if (activeFilterSheet.value === 'status') {
    const target = tabs.find((tab) => tab.label === action.name)
    if (target) {
      activeTab.value = target.key
    }
    closeFilterSheet()
    return
  }

  if (activeFilterSheet.value === 'sort') {
    const target = sortOptions.find((option) => option.label === action.name)
    if (target) {
      orderSortKey.value = target.key
    }
    closeFilterSheet()
    return
  }

  if (activeFilterSheet.value === 'amount') {
    if (amountOptions.includes(action.name as OrderAmountFilter)) {
      orderAmountFilter.value = action.name as OrderAmountFilter
    }
    closeFilterSheet()
    return
  }

  if (activeFilterSheet.value === 'time') {
    if (timeOptions.includes(action.name as OrderTimeFilter)) {
      orderTimeFilter.value = action.name as OrderTimeFilter
    }
    closeFilterSheet()
  }
}

function handleSearch(keyword?: string) {
  if (typeof keyword === 'string') {
    searchKeyword.value = keyword.trim()
  }
}
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
  padding: 24rpx 24rpx 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(8px);
}

.page-order-list__search :deep(.app-search-bar-with-button__field) {
  border-color: #dbe8ff;
  background: rgba(255, 255, 255, 0.95);
}

.page-order-list__search :deep(.app-search-bar-with-button__button) {
  background: linear-gradient(130deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8rpx 18rpx rgba(30, 97, 255, 0.22);
}

.page-order-list__filter-bar {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  border-radius: 20rpx;
  border: 1rpx solid rgba(203, 213, 225, 0.62);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.86) 100%);
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.03);
  backdrop-filter: blur(10px);
}

.page-order-list__filter-item {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 68rpx;
  padding: 0 8rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  color: #475569;
}

.page-order-list__filter-item::after {
  content: '';
  position: absolute;
  top: 17rpx;
  right: 0;
  width: 1rpx;
  height: 34rpx;
  background: rgba(226, 232, 240, 0.85);
}

.page-order-list__filter-item:last-child::after {
  display: none;
}

.page-order-list__filter-item--active {
  color: #1e61ff;
}

.page-order-list__filter-item--open {
  color: #1e61ff;
  background: rgba(239, 246, 255, 0.6);
}

.page-order-list__filter-text {
  max-width: 80%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 22rpx;
  font-weight: 500;
}

.page-order-list__filter-arrow {
  width: 0;
  height: 0;
  flex-shrink: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 7rpx solid #94a3b8;
  transform: translateY(2rpx);
  transition: transform 0.2s ease;
}

.page-order-list__filter-arrow--open {
  border-top-color: #1e61ff;
  transform: translateY(2rpx) rotate(180deg);
}

.page-order-list__content {
  box-sizing: border-box;
  padding-bottom: 56rpx;
}

.page-order-list__content-inner {
  padding: 16rpx 24rpx 0;
}

.page-order-list__bottom-spacer {
  height: 24rpx;
}

.page-order-list__card {
  margin-bottom: 16rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 24rpx;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
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
  color: #1E61FF;
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
  background: #1E61FF;
}

.page-order-list__progress-bar--violet {
  background: #7c3aed;
}

.page-order-list__progress-bar--green {
  background: #059669;
}

.page-order-list__progress-text {
  display: block;
  margin-bottom: 0;
  font-size: 22rpx;
  color: #64748b;
}
</style>
