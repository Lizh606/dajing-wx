<template>
  <view class="page-mine" :class="isEnterprise ? 'is-enterprise' : 'is-personal'">
    <view class="page-mine__top">
      <view class="mine-top__head" @tap="handleProfileTap">
        <view class="mine-top__identity">
          <text class="mine-top__name">{{ profileName }}</text>
          <text class="mine-top__type">{{ profileType }}</text>
        </view>
        <view class="mine-top__avatar">
          <image
            v-if="profileAvatarUrl"
            :src="profileAvatarUrl"
            class="mine-top__avatar-image"
            mode="aspectFill"
          />
          <AppIcon v-else color="#ffffff" :name="heroIconName" size="28" />
        </view>
      </view>

      <view class="mine-top__vip">
        <view>
          <text class="mine-top__vip-label">当前会员</text>
          <text class="mine-top__vip-name">{{ vipName }}</text>
          <text v-if="isLoggedIn" class="mine-top__vip-points">可用积分 {{ pointsText }}</text>
        </view>
        <view class="mine-top__vip-btn" @tap="goMember">升级会员</view>
      </view>

      <view class="mine-top__stats">
        <view class="mine-stat" @tap="goOrder">
          <text class="mine-stat__value">{{ orderCount }}</text>
          <text class="mine-stat__label">进行中订单</text>
        </view>
        <view class="mine-stat" @tap="goReport">
          <text class="mine-stat__value">{{ reportCount }}</text>
          <text class="mine-stat__label">历史报告</text>
        </view>
        <view class="mine-stat" @tap="goMessage">
          <text class="mine-stat__value">{{ unreadCount }}</text>
          <text class="mine-stat__label">风险提醒</text>
        </view>
      </view>
    </view>

    <scroll-view class="page-mine__scroll" scroll-y>
      <view class="page-mine__content">
        <view class="mine-card">
          <text class="mine-card__title">快捷入口</text>
          <view class="mine-quick-grid">
            <view class="mine-quick-item" @tap="goPublishDemand">
              <view class="mine-quick-item__icon mine-quick-item__icon--blue">✍</view>
              <text class="mine-quick-item__text">发布需求</text>
            </view>
            <view class="mine-quick-item" @tap="goReport">
              <view class="mine-quick-item__icon mine-quick-item__icon--cyan">📄</view>
              <text class="mine-quick-item__text">我的报告</text>
            </view>
            <view class="mine-quick-item" @tap="goPaymentRecords">
              <view class="mine-quick-item__icon mine-quick-item__icon--amber">💳</view>
              <text class="mine-quick-item__text">支付记录</text>
            </view>
            <view class="mine-quick-item" @tap="goEnterpriseAuth">
              <view class="mine-quick-item__icon mine-quick-item__icon--green">🏢</view>
              <text class="mine-quick-item__text">企业信息</text>
            </view>
          </view>
        </view>

        <view class="mine-card mine-card--risk" @tap="goMessage">
          <view class="mine-risk__top">
            <view>
              <text class="mine-card__title">风险提醒</text>
            </view>
            <view class="mine-stat__badge-wrap">
              <text class="mine-stat__badge-icon">💬</text>
              <text v-if="unreadCount > 0" class="mine-stat__badge">{{ unreadCount }}</text>
            </view>
          </view>
          <view class="mine-risk__entry">
            <view>
              <text class="mine-risk__entry-title">消息中心</text>
            </view>
          </view>
        </view>

        <view class="mine-card">
          <text class="mine-card__title">数据档案云</text>
          <view class="mine-list-row" @tap="goReport">
            <view>
              <text class="mine-list-row__title">检测报告档案</text>
            </view>
          </view>
          <view class="mine-list-row" @tap="goEnterpriseCerts">
            <view>
              <text class="mine-list-row__title">认证证书档案</text>
            </view>
          </view>
          <view class="mine-list-row" @tap="goOrder">
            <view>
              <text class="mine-list-row__title">需求处理记录</text>
            </view>
          </view>
        </view>

        <view class="mine-settings-tile" @tap="goSettings">
          <view class="mine-settings-tile__icon">⚙</view>
          <view class="mine-settings-tile__main">
            <text class="mine-settings-tile__title">系统设置</text>
            <text class="mine-settings-tile__desc">通知、隐私、安全与帮助中心</text>
          </view>
          <text class="mine-settings-tile__arrow">›</text>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import * as tradeDemandService from '@/services/api/tradeDemand'
