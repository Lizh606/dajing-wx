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
            <view class="home-nav__dot">•••</view>
            <view class="home-nav__dot">◎</view>
          </view>
        </view>

        <view class="home-search-row">
          <view class="home-search-box">
            <AppIcon class="home-search-icon" color="#94a3b8" name="search" size="18" />
            <AppField
              v-model="searchKeyword"
              class="home-search-input-wrap"
              :border="false"
              custom-style="height: 72rpx; min-height: 72rpx; padding: 0; border: none; background: transparent;"
              placeholder="搜索服务、需求、文章"
              @confirm="handleSearch"
            />
          </view>
        </view>

        <view class="home-hotwords">
          <text class="home-hotwords-label">热词：</text>
          <text v-for="word in hotWords" :key="word" class="home-hotword" @tap="quickSearch(word)">
            {{ word }}
          </text>
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
              <view class="module-item__icon" :style="{ background: item.bg }">
                <text>{{ item.emoji }}</text>
              </view>
              <text class="module-item__name">{{ item.title }}</text>
            </view>
          </view>

          <view v-if="showMoreModules" class="module-grid module-grid--extra">
            <view v-for="item in extraModules" :key="item.title" class="module-item" @tap="item.action">
              <view class="module-item__icon module-item__icon--extra">
                <text>{{ item.emoji }}</text>
              </view>
              <text class="module-item__name">{{ item.title }}</text>
            </view>
          </view>
        </view>

        <view class="home-card">
          <view class="home-card__head">
            <text class="home-card__title">需求大厅</text>
            <view class="demand-add-btn" @tap="goPublishDemand">
              <AppIcon color="#2563eb" name="plus" size="18" />
            </view>
          </view>

          <view class="demand-list">
            <view v-for="item in demandList" :key="item.id" class="demand-card" @tap="goDemandDetail(item)">
              <text class="demand-card__title">{{ item.title }}</text>
              <text class="demand-card__meta">{{ item.city }} · 预算 {{ item.budget }} · {{ item.time }}</text>
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
            <view v-for="item in communityList" :key="`${item.source}-${item.id}`" class="community-card" @tap="openContentItem(item)">
              <view class="community-card__main">
                <text class="community-card__tag" :style="{ color: item.tagColor }">{{ item.tag }}</text>
                <text class="community-card__title">{{ item.title }}</text>
                <text class="community-card__meta">{{ item.meta }}</text>
              </view>
              <view class="community-card__icon" :style="{ background: item.iconBg }">{{ item.icon }}</view>
            </view>
          </view>
        </view>

        <view class="home-footer-note">
          <text class="home-footer-note__text">支持单位：株洲市市场监督管理局</text>
          <text class="home-footer-note__text">服务热线：18012345678</text>
        </view>
      </view>
    </scroll-view>

    <view class="home-float" @tap="showCommunitySoon">
      <text class="home-float__icon">🎧</text>
      <text class="home-float__text">客服</text>
    </view>

    <AppUiProvider id="app-ui-provider" />

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'
import AppIcon from '@/components/AppIcon/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import {
  getKnowledgeList,
  getPolicyList,
  getStandardList,
} from '@/services/api/content'
import { getDemandHall } from '@/services/api/tradeDemand'
import { showAppToast } from '@/services/ui/toast'
import { nextTick, onMounted, ref } from 'vue'

type AnyRecord = Record<string, any>
type HomeContentSource = 'knowledge' | 'policy' | 'standard' | 'fallback'

interface HomeContentCard {
  icon: string
  iconBg: string
  id: string
  meta: string
  source: HomeContentSource
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
  time: string
  title: string
}

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

