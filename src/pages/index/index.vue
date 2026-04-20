<template>
  <view class="home-page">
    <!-- 沉浸式 Banner 主视觉 -->
    <view class="home-hero" :style="{ paddingTop: `${safeTop}px` }">
      <view class="home-hero__bg">
        <view class="home-hero__orb home-hero__orb--1"></view>
        <view class="home-hero__orb home-hero__orb--2"></view>
        <view class="home-hero__orb home-hero__orb--3"></view>
      </view>

      <view class="home-hero__nav">
        <view class="home-nav__brand">
          <image :src="logoUrl" class="home-nav__logo" mode="aspectFit" />
          <text class="home-nav__title">AI质享·质量基础创新中心</text>
        </view>
      </view>

      <view class="home-hero__slogan">
        <text class="home-hero__slogan-text">质量服务，智享未来</text>
        <text class="home-hero__slogan-sub">一站式质量基础服务创新平台</text>
      </view>

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
            custom-style="width: 160rpx; height: 72rpx; padding: 0; border-radius: 36rpx; font-size: 28rpx; font-weight: 600; box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.3);"
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

    <view class="content-shell">
      <!-- 快捷入口 - 扁平轻量化面性图标 -->
      <view class="panel-card entry-panel">
        <view class="entry-grid entry-grid--multi">
          <view v-for="entry in quickEntries" :key="entry.title" class="entry-item" @tap="entry.action">
            <view class="entry-icon-wrap" :style="{ background: entry.bg }">
              <AppIcon :color="entry.iconColor" :name="entry.iconName" size="26" />
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
          <view
            v-for="item in demandList"
            :key="item.title"
            class="demand-card"
            :class="`demand-card--${item.tone}`"
            @tap="goDemandDetail"
          >
            <view class="demand-card__accent"></view>
            <view class="demand-card__body">
              <view class="demand-card__tags">
                <text class="demand-tag" :class="`demand-tag--${item.tagTone}`">{{ item.tag }}</text>
              </view>
              <text class="demand-title">{{ item.title }}</text>
              <view class="demand-meta-row">
                <text class="demand-meta">{{ item.city }}</text>
                <text class="demand-budget">{{ item.budget }}</text>
                <text class="demand-time">{{ item.time }}</text>
              </view>
            </view>
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
                <view class="community-cover" :style="{ background: item.coverBg }">
                  <AppIcon :color="item.coverIconColor" :name="item.coverIcon" size="32" />
                </view>
                <view class="community-copy">
                  <text class="community-item-title">{{ item.title }}</text>
                  <view class="community-item-bottom">
                    <text class="community-badge-text" :class="`community-badge-text--${item.tone}`">{{ item.badge }}</text>
                    <text class="community-item-meta">{{ item.meta }}</text>
                  </view>
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
                <view class="qa-icon-wrap">
                  <AppIcon color="#2563eb" name="chat" size="18" />
                </view>
                <view class="qa-body">
                  <text class="qa-title">{{ item.title }}</text>
                  <text class="qa-meta">{{ item.meta }}</text>
                </view>
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
          <view class="expert-avatar">
            <AppIcon color="#f59e0b" name="user" size="28" />
          </view>
          <view class="expert-copy">
            <text class="expert-name">刘工 · 材料检测专家</text>
            <view class="expert-tags">
              <text class="expert-tag">金属材料</text>
              <text class="expert-tag">力学性能</text>
              <text class="expert-tag">失效分析</text>
            </view>
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

        <view class="process-flow">
          <view v-for="(step, idx) in steps" :key="step.index" class="process-step">
            <view class="process-step__dot-wrap">
              <view class="process-step__dot" :class="`process-step__dot--${idx}`">{{ step.index }}</view>
              <view v-if="idx < steps.length - 1" class="process-step__line"></view>
            </view>
            <view class="process-step__content">
              <text class="process-step__title">{{ step.title }}</text>
              <text class="process-step__desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="footer-note">
        <text class="footer-text">运营单位：湖南大金科技</text>
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
import { ref } from 'vue'

interface QuickEntry {
  title: string
  iconName: string
  iconColor: string
  bg: string
  action: () => void
}

const searchKeyword = ref('')
const safeTop = ref(0)

safeTop.value = getStatusBarHeight()

function getStatusBarHeight() {
  // #ifdef MP-WEIXIN
  return uni.getWindowInfo().statusBarHeight ?? 0
  // #endif
}

const hotWords = ['材料检测', '电气安全', 'CNAS', '检测报告']

