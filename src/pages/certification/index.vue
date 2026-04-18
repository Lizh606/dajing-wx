<template>
  <view class="page-certification">
    <view class="page-certification__header">
      <AppSearchPlaceholder
        placeholder="搜索认证项目、机构名称、认证标准"
      />

      <scroll-view class="page-certification__category-scroll" scroll-x>
        <view class="page-certification__category-row">
          <text
            v-for="category in categories"
            :key="category"
            class="page-certification__category-chip"
            :class="{ 'page-certification__category-chip--active': activeCategory === category }"
            @tap="activeCategory = category"
          >{{ category }}</text>
        </view>
      </scroll-view>

      <view class="page-certification__quick-grid">
        <view class="page-certification__quick-item">
          <text>地区：湖南省 / 株洲市</text>
          <text>⌄</text>
        </view>
        <view class="page-certification__quick-item">
          <text>排序：综合推荐</text>
          <text>⌄</text>
        </view>
        <view class="page-certification__quick-item">
          <text>价格区间</text>
          <text>⌄</text>
        </view>
        <view class="page-certification__quick-item">
          <text>周期筛选</text>
          <text>⌄</text>
        </view>
      </view>
    </view>

    <view class="page-certification__content">
      <scroll-view class="page-certification__scroll" scroll-y>
        <AppList :finished="!isGuideLoading" :finished-text="guideFinishedText" :loading="isGuideLoading">
          <view class="card-grid">
            <view
              v-for="item in getServicesByCategory(activeCategory)"
              :key="item.id"
              class="service-card"
              @tap="goOrder(item)"
            >
              <view class="service-card__media" :style="{ background: item.imgBg }">
                <AppIcon :name="item.iconName" size="36" />
              </view>
              <view class="service-card__body">
                <text class="service-card__title">{{ item.name }}</text>
                <text class="service-card__org">{{ item.org }}</text>
                <view class="service-card__price-row">
                  <text class="service-card__price">¥{{ item.price }}起</text>
                  <text class="service-card__sold">已售 {{ item.sold }}</text>
                </view>
                <view class="service-card__tags">
                  <text
                    v-for="tag in item.tags"
                    :key="tag"
                    class="service-card__tag service-card__tag--cert"
                  >{{ tag }}</text>
                </view>
                <view class="service-card__actions">
                  <AppButton
                    block
                    custom-style="min-height: 60rpx; padding: 0; border-radius: 18rpx; font-size: 22rpx; white-space: nowrap;"
                    plain
                    size="small"
                    text="咨询"
                    type="default"
                    @click.stop="goConsult"
                  />
                  <AppButton
                    block
                    custom-style="min-height: 60rpx; padding: 0; border-radius: 18rpx; font-size: 22rpx; white-space: nowrap;"
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
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import {
  getCertificationAgencyDetail,
  getCertificationAgencyList,
  getCertificationGuideDetail,
  getCertificationGuideList,
  type CertGuide,
  type CertificationAgency,
} from '@/services/api/certification'
import { showFailToast } from '@/services/ui/toast'

type CertificationCategory = string
type AnyRecord = Record<string, any>

interface CertificationService {
  agencyId?: string
  category: string
  fallbackAgencyId?: string
  id: string
  iconName: string
  imgBg: string
  name: string
  org: string
  price: number
  sold: string
  tags: string[]
}

const activeCategory = ref<CertificationCategory>('全部')
const categories = ref<CertificationCategory[]>(['全部', 'CE认证', 'ISO认证', 'CCC认证', '有机认证', '质量管理', '环境管理'])
const isGuideLoading = ref(false)
const guideLoadToken = ref(0)
const isGuideLoadedOnce = ref(false)

