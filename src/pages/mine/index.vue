<template>
  <view class="page-mine" :class="`page-mine--${mineViewMode}`">
    <view class="page-mine__top">
      <view class="mine-top__toolbar" :style="{ paddingTop: `${safeTop}px` }">
        <view class="mine-top__settings tap-feedback" @tap="goSettings">
          <AppIcon color="#0f172a" name="setting-line" size="22" />
        </view>
      </view>

      <view class="mine-top__profile">
        <view class="mine-top__profile-main tap-feedback" @tap="handleProfileTap">
          <view class="mine-top__avatar">
            <image
              v-if="profileAvatarUrl"
              :src="profileAvatarUrl"
              class="mine-top__avatar-image"
              mode="aspectFill"
            />
            <AppIcon v-else color="#1E61FF" :name="heroIconName" size="34" />
          </view>

          <view class="mine-top__identity">
            <text class="mine-top__name">{{ profileName }}</text>
            <text v-if="identityTag" class="mine-top__identity-tag">{{ identityTag }}</text>
          </view>
        </view>

        <view class="mine-top__home-tab tap-feedback" @tap.stop="goAccountProfile">
          <text class="mine-top__home-tab-text">个人主页</text>
          <text class="mine-top__home-tab-arrow">›</text>
        </view>
      </view>

      <view class="mine-top__badges">
        <view
          v-for="badge in profileBadges"
          :key="badge.key"
          class="mine-auth-badge tap-feedback"
          :class="`mine-auth-badge--${badge.tone}`"
          @tap="handleProfileBadgeTap(badge)"
        >
          <text class="mine-auth-badge__label">{{ badge.label }}</text>
          <text class="mine-auth-badge__value">{{ badge.value }}</text>
          <text class="mine-auth-badge__arrow">›</text>
        </view>
      </view>

    </view>

    <scroll-view class="page-mine__scroll" scroll-y>
      <view class="page-mine__top-spacer" :style="{ height: `${headerHeight}px` }"></view>
      <view class="page-mine__content" :class="{ 'page-mine__content--loading': isLoadingOverview }">
        <view v-for="section in renderedSections" :key="section.key" class="mine-section">
          <view class="mine-section__head">
            <text class="mine-section__title">{{ section.title }}</text>
          </view>

          <view class="mine-section__grid" :style="{ gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))` }">
            <view
              v-for="entry in section.entries"
              :key="entry.key"
              class="mine-entry tap-feedback"
              :class="{ 'mine-entry--placeholder': entry.isPlaceholder, 'mine-entry--lottery': entry.key === 'lottery' }"
              @tap="handleEntryTap(entry)"
            >
              <view class="mine-entry__icon-wrap">
                <view class="mine-entry__icon">
                  <AppIcon :color="entry.key === 'lottery' ? '#ffffff' : (entry.iconColor || '#475569')" :name="entry.icon" :size="entry.key === 'lottery' ? 24 : 20" />
                </view>
                <text v-if="entry.badgeText" class="mine-entry__badge">{{ entry.badgeText }}</text>
              </view>
              <text class="mine-entry__text">{{ entry.title }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import {
  accountService,
  consultationService,
  enterpriseService,
  orderService,
  reportService,
  userService,
} from '@/services/api'
import * as tradeDemandService from '@/services/api/tradeDemand'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

interface MineEntryItem {
  badgeText?: string
  icon: string
  iconColor?: string
  isPlaceholder?: boolean
  key: string
  requiresAuth: boolean
  route?: string
  title: string
}

interface MineSection {
  columns: number
  entries: MineEntryItem[]
  key: string
  title: string
}

type MineViewMode = 'enterprise' | 'personal'
type AuthTone = 'danger' | 'info' | 'success' | 'warning'

interface MineProfileBadge {
  key: string
  label: string
  route?: string
  tone: AuthTone
  value: string
}

const userStore = useUserStore()
const isLoadingOverview = ref(false)
const safeTop = ref(0)
const headerHeight = ref(0)
const realNameStatus = ref<number | null>(null)
const enterpriseCertStatus = ref<number | null>(null)
const hasEnterpriseProfile = ref(false)

const overviewOrderCount = ref<number | null>(null)
const overviewDemandCount = ref<number | null>(null)
const overviewConsultationCount = ref<number | null>(null)
const overviewReportCount = ref<number | null>(null)
const overviewUnreadMessageCount = ref<number | null>(null)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const tabBarRoutes = new Set([
  '/pages/index/index',
  '/pages/institution/list',
  '/pages/order/list',
  '/pages/mine/index',
])

safeTop.value = getStatusBarHeight()

function getStatusBarHeight() {
  // #ifdef MP-WEIXIN
  return uni.getWindowInfo().statusBarHeight ?? 0
  // #endif

  return 0
}

function syncTopHeight() {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query
      .select('.page-mine__top')
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

const mineViewMode = computed<MineViewMode>(() => {
  const accountType = userStore.accountType

  if (accountType === 2 || accountType === 4) {
    return 'enterprise'
  }

  return 'personal'
})

const profileAvatarUrl = computed(() => {
  if (!isLoggedIn.value) {
    return ''
  }

  return (userStore.avatar || '').trim()
})

const heroIconName = computed(() => (mineViewMode.value === 'enterprise' ? 'enterprise-line' : 'user-line'))
const enterpriseCertLabel = computed(() => (userStore.accountType === 0 ? '企业认证' : '企业信息'))

const profileName = computed(() => {
  if (!isLoggedIn.value) {
    return '未登录'
  }

  if (mineViewMode.value === 'enterprise') {
    return userStore.company?.trim() || '企业账号'
  }

  return userStore.nickname?.trim() || '个人账号'
})

const identityTag = computed(() => {
  if (!isLoggedIn.value) {
    return '游客模式'
  }

  const accountType = userStore.accountType

  if (accountType === 0) {
    return '个人用户'
  }

  if (accountType === 1) {
    return '企业需求方'
  }

  if (accountType === 2) {
    return '服务机构'
  }

  if (accountType === 4) {
    return '平台运营方'
  }

  return mineViewMode.value === 'enterprise' ? '企业用户' : '个人用户'
})

const personalRealNameBadge = computed<MineProfileBadge>(() => {
  if (!isLoggedIn.value) {
    return {
      key: 'real-name',
      label: '个人实名',
      route: '/pages/auth/login',
      tone: 'info',
      value: '去登录',
    }
  }

  if (realNameStatus.value === 1) {
    return {
      key: 'real-name',
      label: '个人实名',
      route: '/pages/settings/realname',
      tone: 'success',
      value: '已通过',
    }
  }

  if (realNameStatus.value === 2) {
    return {
      key: 'real-name',
      label: '个人实名',
      route: '/pages/settings/realname',
      tone: 'danger',
      value: '已驳回',
    }
  }

  if (realNameStatus.value === 0) {
    return {
      key: 'real-name',
      label: '个人实名',
      route: '/pages/settings/realname',
      tone: 'warning',
      value: '待审核',
    }
  }

  return {
    key: 'real-name',
    label: '个人实名',
    route: '/pages/settings/realname',
    tone: 'info',
    value: '未提交',
  }
})

const enterpriseCertBadge = computed<MineProfileBadge>(() => {
  if (!isLoggedIn.value) {
    return {
      key: 'enterprise-cert',
      label: enterpriseCertLabel.value,
      route: '/pages/auth/login',
      tone: 'info',
      value: '去登录',
    }
  }

  if (!hasEnterpriseProfile.value) {
    return {
      key: 'enterprise-cert',
      label: enterpriseCertLabel.value,
      route: '/pages/profile/enterprise-info',
      tone: 'info',
      value: '待完善',
    }
  }

  if (enterpriseCertStatus.value === 1) {
    return {
      key: 'enterprise-cert',
      label: enterpriseCertLabel.value,
      route: '/pages/profile/enterprise-info',
      tone: 'success',
      value: '已通过',
    }
  }

  if (enterpriseCertStatus.value === 2) {
    return {
      key: 'enterprise-cert',
      label: enterpriseCertLabel.value,
      route: '/pages/profile/enterprise-info',
      tone: 'danger',
      value: '已驳回',
    }
  }

  return {
    key: 'enterprise-cert',
    label: enterpriseCertLabel.value,
    route: '/pages/profile/enterprise-info',
    tone: 'warning',
    value: '待审核',
  }
})

const profileBadges = computed(() => {
  if (mineViewMode.value === 'enterprise') {
    return [enterpriseCertBadge.value, personalRealNameBadge.value]
  }

  return [personalRealNameBadge.value, enterpriseCertBadge.value]
})

const sharedEntryMap = computed(() => ({
  allOrder: {
    icon: 'order',
    key: 'all-order',
    requiresAuth: true,
    route: '/pages/order/list',
    title: '全部订单',
  } as MineEntryItem,
  allReport: {
    icon: 'report-line',
    key: 'all-report',
    requiresAuth: true,
    route: '/pages/report/index',
    title: '全部报告',
  } as MineEntryItem,
  consultation: {
    icon: 'consult',
    key: 'consultation',
    requiresAuth: true,
    route: '/pages/institution/consult',
    title: '我的咨询',
  } as MineEntryItem,
  message: {
    icon: 'message-line',
    key: 'message',
    requiresAuth: true,
    route: '/pages/message/index',
    title: '消息通知',
  } as MineEntryItem,
  myDemand: {
    icon: 'edit-line',
    key: 'my-demand',
    requiresAuth: true,
    route: '/pages/demand/hall?scope=my',
    title: '我的需求',
  } as MineEntryItem,
}))

const personalSections = computed<MineSection[]>(() => {
  const shared = sharedEntryMap.value

  return [
    {
      columns: 4,
      entries: [
        { ...shared.allOrder, badgeText: formatBadge(overviewOrderCount.value) },
        { ...shared.myDemand, badgeText: formatBadge(overviewDemandCount.value) },
        { ...shared.consultation, badgeText: formatBadge(overviewConsultationCount.value) },
        { ...shared.allReport, badgeText: formatBadge(overviewReportCount.value) },
      ],
      key: 'personal-core',
      title: '核心入口',
    },
    {
      columns: 4,
      entries: [
        {
          icon: 'edit-line',
          key: 'publish-demand',
          requiresAuth: true,
          route: '/pages/demand/publish',
          title: '发布需求',
        },
        {
          icon: 'goods-line',
          key: 'payment-records',
          requiresAuth: true,
          isPlaceholder: true,
          title: '支付记录',
        },
        {
          icon: 'star',
          key: 'my-review',
          requiresAuth: true,
          isPlaceholder: true,
          title: '我的评价',
        },
        {
          ...shared.message,
          badgeText: formatBadge(overviewUnreadMessageCount.value),
        },
      ],
      key: 'personal-quick',
      title: '快捷入口',
    },
    {
      columns: 4,
      entries: [
        {
          icon: 'file',
          key: 'invoice-manage',
          requiresAuth: true,
          route: '/pages/profile/invoices',
          title: '发票管理',
        },
        {
          icon: 'location',
          key: 'address-manage',
          requiresAuth: true,
          route: '/pages/profile/addresses',
          title: '地址管理',
        },
        {
          icon: 'message',
          key: 'community-publish',
          requiresAuth: true,
          isPlaceholder: true,
          title: '社区发布',
        },
        {
          icon: 'star',
          key: 'my-favorite',
          requiresAuth: true,
          isPlaceholder: true,
          title: '我的收藏',
        },
        {
          icon: 'time',
          key: 'history',
          requiresAuth: true,
          isPlaceholder: true,
          title: '历史浏览',
        },
        {
          icon: 'support',
          key: 'customer-support',
          requiresAuth: true,
          route: '/pages/institution/consult',
          title: '咨询客服',
        },
        {
          icon: 'benefit',
          key: 'lottery',
          requiresAuth: true,
          route: '/pages/marketing/lottery/index',
          title: '现场抽奖',
        },
      ],
      key: 'personal-tools',
      title: '我的工具',
    },
  ]
})

const enterpriseSections = computed<MineSection[]>(() => {
  const shared = sharedEntryMap.value

  return [
    {
      columns: 4,
      entries: [
        { ...shared.allOrder, badgeText: formatBadge(overviewOrderCount.value) },
        {
          icon: 'goods-line',
          key: 'goods-manage',
          requiresAuth: true,
          isPlaceholder: true,
          title: '商品管理',
        },
        {
          icon: 'service',
          key: 'service-manage',
          requiresAuth: true,
          route: '/pages/service/manage',
          title: '服务管理',
        },
        { ...shared.allReport, title: '报告管理', badgeText: formatBadge(overviewReportCount.value) },
        {
          icon: 'edit-line',
          key: 'customer-demand',
          requiresAuth: true,
          route: '/pages/demand/hall',
          title: '客户需求',
          badgeText: formatBadge(overviewDemandCount.value),
        },
        {
          icon: 'consult',
          key: 'customer-consult',
          requiresAuth: true,
          route: '/pages/institution/consult',
          title: '客户咨询',
          badgeText: formatBadge(overviewConsultationCount.value),
        },
        {
          icon: 'analysis',
          key: 'quote-manage',
          requiresAuth: true,
          isPlaceholder: true,
          title: '报价管理',
        },
        {
          ...shared.message,
          title: '消息通知',
          badgeText: formatBadge(overviewUnreadMessageCount.value),
        },
      ],
      key: 'enterprise-core',
      title: '核心入口',
    },
    {
      columns: 4,
      entries: [
        {
          icon: 'enterprise-line',
          key: 'enterprise-profile',
          requiresAuth: true,
          route: '/pages/profile/enterprise-info',
          title: '企业信息',
        },
        {
          icon: 'certification',
          key: 'enterprise-certs',
          requiresAuth: true,
          route: '/pages/enterprise/certs',
          title: '资质管理',
        },
        {
          icon: 'file',
          key: 'invoice-manage',
          requiresAuth: true,
          route: '/pages/profile/invoices',
          title: '发票管理',
        },
        {
          icon: 'location',
          key: 'address-manage',
          requiresAuth: true,
          route: '/pages/profile/addresses',
          title: '地址管理',
        },
        {
          icon: 'message',
          key: 'community-publish',
          requiresAuth: true,
          isPlaceholder: true,
          title: '社区发布',
        },
        {
          icon: 'star',
          key: 'my-favorite',
          requiresAuth: true,
          isPlaceholder: true,
          title: '我的收藏',
        },
        {
          icon: 'support',
          key: 'customer-support',
          requiresAuth: true,
          route: '/pages/institution/consult',
          title: '客服支持',
        },
        {
          icon: 'benefit',
          key: 'lottery',
          requiresAuth: true,
          route: '/pages/marketing/lottery/index',
          title: '现场抽奖',
        },
      ],
      key: 'enterprise-tools',
      title: '我的工具',
    },
  ]
})

const renderedSections = computed(() => (mineViewMode.value === 'enterprise' ? enterpriseSections.value : personalSections.value))

function formatBadge(value: number | null) {
  if (!isLoggedIn.value || value === null || value <= 0) {
    return ''
  }

  if (value > 99) {
    return '99+'
  }

  return String(value)
}

function resolveStoreUserType(userType?: number, accountType?: number) {
  const value = userType ?? accountType

  if (value === undefined || value === null) {
    return undefined
  }

  return value === 0 ? 'personal' : 'enterprise'
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveCountFromListLike(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.length
  }

  if (!isObject(raw)) {
    return 0
  }

  const total = raw.total ?? raw.count ?? raw.data?.total ?? raw.result?.total
  if (typeof total === 'number' && Number.isFinite(total)) {
    return total
  }

  const list = raw.list ?? raw.records ?? raw.items ?? raw.data?.list ?? raw.result?.list
  if (Array.isArray(list)) {
    return list.length
  }

  return 0
}

onShow(() => {
  syncTopHeight()

  if (!isLoggedIn.value) {
    resetAnonymousState()
    return
  }

  void loadMineData()
})

onMounted(() => {
  syncTopHeight()
})

function resetAnonymousState() {
  realNameStatus.value = null
  enterpriseCertStatus.value = null
  hasEnterpriseProfile.value = false

  overviewOrderCount.value = null
  overviewDemandCount.value = null
  overviewConsultationCount.value = null
  overviewReportCount.value = null
  overviewUnreadMessageCount.value = null
}

async function loadMineData() {
  isLoadingOverview.value = true
  overviewOrderCount.value = null
  overviewDemandCount.value = null
  overviewConsultationCount.value = null
  overviewReportCount.value = null
  overviewUnreadMessageCount.value = null

  try {
    const [
      userResult,
      realNameResult,
      enterpriseResult,
    ] = await Promise.allSettled([
      userService.getCurrentUser(),
      accountService.getRealNameStatus(),
      enterpriseService.getMy(),
    ])

    if (userResult.status === 'fulfilled') {
      const currentUser = userResult.value

      userStore.setProfile({
        accountType: currentUser.userType ?? currentUser.accountType,
        avatar: currentUser.avatar,
        company: currentUser.enterpriseName,
        nickname: currentUser.nickname,
        userType: resolveStoreUserType(currentUser.userType, currentUser.accountType),
      })

      if (currentUser.enterpriseId || currentUser.enterpriseName) {
        userStore.setEnterpriseContext({
          company: currentUser.enterpriseName,
          enterpriseId: currentUser.enterpriseId,
          userType: resolveStoreUserType(currentUser.userType, currentUser.accountType),
        })
      }
    }

    realNameStatus.value = realNameResult.status === 'fulfilled' && typeof realNameResult.value?.realNameStatus === 'number'
      ? realNameResult.value.realNameStatus
      : null

    if (enterpriseResult.status === 'fulfilled') {
      const enterpriseContext = enterpriseService.normalizeEnterpriseContext(enterpriseResult.value)
      hasEnterpriseProfile.value = Boolean(enterpriseContext?.company)
      enterpriseCertStatus.value = typeof enterpriseContext?.certStatus === 'number' ? enterpriseContext.certStatus : null

      if (enterpriseContext?.company || enterpriseContext?.enterpriseId) {
        userStore.setEnterpriseContext({
          company: enterpriseContext.company,
          enterpriseId: enterpriseContext.enterpriseId,
          userType: 'enterprise',
        })
      }
    } else {
      hasEnterpriseProfile.value = false
      enterpriseCertStatus.value = null
    }

    await fillOverviewFallback()
  } finally {
    isLoadingOverview.value = false
    syncTopHeight()
  }
}

async function fillOverviewFallback() {
  const needOrder = overviewOrderCount.value === null
  const needReport = overviewReportCount.value === null
  const needDemand = overviewDemandCount.value === null
  const needConsult = overviewConsultationCount.value === null

  if (needOrder || needReport) {
    try {
      const orders = await orderService.getList()
      if (Array.isArray(orders)) {
        if (needOrder) {
          overviewOrderCount.value = orders.length
        }

        if (needReport) {
          try {
            const reports = await reportService.getList(orders.map((item) => item.id).filter(Boolean))
            overviewReportCount.value = Array.isArray(reports) ? reports.length : 0
          } catch {
            overviewReportCount.value = null
          }
        }
      }
    } catch {
      if (needOrder) {
        overviewOrderCount.value = null
      }
      if (needReport) {
        overviewReportCount.value = null
      }
    }
  }

  if (needDemand) {
    try {
      const demandResult = await tradeDemandService.getMyDemands({ page: 1, size: 20, status: undefined })
      overviewDemandCount.value = resolveCountFromListLike(demandResult)
    } catch {
      overviewDemandCount.value = null
    }
  }

  if (needConsult) {
    try {
      const consultResult = await consultationService.getMyList()
      overviewConsultationCount.value = consultationService.ensureConsultationList(consultResult).length
    } catch {
      overviewConsultationCount.value = null
    }
  }

  if (overviewUnreadMessageCount.value === null) {
    overviewUnreadMessageCount.value = isLoggedIn.value ? 0 : null
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}

function requireLogin() {
  showAppToast({ message: '请先登录', icon: 'none' })
  goLogin()
}

function handleProfileTap() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }

  if (mineViewMode.value === 'enterprise') {
    uni.navigateTo({ url: '/pages/profile/enterprise-info' })
    return
  }

  uni.navigateTo({ url: '/pages/settings/account' })
}

function goAccountProfile() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }

  uni.navigateTo({ url: '/pages/settings/account' })
}

