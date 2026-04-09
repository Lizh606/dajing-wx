<template>
  <view class="home-page">
    <view class="home-top-shell">
      <view class="home-nav" :style="{ paddingTop: `${safeTop}px` }">
        <view class="home-nav__bar">
          <view class="home-nav__brand">
            <image :src="logoUrl" class="home-nav__logo" mode="aspectFit" />
            <text class="home-nav__title">AI质享·质量基础创新中心</text>
          </view>

          <!-- <view class="home-nav__actions">
            <view class="home-nav__action" @tap="showComingSoon">
              <AppIcon color="#475569" name="menu" size="18" />
            </view>
            <view class="home-nav__action" @tap="goMessage">
              <AppIcon color="#2563eb" name="message" size="18" />
            </view>
          </view> -->
        </view>
      </view>

      <view class="home-search-section">
        <view class="home-search-card">
          <view class="home-search-row">
            <view class="home-search-box">
              <AppIcon class="home-search-icon" color="#94a3b8" name="search" size="18" />
              <AppField
                v-model="searchKeyword"
                class="home-search-input-wrap"
                :border="false"
                custom-style="border: none; background: transparent;"
                placeholder="搜索检验检测 / 机构 / 报告"
                @confirm="handleSearch"
              />
            </view>
            <AppButton
              custom-style="height: 72rpx; padding: 0 28rpx; border-radius: 24rpx; box-shadow: 0 10rpx 20rpx rgba(37, 99, 235, 0.2);"
              round
              text="搜索"
              type="primary"
              @click="handleSearch"
            />
          </view>

          <view class="home-hotwords">
            <text class="home-hotwords-label">热词：</text>
            <text v-for="word in hotWords" :key="word" class="home-hotword" @tap="quickSearch(word)">
              {{ word }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="home-top-spacer" :style="{ height: `${headerHeight}px` }"></view>

    <view class="content-shell">
      <view class="panel-card entry-panel">
        <view class="entry-grid">
          <view v-for="entry in quickEntries" :key="entry.title" class="entry-item" @tap="entry.action">
            <view class="entry-icon" :style="{ background: entry.bg }">
              <AppIcon :color="entry.iconColor" :name="entry.iconName" size="28" />
            </view>
            <text class="entry-title">{{ entry.title }}</text>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="panel-head">
          <text class="panel-title">需求大厅</text>
          <AppButton
            custom-style="width: 64rpx; min-height: 64rpx; padding: 0; border-radius: 22rpx; background: #eff6ff; color: #2563eb; border: 1rpx solid #bfdbfe;"
            icon="plus"
            plain
            round
            @click="goPublishDemand"
          />
        </view>

        <view class="demand-list">
          <view v-for="item in demandList" :key="item.title" class="demand-card" @tap="goDemandDetail">
            <text class="demand-title">{{ item.title }}</text>
            <text class="demand-meta">{{ item.city }} · 预算 {{ item.budget }} · {{ item.time }}</text>
          </view>
        </view>

        <view class="panel-foot">
          <text class="panel-foot-text">已有 {{ demandTotal }} 条需求</text>
          <text class="panel-foot-link" @tap="goPublishDemand">更多</text>
        </view>
      </view>

      <view class="panel-card community-panel">
        <view class="panel-head-simple">
          <text class="panel-title">质量社区</text>
        </view>

        <view class="community-shell">
          <view class="community-block">
            <view class="community-head">
              <text class="community-title">今日推荐</text>
              <text class="community-link" @tap="showComingSoon">查看全部</text>
            </view>

            <view class="community-list">
              <view
                v-for="item in communityRecommend"
                :key="item.title"
                class="community-item"
                @tap="showComingSoon"
              >
                <view class="community-badge" :class="`community-badge-${item.tone}`">{{ item.badge }}</view>
                <view class="community-copy">
                  <text class="community-item-title">{{ item.title }}</text>
                  <text class="community-item-meta">{{ item.meta }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="community-divider"></view>

          <view class="community-block">
            <view class="community-head">
              <text class="community-title">热门问答</text>
              <text class="community-link" @tap="showComingSoon">我要提问</text>
            </view>

            <view class="qa-list">
              <view v-for="item in qaList" :key="item.title" class="qa-card" @tap="showComingSoon">
                <text class="qa-title">{{ item.title }}</text>
                <text class="qa-meta">{{ item.meta }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="panel-head-simple">
          <text class="panel-title">专家在线</text>
        </view>

        <view class="expert-panel">
          <view class="expert-copy">
            <text class="expert-name">刘工 · 材料检测专家</text>
            <text class="expert-desc">擅长：金属材料、力学性能、失效分析</text>
          </view>
          <AppButton
            custom-style="min-height: 64rpx; padding: 0 26rpx; border-radius: 24rpx;"
            round
            text="预约咨询"
            type="primary"
            @click="goConsult"
          />
        </view>
      </view>

      <view class="panel-card">
        <view class="panel-head-simple">
          <text class="panel-title">服务流程</text>
        </view>

        <view class="process-grid">
          <view v-for="step in steps" :key="step.index" class="process-card">
            <view class="process-index">{{ step.index }}</view>
            <text class="process-title">{{ step.title }}</text>
            <text class="process-desc">{{ step.desc }}</text>
          </view>
        </view>
      </view>

      <view class="footer-note">
        <text class="footer-text">支持单位：株洲市市场监督管理局</text>
        <text class="footer-text">服务热线：18012345678</text>
      </view>
    </view>

    <view class="floating-service" @tap="goConsult">
      <AppIcon color="#ffffff" name="support" size="24" />
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
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppToast } from '@/services/ui/toast'
import { nextTick, onMounted, ref } from 'vue'

interface QuickEntry {
  title: string
  iconName: string
  iconColor: string
  bg: string
  action: () => void
}

const searchKeyword = ref('')
const safeTop = ref(0)
const headerHeight = ref(0)

safeTop.value = getStatusBarHeight()

function getStatusBarHeight() {
  // #ifdef MP-WEIXIN
  return uni.getWindowInfo().statusBarHeight ?? 0
  // #endif
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
})

const hotWords = ['材料检测', '电气安全', 'CNAS', '检测报告']

const quickEntries: QuickEntry[] = [
  {
    title: '检验检测',
    iconName: 'lab',
    iconColor: '#0f8fb0',
    bg: 'linear-gradient(180deg,#ecfeff 0%,#cffafe 100%)',
    action: () => uni.navigateTo({ url: '/pages/detection/index' }),
  },
  {
    title: '数据报告',
    iconName: 'analysis',
    iconColor: '#5b6ad0',
    bg: 'linear-gradient(180deg,#eef2ff 0%,#c7d2fe 100%)',
    action: () => uni.navigateTo({ url: '/pages/report/index' }),
  },
]

const demandList = [
  {
    title: '45#钢试棒力学性能检测',
    city: '株洲',
    budget: '¥3,000',
    time: '2小时前',
  },
  {
    title: 'LED 灯具出口认证咨询',
    city: '长沙',
    budget: '¥8,000',
    time: '今天',
  },
]

const demandTotal = '1286'

const communityRecommend = [
  {
    badge: '政策',
    tone: 'blue',
    title: '湖南省质量服务新规发布，检验检测机构线上受理流程进一步规范',
    meta: '今天 · 2,186 阅读',
  },
  {
    badge: '技术',
    tone: 'violet',
    title: 'RoHS 认证流程详解：企业送检前需要准备哪些文件？',
    meta: '3 小时前 · 986 阅读',
  },
]

const qaList = [
  {
    title: 'CNAS 与 CMA 的适用场景有什么区别？',
    meta: '12 个回答 · 36 人关注 · 分类：检测',
  },
  {
    title: '出口欧盟的 LED 灯具认证一般需要多久？',
    meta: '8 个回答 · 19 人关注 · 分类：认证',
  },
]

const steps = [
  { index: '01', title: '选择服务', desc: '浏览检测服务与机构，快速匹配当前需求。' },
  { index: '02', title: '提交订单', desc: '在线填写委托信息并确认下单。' },
  { index: '03', title: '样品检测', desc: '机构接单后按标准流程执行检测。' },
  { index: '04', title: '获取报告', desc: '在线查看、下载检测结果与报告。' },
]

function handleSearch() {
  uni.navigateTo({ url: '/pages/detection/index' })
}

function quickSearch(word: string) {
  searchKeyword.value = word
  handleSearch()
}

function goPublishDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/demand/publish' })
}

