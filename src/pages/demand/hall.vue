<template>
  <view class="page-demand-hall">
    <scroll-view class="page-demand-hall__scroll" lower-threshold="120" scroll-y @scrolltolower="handleScrollToLower">
      <view class="page-demand-hall__content">
        <view class="hall-toolbar">
          <view class="page-demand-hall__search-wrap">
            <AppSearchBarWithButton
              v-model="keyword"
              button-text="搜索"
              placeholder="搜索需求标题/地区"
              @confirm="handleSearch"
              @search="handleSearch"
            />
          </view>

          <view class="hall-filters">
            <view class="hall-filter-bar">
              <view
                class="hall-filter-item"
                :class="{
                  'hall-filter-item--active': activeStatus !== 'all',
                  'hall-filter-item--open': showStatusSheet,
                }"
                @tap="openStatusSheet"
              >
                <text class="hall-filter-text">{{ activeStatusLabel }}</text>
                <view class="hall-filter-arrow" :class="{ 'hall-filter-arrow--open': showStatusSheet }" />
              </view>
            </view>
          </view>
        </view>

        <view class="hall-stats">
          <view class="hall-stat-card">
            <text class="hall-stat-card__label">总需求</text>
            <text class="hall-stat-card__value">{{ stats.total }}</text>
          </view>
          <view class="hall-stat-card">
            <text class="hall-stat-card__label">待报价</text>
            <text class="hall-stat-card__value hall-stat-card__value--primary">{{ stats.pendingQuote }}</text>
          </view>
          <view class="hall-stat-card">
            <text class="hall-stat-card__label">报价中</text>
            <text class="hall-stat-card__value hall-stat-card__value--accent">{{ stats.quoting }}</text>
          </view>
        </view>

        <view v-if="loading" class="hall-loading">
          <view class="hall-loading__card">
            <view class="skeleton skeleton--lg" />
            <view class="skeleton skeleton--sm" />
            <view class="skeleton skeleton--sm" />
          </view>
          <view class="hall-loading__card">
            <view class="skeleton skeleton--lg" />
            <view class="skeleton skeleton--sm" />
            <view class="skeleton skeleton--sm" />
          </view>
        </view>

        <view v-else-if="filteredList.length === 0" class="hall-empty">
          <text class="hall-empty__title">暂无符合条件的需求</text>
          <text class="hall-empty__desc">你可以切换筛选条件或刷新列表</text>
          <AppButton
            custom-style="height: 72rpx; border-radius: 16rpx; background: #0369a1; color: #ffffff;"
            text="刷新列表"
            @click="reload"
          />
        </view>

        <view v-else class="hall-list">
          <view
            v-for="item in filteredList"
            :key="item.id"
            class="hall-card"
            :class="`hall-card--${getStatusTone(item.statusCode)}`"
            @tap="goDemandDetail(item.id)"
          >
            <view class="hall-card__head">
              <text class="hall-card__title">{{ item.title }}</text>
              <text class="hall-card__budget">{{ item.budgetText }}</text>
            </view>

            <view class="hall-card__meta-row">
              <view class="hall-card__meta-item">
                <AppIcon color="#64748b" name="location" size="14" />
                <text>{{ item.region }}</text>
              </view>
              <view class="hall-card__meta-item">
                <AppIcon color="#64748b" name="time" size="14" />
                <text>{{ item.publishText }}</text>
              </view>
            </view>

            <view class="hall-card__tags">
              <view class="hall-card__status-pill">
                <view :class="['hall-card__status-dot', `hall-card__status-dot--${getStatusTone(item.statusCode)}`]" />
                <text class="hall-card__status-text">{{ resolveStatusText(item.statusCode) }}</text>
              </view>
            </view>
          </view>

          <view class="hall-pagination">
            <text v-if="loadingMore" class="hall-pagination__text">正在加载更多...</text>
            <text v-else-if="hasMore" class="hall-pagination__text">上拉加载更多</text>
            <text v-else class="hall-pagination__text">没有更多需求了</text>
          </view>
        </view>

        <view class="page-demand-hall__bottom-spacer" />
      </view>
    </scroll-view>

    <AppActionSheet
      cancel-text="取消"
      :actions="statusSheetActions"
      :show="showStatusSheet"
      title="需求状态"
      @cancel="closeStatusSheet"
      @close="closeStatusSheet"
      @select="handleStatusSheetSelect"
      @update:show="handleStatusSheetVisibility"
    />

    <view class="page-demand-hall__fab" @tap="goPublishDemand">
      <AppIcon color="#ffffff" name="plus" size="24" />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppActionSheet, { type AppAction } from '@/components/ui/AppActionSheet/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppSearchBarWithButton from '@/components/ui/AppSearchBarWithButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { getDemandHall } from '@/services/api/tradeDemand'
