<template>
  <view class="page-service">
    <view class="page-service__header">
      <view class="page-service__search-box">
        <AppIcon class="page-service__search-icon" color="#94a3b8" name="search" size="18" />
        <AppField
          v-model="searchKeyword"
          class="page-service__search-input-wrap"
          :border="false"
          custom-style="height: 72rpx; min-height: 72rpx; padding: 0; border: none; background: transparent;"
          input-mode="search"
          placeholder="搜索机构 / 服务方向 / 地区"
        />
      </view>

      <AppTabs v-model="activeCategory">
        <AppTab
          v-for="category in categories"
          :key="category.key"
          :name="category.key"
          :title="category.label"
        >
          <scroll-view class="page-service__scroll" scroll-y>
            <view class="page-service__filter-panel">
              <scroll-view class="page-service__filter-scroll" scroll-x>
                <view class="page-service__filter-row">
                  <text
                    v-for="option in regionOptions"
                    :key="option"
                    class="page-service__chip"
                    :class="{ 'page-service__chip--active': activeRegion === option }"
                    @tap="activeRegion = option"
                  >{{ option }}</text>
                </view>
              </scroll-view>

              <scroll-view class="page-service__filter-scroll" scroll-x>
                <view class="page-service__filter-row">
                  <text
                    v-for="option in certOptions"
                    :key="option"
                    class="page-service__chip page-service__chip--muted"
                    :class="{ 'page-service__chip--active': activeCert === option }"
                    @tap="activeCert = option"
                  >{{ option }}</text>
                </view>
              </scroll-view>
            </view>

            <AppList :finished="!isLoading" :finished-text="getFinishedText(category.key)" :loading="isLoading">
              <view
                v-for="inst in getInstitutionsByCategory(category.key)"
                :key="inst.id"
                class="institution-card"
              >
                <view class="institution-card__head">
                  <view class="institution-card__avatar" :style="{ background: inst.iconBg }">
                    <AppIcon :color="inst.iconColor" :name="inst.iconName" size="22" />
                  </view>
                  <view class="institution-card__main">
                    <text class="institution-card__name">{{ inst.name }}</text>
                    <view class="institution-card__certs">
                      <text v-for="cert in inst.certs" :key="cert" class="institution-card__cert">{{ cert }}</text>
                    </view>
                    <text class="institution-card__meta">{{ inst.location }} · {{ inst.desc }}</text>
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

                <view class="institution-card__actions">
                  <AppButton
                    block
                    plain
                    preset="action"
                    size="small"
                    text="立即咨询"
                    type="default"
                    @click="goConsult"
                  />
                  <AppButton
                    block
                    preset="action"
                    size="small"
                    text="查看详情"
                    type="info"
                    @click="goDetail(inst.id)"
                  />
                </view>
              </view>
            </AppList>
          </scroll-view>
        </AppTab>
      </AppTabs>
    </view>

  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import * as institutionService from '@/services/api/institution'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showFailToast } from '@/services/ui/toast'

type ServiceCategory = 'certification' | 'measure' | 'standard' | 'consult' | 'training' | 'all'
type RegionOption = '全国' | '湖南' | '广东' | '北京'
type CertOption = '全部资质' | 'CMA' | 'CNAS' | 'ISO'
type AnyRecord = Record<string, any>

interface ServiceInstitution {
  id: string
  category: ServiceCategory
  name: string
  desc: string
  certs: string[]
  location: string
  region: Exclude<RegionOption, '全国'>
  score: string
  serviceCount: number
  orderCount: string
  avgDays: number
  responseTime: string
  iconName: string
  iconColor: string
  iconBg: string
}

const activeCategory = ref<ServiceCategory>('certification')
const activeRegion = ref<RegionOption>('全国')
const activeCert = ref<CertOption>('全部资质')
const searchKeyword = ref('')
const isLoading = ref(false)
const lastLoadAt = ref(0)
const LOAD_DEDUP_MS = 800

const categories = [
  { key: 'certification', label: '认证认可' },
  { key: 'measure', label: '计量校准' },
  { key: 'standard', label: '标准服务' },
  { key: 'consult', label: '质量咨询' },
  { key: 'training', label: '质量培训' },
] as const

const regionOptions: RegionOption[] = ['全国', '湖南', '广东', '北京']
const certOptions: CertOption[] = ['全部资质', 'CMA', 'CNAS', 'ISO']

const institutions = ref<ServiceInstitution[]>([])

onLoad(() => {
  loadInstitutions()
})

onShow(() => {
  loadInstitutions()
})

function getInstitutionsByCategory(category: ServiceCategory) {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return institutions.value.filter((item) => {
    const matchCategory = item.category === category || item.category === 'all'
    const matchRegion = activeRegion.value === '全国' || item.region === activeRegion.value
    const matchCert = activeCert.value === '全部资质' || item.certs.includes(activeCert.value)
    const matchKeyword =
      !keyword
      || `${item.name} ${item.desc} ${item.location} ${item.region} ${item.certs.join(' ')}`.toLowerCase().includes(keyword)

    return matchCategory && matchRegion && matchCert && matchKeyword
  })
}

