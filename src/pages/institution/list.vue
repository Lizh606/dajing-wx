<template>
  <view class="page-institution-list">
    <view class="page-institution-list__header">
      <AppSearchBarWithButton
        v-model="searchKeyword"
        class="page-institution-list__search"
        placeholder="搜索服务项目、机构名称、服务类型"
        @confirm="handleSearchSubmit"
        @search="handleSearchSubmit"
      />

      <view class="page-institution-list__main-tabs">
        <view
          class="page-institution-list__main-tab"
          :class="{ 'page-institution-list__main-tab--active': activeChannel === 'service' }"
          @tap="activeChannel = 'service'"
        >服务</view>
        <view
          class="page-institution-list__main-tab"
          :class="{ 'page-institution-list__main-tab--active': activeChannel === 'institution' }"
          @tap="activeChannel = 'institution'"
        >机构</view>
      </view>

      <view class="page-institution-list__filter-bar">
        <view
          class="page-institution-list__filter-item"
          :class="{
            'page-institution-list__filter-item--active': selectedRegion !== '全部地区',
            'page-institution-list__filter-item--open': activeFilterSheet === 'region',
          }"
          @tap="openFilterSheet('region')"
        >
          <text class="page-institution-list__filter-text">{{ selectedRegion }}</text>
          <view
            class="page-institution-list__filter-arrow"
            :class="{ 'page-institution-list__filter-arrow--open': activeFilterSheet === 'region' }"
          />
        </view>
        <view
          class="page-institution-list__filter-item"
          :class="{
            'page-institution-list__filter-item--active': isSortApplied,
            'page-institution-list__filter-item--open': activeFilterSheet === 'sort',
          }"
          @tap="openFilterSheet('sort')"
        >
          <text class="page-institution-list__filter-text">{{ sortLabel }}</text>
          <view
            class="page-institution-list__filter-arrow"
            :class="{ 'page-institution-list__filter-arrow--open': activeFilterSheet === 'sort' }"
          />
        </view>
        <view
          class="page-institution-list__filter-item"
          :class="{
            'page-institution-list__filter-item--active': salesMode === 'salesDesc',
            'page-institution-list__filter-item--open': activeFilterSheet === 'sales',
          }"
          @tap="openFilterSheet('sales')"
        >
          <text class="page-institution-list__filter-text">{{ salesLabel }}</text>
          <view
            class="page-institution-list__filter-arrow"
            :class="{ 'page-institution-list__filter-arrow--open': activeFilterSheet === 'sales' }"
          />
        </view>
        <view
          class="page-institution-list__filter-item"
          :class="{
            'page-institution-list__filter-item--active': hasAdvancedFilter,
            'page-institution-list__filter-item--open': showAdvancedFilterPopup,
          }"
          @tap="openAdvancedFilterPopup"
        >
          <text class="page-institution-list__filter-text">筛选</text>
          <view
            class="page-institution-list__filter-arrow"
            :class="{ 'page-institution-list__filter-arrow--open': showAdvancedFilterPopup }"
          />
        </view>
      </view>
    </view>

    <view class="page-institution-list__content">
      <scroll-view v-if="activeChannel === 'service'" class="page-institution-list__scroll" scroll-y>
        <AppList :finished="!isServiceLoading" :finished-text="serviceFinishedText" :loading="isServiceLoading">
          <view class="card-grid">
            <ServiceCard
              v-for="item in filteredServices"
              :key="item.id"
              :cover-url="item.coverUrl"
              fallback-text="服务实景"
              :force-fallback="isServiceImageBroken(item.id)"
              :lazy-load="true"
              :price-text="formatServicePrice(item.price)"
              :right-text="`已售 ${formatServiceOrderCount(item.orderCount)}`"
              :title="item.serviceName"
              :type-text="item.category || item.serviceType"
              @click="goServiceDetail(item)"
              @image-error="markServiceImageBroken(item.id)"
            >
            </ServiceCard>
          </view>
        </AppList>
      </scroll-view>

      <scroll-view v-else class="page-institution-list__scroll" scroll-y>
        <AppList :finished="!isLoading" :finished-text="institutionFinishedText" :loading="isLoading">
          <view
            v-for="inst in filteredInstitutions"
            :key="inst.id"
            class="institution-card"
            @tap="goDetail(inst.id)"
          >
            <view class="institution-card__head">
              <view class="institution-card__avatar">
                <AppIcon color="#1E61FF" name="institution" size="22" />
              </view>
              <view class="institution-card__main">
                <text class="institution-card__name">{{ inst.name }}</text>
                <text
                  v-if="inst.shortName && inst.shortName !== inst.name"
                  class="institution-card__short-name"
                >{{ inst.shortName }}</text>
                <view class="institution-card__certs">
                  <text v-for="cert in inst.certs" :key="cert" class="institution-card__cert">{{ cert }}</text>
                </view>
                <view class="institution-card__meta">
                  <AppIcon color="#64748b" name="location" size="14" />
                  <text class="institution-card__location">{{ inst.location }}</text>
                </view>
              </view>
              <view class="institution-card__score">
                <text class="institution-card__score-value">{{ inst.score }}</text>
                <text class="institution-card__score-label">评分</text>
              </view>
            </view>

            <view class="institution-card__stats">
              <view class="institution-card__stat">
                <text class="institution-card__stat-value">{{ formatServiceCount(inst.serviceCount) }}</text>
                <text class="institution-card__stat-label">服务项目</text>
              </view>
              <view class="institution-card__stat">
                <text class="institution-card__stat-value">{{ inst.orderCount }}</text>
                <text class="institution-card__stat-label">累计订单</text>
              </view>
              <view class="institution-card__stat">
                <text class="institution-card__stat-value">{{ inst.typeLabel }}</text>
                <text class="institution-card__stat-label">机构类型</text>
              </view>
            </view>

          </view>
        </AppList>
      </scroll-view>
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

    <AppPopup
      :show="showAdvancedFilterPopup"
      custom-style="border-radius: 26rpx 26rpx 0 0; background: #ffffff;"
      position="bottom"
      round
      :safe-area-inset-bottom="false"
      :z-index="1300"
      @close="showAdvancedFilterPopup = false"
      @update:show="showAdvancedFilterPopup = $event"
    >
      <view class="advanced-filter">
        <view class="advanced-filter__header">
          <text class="advanced-filter__title">筛选条件</text>
          <view class="advanced-filter__close" @tap="showAdvancedFilterPopup = false">
            <AppIcon color="#94a3b8" name="close" size="16" />
          </view>
        </view>

        <view class="advanced-filter__section">
          <text class="advanced-filter__label">服务类型</text>
          <view class="advanced-filter__options">
            <view
              v-for="type in serviceTypeFilterOptions"
              :key="type"
              class="advanced-filter__option"
              :class="{ 'advanced-filter__option--active': draftType === type }"
              @tap="draftType = type"
            >{{ type }}</view>
          </view>
        </view>

        <view v-if="activeChannel === 'service'" class="advanced-filter__section">
          <text class="advanced-filter__label">价格区间</text>
          <view class="advanced-filter__options">
            <view
              v-for="price in servicePriceOptions"
              :key="price"
              class="advanced-filter__option"
              :class="{ 'advanced-filter__option--active': draftServicePrice === price }"
              @tap="draftServicePrice = price"
            >{{ price }}</view>
          </view>
        </view>

        <view v-else class="advanced-filter__section">
          <text class="advanced-filter__label">机构评分</text>
          <view class="advanced-filter__options">
            <view
              v-for="score in institutionScoreOptions"
              :key="score"
              class="advanced-filter__option"
              :class="{ 'advanced-filter__option--active': draftInstitutionScore === score }"
              @tap="draftInstitutionScore = score"
            >{{ score }}</view>
          </view>
        </view>

        <view class="advanced-filter__actions">
          <AppButton
            block
            custom-style="min-height: 64rpx; border-radius: 14rpx; font-size: 23rpx; border-color: #d6e0ee; background: #f8fbff; color: #5b6b83;"
            text="重置"
            type="default"
            @click="resetAdvancedFilters"
          />
          <AppButton
            block
            custom-style="min-height: 64rpx; border-radius: 14rpx; font-size: 23rpx;"
            text="确定"
            type="info"
            @click="applyAdvancedFilters"
          />
        </view>
      </view>
    </AppPopup>

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import ServiceCard from '@/components/service/ServiceCard/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import * as institutionService from '@/services/api/institution'
import * as serviceManageService from '@/services/api/serviceManage'
import type { ServiceItem } from '@/services/api/serviceManage'
import AppActionSheet, { type AppAction } from '@/components/ui/AppActionSheet/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppPopup from '@/components/ui/AppPopup/index.vue'
import AppSearchBarWithButton from '@/components/ui/AppSearchBarWithButton/index.vue'
import { getErrorMessage } from '@/services/http'
import { showFailToast } from '@/services/ui/toast'