import { pointsService, userService } from '@/services/api'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const isEnterprise = computed(() => isLoggedIn.value && userStore.userType === 'enterprise')
const availablePoints = ref<number | null>(null)
const memberLevel = ref<number | null>(null)
const myDemandCount = ref<number | null>(null)
const userTypeLabels: Record<number, string> = {
  0: '个人用户',
  1: '企业用户(需求发布方)',
  2: '企业用户(服务提供方)',
  4: '平台运营方',
}

const profileName = computed(() => {
  if (!isLoggedIn.value) {
    return '未登录'
  }

  return isEnterprise.value ? userStore.company || '株洲某制造有限公司' : userStore.nickname || '张先生'
})

const profileType = computed(() => {
  if (!isLoggedIn.value) {
    return '点击登录'
  }

  if (userStore.accountType !== null && userStore.accountType in userTypeLabels) {
    return userTypeLabels[userStore.accountType]
  }

  return isEnterprise.value ? '企业账号' : '个人账号'
})

const vipName = computed(() => {
  if (!isLoggedIn.value) {
    return '访客体验版'
  }

  const level = memberLevel.value ?? 0

  if (level >= 3) {
    return isEnterprise.value ? '企业钻石版' : '钻石会员'
  }

  if (level >= 2) {
    return isEnterprise.value ? '企业高级版' : '高级会员'
  }

  if (level >= 1) {
    return isEnterprise.value ? '企业标准版' : '标准会员'
  }

  return isEnterprise.value ? '企业基础版' : '个人专业版'
})

const heroIconName = computed(() => (isEnterprise.value ? 'institution' : 'user'))
const profileAvatarUrl = computed(() => {
  if (!isLoggedIn.value) {
    return ''
  }

  return (userStore.avatar || '').trim()
})
const orderCount = computed(() => (isLoggedIn.value ? '12' : '0'))
const reportCount = computed(() => (isLoggedIn.value ? '38' : '0'))
const unreadCount = computed(() => (isLoggedIn.value ? 3 : 0))
const pointsText = computed(() => {
  if (!isLoggedIn.value) {
    return '--'
  }

  if (availablePoints.value === null) {
    return '--'
  }

  return String(availablePoints.value)
})

function resolveStoreUserType(userType?: number, accountType?: number) {
  const value = userType ?? accountType

  if (value === undefined || value === null) {
    return undefined
  }

  return value === 0 ? 'personal' : 'enterprise'
}

onShow(() => {
  if (!userStore.isLoggedIn) {
    availablePoints.value = null
    memberLevel.value = null
    myDemandCount.value = null
    return
  }

  void syncMineOverview()
})

async function syncMineOverview() {
  await Promise.all([
    syncCurrentProfile(),
    syncPointsSummary(),
    syncMyDemandCount(),
  ])
}

async function syncCurrentProfile() {
  try {
    const currentUser = await userService.getCurrentUser()
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
  } catch {
    // 忽略轮询失败，避免打断页面交互
  }
}

async function syncPointsSummary() {
  try {
    const summary = await pointsService.getMy()
    availablePoints.value = summary.availablePoints
    memberLevel.value = summary.memberLevel ?? null
  } catch {
    // 积分拉取失败时不阻断页面交互
  }
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveMyDemandCount(raw: unknown) {
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

async function syncMyDemandCount() {
  try {
    const result = await tradeDemandService.getMyDemands({
      page: 1,
      size: 20,
      status: undefined,
    })
    myDemandCount.value = resolveMyDemandCount(result)
  } catch {
    myDemandCount.value = null
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}

function requireLogin() {
  showAppToast({ message: '请先登录', icon: 'none' })
  goLogin()
}

function runIfLoggedIn(action: () => void) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }

  action()
}

function handleProfileTap() {
  if (!isLoggedIn.value) {
    requireLogin()
  }
}

function goMember() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/member/vip' })
  })
}

function goPublishDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/demand/publish' })
}

function goOrder() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/order/list' })
  })
}

function goReport() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/report/index' })
  })
}

function goMessage() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/message/index' })
  })
}

function goPaymentRecords() {
  runIfLoggedIn(() => {
    showAppToast({ message: '支付记录功能开发中', icon: 'none' })
  })
}

function goEnterpriseAuth() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/profile/enterprise' })
  })
}

function goEnterpriseCerts() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/enterprise/certs' })
  })
}

function goSettings() {
  runIfLoggedIn(() => {
    uni.navigateTo({ url: '/pages/settings/index' })
  })
}
</script>

<style scoped lang="scss">
.page-mine {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-mine__top {
  padding: 24rpx 24rpx 30rpx;
  border-bottom-left-radius: 56rpx;
  border-bottom-right-radius: 56rpx;
  box-shadow: 0 12rpx 28rpx rgba(30, 64, 175, 0.2);
}

.page-mine.is-enterprise .page-mine__top {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%);
}

.page-mine.is-personal .page-mine__top {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #0ea5e9 100%);
}

.mine-top__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-top__identity {
  flex: 1;
  min-width: 0;
}

.mine-top__name {
  display: block;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.35;
}

.mine-top__type {
  display: block;
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
}

.mine-top__avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-top__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.mine-top__vip {
  margin-top: 18rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.mine-top__vip-label {
  display: block;
  color: rgba(255, 255, 255, 0.78);
  font-size: 22rpx;
}

.mine-top__vip-name {
  display: block;
  margin-top: 6rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.mine-top__vip-points {
  display: block;
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 22rpx;
}

.mine-top__vip-btn {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
  background: #ffffff;
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 600;
}

.mine-top__stats {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.mine-stat {
  min-height: 104rpx;
  border-radius: 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.14);
  padding: 16rpx 14rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.mine-stat__value {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
}

.mine-stat__label {
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.88);
  font-size: 20rpx;
}

.mine-stat__badge-wrap {
  position: relative;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-stat__badge-icon {
  font-size: 24rpx;
}

.mine-stat__badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid #ffffff;
  background: #ef4444;
  color: #ffffff;
  font-size: 18rpx;
  line-height: 24rpx;
  text-align: center;
  padding: 0 6rpx;
}

.page-mine__scroll {
  flex: 1;
  min-height: 0;
}

.page-mine__content {
  margin-top: -18rpx;
  padding: 0 24rpx 28rpx;
  box-sizing: border-box;
}

/* #ifdef H5 */
.page-mine__content {
  padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
}
/* #endif */

.mine-card {
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.07);
  padding: 24rpx;
  margin-top: 16rpx;
}

.mine-card--risk {
  padding-bottom: 20rpx;
}

.mine-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.mine-quick-grid {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}

.mine-quick-item {
  text-align: center;
}

.mine-quick-item__icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 16rpx;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
}

.mine-quick-item__icon--blue {
  background: #eff6ff;
}

.mine-quick-item__icon--cyan {
  background: #ecfeff;
}

.mine-quick-item__icon--amber {
  background: #fffbeb;
}

.mine-quick-item__icon--green {
  background: #ecfdf5;
}

.mine-quick-item__text {
  display: block;
  margin-top: 12rpx;
  color: #334155;
  font-size: 24rpx;
}

.mine-risk__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.mine-risk__entry {
  margin-top: 14rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14rpx;
}

.mine-risk__entry-title {
  display: block;
  color: #1e293b;
  font-size: 24rpx;
  font-weight: 600;
}

.mine-list-row {
  margin-top: 12rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.mine-list-row__title {
  display: block;
  color: #1e293b;
  font-size: 24rpx;
  font-weight: 600;
}

.mine-settings-tile {
  margin-top: 16rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.07);
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.mine-settings-tile__icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.mine-settings-tile__main {
  flex: 1;
  min-width: 0;
}

.mine-settings-tile__title {
  display: block;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
}

.mine-settings-tile__desc {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
}

.mine-settings-tile__arrow {
  color: #94a3b8;
  font-size: 34rpx;
}
</style>
