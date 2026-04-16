<template>
  <view class="page-service">
    <view class="page-service__header">
      <AppSearchPlaceholder
        custom-style="padding: 16rpx 24rpx;"
        placeholder="搜索机构 / 服务方向 / 地区"
        shape="pill"
        size="lg"
        text-size="28rpx"
        tone="light"
      />

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

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import { enterpriseService } from '@/services/api'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
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

const fallbackInstitutions: ServiceInstitution[] = [
  { id: '1', category: 'certification', name: '北京华质认证中心', desc: '体系认证与产品认证服务', certs: ['ISO', 'CNAS'], location: '北京市朝阳区', region: '北京', score: '4.9', serviceCount: 86, orderCount: '1,324', avgDays: 5, responseTime: '10分钟', iconName: 'certification', iconColor: '#b88913', iconBg: '#fffbeb' },
  { id: '2', category: 'certification', name: '深圳华检技术服务', desc: '出口认证与合规辅导', certs: ['ISO', 'CNAS'], location: '广东省深圳市', region: '广东', score: '4.8', serviceCount: 74, orderCount: '986', avgDays: 6, responseTime: '12分钟', iconName: 'quality', iconColor: '#6d28d9', iconBg: '#f5f3ff' },
  { id: '3', category: 'measure', name: '湖南计量测试研究院', desc: '仪器设备计量校准', certs: ['CNAS', 'CMA'], location: '湖南省长沙市', region: '湖南', score: '4.8', serviceCount: 92, orderCount: '1,102', avgDays: 4, responseTime: '15分钟', iconName: 'standard', iconColor: '#2563eb', iconBg: '#eff6ff' },
  { id: '4', category: 'measure', name: '广州计量校准中心', desc: '电学与力学计量服务', certs: ['CNAS'], location: '广东省广州市', region: '广东', score: '4.7', serviceCount: 68, orderCount: '845', avgDays: 3, responseTime: '18分钟', iconName: 'electric', iconColor: '#d97706', iconBg: '#fff7ed' },
  { id: '5', category: 'standard', name: '中标标准信息中心', desc: '标准检索与标准解读', certs: ['ISO'], location: '北京市海淀区', region: '北京', score: '4.7', serviceCount: 58, orderCount: '642', avgDays: 2, responseTime: '8分钟', iconName: 'book', iconColor: '#2563eb', iconBg: '#eff6ff' },
  { id: '6', category: 'standard', name: '湖南标准服务平台', desc: '标准编制与标准咨询', certs: ['ISO'], location: '湖南省株洲市', region: '湖南', score: '4.6', serviceCount: 47, orderCount: '388', avgDays: 3, responseTime: '20分钟', iconName: 'document', iconColor: '#059669', iconBg: '#ecfdf5' },
  { id: '7', category: 'consult', name: '质量管理咨询事务所', desc: '体系诊断与流程优化', certs: ['ISO'], location: '北京市丰台区', region: '北京', score: '4.8', serviceCount: 63, orderCount: '517', avgDays: 4, responseTime: '15分钟', iconName: 'analysis', iconColor: '#5b6ad0', iconBg: '#eef2ff' },
  { id: '8', category: 'consult', name: '大京质量咨询服务', desc: '合规与专项提升咨询', certs: ['ISO', 'CMA'], location: '湖南省株洲市', region: '湖南', score: '4.7', serviceCount: 55, orderCount: '463', avgDays: 5, responseTime: '12分钟', iconName: 'service', iconColor: '#0f766e', iconBg: '#ecfeff' },
  { id: '9', category: 'training', name: '实验室能力培训中心', desc: '内审员与实验室专题课程', certs: ['CMA', 'CNAS'], location: '湖南省长沙市', region: '湖南', score: '4.9', serviceCount: 41, orderCount: '726', avgDays: 1, responseTime: '5分钟', iconName: 'training', iconColor: '#b45309', iconBg: '#fef3c7' },
  { id: '10', category: 'training', name: '质量工程师学院', desc: '标准解读与岗位提升课程', certs: ['ISO'], location: '广东省深圳市', region: '广东', score: '4.8', serviceCount: 39, orderCount: '602', avgDays: 1, responseTime: '6分钟', iconName: 'book', iconColor: '#0f8fb0', iconBg: '#ecfeff' },
]