function handleProfileBadgeTap(badge: MineProfileBadge) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }

  if (!badge.route) {
    return
  }

  openRoute(badge.route)
}

function handleEntryTap(entry: MineEntryItem) {
  if (entry.key === 'publish-demand' && !ensureLoggedInForSubmitAction()) {
    return
  }

  if (entry.requiresAuth && !isLoggedIn.value) {
    requireLogin()
    return
  }

  if (entry.key === 'service-manage' && userStore.accountType !== 2) {
    showAppToast({ icon: 'none', message: '当前账号非服务提供方，暂不可管理服务' })
    return
  }

  if (entry.isPlaceholder) {
    console.info('[mine-placeholder-entry]', entry.key)
    openComingSoonPage(entry)
    return
  }

  if (entry.route) {
    openRoute(entry.route)
    return
  }

  openComingSoonPage(entry)
}

function openComingSoonPage(entry: MineEntryItem) {
  const title = encodeURIComponent(entry.title)
  const key = encodeURIComponent(entry.key)
  uni.navigateTo({ url: `/pages/common/coming-soon?title=${title}&key=${key}&source=mine` })
}

function goSettings() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }

  uni.navigateTo({ url: '/pages/settings/index' })
}

function openRoute(route: string) {
  if (tabBarRoutes.has(route)) {
    uni.switchTab({ url: route })
    return
  }

  uni.navigateTo({ url: route })
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-mine {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $bg-page;
}

.page-mine__top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  min-height: 430rpx;
  padding: 0 24rpx 18rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(180deg, #3a72e8 0%, #5d93f9 32%, #9ec2ff 66%, #edf5ff 90%, #f8fbff 100%);
  box-shadow: 0 10rpx 22rpx rgba(15, 23, 42, 0.06);
}

.page-mine__top::after {
  content: '';
  position: absolute;
  right: -48rpx;
  top: -54rpx;
  width: 220rpx;
  height: 220rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.72) 0%, rgba(219, 234, 254, 0.14) 58%, transparent 76%);
  pointer-events: none;
}