import { showFailToast } from '@/services/ui/toast'

type AnyRecord = Record<string, any>
type HallStatus = 'all' | 'pendingQuote' | 'quoting' | 'closed'

interface HallDemandCard {
  budgetText: string
  id: string
  publishText: string
  region: string
  statusCode: number
  title: string
}

const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const total = ref(0)
const demandList = ref<HallDemandCard[]>([])
const category = ref('')
const keyword = ref('')
const appliedKeyword = ref('')
const activeStatus = ref<HallStatus>('all')
const showStatusSheet = ref(false)
const pageSize = 20

const statusOptions: Array<{ key: HallStatus; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pendingQuote', label: '待报价' },
  { key: 'quoting', label: '报价中' },
  { key: 'closed', label: '已关闭' },
]

const activeStatusLabel = computed(() => statusOptions.find((item) => item.key === activeStatus.value)?.label || '全部')
const statusSheetActions = computed<AppAction[]>(() => statusOptions.map((item) => ({ name: item.label })))

const stats = computed(() => ({
  pendingQuote: demandList.value.filter((item) => item.statusCode === 0).length,
  quoting: demandList.value.filter((item) => item.statusCode === 1).length,
  total: demandList.value.length,
}))

const filteredList = computed(() => {
  const text = appliedKeyword.value.trim().toLowerCase()

  return demandList.value.filter((item) => {
    const statusMatched = activeStatus.value === 'all'
      || (activeStatus.value === 'pendingQuote' && item.statusCode === 0)
      || (activeStatus.value === 'quoting' && item.statusCode === 1)
      || (activeStatus.value === 'closed' && item.statusCode === 5)

    if (!statusMatched) {
      return false
    }

    if (!text) {
      return true
    }

    return item.title.toLowerCase().includes(text) || item.region.toLowerCase().includes(text)
  })
})

function isObject(value: unknown): value is AnyRecord {
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

  return 0
}

function pickDateText(value: unknown) {
  const text = toText(value)
  if (!text) {
    return '最新发布'
  }

  const matched = text.match(/\d{4}-\d{2}-\d{2}/)
  if (matched) {
    return matched[0]
  }

  return text
}

function resolveStatusCode(status: unknown) {
  return toNumber(status)
}

function resolveStatusText(status: unknown) {
  const normalized = resolveStatusCode(status)

  if (normalized === 0) {
    return '待报价'
  }

  if (normalized === 1) {
    return '报价中'
  }

  if (normalized === 2) {
    return '已成交'
  }

  if (normalized === 3) {
    return '检测中'
  }

  if (normalized === 4) {
    return '已完成'
  }

  if (normalized === 5) {
    return '已关闭'
  }

  return '进行中'
}

function getStatusTone(statusCode: number) {
  if (statusCode === 0) {
    return 'blue'
  }

  if (statusCode === 1) {
    return 'amber'
  }

  if (statusCode === 2) {
    return 'green'
  }

  if (statusCode === 5 || statusCode === 4) {
    return 'slate'
  }

  return 'green'
}

function resolveDemandId(item: AnyRecord, index: number) {
  return toText(item.id || item.demandId || item.data?.id || item.data?.demandId || item.result?.id || item.result?.demandId)
    || `demand-${index + 1}`
}

function resolveDemandRecords(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is AnyRecord => isObject(item))
  }

  if (!isObject(raw)) {
    return []
  }

  const candidates = [
    raw.records,
    raw.list,
    raw.items,
    raw.data?.records,
    raw.data?.list,
    raw.result?.records,
    raw.result?.list,
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is AnyRecord => isObject(item))
    }
  }

  return []
}

function resolveTotal(raw: unknown) {
  if (!isObject(raw)) {
    return 0
  }

  return toNumber(raw.total || raw.data?.total || raw.result?.total)
}

