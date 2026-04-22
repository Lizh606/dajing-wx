<template>
  <view class="home-page">
    <view class="home-top-shell">
      <view class="home-nav" :style="{ paddingTop: `${safeTop}px` }">
        <view class="home-nav__row">
          <view class="home-nav__brand">
            <image :src="logoUrl" class="home-nav__logo" mode="aspectFit" />
            <text class="home-nav__title">AI质享·质量基础创新中心</text>
          </view>
          <view class="home-nav__actions">
            <view class="home-nav__dot tap-feedback"><AppIcon color="#eff6ff" name="menu" size="18" /></view>
            <view class="home-nav__dot tap-feedback"><AppIcon color="#eff6ff" name="notice" size="18" /></view>
          </view>
        </view>

        <view class="home-hero-stack">
          <view class="home-hero-banner">
            <text class="home-hero-banner__title">{{ heroBanner.title }}</text>
            <text class="home-hero-banner__desc">{{ heroBanner.desc }}</text>
          </view>

          <view class="home-search-panel">
            <AppSearchBarWithButton
              v-model="searchKeyword"
              placeholder="搜索检验检测 / 机构 / 报告"
              @search="handleSearch"
            />

            <view class="home-hotwords">
              <text class="home-hotwords-label">热词：</text>
              <text v-for="word in hotWords" :key="word" class="home-hotword" @tap="quickSearch(word)">
                {{ word }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="home-scroll" scroll-y>
      <view class="home-top-spacer" :style="{ height: `${headerHeight}px` }"></view>

      <view class="home-content">
        <view class="home-card home-card--module">
          <view class="home-card__head">
            <text class="home-card__title">服务分类</text>
            <text class="home-card__more" @tap="toggleMoreModules">{{ showMoreModules ? '收起' : '更多 >' }}</text>
          </view>

          <view class="module-grid">
            <view v-for="item in coreModules" :key="item.title" class="module-item" @tap="item.action">
              <view class="module-item__icon">
                <view class="module-item__icon-core">
                  <AppIcon :color="item.iconColor" :name="item.icon" :size="32" />
                </view>
              </view>
              <text class="module-item__name">{{ item.title }}</text>
            </view>
          </view>

          <view v-if="showMoreModules" class="module-grid module-grid--extra">
            <view v-for="item in extraModules" :key="item.title" class="module-item" @tap="item.action">
              <view class="module-item__icon module-item__icon--extra">
                <AppIcon :color="item.iconColor" :name="item.icon" :size="28" />
              </view>
              <text class="module-item__name">{{ item.title }}</text>
            </view>
          </view>
        </view>

        <view class="home-card">
          <view class="home-card__head">
            <text class="home-card__title">需求大厅</text>
            <view class="demand-add-btn" @tap="goPublishDemand">
              <AppIcon color="#1E61FF" name="plus" size="18" />
            </view>
          </view>

          <view class="demand-list">
            <view
              v-for="item in demandList"
              :key="item.id"
              class="demand-card"
              :class="`demand-card--${getDemandStatusTone(item.statusCode)}`"
              @tap="goDemandDetail(item)"
            >
              <view class="demand-card__head">
                <text class="demand-card__title">{{ item.title }}</text>
                <text class="demand-card__budget">{{ item.budget }}</text>
              </view>
              <view class="demand-card__meta-row">
                <view class="demand-card__meta-item">
                  <AppIcon class="demand-card__meta-icon" color="#94a3b8" name="location" size="13" />
                  <text class="demand-card__meta-text">{{ item.city }}</text>
                </view>
                <view class="demand-card__meta-item">
                  <AppIcon class="demand-card__meta-icon" color="#94a3b8" name="time" size="13" />
                  <text class="demand-card__meta-text">{{ item.time }}</text>
                </view>
              </view>
              <view class="demand-card__tags">
                <view class="demand-card__status-pill">
                  <view :class="['demand-card__status-dot', `demand-card__status-dot--${getDemandStatusTone(item.statusCode)}`]" />
                  <text class="demand-card__status-text">{{ resolveDemandStatusText(item.statusCode) }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="home-card__foot">
            <text class="home-card__count">已有{{ demandTotal }}条需求</text>
            <text class="home-card__link" @tap="goDemandHall">更多</text>
          </view>
        </view>

        <view class="home-card">
          <view class="home-card__head">
            <text class="home-card__title">质量社区</text>
            <text class="home-card__link" @tap="showCommunitySoon">进入社区</text>
          </view>

          <view class="community-list">
            <view v-for="item in communityList" :key="`${item.source}-${item.type}-${item.id}`" class="community-card" @tap="openContentItem(item)">
              <view class="community-card__source">{{ item.publisherName || '质享平台' }}</view>
              <view class="community-card__content">
                <view class="community-card__main">
                  <text class="community-card__title">{{ item.title }}</text>
                </view>
                <view class="community-card__media">
                  <image class="community-card__cover" :src="item.coverUrl" mode="aspectFill" />
                </view>
              </view>
              <view class="community-card__meta-row">
                <text class="community-card__tag" :style="{ color: item.tagColor }">{{ item.tag }}</text>
                <text class="community-card__meta">{{ item.meta }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="home-footer-note">
          <text class="home-footer-note__text">运营单位：湖南大京科技</text>
          <text class="home-footer-note__text">支持单位：株洲市市场监督管理局</text>
          <text class="home-footer-note__text">服务热线：18012345678</text>
        </view>
      </view>
    </scroll-view>

    <view class="home-float" @tap="showCommunitySoon">
      <AppIcon class="home-float__icon" color="#ffffff" name="support" size="20" />
      <text class="home-float__text">客服</text>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'
import AppIcon from '@/components/AppIcon/index.vue'
import AppSearchBarWithButton from '@/components/ui/AppSearchBarWithButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import {
  getNewsList,
} from '@/services/api/content'
import { getDemandHall } from '@/services/api/tradeDemand'
import { showAppToast } from '@/services/ui/toast'
import { nextTick, onMounted, ref } from 'vue'

type AnyRecord = Record<string, any>

interface HomeContentCard {
  coverUrl: string
  id: string
  meta: string
  publisherName: string
  source: 'news'
  type: string
  tag: string
  tagColor: string
  title: string
}

interface HomeContentCandidate {
  card: HomeContentCard
  score: number
}

interface HomeDemandCard {
  budget: string
  city: string
  id: string
  statusCode: number
  time: string
  title: string
}
type HomeQuickServiceType = '检验检测' | '认证认可' | '计量服务' | '标准服务' | '质量诊断' | '质量培训'

const HOME_SERVICE_TYPE_FILTER_STORAGE_KEY = 'institution:list:quick-service-type'

const searchKeyword = ref('')
const safeTop = ref(0)
const headerHeight = ref(0)
const showMoreModules = ref(false)

safeTop.value = getStatusBarHeight()

function getStatusBarHeight() {
  // #ifdef MP-WEIXIN
  return uni.getWindowInfo().statusBarHeight ?? 0
  // #endif

  return 0
}

function syncHeaderHeight() {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query
      .select('.home-top-shell')
      .boundingClientRect((rect) => {
        if (!rect || Array.isArray(rect)) {
          return
        }

        if (typeof rect.height === 'number') {
          headerHeight.value = rect.height
        }
      })
      .exec()
  })
}