const coreModules: Array<{ action: () => void; bg: string; emoji: string; title: string }> = [
  {
    title: '检验检测',
    emoji: '🔬',
    bg: '#ecfeff',
    action: () => uni.navigateTo({ url: '/pages/detection/index' }),
  },
  {
    title: '认证认可',
    emoji: '🏅',
    bg: '#f5f3ff',
    action: () => uni.navigateTo({ url: '/pages/certification/index' }),
  },
  {
    title: '计量服务',
    emoji: '📏',
    bg: '#ecfdf5',
    action: () => uni.switchTab({ url: '/pages/institution/list' }),
  },
  {
    title: '标准化',
    emoji: '📚',
    bg: '#fffbeb',
    action: () => uni.switchTab({ url: '/pages/institution/list' }),
  },
]

const extraModules: Array<{ action: () => void; emoji: string; title: string }> = [
  {
    title: '商城',
    emoji: '🛒',
    action: () => uni.navigateTo({ url: '/pages/mall/index' }),
  },
  {
    title: '质量培训',
    emoji: '🎓',
    action: () => {
      uni.switchTab({ url: '/pages/institution/list' })
      showAppToast({ message: '已进入服务页，可筛选质量培训模块', icon: 'none' })
    },
  },
  {
    title: '质量诊断',
    emoji: '🩺',
    action: () => {
      uni.switchTab({ url: '/pages/institution/list' })
      showAppToast({ message: '已进入服务页，可筛选质量诊断模块', icon: 'none' })
    },
  },
  {
    title: '数据报告',
    emoji: '📊',
    action: showCommunitySoon,
  },
]

const fallbackDemandTotal = 1286
const fallbackDemandList: HomeDemandCard[] = [
  {
    id: 'fallback-demand-1',
    title: '45#钢试棒力学性能检测',
    city: '株洲',
    budget: '¥3,000',
    time: '2小时前',
  },
  {
    id: 'fallback-demand-2',
    title: 'LED灯具出口认证咨询',
    city: '长沙',
    budget: '¥8,000',
    time: '今日',
  },
]
const demandTotal = ref(fallbackDemandTotal)
const demandList = ref<HomeDemandCard[]>([...fallbackDemandList])

const fallbackCommunityList: HomeContentCard[] = [
  {
    id: 'fallback-knowledge',
    source: 'fallback',
    tag: '今日推荐',
    tagColor: '#2563eb',
    title: '2026质量管理体系落地实务经验分享',
    meta: '已阅读 2,368 · 30分钟前更新',
    icon: '📘',
    iconBg: '#eff6ff',
  },
  {
    id: 'fallback-policy',
    source: 'fallback',
    tag: '热门问答',
    tagColor: '#b45309',
    title: 'RoHS 检测一般需要准备哪些送检资料？',
    meta: '38条回答 · 1小时前',
    icon: '❓',
    iconBg: '#fffbeb',
  },
  {
    id: 'fallback-standard',
    source: 'fallback',
    tag: '专家在线',
    tagColor: '#047857',
    title: '材料检测专家张工在线答疑中',
    meta: '擅长金属材料、失效分析、报告解读',
    icon: '👨‍🔬',
    iconBg: '#ecfdf5',
  },
]
const communityList = ref<HomeContentCard[]>([...fallbackCommunityList])

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

function toContentCandidates(records: AnyRecord[], source: Exclude<HomeContentSource, 'fallback'>): HomeContentCandidate[] {
  const candidates = records.map<HomeContentCandidate>((record, index) => {
    if (source === 'knowledge') {
      const updateValue = record.updateTime || record.createTime
      return {
        card: {
          icon: '📘',
          iconBg: '#eff6ff',
          id: toText(record.id) || `knowledge-${index + 1}`,
          meta: `已阅读 ${toNumber(record.viewCount).toLocaleString()} · ${pickDateText(updateValue)}`,
          source: 'knowledge',
          tag: '知识库',
          tagColor: '#2563eb',
          title: toText(record.title) || '质量知识文章',
        },
        score: parseDateScore(updateValue),
      }
    }

    if (source === 'policy') {
      const updateValue = record.issueDate || record.updateTime || record.createTime
      return {
        card: {
          icon: '📄',
          iconBg: '#fffbeb',
          id: toText(record.id) || `policy-${index + 1}`,
          meta: `${toText(record.issueOrg) || '政策发布'} · ${pickDateText(updateValue)}`,
          source: 'policy',
          tag: '政策速递',
          tagColor: '#b45309',
          title: toText(record.title) || '政策解读',
        },
        score: parseDateScore(updateValue),
      }
    }

    const updateValue = record.issueDate || record.implementDate || record.updateTime || record.createTime
    return {
      card: {
        icon: '📐',
        iconBg: '#ecfdf5',
        id: toText(record.id) || `standard-${index + 1}`,
        meta: `${toText(record.standardNo) || toText(record.standardType) || '标准'} · ${pickDateText(updateValue)}`,
        source: 'standard',
        tag: '标准动态',
        tagColor: '#047857',
        title: toText(record.title) || '标准更新',
      },
      score: parseDateScore(updateValue),
    }
  })

  return candidates.sort(compareContentCandidate)
}