function mergeDemandCards(current: HallDemandCard[], incoming: HallDemandCard[]) {
  const merged = [...current]
  const exists = new Set(current.map((item) => item.id))

  for (const item of incoming) {
    if (exists.has(item.id)) {
      continue
    }

    merged.push(item)
    exists.add(item.id)
  }

  return merged
}

async function loadHall(reset = false) {
  if (loading.value || loadingMore.value) {
    return
  }

  if (!reset && !hasMore.value) {
    return
  }

  const nextPage = reset ? 1 : page.value + 1
  if (reset) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const hallData = await getDemandHall({
      category: category.value || undefined,
      page: nextPage,
      size: pageSize,
    })
    const records = resolveDemandRecords(hallData)
    const cards = records.map((item, index) => {
      const budget = toNumber(item.budgetAmount || item.budgetMax || item.budget)
      const statusCode = resolveStatusCode(item.status)

      return {
        budgetText: budget > 0 ? `¥${budget.toLocaleString()}` : '面议',
        id: resolveDemandId(item, index),
        publishText: pickDateText(item.publishTime || item.createdAt || item.createTime),
        region: toText(item.region || item.city || item.contactAddress) || '全国',
        statusCode,
        title: toText(item.title || item.sampleName || item.demandTitle) || `检测需求 #${index + 1}`,
      }
    })
    total.value = resolveTotal(hallData)

    if (reset) {
      demandList.value = cards
    } else {
      demandList.value = mergeDemandCards(demandList.value, cards)
    }

    page.value = nextPage
    const reachedByTotal = total.value > 0 && demandList.value.length >= total.value
    hasMore.value = cards.length >= pageSize && !reachedByTotal
  } catch (error) {
    showFailToast(getErrorMessage(error, '需求大厅加载失败'))
  } finally {
    if (reset) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

function goPublishDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/demand/publish' })
}

function goDemandDetail(id: string) {
  const normalized = id.trim()
  if (!normalized) {
    return
  }

  uni.navigateTo({ url: `/pages/demand/detail?id=${encodeURIComponent(normalized)}` })
}

function reload() {
  hasMore.value = true
  page.value = 0
  total.value = 0
  void loadHall(true)
}

function handleSearch(value?: string) {
  appliedKeyword.value = (value ?? keyword.value).trim()
}

function openStatusSheet() {
  showStatusSheet.value = true
}

function closeStatusSheet() {
  showStatusSheet.value = false
}

function handleStatusSheetVisibility(show: boolean) {
  showStatusSheet.value = show
}

function handleStatusSheetSelect(action: AppAction) {
  const target = statusOptions.find((item) => item.label === action.name)

  if (target) {
    activeStatus.value = target.key
  }

  closeStatusSheet()
}

function handleScrollToLower() {
  void loadHall(false)
}

onLoad((query) => {
  let nextCategory = ''
  if (typeof query?.category === 'string') {
    try {
      nextCategory = decodeURIComponent(query.category)
    } catch {
      nextCategory = query.category
    }
  }

  category.value = nextCategory
  appliedKeyword.value = keyword.value.trim()
  void loadHall(true)
})
</script>

<style scoped lang="scss">
.page-demand-hall {
  min-height: 100vh;
  background:
    radial-gradient(120rpx 120rpx at 88% 4%, rgba(3, 105, 161, 0.1), transparent 72%),
    linear-gradient(180deg, #f8fafc 0%, #f4f8ff 100%);
}

.page-demand-hall__scroll {
  height: 100vh;
}

.page-demand-hall__content {
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.hall-toolbar {
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid #e2e8f0;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.hall-stats {
  display: grid;
  gap: 12rpx;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.hall-stat-card {
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid #e2e8f0;
  padding: 16rpx;
}

.hall-stat-card__label {
  display: block;
  color: #64748b;
  font-size: 22rpx;
}

.hall-stat-card__value {
  display: block;
  margin-top: 6rpx;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.2;
}

.hall-stat-card__value--primary {
  color: #0369a1;
}

.hall-stat-card__value--accent {
  color: #0284c7;
}

.page-demand-hall__search-wrap {
  width: 100%;
}

.hall-filters {
  width: 100%;
}

.hall-filter-bar {
  display: flex;
  align-items: center;
  border-radius: 20rpx;
  border: 1rpx solid rgba(203, 213, 225, 0.62);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.86) 100%);
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.03);
  backdrop-filter: blur(10px);
}

.hall-filter-item {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 68rpx;
  padding: 0 8rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: #475569;
}