onMounted(() => {
  syncHeaderHeight()
  loadHomeContent()
  loadDemandHall()
})

const hotWords = ['计量', '大京', '认证认可', '2026质检政策']

const heroBanner = ref({
  desc: '一站式质量基础服务协作平台',
  title: '质量服务，智享未来',
})

function switchToServiceTabWithType(type: HomeQuickServiceType, message?: string) {
  uni.setStorageSync(HOME_SERVICE_TYPE_FILTER_STORAGE_KEY, type)
  uni.switchTab({ url: '/pages/institution/list' })

  if (!message) {
    return
  }

  showAppToast({ message, icon: 'none' })
}

const coreModules: Array<{ action: () => void; icon: string; iconColor: string; title: string }> = [
  {
    title: '检验检测',
    icon: 'lab-fill',
    iconColor: '#1E61FF',
    action: () => switchToServiceTabWithType('检验检测'),
  },
  {
    title: '认证认可',
    icon: 'certification-fill',
    iconColor: '#4f46e5',
    action: () => switchToServiceTabWithType('认证认可'),
  },
  {
    title: '计量服务',
    icon: 'analysis-fill',
    iconColor: '#0f766e',
    action: () => switchToServiceTabWithType('计量服务'),
  },
  {
    title: '标准化',
    icon: 'standard-fill',
    iconColor: '#c2410c',
    action: () => switchToServiceTabWithType('标准服务'),
  },
]