function compareContentCandidate(a: HomeContentCandidate, b: HomeContentCandidate) {
  if (a.score !== b.score) {
    return b.score - a.score
  }

  const aKey = `${a.card.source}-${a.card.id}`
  const bKey = `${b.card.source}-${b.card.id}`
  return aKey.localeCompare(bKey)
}

function pickHomeCommunityCards(
  knowledgeCandidates: HomeContentCandidate[],
  policyCandidates: HomeContentCandidate[],
  standardCandidates: HomeContentCandidate[],
) {
  const picked: HomeContentCandidate[] = []
  const pickedKeys = new Set<string>()

  const pickOneFromSource = (candidate?: HomeContentCandidate) => {
    if (!candidate) {
      return
    }

    const key = `${candidate.card.source}-${candidate.card.id}`
    if (pickedKeys.has(key)) {
      return
    }

    picked.push(candidate)
    pickedKeys.add(key)
  }

  pickOneFromSource(knowledgeCandidates[0])
  pickOneFromSource(policyCandidates[0])
  pickOneFromSource(standardCandidates[0])

  const allCandidates = [...knowledgeCandidates, ...policyCandidates, ...standardCandidates]
    .sort(compareContentCandidate)

  for (const candidate of allCandidates) {
    if (picked.length >= 3) {
      break
    }

    const key = `${candidate.card.source}-${candidate.card.id}`
    if (pickedKeys.has(key)) {
      continue
    }

    picked.push(candidate)
    pickedKeys.add(key)
  }

  return picked
    .sort(compareContentCandidate)
    .slice(0, 3)
    .map((candidate) => candidate.card)
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
      demandList.value = [...fallbackDemandList]
      demandTotal.value = fallbackDemandTotal
      return
    }

    const cards = records.map<HomeDemandCard>((item, index) => ({
      budget: resolveDemandBudget(item.budgetAmount || item.budgetMax || item.budget),
      city: toText(item.region || item.city || item.contactAddress) || '全国',
      id: resolveDemandId(item) || `demand-${index + 1}`,
      time: pickDateText(item.publishTime || item.createdAt || item.createTime) || '最新发布',
      title: toText(item.title || item.sampleName || item.demandTitle) || `检测需求 #${index + 1}`,
    }))

    demandList.value = cards
    const total = resolveDemandTotal(hallData)
    demandTotal.value = total > 0 ? total : cards.length
  } catch {
    demandList.value = [...fallbackDemandList]
    demandTotal.value = fallbackDemandTotal
  }
}