const quickEntries: QuickEntry[] = [
  {
    title: '检验检测',
    iconName: 'lab',
    iconColor: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.12)',
    action: () => uni.navigateTo({ url: '/pages/detection/index' }),
  },
  {
    title: '认证认可',
    iconName: 'certification',
    iconColor: '#d97706',
    bg: 'rgba(217, 119, 6, 0.12)',
    action: () => uni.navigateTo({ url: '/pages/service/index' }),
  },
  {
    title: '数据报告',
    iconName: 'analysis',
    iconColor: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.12)',
    action: () => uni.navigateTo({ url: '/pages/report/index' }),
  },
  {
    title: '计量校准',
    iconName: 'standard',
    iconColor: '#059669',
    bg: 'rgba(5, 150, 105, 0.12)',
    action: () => uni.navigateTo({ url: '/pages/service/index' }),
  },
  {
    title: '质量咨询',
    iconName: 'service',
    iconColor: '#e11d48',
    bg: 'rgba(225, 29, 72, 0.10)',
    action: () => uni.navigateTo({ url: '/pages/service/index' }),
  },
  {
    title: '质量培训',
    iconName: 'training',
    iconColor: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.12)',
    action: () => uni.navigateTo({ url: '/pages/service/index' }),
  },
]

const demandList = [
  {
    title: '45#钢试棒力学性能检测',
    city: '株洲',
    budget: '¥3,000',
    time: '2小时前',
    tone: 'amber',
    tag: '材料检测',
    tagTone: 'amber',
  },
  {
    title: 'LED 灯具出口认证咨询',
    city: '长沙',
    budget: '¥8,000',
    time: '今天',
    tone: 'teal',
    tag: '认证认可',
    tagTone: 'teal',
  },
]

const demandTotal = '1286'

const communityRecommend = [
  {
    badge: '政策',
    tone: 'blue',
    title: '湖南省质量服务新规发布，检验检测机构线上受理流程进一步规范',
    meta: '今天 · 2,186 阅读',
    coverBg: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 60%, #3b82f6 100%)',
    coverIconColor: '#ffffff',
    coverIcon: 'document',
  },
  {
    badge: '技术',
    tone: 'violet',
    title: 'RoHS 认证流程详解：企业送检前需要准备哪些文件？',
    meta: '3 小时前 · 986 阅读',
    coverBg: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 60%, #d97706 100%)',
    coverIconColor: '#ffffff',
    coverIcon: 'book',
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
  background: #f8fafc;
  padding-bottom: 140rpx;
}

/* ========== 沉浸式 Hero Banner ========== */
.home-hero {
  position: relative;
  padding: 0 24rpx 32rpx;
  min-height: 520rpx;
  background: linear-gradient(165deg, #1e3a5f 0%, #1d4ed8 25%, #2563eb 50%, #0ea5e9 78%, #67e8f9 100%);
  overflow: hidden;
}

.home-hero__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.home-hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.3;
}

.home-hero__orb--1 {
  width: 400rpx;
  height: 400rpx;
  top: -80rpx;
  right: -60rpx;
  background: #fbbf24;
}

.home-hero__orb--2 {
  width: 300rpx;
  height: 300rpx;
  bottom: -40rpx;
  left: -40rpx;
  background: #34d399;
}

.home-hero__orb--3 {
  width: 200rpx;
  height: 200rpx;
  top: 40%;
  left: 50%;
  background: #a78bfa;
}

.home-hero__nav {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.home-nav__brand {
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
  color: #ffffff;
  font-size: 32rpx;
  line-height: 1.25;
  font-weight: 700;
}

.home-hero__slogan {
  margin: 16rpx 0 24rpx;
  position: relative;
  z-index: 2;
}

.home-hero__slogan-text {
  display: block;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 2rpx;
}

.home-hero__slogan-sub {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 24rpx;
}

.home-search-card {
  position: relative;
  z-index: 2;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.12);
  padding: 20rpx;
}

.home-search-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.home-search-box {
  flex: 1;
  min-height: 72rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.35);
  border: none;
  padding: 0 28rpx;
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
  gap: 16rpx;
  align-items: center;
}

.home-hotwords-label {
  color: #64748b;
  font-size: 22rpx;
}

.home-hotword {
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 500;
}

/* ========== 内容区域 ========== */
.content-shell {
  padding: 24rpx;
  margin-top: -8rpx;
}

.panel-card {
  margin-top: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
  padding: 24rpx;
}

.entry-panel {
  margin-top: 0;
  border: none;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.08);
}

.entry-grid--multi {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx 12rpx;
  text-align: center;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.entry-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12rpx);
  border: none;
}