const fallbackServices: CertificationService[] = [
  { id: 'fallback-1', category: 'CE认证', name: 'CE认证咨询', org: '深圳华检技术服务', price: 3800, sold: '654', iconName: 'certification', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CE', '欧盟认证'] },
  { id: 'fallback-2', category: 'ISO认证', name: 'ISO 9001认证', org: '北京华质检测技术', price: 5600, sold: '432', iconName: 'quality', imgBg: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)', tags: ['ISO', '质量管理'] },
  { id: 'fallback-3', category: 'CCC认证', name: 'CCC强制认证', org: '中国质量认证中心', price: 4200, sold: '867', iconName: 'success', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CCC', '国内强制'] },
  { id: 'fallback-4', category: '环境管理', name: 'ISO 14001认证', org: '湖南质量认证服务中心', price: 6800, sold: '298', iconName: 'environment', imgBg: 'linear-gradient(135deg,#ecfdf5,#bbf7d0)', tags: ['ISO', '环境管理'] },
  { id: 'fallback-5', category: '有机认证', name: '有机产品认证', org: '中绿华夏有机食品认证', price: 9800, sold: '134', iconName: 'food', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['有机', '食品农业'] },
  { id: 'fallback-6', category: '质量管理', name: 'IATF 16949认证', org: '广州赛宝认证中心', price: 12000, sold: '89', iconName: 'vehicle', imgBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', tags: ['汽车行业', 'IATF'] },
]
const services = ref<CertificationService[]>([...fallbackServices])
const agencyOptions = ref<Array<{ id: string; name: string }>>([])
const guideFinishedText = computed(() => (getServicesByCategory(activeCategory.value).length > 0 ? '没有更多认证服务了' : '暂无认证服务数据'))

onLoad(() => {
  loadCertificationData()
})

onShow(() => {
  if (!isGuideLoadedOnce.value) {
    loadCertificationData()
  }
})

watch(activeCategory, (next, prev) => {
  if (next === prev) {
    return
  }

  loadGuideList(next === '全部' ? undefined : next)
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

function normalizeAgency(item: CertificationAgency, index: number) {
  const id = toText(item.id) || `agency-${index + 1}`
  const name = toText(item.shortName) || toText(item.name) || `认证机构${index + 1}`
  return { id, name }
}

function pickGuideStyle(category: string) {
  if (category.includes('CE')) {
    return { iconName: 'certification', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' }
  }

  if (category.includes('ISO')) {
    return { iconName: 'quality', imgBg: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)' }
  }

  if (category.includes('CCC')) {
    return { iconName: 'success', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' }
  }

  if (category.includes('环境')) {
    return { iconName: 'environment', imgBg: 'linear-gradient(135deg,#ecfdf5,#bbf7d0)' }
  }

  if (category.includes('有机') || category.includes('食品')) {
    return { iconName: 'food', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)' }
  }

  return { iconName: 'vehicle', imgBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' }
}

function resolveGuidePrice(costRange: unknown) {
  const text = toText(costRange)
  const matched = text.match(/\d+(?:\.\d+)?/)
  if (!matched) {
    return 0
  }

  return Number(matched[0])
}

function normalizeGuide(item: CertGuide, index: number): CertificationService {
  const source: AnyRecord = isObject(item) ? (item as AnyRecord) : {}
  const category = toText(source.certType) || '认证服务'
  const id = toText(source.id) || `guide-${index + 1}`
  const agencyId = toText(source.agencyId)
  const fallbackAgency = agencyOptions.value[index % Math.max(agencyOptions.value.length, 1)]
  const agencyName = agencyId
    ? (agencyOptions.value.find((agency) => agency.id === agencyId)?.name || fallbackAgency?.name || '认证服务机构')
    : (fallbackAgency?.name || '认证服务机构')
  const style = pickGuideStyle(category)
  const duration = toText(source.duration)
  const costRange = toText(source.costRange)

  return {
    agencyId: agencyId || undefined,
    category,
    fallbackAgencyId: fallbackAgency?.id,
    id,
    iconName: style.iconName,
    imgBg: style.imgBg,
    name: toText(source.title) || `认证服务${index + 1}`,
    org: agencyName,
    price: resolveGuidePrice(source.costRange),
    sold: '-',
    tags: [category, duration, costRange].filter(Boolean).slice(0, 3),
  }
}

function updateCategoryOptions(guides: CertGuide[]) {
  const dynamic = guides
    .map((guide) => toText(guide.certType))
    .filter(Boolean)
  const merged = ['全部', ...Array.from(new Set(dynamic))]

  categories.value = merged.length > 1 ? merged : ['全部']
  if (!categories.value.includes(activeCategory.value)) {
    activeCategory.value = '全部'
  }
}

async function loadAgencyList() {
  const response = await getCertificationAgencyList({
    keyword: undefined,
    page: 1,
    region: undefined,
    size: 100,
  })
  const records = Array.isArray(response?.records) ? response.records : []
  agencyOptions.value = records.map((item, index) => normalizeAgency(item, index))

  const firstAgency = records[0]
  if (firstAgency?.id !== undefined && firstAgency?.id !== null) {
    try {
      const detail = await getCertificationAgencyDetail(firstAgency.id)
      const detailName = toText(detail.shortName) || toText(detail.name)
      if (detailName && agencyOptions.value.length > 0) {
        agencyOptions.value[0] = {
          ...agencyOptions.value[0],
          name: detailName,
        }
      }
    } catch {
      // ignore detail preload error
    }
  }
}

async function loadGuideList(certType?: string) {
  const token = Date.now()
  guideLoadToken.value = token
  isGuideLoading.value = true

  try {
    const guides = await getCertificationGuideList(certType)
    if (guideLoadToken.value !== token) {
      return
    }

    if (Array.isArray(guides) && guides.length > 0) {
      updateCategoryOptions(guides)
      services.value = guides.map((item, index) => normalizeGuide(item, index))
      isGuideLoadedOnce.value = true
      return
    }

    services.value = []
  } catch (error) {
    if (guideLoadToken.value === token) {
      showFailToast(getErrorMessage(error, '认证服务加载失败，已展示本地数据'))
      services.value = [...fallbackServices]
    }
  } finally {
    if (guideLoadToken.value === token) {
      isGuideLoading.value = false
    }
  }
}

async function loadCertificationData() {
  try {
    await loadAgencyList()
  } catch (error) {
    showFailToast(getErrorMessage(error, '认证机构列表加载失败，已展示本地数据'))
  }

  await loadGuideList(activeCategory.value === '全部' ? undefined : activeCategory.value)
}

function getServicesByCategory(category: CertificationCategory) {
  if (category === '全部') {
    return services.value
  }

  return services.value.filter((service) => service.category === category)
}

async function goOrder(item: CertificationService) {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  let serviceName = item.name

  try {
    const guideDetail = await getCertificationGuideDetail(item.id)
    serviceName = toText(guideDetail.title) || serviceName
  } catch {
    // ignore guide detail prefetch error
  }

  const agencyDetailId = item.agencyId || item.fallbackAgencyId
  if (agencyDetailId) {
    try {
      const agencyDetail = await getCertificationAgencyDetail(agencyDetailId)
      const agencyName = toText(agencyDetail.shortName) || toText(agencyDetail.name)
      if (agencyName && !serviceName.includes(agencyName)) {
        serviceName = `${serviceName}（${agencyName}）`
      }
    } catch {
      // ignore agency detail prefetch error
    }
  }

  const params = [
    `service=${encodeURIComponent(serviceName)}`,
    `institutionName=${encodeURIComponent(item.org)}`,
  ]

  if (agencyDetailId) {
    params.push(`institutionId=${encodeURIComponent(String(agencyDetailId))}`)
  }

  uni.navigateTo({ url: `/pages/order/create?${params.join('&')}` })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}
</script>

<style scoped lang="scss">
.page-certification {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-certification__header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  padding: 20rpx 24rpx 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.page-certification__header :deep(.app-search-placeholder) {
  margin-bottom: 16rpx;
}

.page-certification__category-scroll {
  margin-bottom: 12rpx;
  white-space: nowrap;
}

.page-certification__category-row {
  display: flex;
  gap: 10rpx;
  padding-bottom: 8rpx;
}

.page-certification__category-chip {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 21rpx;
}

.page-certification__category-chip--active {
  background: #2563eb;
  color: #ffffff;
}

.page-certification__quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.page-certification__quick-item {
  min-height: 56rpx;
  padding: 0 16rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  background: #ffffff;
  color: #64748b;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-certification__content {
  flex: 1;
  min-height: 0;
}

.page-certification__scroll {
  height: 100%;
  padding: 16rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.card-grid {
  @include service-card-grid(0, 12rpx);
}

.service-card {
  @include service-card-shell(24rpx);
  border: 1rpx solid #f1f5f9;
}

.service-card__media {
  @include service-card-media(180rpx);
}

.service-card__body {
  @include service-card-body(20rpx);
}

.service-card__title {
  @include service-card-title(26rpx, 1.4);
}

.service-card__org {
  @include service-card-org(22rpx, #64748b, 6rpx);
}

.service-card__price-row {
  @include service-card-price-row(12rpx);
}

.service-card__price {
  @include service-card-price(28rpx);
}

.service-card__sold {
  @include service-card-sold(20rpx);
}

.service-card__tags {
  @include service-card-tags(12rpx, null, 8rpx);
}

.service-card__tag {
  @include service-card-tag(20rpx, 8rpx, 4rpx 12rpx);
}

.service-card__tag--cert {
  background: #fef3c7;
  color: #92400e;
}

.service-card__actions {
  @include service-card-actions(8rpx, 12rpx);
}
</style>