type ChannelKey = 'service' | 'institution'
type FilterSheetKey = 'region' | 'sales' | 'sort' | ''
const serviceTypeOptions = ['检验检测', '认证认可', '计量服务', '标准服务', '质量诊断', '质量培训'] as const
const serviceTypeFilterOptions = ['全部类型', ...serviceTypeOptions] as const
type ServiceType = typeof serviceTypeOptions[number]
type ServiceTypeFilter = typeof serviceTypeFilterOptions[number]
type ServicePriceFilter = '全部价格' | '1000以下' | '1000-5000' | '5000以上'
type InstitutionScoreFilter = '全部评分' | '4.5分以上' | '4.8分以上'
type ServiceSortKey = 'recommend' | 'priceAsc' | 'priceDesc'
type InstitutionSortKey = 'recommend' | 'scoreDesc' | 'serviceCountDesc'
type SalesMode = 'normal' | 'salesDesc'
type AnyRecord = Record<string, any>
const DEFAULT_SERVICE_TYPE: ServiceType = '检验检测'
const HOME_SERVICE_TYPE_FILTER_STORAGE_KEY = 'institution:list:quick-service-type'

interface ServiceCard {
  category: string
  coverUrl: string
  id: string
  orderCount: number
  price: number
  region: string
  serviceName: string
  serviceType: ServiceType
  status?: ServiceItem['status']
}