.mine-top__toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 88rpx;
}

.mine-top__settings {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-top__profile {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.mine-top__profile-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.mine-top__home-tab {
  flex-shrink: 0;
  min-width: 0;
  width: auto;
  height: 62rpx;
  padding: 0 20rpx;
  margin-right: -24rpx;
  border-radius: 999rpx;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background: rgba(239, 248, 255, 0.98);
  border: 1rpx solid #d7ebff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  box-shadow: 0 8rpx 18rpx rgba(59, 130, 246, 0.14);
  overflow: hidden;
}

.mine-top__home-tab-text {
  color: #0284c7;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 22rpx;
  text-align: right;
}

.mine-top__home-tab-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22rpx;
  line-height: 22rpx;
  color: #0ea5e9;
  font-size: 26rpx;
  font-weight: 500;
}

.mine-top__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  flex-shrink: 0;
}

.mine-top__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.mine-top__identity {
  min-width: 0;
  flex: 1;
}

.mine-top__name {
  display: block;
  color: #0f172a;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.3;
  max-width: 320rpx;
  white-space: normal;
  word-break: break-all;
}

.mine-top__identity-tag {
  display: inline-flex;
  margin-top: 10rpx;
  height: 44rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid #dbe3ee;
  color: #64748b;
  font-size: 24rpx;
  font-weight: 400;
  line-height: 44rpx;
}