function getFinishedText(category: ServiceCategory) {
  return getInstitutionsByCategory(category).length > 0 ? '没有更多机构了' : '暂无机构数据'
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

function resolveRegion(location: string): Exclude<RegionOption, '全国'> {
  if (location.includes('北京')) {
    return '北京'
  }

  if (location.includes('广东') || location.includes('广州') || location.includes('深圳')) {
    return '广东'
  }

  return '湖南'
}

function normalizeInstitution(source: unknown, index: number): ServiceInstitution {
  const id = toText(pickValue(source, [['id'], ['enterpriseId'], ['enterpriseID'], ['companyId']])) || `inst-${index + 1}`
  const name = toText(pickValue(source, [['name'], ['shortName'], ['enterpriseName'], ['companyName'], ['company']])) || '未命名机构'
  const regionText = toText(pickValue(source, [['region'], ['area'], ['city'], ['province']]))
  const addressText = toText(pickValue(source, [['address']]))
  const location = [regionText, addressText].filter(Boolean).join(' ') || regionText || addressText || '地区待完善'
  const certs = parseCerts(source)
  const scoreValue = toNumber(pickValue(source, [['avgScore'], ['score'], ['rating'], ['rate']]))
  const serviceCount = toNumber(pickValue(source, [['serviceCount'], ['projectCount'], ['serviceNum']]))
    || toText(pickValue(source, [['serviceRange']]))
      .split(/[,\s/|、，；;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .length
  const orderCount = toNumber(pickValue(source, [['orderCount'], ['orders'], ['orderNum']]))
  const avgDays = toNumber(pickValue(source, [['avgDays'], ['cycleDays'], ['serviceDays']]))
  const responseMinutes = toNumber(pickValue(source, [['responseMinutes'], ['responseTimeMinutes']]))
  const responseTime = toText(pickValue(source, [['responseTime'], ['responseDuration']]))
  const desc = toText(pickValue(source, [['introduction'], ['serviceRange'], ['description'], ['intro'], ['profile'], ['summary']])) || '服务能力信息待完善'

  return {
    avgDays: avgDays > 0 ? avgDays : 0,
    category: 'all',
    certs,
    desc,
    iconBg: '#eff6ff',
    iconColor: '#1E61FF',
    iconName: 'institution',
    id,
    location,
    name,
    orderCount: orderCount > 0 ? orderCount.toLocaleString() : '0',
    region: resolveRegion(location),
    responseTime: responseTime || (responseMinutes > 0 ? `${responseMinutes}分钟` : '-'),
    score: scoreValue > 0 ? scoreValue.toFixed(1) : '-',
    serviceCount: serviceCount > 0 ? serviceCount : 0,
  }
}

async function loadInstitutions() {
  const now = Date.now()

  if (isLoading.value) {
    return
  }

  if (now - lastLoadAt.value < LOAD_DEDUP_MS) {
    return
  }

  lastLoadAt.value = now
  isLoading.value = true

  try {
    const response = await institutionService.getList({
      keyword: undefined,
      page: 1,
      region: undefined,
      size: 100,
      type: undefined,
    })
    const records = extractList(response)

    if (records.length === 0) {
      return
    }

    institutions.value = records.map((item, index) => normalizeInstitution(item, index))
  } catch (error) {
    showFailToast(getErrorMessage(error, '机构列表加载失败'))
  } finally {
    isLoading.value = false
  }
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
.page-service {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-service__header {
  flex: 1;
  min-height: 0;
  padding: 20rpx 32rpx 0;
  background: linear-gradient(180deg, #dfeeff 0%, #ecf5ff 280rpx, #f8fafc 280rpx, #f8fafc 100%);
}

.page-service__search-box {
  height: 72rpx;
  min-height: 72rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.page-service__search-icon {
  flex-shrink: 0;
  margin-right: 10rpx;
}

.page-service__search-input-wrap {
  flex: 1;
}

:deep(.page-service__search-input-wrap .van-field__control),
:deep(.page-service__search-input-wrap .app-field__control) {
  height: 72rpx;
  min-height: 72rpx;
  padding: 0;
  font-size: 24rpx;
  color: #0f172a;
}

:deep(.page-service__search-input-wrap .app-field) {
  border: none;
  background: transparent;
  box-shadow: none;
}

.page-service__header :deep(.app-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-service__header :deep(.app-tabs__nav) {
  padding-bottom: 8rpx;
  border-bottom-color: #dbe3ef;
}

.page-service__header :deep(.app-tabs__nav--wrap) {
  padding-bottom: 0;
  row-gap: 6rpx;
}

.page-service__header :deep(.app-tabs__nav-item) {
  padding: 6rpx 0 12rpx;
  background: transparent;
  color: #64748b;
}

.page-service__header :deep(.app-tabs__nav-item--active) {
  background: transparent;
  color: #0f172a;
  box-shadow: none;
}

.page-service__header :deep(.app-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin: 12rpx -32rpx 0;
  padding: 24rpx 32rpx 0;
  background: #f8fafc;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
}

.page-service__scroll {
  height: 100%;
  padding: 8rpx 0 24rpx;
  box-sizing: border-box;
}

.page-service__filter-panel {
  margin-bottom: 20rpx;
}

.page-service__filter-scroll {
  white-space: nowrap;
}

.page-service__filter-row {
  display: flex;
  gap: 12rpx;
  padding-bottom: 12rpx;
}

.page-service__chip {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 22rpx;
}

.page-service__chip--muted {
  background: #f1f5f9;
  color: #475569;
}

.page-service__chip--active {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e61ff;
}

.institution-card {
  margin-bottom: 16rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 20rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 3rpx 12rpx rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.institution-card__head {
  display: flex;
  gap: 16rpx;
}

.institution-card__avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.institution-card__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.institution-card__name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.institution-card__certs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.institution-card__cert {
  @include pill-tag(20rpx, 6rpx, 4rpx 12rpx);
  @include pill-tag-tone(#1E61FF, #eff6ff);
}

.institution-card__meta {
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
  border-radius: 12rpx;
  background: #f8fafc;
  padding: 16rpx;
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

.institution-card__actions {
  @include service-card-actions(null, 12rpx);
}
</style>