interface InstitutionCard {
  certs: string[]
  id: string
  location: string
  name: string
  orderCount: string
  score: string
  serviceCount: number | null
  serviceRange: string
  shortName: string
  typeLabel: string
  types: ServiceType[]
}

const activeChannel = ref<ChannelKey>('service')
const activeType = ref<ServiceTypeFilter>('全部类型')
const searchKeyword = ref('')
const selectedRegion = ref('全部地区')
const serviceSortKey = ref<ServiceSortKey>('recommend')
const institutionSortKey = ref<InstitutionSortKey>('recommend')
const salesMode = ref<SalesMode>('normal')
const servicePriceFilter = ref<ServicePriceFilter>('全部价格')
const institutionScoreFilter = ref<InstitutionScoreFilter>('全部评分')

const showAdvancedFilterPopup = ref(false)
const activeFilterSheet = ref<FilterSheetKey>('')
const draftType = ref<ServiceTypeFilter>(activeType.value)
const draftServicePrice = ref<ServicePriceFilter>(servicePriceFilter.value)
const draftInstitutionScore = ref<InstitutionScoreFilter>(institutionScoreFilter.value)

const serviceImageBrokenMap = ref<Record<string, boolean>>({})
const isServiceLoading = ref(false)
const isLoading = ref(false)
const institutionRegionHistory = ref<string[]>([])
const lastLoadAt = ref(0)
const LOAD_DEDUP_MS = 800
const serviceLoadToken = ref(0)
const isServiceLoadedOnce = ref(false)

const servicePriceOptions: ServicePriceFilter[] = ['全部价格', '1000以下', '1000-5000', '5000以上']
const institutionScoreOptions: InstitutionScoreFilter[] = ['全部评分', '4.5分以上', '4.8分以上']
const serviceSortOptions: Array<{ key: ServiceSortKey, label: string }> = [
  { key: 'recommend', label: '综合推荐' },
  { key: 'priceAsc', label: '价格从低到高' },
  { key: 'priceDesc', label: '价格从高到低' },
]
const institutionSortOptions: Array<{ key: InstitutionSortKey, label: string }> = [
  { key: 'recommend', label: '综合推荐' },
  { key: 'scoreDesc', label: '评分优先' },
  { key: 'serviceCountDesc', label: '服务数量优先' },
]
const salesOptionPool: Array<{ key: SalesMode, label: string }> = [
  { key: 'normal', label: '默认排序' },
  { key: 'salesDesc', label: '销量优先' },
]
const orderOptionPool: Array<{ key: SalesMode, label: string }> = [
  { key: 'normal', label: '默认排序' },
  { key: 'salesDesc', label: '订单量优先' },
]

const SERVICE_TYPE_KEYWORDS: Record<ServiceType, string[]> = {
  检验检测: ['检测', '检验', '试验', '实验室'],
  认证认可: ['认证', '认可', '体系', 'iso', 'ccc', 'ce'],
  计量服务: ['计量', '校准', '标定'],
  标准服务: ['标准', '标准化', '国标', '行标', '团标'],
  质量诊断: ['诊断', '改进', '提升', '优化', '辅导', '咨询'],
  质量培训: ['培训', '课程', '讲座', '实训'],
}


const services = ref<ServiceCard[]>([])
const institutions = ref<InstitutionCard[]>([])

const regionOptions = computed(() => {
  const options = new Set<string>(['全部地区'])
  const source = activeChannel.value === 'service'
    ? services.value.map((item) => item.region)
    : [...institutionRegionHistory.value, ...institutions.value.map((item) => item.location)]

  source.forEach((value) => {
    const region = resolveRegionLabel(value)
    if (region && region !== '全国') {
      options.add(region)
    }
  })

  if (selectedRegion.value !== '全部地区') {
    options.add(selectedRegion.value)
  }

  return Array.from(options)
})

const salesOptions = computed(() => (activeChannel.value === 'service' ? salesOptionPool : orderOptionPool))
const sortLabel = computed(() => {
  if (activeChannel.value === 'service') {
    return serviceSortOptions.find((item) => item.key === serviceSortKey.value)?.label || '综合推荐'
  }

  return institutionSortOptions.find((item) => item.key === institutionSortKey.value)?.label || '综合推荐'
})
const salesLabel = computed(() => {
  if (salesMode.value === 'salesDesc') {
    return activeChannel.value === 'service' ? '销量优先' : '订单量优先'
  }

  return activeChannel.value === 'service' ? '销量' : '订单量'
})
const isSortApplied = computed(() => {
  return activeChannel.value === 'service'
    ? serviceSortKey.value !== 'recommend'
    : institutionSortKey.value !== 'recommend'
})
const hasAdvancedFilter = computed(() => {
  if (activeType.value !== '全部类型') {
    return true
  }

  return activeChannel.value === 'service'
    ? servicePriceFilter.value !== '全部价格'
    : institutionScoreFilter.value !== '全部评分'
})
const showFilterSheet = computed(() => activeFilterSheet.value !== '')
const currentSheetTitle = computed(() => {
  if (activeFilterSheet.value === 'region') {
    return '选择地区'
  }

  if (activeFilterSheet.value === 'sort') {
    return '选择排序方式'
  }

  if (activeFilterSheet.value === 'sales') {
    return activeChannel.value === 'service' ? '销量排序' : '订单量排序'
  }

  return ''
})
const currentSheetActions = computed<AppAction[]>(() => {
  if (activeFilterSheet.value === 'region') {
    return regionOptions.value.map((name) => ({ name }))
  }

  if (activeFilterSheet.value === 'sort') {
    return activeChannel.value === 'service'
      ? serviceSortOptions.map((item) => ({ name: item.label }))
      : institutionSortOptions.map((item) => ({ name: item.label }))
  }

  if (activeFilterSheet.value === 'sales') {
    return salesOptions.value.map((item) => ({ name: item.label }))
  }

  return []
})