const extraModules: Array<{ action: () => void; icon: string; iconColor: string; title: string }> = [
  {
    title: '商城',
    icon: 'goods-fill',
    iconColor: '#1E61FF',
    action: () => uni.navigateTo({ url: '/pages/mall/index' }),
  },
  {
    title: '质量培训',
    icon: 'training-fill',
    iconColor: '#0F766E',
    action: () => switchToServiceTabWithType('质量培训', '已进入服务页，可筛选质量培训模块'),
  },
  {
    title: '质量诊断',
    icon: 'consult-fill',
    iconColor: '#B45309',
    action: () => switchToServiceTabWithType('质量诊断', '已进入服务页，可筛选质量诊断模块'),
  },
  {
    title: '数据报告',
    icon: 'report-fill',
    iconColor: '#1F2937',
    action: showCommunitySoon,
  },
]

const demandTotal = ref(0)
const demandList = ref<HomeDemandCard[]>([])
const communityList = ref<HomeContentCard[]>([])

const COMMUNITY_COVER_POOL = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=800&q=80',
]

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
    return '最新更新'
  }

  const matched = text.match(/\d{4}-\d{2}-\d{2}/)
  if (matched) {
    return matched[0]
  }

  return text
}

function parseDateScore(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? value : value * 1000
  }

  const text = toText(value)
  if (!text) {
    return 0
  }

  const normalized = text.replace(/\./g, '-').replace(/\//g, '-').replace(/年|月/g, '-').replace(/日/g, '')
  const timestamp = Date.parse(normalized)
  if (Number.isFinite(timestamp)) {
    return timestamp
  }

  const matched = text.match(/\d{4}-\d{2}-\d{2}/)
  if (!matched) {
    return 0
  }

  const fallback = Date.parse(matched[0])
  return Number.isFinite(fallback) ? fallback : 0
}

function compareContentCandidate(a: HomeContentCandidate, b: HomeContentCandidate) {
  if (a.score !== b.score) {
    return b.score - a.score
  }

  const aKey = `${a.card.source}-${a.card.type}-${a.card.id}`
  const bKey = `${b.card.source}-${b.card.type}-${b.card.id}`
  return aKey.localeCompare(bKey)
}

function resolveNewsType(value: unknown) {
  const text = toText(value).toLowerCase()
  if (text) {
    return text
  }

  return 'news'
}

function resolveNewsArticleType(value: unknown): 1 | 2 {
  const text = toText(value).toLowerCase()
  if (text === '1' || text === 'knowledge' || text === '知识库') {
    return 1
  }

  return 2
}

function resolveCommunityCoverUrl(record: AnyRecord, index: number) {
  const coverUrl = toText(record.coverUrl || record.coverurl)
  if (coverUrl) {
    return coverUrl
  }

  return COMMUNITY_COVER_POOL[index % COMMUNITY_COVER_POOL.length] || ''
}

function toNewsCandidates(records: AnyRecord[]) {
  const candidates = records.map<HomeContentCandidate>((record, index) => {
    const publishValue = record.publishTime || record.updateTime || record.createTime
    const subtitle = toText(record.subtitle)
    const dateText = pickDateText(publishValue)
    const articleType = resolveNewsArticleType(record.articleType || record.type)
    const meta = [subtitle, dateText].filter(Boolean).join(' · ') || dateText

    return {
      card: {
        coverUrl: resolveCommunityCoverUrl(record, index),
        id: toText(record.id) || `${resolveNewsType(record.type)}-${index + 1}`,
        meta,
        publisherName: toText(record.publisherName) || '质享平台',
        source: 'news',
        type: resolveNewsType(record.type),
        tag: toText(record.tag) || (articleType === 1 ? '知识库' : '资讯'),
        tagColor: articleType === 1 ? '#1E61FF' : '#b45309',
        title: toText(record.title) || (articleType === 1 ? '质量知识文章' : '质量资讯'),
      },
      score: parseDateScore(publishValue),
    }
  })

  return candidates.sort(compareContentCandidate)
}

