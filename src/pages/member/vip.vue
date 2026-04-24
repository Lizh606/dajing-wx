<template>
  <view class="page-vip">
    <view class="vip-hero">
      <view class="vip-hero__badge">
        <AppIcon color="#f5d0a9" name="vip" size="28" />
      </view>
      <view class="vip-hero__copy">
        <text class="vip-hero__title">会员中心</text>
        <text class="vip-hero__desc">{{ heroSubtitle }}</text>
      </view>
    </view>

    <view v-if="isGuest" class="vip-guest">
      <text class="vip-guest__title">当前为游客模式</text>
      <text class="vip-guest__desc">可先浏览会员套餐与权益介绍，按需登录后再查看积分和开通会员。</text>
      <AppButton
        block
        custom-style="min-height: 76rpx; border-radius: 18rpx; margin-top: 12rpx;"
        text="去登录"
        type="info"
        @click="goLogin"
      />
    </view>

    <view class="vip-section vip-section--points">
      <view class="vip-points-card">
        <view class="vip-points-card__main">
          <text class="vip-points-card__label">当前积分余额</text>
          <text class="vip-points-card__value">{{ availablePointsText }}</text>
        </view>
        <view class="vip-points-card__side">
          <text class="vip-points-card__side-label">累计积分</text>
          <text class="vip-points-card__side-value">{{ totalPointsText }}</text>
        </view>
      </view>

      <view class="vip-rules-inline">
        <text class="vip-rules-inline__title">积分规则</text>
        <text
          v-for="item in topRules"
          :key="item.title"
          class="vip-rules-inline__item"
        >
          {{ item.title }}<text v-if="item.points !== undefined">（{{ item.points }}）</text>
        </text>
        <text v-if="topRules.length === 0" class="vip-rules-inline__item">暂无规则说明</text>
      </view>
    </view>

    <view class="vip-section">
      <text class="vip-section__title">选择会员套餐</text>
      <view class="vip-plan-list">
        <view
          v-for="plan in plans"
          :key="plan.id"
          class="vip-plan"
          :class="{
            'vip-plan--featured': plan.featured,
            'vip-plan--active': selectedPlanId === plan.id,
          }"
          @tap="selectPlan(plan.id)"
        >
          <view class="vip-plan__head">
            <view class="vip-plan__copy">
              <text class="vip-plan__name">{{ plan.name }}</text>
              <text class="vip-plan__sub">{{ plan.sub }}</text>
            </view>
            <view class="vip-plan__price-box">
              <text v-if="plan.tag" class="vip-plan__badge">{{ plan.tag }}</text>
              <text class="vip-plan__price">¥{{ plan.price }}</text>
              <text class="vip-plan__origin">¥{{ plan.originPrice }}</text>
            </view>
          </view>

          <view class="vip-plan__features">
            <view v-for="feature in plan.features" :key="feature" class="vip-plan__feature">
              <AppIcon
                :color="selectedPlanId === plan.id ? '#1E61FF' : '#94a3b8'"
                name="success"
                size="14"
              />
              <text class="vip-plan__feature-text">{{ feature }}</text>
            </view>
          </view>

          <view v-if="selectedPlanId === plan.id" class="vip-plan__selected">
            <AppIcon color="#1E61FF" name="success" size="14" />
            <text class="vip-plan__selected-text">已选中</text>
          </view>
        </view>
      </view>
    </view>

    <view class="vip-section">
      <text class="vip-section__title">会员权益</text>
      <view class="vip-benefits">
        <view
          v-for="item in benefits"
          :key="item.title"
          class="vip-benefit"
        >
          <view class="vip-benefit__icon" :style="{ background: item.bg }">
            <AppIcon :color="item.color" :name="item.iconName" size="22" />
          </view>
          <text class="vip-benefit__title">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <view class="vip-section">
      <text class="vip-section__title">最近积分流水</text>
      <view v-if="historyList.length > 0" class="vip-history">
        <view
          v-for="item in historyList"
          :key="item.id || `${item.createdAt}-${item.remark}-${item.changePoints}`"
          class="vip-history__row"
        >
          <view class="vip-history__main">
            <text class="vip-history__title">{{ item.remark || item.scene || '积分变更' }}</text>
            <text class="vip-history__time">{{ item.createdAt || '--' }}</text>
          </view>
          <text
            class="vip-history__delta"
            :class="item.changePoints >= 0 ? 'vip-history__delta--plus' : 'vip-history__delta--minus'"
          >
            {{ item.changePoints >= 0 ? '+' : '' }}{{ item.changePoints }}
          </text>
        </view>
      </view>
      <view v-else class="vip-history__empty">
        <text>暂无积分流水记录</text>
      </view>
    </view>

    <view class="vip-footer">
      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 24rpx; font-size: 28rpx;"
        :text="selectedPlan ? `立即开通${selectedPlan.name}` : '立即开通会员'"
        type="info"
        @click="openVip"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { pointsService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const plans = [
  {
    id: 'monthly',
    name: '连续包月',
    sub: '适合轻量体验',
    price: '19.9',
    originPrice: '30',
    tag: '首月优惠',
    featured: false,
    features: ['专属标识', '无限次质量诊断', '优先客服响应', '标准下载额度提升'],
  },
  {
    id: 'quarterly',
    name: '连续包季',
    sub: '适合稳定使用',
    price: '58',
    originPrice: '90',
    tag: '立省 32 元',
    featured: false,
    features: ['包含包月全部权益', '下载额度进一步提升', '专家在线咨询 1 次'],
  },
  {
    id: 'yearly',
    name: '年度会员',
    sub: '适合企业长期使用',
    price: '198',
    originPrice: '360',
    tag: '推荐套餐',
    featured: true,
    features: ['包含包季全部权益', '不限次数标准下载', '专家在线咨询 5 次', '线下活动优先参与'],
  },
]

const benefits = [
  { title: '专属标识', iconName: 'vip', color: '#1E61FF', bg: '#eff6ff' },
  { title: '标准下载', iconName: 'download', color: '#0f766e', bg: '#ecfdf5' },
  { title: '专家咨询', iconName: 'consult', color: '#7c3aed', bg: '#f5f3ff' },
  { title: '极速响应', iconName: 'support', color: '#b45309', bg: '#fff7ed' },
  { title: '深度诊断', iconName: 'analysis', color: '#1E61FF', bg: '#eff6ff' },
  { title: '会员活动', iconName: 'benefit', color: '#dc2626', bg: '#fef2f2' },
  { title: '消息提醒', iconName: 'message', color: '#4f46e5', bg: '#eef2ff' },
  { title: '更多权益', iconName: 'star', color: '#0891b2', bg: '#ecfeff' },
]

const selectedPlanId = ref('yearly')
const userStore = useUserStore()
const availablePoints = ref<number | null>(null)
const totalPoints = ref<number | null>(null)
const memberLevel = ref<number | null>(null)
const historyList = ref<Awaited<ReturnType<typeof pointsService.getMyHistory>>['list']>([])
const topRules = ref<Awaited<ReturnType<typeof pointsService.getRules>>>([])
const isGuest = computed(() => !userStore.isLoggedIn)

const selectedPlan = computed(() => plans.find((item) => item.id === selectedPlanId.value) ?? null)
const levelName = computed(() => {
  const level = memberLevel.value ?? 0

  if (level >= 3) {
    return '钻石会员'
  }

  if (level >= 2) {
    return '高级会员'
  }

  if (level >= 1) {
    return '标准会员'
  }

  return '普通会员'
})
const availablePointsText = computed(() => (availablePoints.value === null ? '--' : String(availablePoints.value)))
const totalPointsText = computed(() => (totalPoints.value === null ? '--' : String(totalPoints.value)))
const heroSubtitle = computed(() => {
  if (isGuest.value) {
    return '游客模式 · 可先浏览会员权益'
  }

  return `${levelName.value} · 可用积分 ${availablePointsText.value}`
})

function selectPlan(planId: string) {
  selectedPlanId.value = planId
}

onShow(() => {
  if (!userStore.isLoggedIn) {
    resetPointsAssets()
    return
  }

  void loadPointsAssets()
})

function resetPointsAssets() {
  availablePoints.value = null
  totalPoints.value = null
  memberLevel.value = null
  historyList.value = []
  topRules.value = []
}

async function loadPointsAssets() {
  try {
    const [summary, rules, historyPage] = await Promise.all([
      pointsService.getMy(),
      pointsService.getRules(),
      pointsService.getMyHistory({ page: 1, size: 10 }),
    ])

    availablePoints.value = summary.availablePoints
    totalPoints.value = summary.totalPoints
    memberLevel.value = summary.memberLevel ?? null
    historyList.value = historyPage.list
    topRules.value = rules.slice(0, 3)
  } catch (error) {
    showFailToast(getErrorMessage(error, '积分信息加载失败'))
  }
}

function openVip() {
  if (isGuest.value) {
    goLogin()
    return
  }

  const planName = selectedPlan.value?.name ?? '会员'
  showSuccessToast(`${planName}开通流程建设中`)
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}
</script>

<style scoped lang="scss">
.page-vip {
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
  background: $bg-page;
  box-sizing: border-box;
}

.vip-hero {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
}

.vip-hero__badge {
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(245, 208, 169, 0.4);
  background: rgba(245, 208, 169, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-hero__copy {
  flex: 1;
  min-width: 0;
}

.vip-hero__title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
}

.vip-hero__desc {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
}

.vip-guest {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid #dbeafe;
  background: #ffffff;
}

.vip-guest__title {
  display: block;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 600;
}

.vip-guest__desc {
  display: block;
  margin-top: 10rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.6;
}

.vip-section {
  margin-top: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.06);
}

.vip-section--points {
  padding-top: 24rpx;
}

.vip-points-card {
  border-radius: 20rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.vip-points-card__main {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.vip-points-card__label {
  color: #475569;
  font-size: 22rpx;
}

.vip-points-card__value {
  color: #1d4ed8;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.2;
}

.vip-points-card__side {
  text-align: right;
}

.vip-points-card__side-label {
  display: block;
  color: #64748b;
  font-size: 20rpx;
}

.vip-points-card__side-value {
  display: block;
  margin-top: 6rpx;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.vip-rules-inline {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.vip-rules-inline__title {
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.vip-rules-inline__item {
  color: #475569;
  font-size: 22rpx;
}

.vip-section__title {
  display: block;
  margin-bottom: 20rpx;
  color: $slate-900;
  font-size: 30rpx;
  font-weight: 700;
}

.vip-plan-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.vip-plan {
  padding: 24rpx;
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.vip-plan--featured {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.vip-plan--active {
  border-color: #93c5fd;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.12);
}

.vip-plan__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.vip-plan__copy {
  flex: 1;
  min-width: 0;
}

.vip-plan__name {
  display: block;
  color: $slate-900;
  font-size: 30rpx;
  font-weight: 700;
}

.vip-plan__sub {
  display: block;
  margin-top: 6rpx;
  color: $slate-400;
  font-size: 22rpx;
}

.vip-plan__price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
  flex-shrink: 0;
}

.vip-plan__badge {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #1E61FF 0%, #4A86FF 100%);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 1;
}

.vip-plan__price {
  display: block;
  color: #1E61FF;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.1;
}

.vip-plan__origin {
  display: block;
  color: $slate-400;
  font-size: 20rpx;
  text-decoration: line-through;
  line-height: 1;
}

.vip-plan__features {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #f8fafc;
}

.vip-plan__feature {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.vip-plan__feature-text {
  color: $slate-600;
  font-size: 24rpx;
}

.vip-plan__selected {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #eff6ff;
}

.vip-plan__selected-text {
  color: #1E61FF;
  font-size: 22rpx;
  font-weight: 600;
}

.vip-benefits {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20rpx 12rpx;
}

.vip-benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  text-align: center;
}

.vip-benefit__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-benefit__title {
  color: $slate-600;
  font-size: 22rpx;
  line-height: 1.4;
}

.vip-history {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.vip-history__row {
  border-radius: 16rpx;
  padding: 14rpx 16rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.vip-history__main {
  flex: 1;
  min-width: 0;
}

.vip-history__title {
  display: block;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.vip-history__time {
  display: block;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 20rpx;
}

.vip-history__delta {
  font-size: 28rpx;
  font-weight: 700;
}

.vip-history__delta--plus {
  color: #0f766e;
}

.vip-history__delta--minus {
  color: #dc2626;
}

.vip-history__empty {
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 18rpx;
  color: #64748b;
  font-size: 22rpx;
  text-align: center;
}

.vip-footer {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom) + 24rpx);
}
</style>