const filteredServices = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  const filtered = services.value.filter((item) => {
    if (activeType.value !== '全部类型' && item.serviceType !== activeType.value) {
      return false
    }

    if (item.region && !matchesRegion(item.region, selectedRegion.value)) {
      return false
    }

    if (!matchesServicePrice(item.price)) {
      return false
    }

    if (!keyword) {
      return true
    }

    const text = [
      item.serviceName,
      item.category,
      item.serviceType,
      item.region || '',
    ].join(' ').toLowerCase()

    return text.includes(keyword)
  })

  const sorted = [...filtered]

  if (salesMode.value === 'salesDesc') {
    return sorted.sort((a, b) => b.orderCount - a.orderCount)
  }

  if (serviceSortKey.value === 'priceAsc') {
    return sorted.sort((a, b) => a.price - b.price)
  }

  if (serviceSortKey.value === 'priceDesc') {
    return sorted.sort((a, b) => b.price - a.price)
  }

  return sorted.sort((a, b) => b.orderCount - a.orderCount)
})

const filteredInstitutions = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  const filtered = institutions.value.filter((item) => {
    if (activeType.value !== '全部类型' && !item.types.includes(activeType.value)) {
      return false
    }

    if (!matchesRegion(item.location, selectedRegion.value)) {
      return false
    }

    if (!matchesInstitutionScore(item.score)) {
      return false
    }

    if (!keyword) {
      return true
    }

    const text = `${item.name} ${item.location} ${item.certs.join(' ')} ${item.types.join(' ')}`.toLowerCase()
    return text.includes(keyword)
  })

  const sorted = [...filtered]

  if (salesMode.value === 'salesDesc') {
    return sorted.sort((a, b) => toSortableCount(b.orderCount) - toSortableCount(a.orderCount))
  }

  if (institutionSortKey.value === 'scoreDesc') {
    return sorted.sort((a, b) => toNumber(b.score) - toNumber(a.score))
  }

  if (institutionSortKey.value === 'serviceCountDesc') {
    return sorted.sort((a, b) => (b.serviceCount ?? -1) - (a.serviceCount ?? -1))
  }

  return sorted.sort((a, b) => {
    const scoreDiff = toNumber(b.score) - toNumber(a.score)
    if (scoreDiff !== 0) {
      return scoreDiff
    }

    return toSortableCount(b.orderCount) - toSortableCount(a.orderCount)
  })
})

const serviceFinishedText = computed(() => (filteredServices.value.length > 0 ? '没有更多服务了' : '暂无服务数据'))
const institutionFinishedText = computed(() => (filteredInstitutions.value.length > 0 ? '没有更多机构了' : '暂无机构数据'))

onLoad(() => {
  applyPendingHomeServiceTypeFilter()

  if (activeChannel.value === 'service') {
    loadServices()
    return
  }

  if (activeChannel.value === 'institution') {
    loadInstitutions()
  }
})

onShow(() => {
  applyPendingHomeServiceTypeFilter()

  if (activeChannel.value === 'service') {
    if (!isServiceLoadedOnce.value) {
      loadServices()
    }
    return
  }

  if (activeChannel.value === 'institution') {
    loadInstitutions()
  }
})

watch(activeChannel, (channel) => {
  salesMode.value = 'normal'

  if (channel === 'service') {
    loadServices(searchKeyword.value.trim(), true)
    return
  }

  if (channel === 'institution') {
    loadInstitutions(searchKeyword.value.trim(), true)
  }
})

watch(activeType, () => {
  if (activeChannel.value === 'service') {
    loadServices(searchKeyword.value.trim(), true)
    return
  }

  if (activeChannel.value === 'institution') {
    loadInstitutions(searchKeyword.value.trim(), true)
  }
})

watch(selectedRegion, () => {
  if (activeChannel.value === 'institution') {
    loadInstitutions(searchKeyword.value.trim(), true)
  }
})

watch(regionOptions, (options) => {
  if (!options.includes(selectedRegion.value)) {
    selectedRegion.value = '全部地区'
  }
})