function resolveNewsRecords(newsData: unknown): AnyRecord[] {
  if (Array.isArray(newsData)) {
    return newsData.filter((item): item is AnyRecord => isObject(item))
  }

  if (!isObject(newsData)) {
    return []
  }

  const records: AnyRecord[] = []
  for (const value of Object.values(newsData)) {
    if (!Array.isArray(value)) {
      continue
    }

    for (const item of value) {
      if (isObject(item)) {
        records.push(item)
      }
    }
  }

  return records
}

function extractRecords<T>(pageData: unknown): T[] {
  if (Array.isArray(pageData)) {
    return pageData as T[]
  }

  if (!isObject(pageData)) {
    return []
  }

  if (Array.isArray(pageData.records)) {
    return pageData.records as T[]
  }

  return []
}

function resolveDemandRecords(pageData: unknown): AnyRecord[] {
  const records = extractRecords<AnyRecord>(pageData)
  if (records.length > 0) {
    return records
  }

  if (!isObject(pageData)) {
    return []
  }

  const candidates = [
    pageData.list,
    pageData.items,
    pageData.data,
    pageData.result,
    pageData.data?.records,
    pageData.result?.records,
    pageData.data?.list,
    pageData.result?.list,
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is AnyRecord => isObject(item))
    }
  }

  return []
}

function resolveDemandId(value: unknown) {
  if (!isObject(value)) {
    return ''
  }

  return toText(value.id || value.demandId || value.data?.id || value.data?.demandId || value.result?.id || value.result?.demandId)
}

function resolveDemandBudget(value: unknown) {
  const amount = toNumber(value)
  if (amount > 0) {
    return `¥${amount.toLocaleString()}`
  }

  const text = toText(value)
  return text || '面议'
}

function resolveDemandStatusCode(value: unknown) {
  return toNumber(value)
}

function resolveDemandStatusText(value: unknown) {
  const code = resolveDemandStatusCode(value)

  if (code === 0) {
    return '待报价'
  }

  if (code === 1) {
    return '报价中'
  }

  if (code === 2) {
    return '已成交'
  }

  if (code === 3) {
    return '检测中'
  }

  if (code === 4) {
    return '已完成'
  }

  if (code === 5) {
    return '已关闭'
  }

  return '进行中'
}

function getDemandStatusTone(statusCode: number) {
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

function resolveDemandTotal(pageData: unknown) {
  if (!isObject(pageData)) {
    return 0
  }

  return toNumber(pageData.total || pageData.data?.total || pageData.result?.total)
}

async function loadDemandHall() {
  try {
    const hallData = await getDemandHall({
      page: 1,
      size: 3,
    })
    const records = resolveDemandRecords(hallData)

    if (records.length === 0) {
      demandList.value = []
      demandTotal.value = 0
      return
    }

    const cards = records.map<HomeDemandCard>((item, index) => ({
      budget: resolveDemandBudget(item.budgetAmount || item.budgetMax || item.budget),
      city: toText(item.region || item.city || item.contactAddress) || '全国',
      id: resolveDemandId(item) || `demand-${index + 1}`,
      statusCode: resolveDemandStatusCode(item.status),
      time: pickDateText(item.publishTime || item.createdAt || item.createTime) || '最新发布',
      title: toText(item.title || item.sampleName || item.demandTitle) || `检测需求 #${index + 1}`,
    }))

    demandList.value = cards
    const total = resolveDemandTotal(hallData)
    demandTotal.value = total > 0 ? total : cards.length
  } catch {
    demandList.value = []
    demandTotal.value = 0
  }
}

async function loadHomeContent() {
  try {
    const newsData = await getNewsList({ eachSize: 3 })
    const records = resolveNewsRecords(newsData)
    const cards = toNewsCandidates(records)
      .slice(0, 3)
      .map((candidate) => candidate.card)

    if (cards.length > 0) {
      communityList.value = cards
      return
    }

    communityList.value = []
  } catch {
    communityList.value = []
  }
}

function goDetection() {
  uni.navigateTo({ url: '/pages/detection/index' })
}

function handleSearch() {
  goDetection()
}

function quickSearch(word: string) {
  searchKeyword.value = word
  handleSearch()
}

function toggleMoreModules() {
  showMoreModules.value = !showMoreModules.value
  syncHeaderHeight()
}

function goPublishDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/demand/publish' })
}