.mine-top__badges {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.mine-auth-badge {
  min-height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.72);
  padding: 12rpx 14rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.mine-auth-badge__label {
  color: $text-secondary;
  font-size: 21rpx;
}

.mine-auth-badge__value {
  flex: 1;
  min-width: 0;
  font-size: 21rpx;
  font-weight: 600;
}

.mine-auth-badge__arrow {
  color: #94a3b8;
  font-size: 24rpx;
}

.mine-auth-badge--success {
  background: #f1fbf5;
}

.mine-auth-badge--success .mine-auth-badge__value {
  color: #047857;
}

.mine-auth-badge--warning {
  background: #fffaf1;
}

.mine-auth-badge--warning .mine-auth-badge__value {
  color: #b45309;
}

.mine-auth-badge--danger {
  background: #fff5f7;
}

.mine-auth-badge--danger .mine-auth-badge__value {
  color: #be123c;
}

.mine-auth-badge--info {
  background: #f8fbff;
}

.mine-auth-badge--info .mine-auth-badge__value {
  color: #1d4ed8;
}

.page-mine__scroll {
  flex: 1;
  min-height: 0;
}

.page-mine__top-spacer {
  width: 100%;
  flex-shrink: 0;
}

.page-mine__content {
  padding: 16rpx 24rpx calc(34rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.page-mine__content--loading {
  opacity: 0.96;
}

.mine-section {
  margin-top: 18rpx;
  padding: 18rpx 16rpx 14rpx;
  background: #ffffff;
  border: 1rpx solid #ffffff;
  border-radius: 18rpx;
}

.mine-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-section__title {
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 600;
}

.mine-section__grid {
  margin-top: 14rpx;
  display: grid;
  gap: 12rpx 8rpx;
}

.mine-entry {
  position: relative;
  min-height: 112rpx;
  border-radius: 14rpx;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 6rpx;
}

.mine-entry--placeholder {
  background: transparent;
}

.mine-entry__icon-wrap {
  position: relative;
}

.mine-entry__icon {
  position: relative;
  width: 58rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-entry--lottery {
  background: linear-gradient(180deg, #fff7ed 0%, #fff1f2 100%);
  box-shadow: 0 10rpx 20rpx rgba(249, 115, 22, 0.14);
}

.mine-entry--lottery .mine-entry__icon-wrap {
  animation: mine-lottery-breath 1.8s ease-in-out infinite;
}

.mine-entry--lottery .mine-entry__icon {
  width: 66rpx;
  height: 66rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #fb923c 0%, #f97316 42%, #ef4444 100%);
  box-shadow: 0 12rpx 20rpx rgba(249, 115, 22, 0.3);
}

.mine-entry--lottery .mine-entry__icon::after {
  content: '';
  position: absolute;
  inset: -6rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(249, 115, 22, 0.34);
}

.mine-entry--lottery .mine-entry__text {
  color: #9a3412;
  font-weight: 600;
}

.mine-entry__badge {
  position: absolute;
  top: -8rpx;
  right: -14rpx;
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 20rpx;
  border: 2rpx solid #ffffff;
  background: #ef4444;
  color: #ffffff;
  font-size: 18rpx;
  line-height: 24rpx;
  text-align: center;
  padding: 0 6rpx;
}

.mine-entry__text {
  margin-top: 8rpx;
  color: #334155;
  font-size: 21rpx;
  text-align: center;
}

@keyframes mine-lottery-breath {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }

  100% {
    transform: scale(1);
  }
}

</style>