function applyPendingHomeServiceTypeFilter() {
  const cachedType = toText(uni.getStorageSync(HOME_SERVICE_TYPE_FILTER_STORAGE_KEY))
  if (!cachedType) {
    return
  }

  uni.removeStorageSync(HOME_SERVICE_TYPE_FILTER_STORAGE_KEY)
  const normalizedType = normalizeServiceTypeLabel(cachedType)

  if (!normalizedType) {
    return
  }

  activeChannel.value = 'service'
  activeType.value = normalizedType
  draftType.value = normalizedType
}

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

function toOptionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return undefined
}

function formatServiceCount(value: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-'
  }

  return String(value)
}

function formatServicePrice(value: number) {
  if (!Number.isFinite(value)) {
    return '¥--'
  }

  return `¥${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}起`
}

function formatServiceOrderCount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0'
  }

  return value.toLocaleString('zh-CN')
}

function toSortableCount(value: unknown) {
  const text = toText(value).replace(/[^0-9.]/g, '')

  if (!text) {
    return 0
  }

  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : 0
}

function resolveRegionLabel(source: string) {
  const text = source.trim()

  if (!text) {
    return '全国'
  }

  const match = text.match(/(北京市|天津市|上海市|重庆市|内蒙古自治区|广西壮族自治区|西藏自治区|宁夏回族自治区|新疆维吾尔自治区|香港特别行政区|澳门特别行政区|[\u4e00-\u9fa5]{2,8}(?:省|市|自治区))/)
  if (match?.[1]) {
    return match[1]
  }

  return text.split(/\s+/)[0] || '全国'
}

function matchRegionFromText(source: string) {
  const text = source.trim()
  if (!text) {
    return ''
  }

  const match = text.match(/(北京市|天津市|上海市|重庆市|内蒙古自治区|广西壮族自治区|西藏自治区|宁夏回族自治区|新疆维吾尔自治区|香港特别行政区|澳门特别行政区|[\u4e00-\u9fa5]{2,8}(?:省|市|自治区))/)
  return match?.[1] || ''
}

function matchesRegion(source: string, region: string) {
  if (region === '全部地区') {
    return true
  }

  const resolved = resolveRegionLabel(source)
  return resolved.includes(region) || region.includes(resolved)
}

function resolveRegionQueryValue(region: string) {
  if (region === '全部地区') {
    return undefined
  }

  return region
}

function matchesServicePrice(price: number) {
  if (servicePriceFilter.value === '全部价格') {
    return true
  }

  if (servicePriceFilter.value === '1000以下') {
    return price < 1000
  }

  if (servicePriceFilter.value === '1000-5000') {
    return price >= 1000 && price <= 5000
  }

  return price > 5000
}

function matchesInstitutionScore(score: string) {
  if (institutionScoreFilter.value === '全部评分') {
    return true
  }

  const value = toNumber(score)

  if (institutionScoreFilter.value === '4.5分以上') {
    return value >= 4.5
  }

  return value >= 4.8
}

function normalizeCoverUrl(value: unknown) {
  const text = toText(value)

  if (text.startsWith('https://') || text.startsWith('http://')) {
    return text
  }

  return ''
}

function inferRegionBySource(source: unknown) {
  const province = toText(pickValue(source, [['province'], ['institutionProvince'], ['orgProvince']]))
  const city = toText(pickValue(source, [['city'], ['institutionCity'], ['orgCity']]))
  const area = toText(pickValue(source, [['area'], ['district'], ['institutionArea'], ['orgArea']]))
  const regionText = toText(pickValue(source, [['region'], ['institutionRegion'], ['orgRegion'], ['enterpriseRegion']]))
  const addressText = toText(pickValue(source, [['address'], ['institutionAddress'], ['orgAddress']]))

  const candidates = [
    [province, city, area].filter(Boolean).join(' '),
    regionText,
    addressText,
    province,
    city,
  ]

  for (const candidate of candidates) {
    const matched = matchRegionFromText(candidate)
    if (matched) {
      return matched
    }
  }

  return ''
}

