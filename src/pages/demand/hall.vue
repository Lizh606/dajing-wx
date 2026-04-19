<template>
  <view class="page-demand-hall">
    <scroll-view class="page-demand-hall__scroll" lower-threshold="120" scroll-y @scrolltolower="handleScrollToLower">
      <view class="page-demand-hall__content">
        <view class="hall-hero">
          <view class="hall-hero__main">
            <text class="hall-hero__title">需求大厅</text>
            <text class="hall-hero__subtitle">{{ categoryLabel }}</text>
          </view>
          <view class="hall-hero__action" @tap="goPublishDemand">
            <AppIcon color="#0369a1" name="plus" size="18" />
          </view>
        </view>

        <view class="hall-stats">
          <view class="hall-stat-card">
            <text class="hall-stat-card__label">总需求</text>
            <text class="hall-stat-card__value">{{ stats.total }}</text>
          </view>
          <view class="hall-stat-card">
            <text class="hall-stat-card__label">发布中</text>
            <text class="hall-stat-card__value hall-stat-card__value--primary">{{ stats.publishing }}</text>
          </view>
          <view class="hall-stat-card">
            <text class="hall-stat-card__label">竞价中</text>
            <text class="hall-stat-card__value hall-stat-card__value--accent">{{ stats.bidding }}</text>
          </view>
        </view>

        <view class="hall-toolbar">
          <view class="page-demand-hall__search-box">
            <AppIcon class="page-demand-hall__search-icon" color="#94a3b8" name="search" size="18" />
            <AppField
              v-model="keyword"
              class="page-demand-hall__search-input-wrap"
              :border="false"
              custom-style="height: 72rpx; min-height: 72rpx; padding: 0; border: none; background: transparent;"
              placeholder="搜索需求标题/地区"
              @confirm="handleSearch"
            />
          </view>

          <view class="hall-filters">
            <view
              v-for="status in statusOptions"
              :key="status.key"
              :class="['hall-filter-chip', activeStatus === status.key ? 'hall-filter-chip--active' : '']"
              @tap="activeStatus = status.key"
            >
              <text class="hall-filter-chip__text">{{ status.label }}</text>
            </view>
          </view>
        </view>

        <view v-if="loading" class="hall-loading">
          <view class="skeleton skeleton--lg" />
          <view class="skeleton skeleton--md" />
          <view class="skeleton skeleton--md" />
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
          <view v-for="item in filteredList" :key="item.id" class="hall-card" @tap="goDemandDetail(item.id)">
            <view class="hall-card__head">
              <text class="hall-card__title">{{ item.title }}</text>
              <view class="hall-card__status">
                <text class="hall-card__status-text">{{ item.statusText }}</text>
              </view>
            </view>

            <view class="hall-card__meta-row">
              <view class="hall-card__meta-item">
                <AppIcon color="#64748b" name="location" size="14" />
                <text>{{ item.region }}</text>
              </view>
              <view class="hall-card__meta-item">
                <AppIcon color="#64748b" name="analysis" size="14" />
                <text>预算 {{ item.budgetText }}</text>
              </view>
            </view>

            <view class="hall-card__meta-row">
              <text class="hall-card__minor">{{ item.publishText }}</text>
              <text class="hall-card__minor">{{ item.bidText }}</text>
            </view>

            <view class="hall-card__footer">
              <text class="hall-card__view">查看详情</text>
              <AppIcon color="#0369a1" name="arrow" size="14" />
            </view>
          </view>

          <view class="hall-pagination">
            <text v-if="loadingMore" class="hall-pagination__text">正在加载更多...</text>
            <text v-else-if="hasMore" class="hall-pagination__text">上拉加载更多</text>
            <text v-else class="hall-pagination__text">没有更多需求了</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppField from '@/components/ui/AppField/index.vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { getDemandHall } from '@/services/api/tradeDemand'
import { showFailToast } from '@/services/ui/toast'

type AnyRecord = Record<string, any>
type HallStatus = 'all' | 'publishing' | 'bidding' | 'closed'

interface HallDemandCard {
  bidText: string
  budgetText: string
  id: string
  publishText: string
  region: string
  statusCode: number
  statusText: string
  title: string
}

const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const total = ref(0)
const demandList = ref<HallDemandCard[]>([])
const category = ref('')
const categoryLabel = ref('开放需求，按发布时间排序')
const keyword = ref('')
const activeStatus = ref<HallStatus>('all')
const pageSize = 20

const statusOptions: Array<{ key: HallStatus; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'publishing', label: '发布中' },
  { key: 'bidding', label: '竞价中' },
  { key: 'closed', label: '已关闭' },
]

const stats = computed(() => ({
  bidding: demandList.value.filter((item) => item.statusCode === 2).length,
  publishing: demandList.value.filter((item) => item.statusCode === 1).length,
  total: demandList.value.length,
}))