async function loadHomeContent() {
  try {
    const perSourceSize = 8
    const [knowledgePage, policyPage, standardPage] = await Promise.all([
      getKnowledgeList({
        category: undefined,
        contentType: undefined,
        keyword: undefined,
        page: 1,
        size: perSourceSize,
      }),
      getPolicyList({
        category: undefined,
        keyword: undefined,
        page: 1,
        region: undefined,
        size: perSourceSize,
      }),
      getStandardList({
        category: undefined,
        keyword: undefined,
        page: 1,
        size: perSourceSize,
        standardType: undefined,
      }),
    ])

    const knowledgeRecords = extractRecords<AnyRecord>(knowledgePage)
    const policyRecords = extractRecords<AnyRecord>(policyPage)
    const standardRecords = extractRecords<AnyRecord>(standardPage)
    const cards = pickHomeCommunityCards(
      toContentCandidates(knowledgeRecords, 'knowledge'),
      toContentCandidates(policyRecords, 'policy'),
      toContentCandidates(standardRecords, 'standard'),
    )

    if (cards.length > 0) {
      communityList.value = cards
    }
  } catch {
    communityList.value = [...fallbackCommunityList]
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
  if (id && !id.startsWith('fallback-')) {
    uni.navigateTo({ url: `/pages/demand/detail?id=${encodeURIComponent(id)}` })
    return
  }

  uni.navigateTo({ url: '/pages/demand/detail' })
}

function goDemandHall() {
  uni.navigateTo({ url: '/pages/demand/hall' })
}

function openContentItem(item: HomeContentCard) {
  if (item.source === 'fallback') {
    showCommunitySoon()
    return
  }

  const query = [
    `source=${encodeURIComponent(item.source)}`,
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
  background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 78%, #eef5ff 100%);
  border-bottom: 1rpx solid #dbeafe;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
}

.home-top-spacer {
  width: 100%;
  flex-shrink: 0;
}

.home-nav {
  padding: 0 24rpx 20rpx;
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
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.25;
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
  border: 1rpx solid #dbeafe;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 20rpx;
}

.home-search-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.home-search-box {
  flex: 1;
  height: 72rpx;
  min-height: 72rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
}

.home-search-icon {
  flex-shrink: 0;
  margin-right: 10rpx;
}

.home-search-input-wrap {
  flex: 1;
}

:deep(.home-search-input-wrap .van-field__control),
:deep(.home-search-input-wrap .app-field__control) {
  height: 72rpx;
  min-height: 72rpx;
  padding: 0;
  font-size: 24rpx;
  color: #0f172a;
}

:deep(.home-search-input-wrap .app-field) {
  border: none;
  background: transparent;
}

.home-hotwords {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18rpx;
}

.home-hotwords-label {
  color: #64748b;
  font-size: 22rpx;
}

.home-hotword {
  color: #2563eb;
  font-size: 22rpx;
}

.home-scroll {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

/* #ifdef H5 */
.home-scroll {
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
}
/* #endif */

.home-content {
  padding: 24rpx;
}

.home-card {
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(226, 232, 240, 0.92);
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.06);
  padding: 24rpx;
  margin-bottom: 18rpx;
}

.home-card--module {
  margin-top: 4rpx;
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
  color: #2563eb;
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
  width: 112rpx;
  height: 112rpx;
  border-radius: 28rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
}

.module-item__icon--extra {
  background: #f8fafc;
}

.module-item__name {
  margin-top: 12rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
}

.demand-list,
.community-list {
  display: grid;
  gap: 14rpx;
}

.demand-card,
.community-card {
  border-radius: 18rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  padding: 20rpx;
}

.demand-card__title {
  display: block;
  color: #1e293b;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.45;
}

.demand-card__meta {
  display: block;
  color: #64748b;
  font-size: 24rpx;
  margin-top: 10rpx;
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

.community-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.community-card__main {
  min-width: 0;
  flex: 1;
}

.community-card__tag {
  display: block;
  font-size: 22rpx;
  font-weight: 600;
}

.community-card__title {
  display: block;
  margin-top: 8rpx;
  color: #1e293b;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.45;
}

.community-card__meta {
  display: block;
  margin-top: 10rpx;
  color: #64748b;
  font-size: 23rpx;
}

.community-card__icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
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
  background: #2563eb;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(37, 99, 235, 0.35);
}

.home-float__icon {
  font-size: 28rpx;
  line-height: 1;
}

.home-float__text {
  margin-top: 4rpx;
  font-size: 18rpx;
}
</style>