const institutions = ref<ServiceInstitution[]>([...fallbackInstitutions])

onLoad(() => {
  loadInstitutions()
})

onShow(() => {
  loadInstitutions()
})

function getInstitutionsByCategory(category: ServiceCategory) {
  return institutions.value.filter((item) => {
    const matchCategory = item.category === category || item.category === 'all'
    const matchRegion = activeRegion.value === '全国' || item.region === activeRegion.value
    const matchCert = activeCert.value === '全部资质' || item.certs.includes(activeCert.value)
    return matchCategory && matchRegion && matchCert
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
    ['certs'],
    ['certList'],
    ['certNames'],
    ['qualifications'],
    ['certification'],
    ['certificationList'],
  ])

  if (Array.isArray(candidate)) {
    return candidate.map((item) => toText(item)).filter(Boolean).slice(0, 4)
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
  const id = toText(pickValue(source, [['enterpriseId'], ['id'], ['enterpriseID'], ['companyId']])) || `inst-${index + 1}`
  const name = toText(pickValue(source, [['enterpriseName'], ['companyName'], ['company'], ['name']])) || '未命名机构'
  const regionText = toText(pickValue(source, [['region'], ['area'], ['city'], ['province']]))
  const addressText = toText(pickValue(source, [['address']]))
  const location = [regionText, addressText].filter(Boolean).join(' ') || regionText || addressText || '地区待完善'
  const certs = parseCerts(source)
  const scoreValue = toNumber(pickValue(source, [['score'], ['rating'], ['rate']]))
  const serviceCount = toNumber(pickValue(source, [['serviceCount'], ['projectCount'], ['serviceNum']]))
  const orderCount = toNumber(pickValue(source, [['orderCount'], ['orders'], ['orderNum']]))
  const avgDays = toNumber(pickValue(source, [['avgDays'], ['cycleDays'], ['serviceDays']]))
  const responseMinutes = toNumber(pickValue(source, [['responseMinutes'], ['responseTimeMinutes']]))
  const responseTime = toText(pickValue(source, [['responseTime'], ['responseDuration']]))
  const desc = toText(pickValue(source, [['description'], ['intro'], ['profile'], ['summary']])) || '服务能力信息待完善'

  return {
    avgDays: avgDays > 0 ? avgDays : 0,
    category: 'all',
    certs,
    desc,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
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
    const response = await enterpriseService.getList({
      enterpriseType: undefined,
      keyword: '',
      page: 1,
      size: 100,
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
  background: #f0f4f8;
}

.page-service__header {
  flex: 1;
  min-height: 0;
  padding: 20rpx 32rpx 0;
  background: linear-gradient(180deg, #1d4ed8 0%, #2563eb 320rpx, #f0f4f8 320rpx, #f0f4f8 100%);
}

.page-service__header :deep(.app-search-placeholder) {
  margin-bottom: 24rpx;
}

.page-service__header :deep(.app-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-service__header :deep(.app-tabs__nav) {
  padding-bottom: 0;
}

.page-service__header :deep(.app-tabs__nav--wrap) {
  padding-bottom: 12rpx;
}

.page-service__header :deep(.app-tabs__nav-item) {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.88);
}

.page-service__header :deep(.app-tabs__nav-item--active) {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 8rpx 18rpx rgba(15, 23, 42, 0.08);
}

.page-service__header :deep(.app-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin: 12rpx -32rpx 0;
  padding: 24rpx 32rpx 0;
  background: #f0f4f8;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
}

.page-service__scroll {
  height: 100%;
  padding: 8rpx 0 24rpx;
  box-sizing: border-box;
}

/* #ifdef H5 */
.page-service__scroll {
  padding-bottom: calc(144rpx + env(safe-area-inset-bottom));
}
/* #endif */

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
  background: #dbeafe;
  color: #2563eb;
  font-size: 22rpx;
}

.page-service__chip--muted {
  background: #e2e8f0;
  color: #475569;
}

.page-service__chip--active {
  background: #2563eb;
  color: #ffffff;
}

.institution-card {
  margin-bottom: 16rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 20rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.institution-card__main {
  flex: 1;
  min-width: 0;
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
  margin-bottom: 20rpx;
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