function goDemandDetail(item?: HomeDemandCard) {
  const id = item?.id?.trim()
  if (id) {
    uni.navigateTo({ url: `/pages/demand/detail?id=${encodeURIComponent(id)}` })
    return
  }

  uni.navigateTo({ url: '/pages/demand/detail' })
}

function goDemandHall() {
  uni.navigateTo({ url: '/pages/demand/hall' })
}

function openContentItem(item: HomeContentCard) {
  const articleType = resolveNewsArticleType(item.type)
  const query = [
    `type=${encodeURIComponent(item.type)}`,
    `articleType=${encodeURIComponent(String(articleType))}`,
    `id=${encodeURIComponent(item.id)}`,
    `title=${encodeURIComponent(item.title)}`,
    `tag=${encodeURIComponent(item.tag)}`,
    `meta=${encodeURIComponent(item.meta)}`,
  ].join('&')
  uni.navigateTo({ url: `/pages/community/detail?${query}` })
}

function showCommunitySoon() {
  showAppToast({ message: '社区能力建设中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.home-top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: linear-gradient(180deg, #3a72e8 0%, #5d93f9 32%, #9ec2ff 66%, #edf5ff 90%, #f8fbff 100%);
  border-bottom: none;
  box-shadow: 0 10rpx 22rpx rgba(15, 23, 42, 0.06);
}

.home-top-spacer {
  width: 100%;
  flex-shrink: 0;
}

.home-nav {
  padding: 0 24rpx 12rpx;
}

.home-nav__row {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.home-nav__brand {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.home-nav__logo {
  width: 68rpx;
  height: 68rpx;
  flex-shrink: 0;
}

.home-nav__title {
  color: #f8fbff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.25;
  text-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.22);
}

.home-nav__actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.home-nav__dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.32);
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fbff;
  font-size: 20rpx;
}

.home-hero-stack {
  margin-top: 8rpx;
  padding: 6rpx 0 14rpx;
}

.home-hero-banner {
  padding: 8rpx 2rpx 0;
}

.home-hero-banner__title {
  display: block;
  margin-top: 0;
  color: #ffffff;
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 4rpx 12rpx rgba(10, 42, 110, 0.2);
}

.home-hero-banner__desc {
  display: block;
  margin-top: 8rpx;
  color: rgba(241, 245, 249, 0.95);
  font-size: 30rpx;
}

.home-search-panel {
  margin-top: 14rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(219, 234, 254, 0.92);
  padding: 14rpx 16rpx 12rpx;
  box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.04);
}

.home-hotwords {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
}

.home-hotwords-label {
  color: #7c8ea8;
  font-size: 22rpx;
}

.home-hotword {
  color: #2d6dff;
  font-size: 22rpx;
  font-weight: 600;
}