const filteredList = computed(() => {
  const text = keyword.value.trim().toLowerCase()

  return demandList.value.filter((item) => {
    const statusMatched = activeStatus.value === 'all'
      || (activeStatus.value === 'publishing' && item.statusCode === 1)
      || (activeStatus.value === 'bidding' && item.statusCode === 2)
      || (activeStatus.value === 'closed' && item.statusCode === 4)

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
    return '草稿'
  }

  if (normalized === 1) {
    return '发布中'
  }

  if (normalized === 2) {
    return '竞价中'
  }

  if (normalized === 3) {
    return '已成交'
  }

  if (normalized === 4) {
    return '已关闭'
  }

  return '进行中'
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
      const bidCount = toNumber(item.bidCount || item.bidsCount || item.responseCount || item.quoteCount)
      const statusCode = resolveStatusCode(item.status)

      return {
        bidText: `${bidCount} 家机构响应`,
        budgetText: budget > 0 ? `¥${budget.toLocaleString()}` : '面议',
        id: resolveDemandId(item, index),
        publishText: pickDateText(item.publishTime || item.createdAt || item.createTime),
        region: toText(item.region || item.city || item.contactAddress) || '全国',
        statusCode,
        statusText: toText(item.statusText || item.statusName) || resolveStatusText(item.status),
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

function handleSearch() {}

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
  categoryLabel.value = nextCategory ? `当前分类：${nextCategory}` : '开放需求，按发布时间排序'
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

.hall-hero {
  border-radius: 22rpx;
  padding: 22rpx;
  background: linear-gradient(135deg, #ffffff 0%, #eef6ff 100%);
  border: 1rpx solid #dbeafe;
  box-shadow: 0 14rpx 30rpx rgba(15, 23, 42, 0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.hall-hero__main {
  min-width: 0;
}

.hall-hero__title {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  line-height: 1.3;
  font-weight: 700;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.hall-hero__subtitle {
  display: block;
  margin-top: 8rpx;
  color: #334155;
  font-size: 24rpx;
  line-height: 1.45;
}

.hall-hero__action {
  width: 72rpx;
  height: 72rpx;
  min-width: 72rpx;
  min-height: 72rpx;
  border-radius: 20rpx;
  background: #f0f7ff;
  border: 1rpx solid #bfdbfe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  touch-action: manipulation;
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

.hall-toolbar {
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid #e2e8f0;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.page-demand-hall__search-box {
  height: 72rpx;
  min-height: 72rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
}

.page-demand-hall__search-icon {
  flex-shrink: 0;
  margin-right: 10rpx;
}

.page-demand-hall__search-input-wrap {
  flex: 1;
}

:deep(.page-demand-hall__search-input-wrap .van-field__control),
:deep(.page-demand-hall__search-input-wrap .app-field__control) {
  height: 72rpx;
  min-height: 72rpx;
  padding: 0;
  font-size: 24rpx;
  color: #0f172a;
}

:deep(.page-demand-hall__search-input-wrap .app-field) {
  border: none;
  background: transparent;
}

.hall-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.hall-filter-chip {
  min-height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid #cbd5e1;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

.hall-filter-chip--active {
  background: #0369a1;
  border-color: #0369a1;
}

.hall-filter-chip__text {
  color: #334155;
  font-size: 22rpx;
  line-height: 1;
}

.hall-filter-chip--active .hall-filter-chip__text {
  color: #ffffff;
}

.hall-loading {
  border-radius: 18rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.skeleton {
  border-radius: 10rpx;
  background: linear-gradient(90deg, #e2e8f0 20%, #f1f5f9 40%, #e2e8f0 60%);
  background-size: 320rpx 100%;
  animation: skeleton-flow 1.2s ease-in-out infinite;
}

.skeleton--lg {
  height: 42rpx;
}

.skeleton--md {
  height: 24rpx;
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
  gap: 12rpx;
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
  border-radius: 18rpx;
  background: #ffffff;
  border: 1rpx solid #dbe4ef;
  padding: 20rpx;
  box-shadow: 0 10rpx 20rpx rgba(15, 23, 42, 0.05);
  touch-action: manipulation;
}

.hall-card__head {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.hall-card__title {
  flex: 1;
  min-width: 0;
  color: #0f172a;
  font-size: 29rpx;
  line-height: 1.45;
  font-weight: 700;
}

.hall-card__status {
  flex-shrink: 0;
  min-height: 40rpx;
  border-radius: 999rpx;
  padding: 0 12rpx;
  background: #ecfeff;
  border: 1rpx solid #bae6fd;
  display: inline-flex;
  align-items: center;
}

.hall-card__status-text {
  color: #0369a1;
  font-size: 20rpx;
}

.hall-card__meta-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.hall-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  color: #475569;
  font-size: 23rpx;
  line-height: 1.3;
}

.hall-card__minor {
  color: #64748b;
  font-size: 22rpx;
}

.hall-card__footer {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6rpx;
}

.hall-card__view {
  color: #0369a1;
  font-size: 22rpx;
  font-weight: 600;
}

@media (max-width: 360px) {
  .hall-stats {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