.hall-filter-item--active {
  color: #1e61ff;
}

.hall-filter-item--open {
  background: rgba(239, 246, 255, 0.6);
  color: #1e61ff;
}

.hall-filter-text {
  max-width: 82%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 22rpx;
  font-weight: 500;
}

.hall-filter-arrow {
  width: 0;
  height: 0;
  flex-shrink: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 7rpx solid #94a3b8;
  transform: translateY(2rpx);
  transition: transform 0.2s ease;
}

.hall-filter-arrow--open {
  border-top-color: #1e61ff;
  transform: translateY(2rpx) rotate(180deg);
}

.hall-filter-item::after {
  content: '';
  position: absolute;
  top: 17rpx;
  right: 0;
  width: 1rpx;
  height: 34rpx;
  background: rgba(226, 232, 240, 0.85);
}

.hall-filter-item:last-child::after {
  display: none;
}

.hall-filter-item:active {
  color: #1d4ed8;
}

.hall-loading {
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hall-loading__card {
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.skeleton {
  border-radius: 10rpx;
  background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 45%, #e2e8f0 65%);
  background-size: 320rpx 100%;
  animation: skeleton-flow 1.2s ease-in-out infinite;
}

.skeleton--lg {
  height: 42rpx;
}

.skeleton--md {
  height: 24rpx;
}

.skeleton--sm {
  height: 20rpx;
}

@keyframes skeleton-flow {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

.hall-empty {
  border-radius: 18rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hall-empty__title {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
}

.hall-empty__desc {
  color: #64748b;
  font-size: 24rpx;
}

.hall-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.hall-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
}

.hall-pagination__text {
  color: #64748b;
  font-size: 22rpx;
}

.hall-card {
  position: relative;
  overflow: hidden;
  border-radius: 20rpx;
  border: 1rpx solid #cfdeef;
  background: linear-gradient(165deg, #f8fbff 0%, #f1f6ff 100%);
  padding: 22rpx;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05), inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  touch-action: manipulation;
}

.hall-card:active {
  transform: translateY(1rpx);
  box-shadow: 0 12rpx 26rpx rgba(15, 23, 42, 0.08), inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.hall-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 6rpx;
  height: 100%;
  border-radius: 0;
  background: #cbd5e1;
}

.hall-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  pointer-events: none;
}

.hall-card--blue {
  background: linear-gradient(165deg, #f6faff 0%, #edf4ff 100%);
}

.hall-card--amber {
  background: linear-gradient(165deg, #fffaf2 0%, #fff5e7 100%);
}

.hall-card--slate {
  background: linear-gradient(165deg, #f8fafc 0%, #f1f5f9 100%);
}

.hall-card--green {
  background: linear-gradient(165deg, #f4fcf8 0%, #ebf9f2 100%);
}

.hall-card--blue::before {
  background: #60a5fa;
}

.hall-card--amber::before {
  background: #f59e0b;
}

.hall-card--slate::before {
  background: #94a3b8;
}

.hall-card--green::before {
  background: #34d399;
}

.hall-card__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.hall-card__title {
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.34;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hall-card__budget {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  color: #ff8a00;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1;
}

.hall-card__status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
}

.hall-card__status-dot--blue {
  background: #1E61FF;
}

.hall-card__status-dot--amber {
  background: #d97706;
}

.hall-card__status-dot--slate {
  background: #64748b;
}

.hall-card__status-dot--green {
  background: #059669;
}

.hall-card__status-text {
  color: #334155;
  font-size: 21rpx;
  line-height: 1;
}

.hall-card__meta-row {
  position: relative;
  z-index: 1;
  margin-top: 16rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(148, 163, 184, 0.28);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hall-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  color: #64748b;
  font-size: 21rpx;
  line-height: 1.35;
}

.hall-card__tags {
  position: relative;
  z-index: 1;
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12rpx;
}

.hall-card__status-pill {
  flex-shrink: 0;
  min-height: 44rpx;
  border-radius: 999rpx;
  padding: 0 14rpx 0 12rpx;
  background: rgba(255, 255, 255, 0.66);
  border: 1rpx solid rgba(148, 163, 184, 0.32);
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}

.page-demand-hall__fab {
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

.page-demand-hall__bottom-spacer {
  height: 120rpx;
}

@media (max-width: 360px) {
  .hall-stats {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
