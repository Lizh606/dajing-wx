<template>
  <view class="page-institution-list">
    <view class="page-institution-list__header">
      <view class="page-institution-list__search-box">
        <AppIcon class="page-institution-list__search-icon" color="#94a3b8" name="search" size="18" />
        <AppField
          v-model="searchKeyword"
          class="page-institution-list__search-input-wrap"
          :border="false"
          custom-style="height: 72rpx; min-height: 72rpx; padding: 0; border: none; background: transparent;"
          input-mode="search"
          placeholder="搜索服务项目、机构名称、服务类型"
          @confirm="handleInstitutionSearch"
        />
      </view>

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

      <view class="page-institution-list__filter-panel">
        <scroll-view class="page-institution-list__type-scroll" scroll-x>
          <view class="page-institution-list__type-row">
            <text
              v-for="type in serviceTypeOptions"
              :key="type"
              class="page-institution-list__type-chip"
              :class="{ 'page-institution-list__type-chip--active': activeType === type }"
              @tap="activeType = type"
            >{{ type }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="page-institution-list__content">
      <scroll-view v-if="activeChannel === 'service'" class="page-institution-list__scroll" scroll-y>
        <AppList :finished="!isServiceLoading" :finished-text="serviceFinishedText" :loading="isServiceLoading">
          <view class="card-grid">
            <view
              v-for="item in filteredServices"
              :key="item.id"
              class="service-card"
              @tap="goOrder(item)"
            >
              <view class="service-card__media" :style="{ background: item.imgBg }">
                <AppIcon :name="item.iconName" size="32" />
              </view>
              <view class="service-card__body">
                <text class="service-card__title">{{ item.name }}</text>
                <text class="service-card__org">{{ item.org }}</text>
                <view class="service-card__price-row">
                  <text class="service-card__price">¥{{ item.price }}起</text>
                  <text class="service-card__sold">已售 {{ item.sold }}</text>
                </view>
                <view class="service-card__meta-row">
                  <text class="service-card__type">{{ item.type }}</text>
                  <text class="service-card__cycle">{{ item.cycleDays }}天出结果</text>
                </view>
                <view class="service-card__tags">
                  <text v-for="tag in item.tags" :key="tag" class="service-card__tag">{{ tag }}</text>
                </view>
                <view class="service-card__actions">
                  <AppButton
                    block
                    plain
                    preset="action"
                    size="small"
                    text="咨询"
                    type="default"
                    @click.stop="goConsult"
                  />
                  <AppButton
                    block
                    preset="action"
                    size="small"
                    text="立即下单"
                    type="info"
                    @click.stop="goOrder(item)"
                  />
                </view>
              </view>
            </view>
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
                <AppIcon color="#2563eb" name="institution" size="22" />
              </view>
              <view class="institution-card__main">
                <text class="institution-card__name">{{ inst.name }}</text>
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
                <text class="institution-card__stat-value">{{ inst.serviceCount }}</text>
                <text class="institution-card__stat-label">服务项目</text>
              </view>
              <view class="institution-card__stat">
                <text class="institution-card__stat-value">{{ inst.orderCount }}</text>
                <text class="institution-card__stat-label">累计订单</text>
              </view>
              <view class="institution-card__stat">
                <text class="institution-card__stat-value">{{ inst.avgDays }}天</text>
                <text class="institution-card__stat-label">平均周期</text>
              </view>
              <view class="institution-card__stat">
                <text class="institution-card__stat-value">{{ inst.responseTime }}</text>
                <text class="institution-card__stat-label">响应时长</text>
              </view>
            </view>
          </view>
        </AppList>
      </scroll-view>
    </view>

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import * as institutionService from '@/services/api/institution'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import {
  getInspectionItemDetail,
  getInspectionItemList,
  type InspectionItem,
} from '@/services/api/inspectionItem'
import { getErrorMessage } from '@/services/http'
import { showFailToast } from '@/services/ui/toast'

type ChannelKey = 'service' | 'institution'
const serviceTypeOptions = ['检验检测', '认证认可', '计量服务', '标准服务', '质量诊断', '质量培训'] as const
type ServiceType = typeof serviceTypeOptions[number]
const DEFAULT_SERVICE_TYPE: ServiceType = '检验检测'
type AnyRecord = Record<string, any>

interface ServiceCard {
  cycleDays: number
  iconName: string
  id: string
  imgBg: string
  name: string
  org: string
  price: number
  rawId?: number | string
  sold: string
  tags: string[]
  type: ServiceType
}

interface InstitutionCard {
  avgDays: number
  certs: string[]
  id: string
  location: string
  name: string
  orderCount: string
  responseTime: string
  score: string
  serviceCount: number
  types: ServiceType[]
}

const activeChannel = ref<ChannelKey>('service')
const activeType = ref<ServiceType>(DEFAULT_SERVICE_TYPE)
const searchKeyword = ref('')
const isServiceLoading = ref(false)
const isLoading = ref(false)
const lastLoadAt = ref(0)
const LOAD_DEDUP_MS = 800
const serviceLoadToken = ref(0)
const isServiceLoadedOnce = ref(false)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const fallbackServices: ServiceCard[] = [
  { id: 'service-1', type: '检验检测', name: '金属材料成分检测', org: '湖南质量检测研究院', price: 980, cycleDays: 3, sold: '1,286', iconName: 'lab', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CMA', '3天出报告'] },
  { id: 'service-2', type: '认证认可', name: 'ISO 9001体系认证', org: '北京华质认证中心', price: 5600, cycleDays: 8, sold: '652', iconName: 'certification', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', tags: ['ISO', '体系审核'] },
  { id: 'service-3', type: '计量服务', name: '仪器设备计量校准', org: '湖南计量测试研究院', price: 380, cycleDays: 2, sold: '2,164', iconName: 'standard', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CNAS', '上门服务'] },
  { id: 'service-4', type: '标准服务', name: '标准检索与适用性分析', org: '中标标准信息中心', price: 680, cycleDays: 1, sold: '934', iconName: 'book', imgBg: 'linear-gradient(135deg,#ecfeff,#cffafe)', tags: ['标准解读', '快速响应'] },
  { id: 'service-5', type: '质量诊断', name: '质量管理体系诊断', org: '大京质量咨询服务', price: 3200, cycleDays: 5, sold: '428', iconName: 'analysis', imgBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', tags: ['诊断报告', '改进建议'] },
  { id: 'service-6', type: '质量培训', name: '内审员能力提升培训', org: '实验室能力培训中心', price: 1280, cycleDays: 2, sold: '1,102', iconName: 'training', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['线上线下', '证书可查'] },
]
const services = ref<ServiceCard[]>([...fallbackServices])

const fallbackInstitutions: InstitutionCard[] = [
  { id: '1', name: '湖南质量检测研究院', certs: ['CMA', 'CNAS'], location: '湖南省长沙市', score: '4.9', serviceCount: 128, orderCount: '2,341', avgDays: 3, responseTime: '8分钟', types: ['检验检测', '计量服务'] },
  { id: '2', name: '广州检验检测认证集团', certs: ['CMA'], location: '广东省广州市', score: '4.7', serviceCount: 96, orderCount: '1,872', avgDays: 5, responseTime: '15分钟', types: ['检验检测', '认证认可'] },
  { id: '3', name: '深圳华检技术服务有限公司', certs: ['CNAS'], location: '广东省深圳市', score: '4.8', serviceCount: 84, orderCount: '1,234', avgDays: 4, responseTime: '12分钟', types: ['检验检测'] },
]

const institutions = ref<InstitutionCard[]>([...fallbackInstitutions])

const SERVICE_TYPE_KEYWORDS: Record<ServiceType, string[]> = {
  检验检测: ['检测', '检验', '试验', '实验室'],
  认证认可: ['认证', '认可', '体系', 'iso', 'ccc', 'ce'],
  计量服务: ['计量', '校准', '标定'],
  标准服务: ['标准', '标准化', '国标', '行标', '团标'],
  质量诊断: ['诊断', '改进', '提升', '优化', '辅导', '咨询'],
  质量培训: ['培训', '课程', '讲座', '实训'],
}

const filteredServices = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return services.value.filter((item) => {
    if (item.type !== activeType.value) {
      return false
    }

    if (!keyword) {
      return true
    }

    const text = `${item.name} ${item.org} ${item.type} ${item.tags.join(' ')}`.toLowerCase()
    return text.includes(keyword)
  })
})

const filteredInstitutions = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return institutions.value.filter((item) => {
    if (!item.types.includes(activeType.value)) {
      return false
    }

    if (!keyword) {
      return true
    }

    const text = `${item.name} ${item.location} ${item.certs.join(' ')} ${item.types.join(' ')}`.toLowerCase()
    return text.includes(keyword)
  })
})

const serviceFinishedText = computed(() => (filteredServices.value.length > 0 ? '没有更多服务了' : '暂无服务数据'))
const institutionFinishedText = computed(() => (filteredInstitutions.value.length > 0 ? '没有更多机构了' : '暂无机构数据'))

onLoad(() => {
  if (activeChannel.value === 'service') {
    loadServices()
    return
  }

  if (activeChannel.value === 'institution') {
    loadInstitutions()
  }
})

onShow(() => {
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
    return
  }

  if (activeChannel.value === 'institution') {
    loadInstitutions(searchKeyword.value.trim(), true)
  }
})