.entry-title {
  display: block;
  margin-top: 12rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

/* ========== 面板头部 ========== */
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

/* ========== 需求大厅 - 彩色卡片 ========== */
.demand-list,
.community-list,
.qa-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.demand-card {
  display: flex;
  border-radius: 20rpx;
  border: none;
  background: #ffffff;
  overflow: hidden;
}

.demand-card__accent {
  width: 6rpx;
  flex-shrink: 0;
}

.demand-card--amber {
  background: rgba(245, 158, 11, 0.06);
}

.demand-card--amber .demand-card__accent {
  background: linear-gradient(180deg, #f59e0b, #fbbf24);
}

.demand-card--teal {
  background: rgba(20, 184, 166, 0.06);
}

.demand-card--teal .demand-card__accent {
  background: linear-gradient(180deg, #14b8a6, #5eead4);
}

.demand-card__body {
  flex: 1;
  padding: 20rpx 22rpx;
}

.demand-card__tags {
  margin-bottom: 8rpx;
}

.demand-tag {
  display: inline-block;
  padding: 2rpx 14rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.demand-tag--amber {
  background: #fef3c7;
  color: #b45309;
}

.demand-tag--teal {
  background: #ccfbf1;
  color: #0f766e;
}

.demand-title,
.community-item-title,
.qa-title,
.expert-name {
  display: block;
  color: #1e293b;
  font-weight: 600;
}

.demand-title {
  font-size: 28rpx;
  line-height: 1.5;
}

.demand-meta-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.demand-meta,
.panel-foot-text,
.community-item-meta,
.qa-meta,
.expert-desc,
.footer-text {
  display: block;
  color: #64748b;
}

.demand-meta,
.demand-time {
  font-size: 22rpx;
}

.demand-budget {
  font-size: 24rpx;
  font-weight: 700;
  color: #e11d48;
}

.demand-time {
  color: #94a3b8;
}

.panel-foot {
  margin-top: 16rpx;
}

.panel-foot-text,
.community-item-meta,
.qa-meta,
.footer-text {
  font-size: 22rpx;
}

.panel-foot-link,
.community-link {
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 600;
}

/* ========== 质量社区 - 图文结合 ========== */
.community-panel {
  padding-bottom: 0;
}

.community-shell {
  margin-top: 18rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: none;
  overflow: hidden;
}

.community-block {
  padding: 20rpx;
}

.community-item {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #ffffff;
  border: none;
}

.community-cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.community-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.community-item-title,
.qa-title {
  font-size: 26rpx;
  line-height: 1.55;
  color: #1e293b;
}

.community-item-bottom {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.community-badge-text {
  display: inline-block;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.community-badge-text--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.community-badge-text--violet {
  background: #ede9fe;
  color: #6d28d9;
}

.community-item-meta,
.qa-meta {
  font-size: 20rpx;
  line-height: 1.55;
  color: #94a3b8;
}

.community-divider {
  height: 1rpx;
  background: #e2e8f0;
}

.qa-card {
  display: flex;
  gap: 14rpx;
  border-radius: 18rpx;
  border: none;
  background: #ffffff;
  padding: 18rpx;
}

.qa-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: #eff6ff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-body {
  flex: 1;
  min-width: 0;
}

.qa-meta {
  margin-top: 8rpx;
}

/* ========== 专家在线 ========== */
.expert-panel {
  margin-top: 18rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
  border: 1rpx solid #fde68a;
  padding: 22rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.expert-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #fef3c7;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expert-copy {
  flex: 1;
  min-width: 0;
}

.expert-name {
  font-size: 28rpx;
  line-height: 1.45;
}

.expert-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
  flex-wrap: wrap;
}

.expert-tag {
  padding: 2rpx 14rpx;
  border-radius: 8rpx;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 20rpx;
  font-weight: 500;
}

/* ========== 服务流程 - 时间线 ========== */
.process-flow {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
}

.process-step {
  display: flex;
  gap: 20rpx;
  align-items: stretch;
}

.process-step__dot-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.process-step__dot {
  width: 52rpx;
  height: 52rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #ffffff;
}

.process-step__dot--0 { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.process-step__dot--1 { background: linear-gradient(135deg, #10b981, #34d399); }
.process-step__dot--2 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.process-step__dot--3 { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }

.process-step__line {
  width: 2rpx;
  flex: 1;
  margin: 8rpx 0;
  background: #e2e8f0;
}

.process-step__content {
  flex: 1;
  padding-bottom: 28rpx;
}

.process-step__title {
  display: block;
  color: #1e293b;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.45;
}

.process-step__desc {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.6;
}

/* ========== Footer ========== */
.footer-note {
  padding: 28rpx 8rpx 10rpx;
}

.footer-text {
  text-align: center;
  line-height: 1.8;
}

/* ========== 浮动按钮 ========== */
.floating-service {
  position: fixed;
  right: 24rpx;
  bottom: 176rpx;
  z-index: 18;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  box-shadow: 0 14rpx 30rpx rgba(245, 158, 11, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