function parseCerts(source: unknown) {
  const candidate = pickValue(source, [
    ['qualification'],
    ['certs'],
    ['certList'],
    ['certNames'],
    ['qualifications'],
    ['certification'],
    ['certificationList'],
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

function toTextList(source: unknown) {
  if (Array.isArray(source)) {
    return source
      .map((item) => toText(item))
      .filter(Boolean)
  }

  if (typeof source === 'string') {
    return source
      .split(/[,\s/|、]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeServiceTypeLabel(source: string): ServiceType | '' {
  const text = source.toLowerCase().replace(/\s+/g, '')

  if (text.includes('检测') || text.includes('检验') || text.includes('试验') || text.includes('实验室')) {
    return '检验检测'
  }

  if (text.includes('认证') || text.includes('认可') || text.includes('iso') || text.includes('ccc') || text.includes('ce')) {
    return '认证认可'
  }

  if (text.includes('计量') || text.includes('校准') || text.includes('标定')) {
    return '计量服务'
  }

  if (text.includes('标准')) {
    return '标准服务'
  }

  if (text.includes('诊断') || text.includes('咨询') || text.includes('改进') || text.includes('提升') || text.includes('辅导')) {
    return '质量诊断'
  }

  if (text.includes('培训') || text.includes('课程') || text.includes('实训')) {
    return '质量培训'
  }

  return ''
}

function inferServiceTypesByText(source: string): ServiceType[] {
  const content = source.toLowerCase()
  const matches = serviceTypeOptions.filter((type) => SERVICE_TYPE_KEYWORDS[type].some((keyword) => content.includes(keyword)))
  return matches.length > 0 ? matches : [DEFAULT_SERVICE_TYPE]
}

function normalizeInstitutionService(item: ServiceItem, index: number): ServiceCard {
  const category = toText(item.category)
  const serviceName = toText(item.serviceName) || `服务项目${index + 1}`
  const defaultStd = toText(item.defaultStd)
  const sampleType = toText(item.sampleType)
  const description = toText(item.description)
  const inferredType = inferServiceTypesByText(`${category} ${serviceName} ${defaultStd} ${description}`)[0] || DEFAULT_SERVICE_TYPE
  const id = toText(item.id) || `service-${index + 1}`
  const coverFromApi = normalizeCoverUrl(item.coverUrl)
  const region = inferRegionBySource(item)

  return {
    category: category || inferredType,
    coverUrl: coverFromApi,
    id,
    orderCount: toNumber(item.orderCount),
    price: toNumber(item.price),
    region,
    serviceName,
    serviceType: inferredType,
    status: item.status,
  }
}

async function loadServices(keyword = searchKeyword.value.trim(), force = false) {
  if (isServiceLoading.value && !force) {
    return
  }

  const token = Date.now()
  serviceLoadToken.value = token
  isServiceLoading.value = true

  try {
    const response = await serviceManageService.listAll({
      institutionType: resolveInstitutionType(),
      keyword: keyword || undefined,
      page: 1,
      size: 100,
    })
    const records = Array.isArray(response.records) ? response.records : []

    if (serviceLoadToken.value !== token) {
      return
    }

    services.value = records.length > 0
      ? records.map((item, index) => normalizeInstitutionService(item, index))
      : []
    isServiceLoadedOnce.value = true
  } catch (error) {
    if (serviceLoadToken.value === token) {
      showFailToast(getErrorMessage(error, '服务列表加载失败'))
      services.value = []
    }
  } finally {
    if (serviceLoadToken.value === token) {
      isServiceLoading.value = false
    }
  }
}

function resolveServiceTypes(source: unknown, name: string): ServiceType[] {
  const institutionType = toNumber(pickValue(source, [['institutionType'], ['type']]))
  const typeByCode = resolveInstitutionTypeByCode(institutionType, source)
  if (typeByCode) {
    return [typeByCode]
  }

  const candidate = pickValue(source, [
    ['serviceRange'],
    ['qualification'],
    ['serviceTypes'],
    ['serviceType'],
    ['businessTypes'],
    ['businessType'],
    ['serviceCategory'],
    ['serviceCategories'],
    ['category'],
    ['categories'],
    ['tags'],
    ['labels'],
  ])

  const normalized = Array.from(
    new Set(
      toTextList(candidate)
        .map((text) => normalizeServiceTypeLabel(text))
        .filter((type): type is ServiceType => Boolean(type)),
    ),
  )

  if (normalized.length > 0) {
    return normalized
  }

  const desc = toText(pickValue(source, [['description'], ['intro'], ['profile'], ['summary'], ['businessScope']]))
  return inferServiceTypesByText(`${name} ${desc}`)
}

function resolveInstitutionTypeByCode(institutionType: number, source: unknown): ServiceType | '' {
  if (institutionType === 1) {
    return '检验检测'
  }

  if (institutionType === 4) {
    return '质量诊断'
  }

  if (institutionType !== 2 && institutionType !== 3) {
    return ''
  }

  const text = toText(
    pickValue(source, [
      ['serviceRange'],
      ['qualification'],
      ['introduction'],
      ['description'],
      ['summary'],
      ['businessScope'],
    ]),
  ).toLowerCase()

  const containsCertification = /认证|认可|iso|ccc|ce/.test(text)
  const containsMeasurement = /计量|校准|标定/.test(text)

  if (containsCertification && !containsMeasurement) {
    return '认证认可'
  }

  if (containsMeasurement && !containsCertification) {
    return '计量服务'
  }

  return institutionType === 2 ? '认证认可' : '计量服务'
}

function resolveInstitutionTypeLabel(source: unknown, name: string) {
  const institutionType = toNumber(pickValue(source, [['institutionType'], ['type']]))
  const typeByCode = resolveInstitutionTypeByCode(institutionType, source)
  if (typeByCode) {
    return typeByCode
  }

  const serviceRange = toText(pickValue(source, [['serviceRange'], ['qualification']]))
  return inferServiceTypesByText(`${name} ${serviceRange}`)[0] || DEFAULT_SERVICE_TYPE
}

function extractList(source: unknown): unknown[] {
  if (Array.isArray(source)) {
    return source
  }

  if (!isObject(source)) {
    return []
  }

  const directList = pickValue(source, [['list'], ['records'], ['items'], ['rows'], ['content']])

  if (Array.isArray(directList)) {
    return directList
  }

  const data = source.data

  if (Array.isArray(data)) {
    return data
  }

  if (isObject(data)) {
    const nested = pickValue(data, [['list'], ['records'], ['items'], ['rows'], ['content']])

    if (Array.isArray(nested)) {
      return nested
    }
  }

  return []
}

function normalizeInstitution(source: unknown, index: number): InstitutionCard {
  const id = toText(pickValue(source, [['id'], ['enterpriseId'], ['enterpriseID'], ['companyId']])) || `inst-${index + 1}`
  const name = toText(pickValue(source, [['name'], ['enterpriseName'], ['companyName'], ['company']])) || '未命名机构'
  const shortName = toText(pickValue(source, [['shortName']]))
  const regionText = toText(pickValue(source, [['region'], ['area'], ['city'], ['province']]))
  const addressText = toText(pickValue(source, [['address']]))
  const location = [regionText, addressText].filter(Boolean).join(' ') || regionText || addressText || '地区待完善'
  const scoreValue = toNumber(pickValue(source, [['avgScore'], ['score'], ['rating'], ['rate']]))
  const serviceRange = toText(pickValue(source, [['serviceRange']]))
  const serviceCount = toOptionalNumber(pickValue(source, [['serviceCount'], ['projectCount'], ['serviceNum']]))
  const orderCount = toNumber(pickValue(source, [['orderCount'], ['orders'], ['orderNum'], ['dealCount']]))

  return {
    certs: parseCerts(source),
    id,
    location,
    name,
    orderCount: orderCount > 0 ? orderCount.toLocaleString() : '0',
    score: scoreValue > 0 ? scoreValue.toFixed(1) : '-',
    serviceCount: typeof serviceCount === 'number' ? serviceCount : null,
    serviceRange,
    shortName,
    typeLabel: resolveInstitutionTypeLabel(source, name),
    types: resolveServiceTypes(source, `${name} ${serviceRange}`),
  }
}

async function loadInstitutions(keyword = searchKeyword.value.trim(), force = false) {
  const now = Date.now()

  if (isLoading.value) {
    return
  }

  if (!force && now - lastLoadAt.value < LOAD_DEDUP_MS) {
    return
  }

  lastLoadAt.value = now
  isLoading.value = true

  try {
    const type = resolveInstitutionType()
    const region = resolveRegionQueryValue(selectedRegion.value)
    const response = keyword
      ? await institutionService.search({
          keyword,
          page: 1,
          region,
          size: 100,
          type,
        })
      : await institutionService.getList({
          keyword: undefined,
          page: 1,
          region,
          size: 100,
          type,
        })
    const records = extractList(response)

    if (records.length === 0) {
      institutions.value = []
      return
    }

    institutions.value = records.map((item, index) => normalizeInstitution(item, index))
    const nextRegionHistory = new Set(institutionRegionHistory.value)
    institutions.value.forEach((item) => {
      const region = resolveRegionLabel(item.location)
      if (region && region !== '全国') {
        nextRegionHistory.add(region)
      }
    })
    institutionRegionHistory.value = Array.from(nextRegionHistory)
  } catch (error) {
    showFailToast(getErrorMessage(error, '机构列表加载失败'))
  } finally {
    isLoading.value = false
  }
}

function resolveInstitutionType() {
  if (activeType.value === '检验检测') {
    return 1
  }

  if (activeType.value === '计量服务') {
    return 2
  }

  if (activeType.value === '认证认可') {
    return 3
  }

  return undefined
}

function handleSearchSubmit(keyword?: string) {
  if (typeof keyword === 'string') {
    searchKeyword.value = keyword
  }

  const normalizedKeyword = searchKeyword.value.trim()

  if (activeChannel.value === 'service') {
    loadServices(normalizedKeyword, true)
    return
  }

  loadInstitutions(normalizedKeyword, true)
}

function markServiceImageBroken(id: string) {
  if (!id) {
    return
  }

  serviceImageBrokenMap.value = {
    ...serviceImageBrokenMap.value,
    [id]: true,
  }
}

function isServiceImageBroken(id: string) {
  return Boolean(serviceImageBrokenMap.value[id])
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
  if (activeFilterSheet.value === 'region') {
    selectedRegion.value = action.name
    closeFilterSheet()
    return
  }

  if (activeFilterSheet.value === 'sort') {
    if (activeChannel.value === 'service') {
      const target = serviceSortOptions.find((item) => item.label === action.name)
      if (target) {
        serviceSortKey.value = target.key
      }
      closeFilterSheet()
      return
    }

    const target = institutionSortOptions.find((item) => item.label === action.name)
    if (target) {
      institutionSortKey.value = target.key
    }
    closeFilterSheet()
    return
  }

  if (activeFilterSheet.value === 'sales') {
    const target = salesOptions.value.find((item) => item.label === action.name)
    if (target) {
      salesMode.value = target.key
    }
  }

  closeFilterSheet()
}

function openAdvancedFilterPopup() {
  draftType.value = activeType.value
  draftServicePrice.value = servicePriceFilter.value
  draftInstitutionScore.value = institutionScoreFilter.value
  showAdvancedFilterPopup.value = true
}

function resetAdvancedFilters() {
  draftType.value = '全部类型'
  draftServicePrice.value = '全部价格'
  draftInstitutionScore.value = '全部评分'
}

function applyAdvancedFilters() {
  activeType.value = draftType.value
  servicePriceFilter.value = draftServicePrice.value
  institutionScoreFilter.value = draftInstitutionScore.value
  showAdvancedFilterPopup.value = false
}

function goServiceDetail(item: ServiceCard) {
  const detailId = item.id

  if (!detailId) {
    showFailToast('服务ID缺失，无法查看详情')
    return
  }

  uni.navigateTo({ url: `/pages/service/detail?id=${encodeURIComponent(String(detailId))}` })
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/institution/detail?id=${id}` })
}
</script>

<style scoped lang="scss">
.page-institution-list {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f7fb;
}

.page-institution-list__header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 20rpx 24rpx 14rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border-bottom: 1rpx solid #e8eef7;
}

.page-institution-list__search {
  margin-bottom: 16rpx;
}

.page-institution-list__search :deep(.app-search-bar-with-button__field) {
  border-color: #dbe8ff;
  background: rgba(255, 255, 255, 0.95);
}

.page-institution-list__search :deep(.app-search-bar-with-button__button) {
  background: linear-gradient(130deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8rpx 18rpx rgba(30, 97, 255, 0.22);
}

.page-institution-list__main-tabs {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12rpx;
  border-bottom: 1rpx solid #e6edf8;
}

.page-institution-list__main-tab {
  position: relative;
  flex: 1;
  height: 70rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 27rpx;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.page-institution-list__main-tab--active {
  color: #0f172a;
  font-weight: 700;
}

.page-institution-list__main-tab--active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 46rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: #1e61ff;
}

.page-institution-list__filter-bar {
  display: flex;
  align-items: center;
  border-radius: 20rpx;
  border: 1rpx solid rgba(203, 213, 225, 0.62);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.86) 100%);
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.03);
  backdrop-filter: blur(10px);
}

.page-institution-list__filter-item {
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

.page-institution-list__filter-item::after {
  content: '';
  position: absolute;
  top: 17rpx;
  right: 0;
  width: 1rpx;
  height: 34rpx;
  background: rgba(226, 232, 240, 0.85);
}

.page-institution-list__filter-item:last-child::after {
  display: none;
}

.page-institution-list__filter-item--active {
  color: #1e61ff;
}

.page-institution-list__filter-item--open {
  color: #1e61ff;
  background: rgba(239, 246, 255, 0.6);
}

.page-institution-list__filter-text {
  max-width: 82%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 22rpx;
  font-weight: 500;
}

.page-institution-list__filter-arrow {
  width: 0;
  height: 0;
  flex-shrink: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 7rpx solid #94a3b8;
  transform: translateY(2rpx);
  transition: transform 0.2s ease;
}

.page-institution-list__filter-arrow--open {
  border-top-color: #1e61ff;
  transform: translateY(2rpx) rotate(180deg);
}

.page-institution-list__content {
  flex: 1;
  min-height: 0;
}

.page-institution-list__scroll {
  height: 100%;
  padding: 16rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.institution-card {
  margin-bottom: 14rpx;
  border: 1rpx solid #e8edf6;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 6rpx 18rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.institution-card:active {
  transform: scale(0.996);
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
}

.institution-card__head {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.institution-card__avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.institution-card__main {
  flex: 1;
}

.institution-card__name {
  display: block;
  margin-bottom: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.institution-card__short-name {
  display: block;
  margin-top: -2rpx;
  margin-bottom: 8rpx;
  font-size: 22rpx;
  color: #475569;
}

.institution-card__certs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.institution-card__cert {
  @include pill-tag(20rpx, 6rpx, 4rpx 12rpx);
  @include pill-tag-tone(#1e61ff, #eff6ff);
}

.institution-card__meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.institution-card__location {
  display: block;
  font-size: 22rpx;
  color: #64748b;
}

.institution-card__score {
  flex-shrink: 0;
  text-align: center;
}

.institution-card__score-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #d97706;
}

.institution-card__score-label {
  display: block;
  font-size: 20rpx;
  color: #94a3b8;
}

.institution-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 2rpx;
  border-radius: 14rpx;
  background: #f8fafc;
  padding: 14rpx;
}

.institution-card__stat {
  text-align: center;
}

.institution-card__stat-value {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}

.institution-card__stat-label {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #64748b;
}

.advanced-filter {
  padding: 20rpx 24rpx 16rpx;
}

.advanced-filter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.advanced-filter__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.advanced-filter__close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.advanced-filter__section + .advanced-filter__section {
  margin-top: 14rpx;
}

.advanced-filter__label {
  display: block;
  margin-bottom: 10rpx;
  color: #334155;
  font-size: 23rpx;
  font-weight: 600;
}

.advanced-filter__options {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.advanced-filter__option {
  min-width: 132rpx;
  padding: 12rpx 18rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 22rpx;
  text-align: center;
}

.advanced-filter__option--active {
  color: #1e61ff;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.advanced-filter__actions {
  margin-top: 12rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}
</style>