function goDemandDetail() {
  uni.navigateTo({ url: '/pages/demand/detail' })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}

function showComingSoon() {
  showAppToast({ message: '功能开发中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0, #f8fafc 420rpx, #f8fafc 100%);
  padding-bottom: 140rpx;
}

.home-top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
}

.home-top-spacer {
  width: 100%;
  flex-shrink: 0;
}

.home-nav {
  padding: 0 24rpx 8rpx;
}

.home-nav__bar {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.home-nav__brand {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.home-nav__logo {
  width: 68rpx;
  height: 68rpx;
  flex-shrink: 0;
}

.home-nav__title {
  min-width: 0;
  flex: 1;
  color: #0f172a;
  font-size: 32rpx;
  line-height: 1.25;
  font-weight: 700;
}

.home-nav__actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.home-nav__action {
  width: 58rpx;
  height: 58rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-search-section {
  padding: 0 24rpx 18rpx;
}

.home-search-card {
  border-radius: 28rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1rpx solid rgba(219, 234, 254, 0.96);
  box-shadow: 0 14rpx 30rpx rgba(37, 99, 235, 0.08);
  padding: 18rpx;
}

.home-search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.home-search-box {
  flex: 1;
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
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  align-items: center;
}

.home-hotwords-label {
  color: #64748b;
  font-size: 22rpx;
}

.home-hotword {
  color: #2563eb;
  font-size: 22rpx;
}

.content-shell {
  padding: 24rpx;
}

.panel-card {
  margin-top: 20rpx;
  border-radius: 28rpx;
  background: #ffffff;
  border: 1rpx solid rgba(226, 232, 240, 0.92);
  box-shadow: 0 14rpx 34rpx rgba(15, 23, 42, 0.06);
  padding: 24rpx;
}

.entry-panel {
  margin-top: 24rpx;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  text-align: center;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.entry-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-title {
  display: block;
  margin-top: 14rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.panel-head,
.panel-head-simple,
.community-head,
.panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.panel-title,
.community-title {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.35;
}

.demand-list,
.community-list,
.qa-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.demand-card {
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  padding: 22rpx;
}

.demand-title,
.community-item-title,
.qa-title,
.expert-name,
.process-title {
  display: block;
  color: #1e293b;
  font-weight: 600;
}

.demand-title {
  font-size: 28rpx;
  line-height: 1.5;
}

.demand-meta,
.panel-foot-text,
.community-item-meta,
.qa-meta,
.expert-desc,
.process-desc,
.footer-text {
  display: block;
  color: #64748b;
}

.demand-meta,
.panel-foot-text,
.community-item-meta,
.qa-meta,
.footer-text {
  font-size: 22rpx;
}

.demand-meta {
  margin-top: 12rpx;
}

.panel-foot {
  margin-top: 18rpx;
}

.panel-foot-link,
.community-link {
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 600;
}

.community-panel {
  padding-bottom: 0;
}

.community-shell {
  margin-top: 18rpx;
  border-radius: 22rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
}

.community-block {
  padding: 22rpx;
}

.community-item {
  display: flex;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
}

.community-badge {
  width: 88rpx;
  height: 88rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
}

.community-badge-blue {
  background: #eff6ff;
  border: 1rpx solid #dbeafe;
  color: #1d4ed8;
}

.community-badge-violet {
  background: #f5f3ff;
  border: 1rpx solid #ddd6fe;
  color: #7c3aed;
}

.community-copy {
  flex: 1;
  min-width: 0;
}

.community-item-title,
.qa-title {
  font-size: 26rpx;
  line-height: 1.55;
}

.community-item-meta,
.qa-meta {
  margin-top: 8rpx;
  line-height: 1.55;
}

.community-divider {
  height: 1rpx;
  background: #e2e8f0;
}

.qa-card {
  border-radius: 18rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 20rpx;
}

.expert-panel {
  margin-top: 18rpx;
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.expert-copy {
  flex: 1;
  min-width: 0;
}

.expert-name {
  font-size: 28rpx;
  line-height: 1.45;
}

.expert-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.55;
}

.process-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.process-card {
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 20rpx;
}

.process-index {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-title {
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.45;
}

.process-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
}

.footer-note {
  padding: 28rpx 8rpx 10rpx;
}

.footer-text {
  text-align: center;
  line-height: 1.8;
}

.floating-service {
  position: fixed;
  right: 24rpx;
  bottom: 176rpx;
  z-index: 18;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: #2563eb;
  box-shadow: 0 14rpx 30rpx rgba(37, 99, 235, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