.home-scroll {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

.home-content {
  padding: 12rpx 24rpx 24rpx;
}

.home-card {
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(226, 232, 240, 0.84);
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
  padding: 24rpx;
  margin-bottom: 18rpx;
}

.home-card--module {
  margin-top: 0;
  border-color: #dce9ff;
}

.home-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.demand-add-btn {
  width: 64rpx;
  height: 64rpx;
  min-width: 64rpx;
  min-height: 64rpx;
  border-radius: 22rpx;
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.home-card__title {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.35;
}

.home-card__more,
.home-card__link {
  color: #1E61FF;
  font-size: 24rpx;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16rpx;
}

.module-grid--extra {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #f1f5f9;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.module-item__icon {
  width: auto;
  height: auto;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  box-shadow: none;
}

.module-item__icon-core {
  width: auto;
  height: auto;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  box-shadow: none;
}

.module-item__icon--extra {
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.module-item__name {
  margin-top: 10rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
  text-align: center;
}

.demand-list,
.community-list {
  display: grid;
  gap: 16rpx;
}

.demand-card {
  position: relative;
  overflow: hidden;
  border-radius: 20rpx;
  border: 1rpx solid #cfdeef;
  background: linear-gradient(165deg, #f8fbff 0%, #f1f6ff 100%);
  padding: 22rpx;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05), inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.demand-card:active {
  transform: translateY(1rpx);
  box-shadow: 0 12rpx 26rpx rgba(15, 23, 42, 0.08), inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.demand-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 8rpx;
  height: 100%;
  border-radius: 0;
  background: #cbd5e1;
}

.demand-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  pointer-events: none;
}

.demand-card--blue {
  background: linear-gradient(165deg, #f6faff 0%, #edf4ff 100%);
}

.demand-card--amber {
  background: linear-gradient(165deg, #fffaf2 0%, #fff5e7 100%);
}

.demand-card--slate {
  background: linear-gradient(165deg, #f8fafc 0%, #f1f5f9 100%);
}

.demand-card--green {
  background: linear-gradient(165deg, #f4fcf8 0%, #ebf9f2 100%);
}

.demand-card--blue::before {
  background: #60a5fa;
}

.demand-card--amber::before {
  background: #f59e0b;
}

.demand-card--slate::before {
  background: #94a3b8;
}

.demand-card--green::before {
  background: #34d399;
}

.demand-card__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.demand-card__budget {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  padding: 0;
  border-radius: 0;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1;
  color: #ff8a00;
  background: transparent;
  box-shadow: none;
}

.demand-card__meta-row {
  position: relative;
  z-index: 1;
  margin-top: 16rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(148, 163, 184, 0.28);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18rpx;
}

.demand-card__tags {
  position: relative;
  z-index: 1;
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12rpx;
}

.community-card {
  border-radius: 18rpx;
  border: 1rpx solid #e9eff7;
  background: #ffffff;
  padding: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.demand-card__title {
  display: block;
  color: #0f172a;
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.34;
}

.demand-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}

.demand-card__meta-icon {
  flex-shrink: 0;
}

.demand-card__meta-text {
  color: #64748b;
  font-size: 21rpx;
  line-height: 1.35;
}

.demand-card__status-pill {
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

.demand-card__status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
}

.demand-card__status-dot--blue {
  background: #1E61FF;
}

.demand-card__status-dot--amber {
  background: #d97706;
}

.demand-card__status-dot--slate {
  background: #64748b;
}

.demand-card__status-dot--green {
  background: #059669;
}

.demand-card__status-text {
  color: #334155;
  font-size: 21rpx;
  line-height: 1;
}

.home-card__foot {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-card__count {
  color: #64748b;
  font-size: 22rpx;
}

.community-card__source {
  color: #6b7280;
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 0.2rpx;
}

.community-card__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
}

.community-card__main {
  min-width: 0;
  flex: 1;
}

.community-card__tag {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: #edf4ff;
  font-size: 20rpx;
  font-weight: 600;
}

.community-card__title {
  display: -webkit-box;
  margin-top: 0;
  color: #1e293b;
  font-size: 31rpx;
  font-weight: 600;
  line-height: 1.42;
  min-height: 86rpx;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.community-card__meta-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.community-card__meta {
  min-width: 0;
  color: #94a3b8;
  font-size: 21rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.community-card__cover {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.community-card__media {
  width: 178rpx;
  height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 1rpx solid #e5ecf5;
  flex-shrink: 0;
}

.home-footer-note {
  margin: 8rpx 0 12rpx;
  text-align: center;
  display: grid;
  gap: 6rpx;
}

.home-footer-note__text {
  color: #94a3b8;
  font-size: 21rpx;
}

.home-float {
  position: fixed;
  right: 24rpx;
  bottom: 176rpx;
  z-index: 55;
  width: 92rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: #1E61FF;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
}

.home-float__icon {
  line-height: 1;
}

:deep(.home-float__icon .app-icon__image),
:deep(.home-float__icon .app-icon__text) {
  line-height: 1;
}

.home-float__text {
  margin-top: 4rpx;
  font-size: 18rpx;
}
</style>