watch(searchKeyword, () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    if (activeChannel.value === 'service') {
      loadServices(searchKeyword.value.trim(), true)
      return
    }

    loadInstitutions(searchKeyword.value.trim(), true)
  }, 260)
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

function pickServiceCardStyle(content: string) {
  const text = content.toLowerCase()

  if (text.includes('认证') || text.includes('认可') || text.includes('iso') || text.includes('ccc') || text.includes('ce')) {
    return { iconName: 'certification', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)' }
  }

  if (text.includes('计量') || text.includes('校准') || text.includes('标定')) {
    return { iconName: 'standard', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }
  }

  if (text.includes('标准')) {
    return { iconName: 'book', imgBg: 'linear-gradient(135deg,#ecfeff,#cffafe)' }
  }

  if (text.includes('诊断') || text.includes('咨询') || text.includes('改进') || text.includes('优化')) {
    return { iconName: 'analysis', imgBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }
  }

  if (text.includes('培训') || text.includes('课程') || text.includes('讲座') || text.includes('实训')) {
    return { iconName: 'training', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)' }
  }

  if (text.includes('电') || text.includes('安规')) {
    return { iconName: 'electric', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)' }
  }

  return { iconName: 'lab', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' }
}

function inferServiceTypesByText(source: string): ServiceType[] {
  const content = source.toLowerCase()
  const matches = serviceTypeOptions.filter((type) => SERVICE_TYPE_KEYWORDS[type].some((keyword) => content.includes(keyword)))
  return matches.length > 0 ? matches : [DEFAULT_SERVICE_TYPE]
}

function normalizeInspectionService(item: InspectionItem, index: number): ServiceCard {
  const category = toText(item.category)
  const defaultStd = toText(item.defaultStd)
  const sampleType = toText(item.sampleType)
  const description = toText(item.description)
  const name = toText(item.itemName) || `服务项目${index + 1}`
  const style = pickServiceCardStyle(`${category} ${name} ${description}`)
  const inferredType = inferServiceTypesByText(`${category} ${name} ${defaultStd} ${description}`)[0] || DEFAULT_SERVICE_TYPE
  const id = toText(item.id) || `inspection-${index + 1}`

  return {
    cycleDays: toNumber(item.cycleDays),
    iconName: style.iconName,
    id,
    imgBg: style.imgBg,
    name,
    org: '平台检测项目库',
    price: toNumber(item.unitPrice),
    rawId: item.id,
    sold: '-',
    tags: [category, defaultStd, sampleType, description].filter(Boolean).slice(0, 3),
    type: inferredType,
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
    const response = await getInspectionItemList({
      category: undefined,
      keyword: keyword || undefined,
      page: 1,
      size: 100,
    })
    const records = Array.isArray(response?.records) ? response.records : []

    if (serviceLoadToken.value !== token) {
      return
    }

    services.value = records.length > 0
      ? records.map((item, index) => normalizeInspectionService(item, index))
      : []
    isServiceLoadedOnce.value = true
  } catch (error) {
    if (serviceLoadToken.value === token) {
      showFailToast(getErrorMessage(error, '服务列表加载失败，已展示本地数据'))
      services.value = [...fallbackServices]
    }
  } finally {
    if (serviceLoadToken.value === token) {
      isServiceLoading.value = false
    }
  }
}

function resolveServiceTypes(source: unknown, name: string): ServiceType[] {
  const institutionType = toNumber(pickValue(source, [['institutionType'], ['type']]))
  if (institutionType === 1) {
    return ['检验检测'] as ServiceType[]
  }

  if (institutionType === 2) {
    return ['认证认可'] as ServiceType[]
  }

  if (institutionType === 3) {
    return ['计量服务'] as ServiceType[]
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
  const name = toText(pickValue(source, [['name'], ['shortName'], ['enterpriseName'], ['companyName'], ['company']])) || '未命名机构'
  const regionText = toText(pickValue(source, [['region'], ['area'], ['city'], ['province']]))
  const addressText = toText(pickValue(source, [['address']]))
  const location = [regionText, addressText].filter(Boolean).join(' ') || regionText || addressText || '地区待完善'
  const scoreValue = toNumber(pickValue(source, [['avgScore'], ['score'], ['rating'], ['rate']]))
  const serviceCount = toNumber(pickValue(source, [['serviceCount'], ['projectCount'], ['serviceNum']]))
    || toText(pickValue(source, [['serviceRange']]))
      .split(/[,\s/|、，；;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .length
  const orderCount = toNumber(pickValue(source, [['orderCount'], ['orders'], ['orderNum'], ['dealCount']]))
  const avgDays = toNumber(pickValue(source, [['avgDays'], ['cycleDays'], ['serviceDays']]))
  const responseMinutes = toNumber(pickValue(source, [['responseMinutes'], ['responseTimeMinutes']]))
  const responseTimeText = toText(pickValue(source, [['responseTime'], ['responseDuration']]))

  return {
    avgDays: avgDays > 0 ? avgDays : 0,
    certs: parseCerts(source),
    id,
    location,
    name,
    orderCount: orderCount > 0 ? orderCount.toLocaleString() : '0',
    responseTime: responseTimeText || (responseMinutes > 0 ? `${responseMinutes}分钟` : '-'),
    score: scoreValue > 0 ? scoreValue.toFixed(1) : '-',
    serviceCount: serviceCount > 0 ? serviceCount : 0,
    types: resolveServiceTypes(source, name),
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
    const response = keyword
      ? await institutionService.search({
          keyword,
          page: 1,
          region: undefined,
          size: 100,
          type,
        })
      : await institutionService.getList({
          keyword: undefined,
          page: 1,
          region: undefined,
          size: 100,
          type,
        })
    const records = extractList(response)

    if (records.length === 0) {
      return
    }

    institutions.value = records.map((item, index) => normalizeInstitution(item, index))
  } catch (error) {
    showFailToast(getErrorMessage(error, '机构列表加载失败，已展示本地数据'))
  } finally {
    isLoading.value = false
  }
}

function resolveInstitutionType() {
  if (activeType.value === '检验检测') {
    return 1
  }

  if (activeType.value === '认证认可') {
    return 2
  }

  if (activeType.value === '计量服务') {
    return 3
  }

  return undefined
}

function handleInstitutionSearch() {
  if (activeChannel.value !== 'institution') {
    return
  }

  loadInstitutions(searchKeyword.value.trim(), true)
}

function resolveInstitutionIdForService(item: ServiceCard) {
  const org = item.org.trim()
  if (!org) {
    return ''
  }

  const matched = institutions.value.find((institution) => institution.name.includes(org) || org.includes(institution.name))
  return matched?.id || ''
}

async function goOrder(item: ServiceCard) {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  let serviceName = item.name
  const detailId = item.rawId ?? item.id

  if (detailId) {
    try {
      const detail = await getInspectionItemDetail(detailId)
      serviceName = toText(detail.itemName) || serviceName
    } catch {
      // ignore detail prefetch failure
    }
  }

  const params = [
    `service=${encodeURIComponent(serviceName)}`,
    `institutionName=${encodeURIComponent(item.org)}`,
  ]
  const matchedInstitutionId = resolveInstitutionIdForService(item)
  if (matchedInstitutionId) {
    params.push(`institutionId=${encodeURIComponent(matchedInstitutionId)}`)
  }

  uni.navigateTo({ url: `/pages/order/create?${params.join('&')}` })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
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
  background: #f8fafc;
}

.page-institution-list__header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 20rpx 24rpx 16rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
}

.page-institution-list__search-box {
  height: 72rpx;
  min-height: 72rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
}

.page-institution-list__search-icon {
  flex-shrink: 0;
  margin-right: 10rpx;
}

.page-institution-list__search-input-wrap {
  flex: 1;
}

:deep(.page-institution-list__search-input-wrap .van-field__control),
:deep(.page-institution-list__search-input-wrap .app-field__control) {
  height: 72rpx;
  min-height: 72rpx;
  padding: 0;
  font-size: 24rpx;
  color: #0f172a;
}

:deep(.page-institution-list__search-input-wrap .app-field) {
  border: none;
  background: transparent;
  box-shadow: none;
}

.page-institution-list__main-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-bottom: 14rpx;
}

.page-institution-list__main-tab {
  height: 70rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-institution-list__main-tab--active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.page-institution-list__filter-panel {
  display: flex;
  flex-direction: column;
}

.page-institution-list__type-scroll {
  white-space: nowrap;
}

.page-institution-list__type-row {
  display: flex;
  gap: 10rpx;
  padding-bottom: 6rpx;
}

.page-institution-list__type-chip {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 21rpx;
}

.page-institution-list__type-chip--active {
  background: #2563eb;
  color: #ffffff;
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

/* #ifdef H5 */
.page-institution-list__scroll {
  padding-bottom: calc(144rpx + env(safe-area-inset-bottom));
}
/* #endif */

.card-grid {
  @include service-card-grid(0, 12rpx);
}

.service-card {
  @include service-card-shell(24rpx);
  border: 1rpx solid #f1f5f9;
}

.service-card__media {
  @include service-card-media(170rpx);
}

.service-card__body {
  @include service-card-body(20rpx);
}

.service-card__title {
  @include service-card-title(26rpx, 1.375);
}

.service-card__org {
  @include service-card-org(20rpx, #64748b, 4rpx);
}

.service-card__price-row {
  @include service-card-price-row(12rpx);
}

.service-card__price {
  @include service-card-price(26rpx);
}

.service-card__sold {
  @include service-card-sold(20rpx);
}

.service-card__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #64748b;
}

.service-card__type {
  color: #2563eb;
}

.service-card__tags {
  @include service-card-tags(10rpx, null, 6rpx);
}

.service-card__tag {
  @include service-card-tag(18rpx, 6rpx, 4rpx 12rpx);
  color: #2563eb;
  background: #eff6ff;
}

.service-card__actions {
  @include service-card-actions(14rpx, 10rpx);
}

.institution-card {
  margin-bottom: 14rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.institution-card:active {
  transform: scale(0.995);
  box-shadow: 0 6rpx 18rpx rgba(15, 23, 42, 0.1);
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

.institution-card__certs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.institution-card__cert {
  @include pill-tag(20rpx, 6rpx, 4rpx 12rpx);
  @include pill-tag-tone(#2563eb, #eff6ff);
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

</style>
