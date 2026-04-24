<template>
  <view class="page-lottery">
    <view class="lottery-card">
      <view class="lottery-wheel-shell">
        <view class="lottery-pointer">
          <text class="lottery-pointer__text">抽</text>
        </view>

        <view class="lottery-wheel" :style="wheelStyle">
          <view class="lottery-wheel__surface"></view>

          <view
            v-for="sector in wheelSectors"
            :key="`${sector.index}-${sector.level}`"
            class="lottery-wheel__label"
            :style="resolveWheelSectorStyle(sector.index)"
          >
            <text
              class="lottery-wheel__label-chip"
              :class="`lottery-wheel__label-chip--${sector.level.toLowerCase()}`"
            >
              {{ sector.name }}
            </text>
          </view>

          <view class="lottery-wheel__center" />
        </view>
      </view>

      <text class="lottery-card__hint">{{ drawHintText }}</text>

      <AppButton
        block
        custom-style="min-height: 92rpx; border-radius: 20rpx; margin-top: 20rpx;"
        :disabled="drawDisabled"
        :loading="isDrawing"
        :text="drawButtonText"
        type="info"
        @click="handleDraw"
      />

      <view v-if="drawnResult" class="lottery-inline-result">
        <text class="lottery-inline-result__title">抽奖结果：{{ drawnResult.prizeName }}</text>
        <text class="lottery-inline-result__desc">领奖编号：{{ drawnResult.claimCode }}</text>
      </view>
    </view>

    <view class="lottery-card lottery-card--light">
      <text class="lottery-section__title">奖项配置</text>
      <view v-if="prizeLines.length > 0" class="lottery-prize-list">
        <view v-for="item in prizeLines" :key="item.level" class="lottery-prize-item">
          <text class="lottery-prize-item__name">{{ item.name }}</text>
          <text class="lottery-prize-item__meta">{{ item.meta }}</text>
        </view>
      </view>
      <text v-else class="lottery-empty">正在加载奖项信息...</text>
    </view>

    <view class="lottery-card lottery-card--light">
      <text class="lottery-section__title">活动说明</text>
      <view class="lottery-rule-list">
        <text class="lottery-rule-item">1. 仅限活动当天注册用户参与。</text>
        <text class="lottery-rule-item">2. 每个账号仅可抽取 1 次。</text>
        <text class="lottery-rule-item">3. 奖项设置以活动配置为准。</text>
        <text class="lottery-rule-item">4. 请凭领奖编号至现场工作人员核销领取奖品。</text>
      </view>
    </view>

    <view v-if="resultPopupVisible && drawnResult" class="lottery-result-mask" @tap="closeResultPopup">
      <view class="lottery-result-card" @tap.stop>
        <text class="lottery-result-card__title">{{ drawnResult.prizeName }}</text>
        <text class="lottery-result-card__subtitle">恭喜你抽中奖品</text>
        <view class="lottery-result-card__code">
          <text class="lottery-result-card__code-label">领奖编号</text>
          <text class="lottery-result-card__code-value">{{ drawnResult.claimCode }}</text>
        </view>
        <AppButton
          block
          custom-style="margin-top: 22rpx; border-radius: 16rpx; min-height: 82rpx;"
          text="我知道了"
          type="info"
          @click="closeResultPopup"
        />
      </view>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import {
  lotteryService,
} from '@/services/api'
import type {
  LotteryCampaignCurrent,
  LotteryDrawResult,
  LotteryMyResult,
  PrizeLevel,
} from '@/services/api/lottery'
import { showFailToast } from '@/services/ui/toast'

type LotteryPageState = 'canDraw' | 'drawn' | 'loading' | 'notEligible'

const WHEEL_ANIMATION_MS = 5200
const WHEEL_BASE_CIRCLES = 5

const DEFAULT_SEGMENT_PRIZE_LEVELS: PrizeLevel[] = [
  'THIRD', 'SECOND', 'THIRD', 'THIRD',
  'FIRST', 'THIRD', 'THIRD', 'THIRD',
  'SECOND', 'THIRD', 'THIRD', 'THIRD',
]

const PRIZE_NAME_MAP: Record<PrizeLevel, string> = {
  FIRST: '一等奖',
  SECOND: '二等奖',
  THIRD: '三等奖',
}

const campaign = ref<LotteryCampaignCurrent | null>(null)
const myResult = ref<LotteryMyResult | null>(null)
const isLoading = ref(false)
const isDrawing = ref(false)
const resultPopupVisible = ref(false)
const wheelRotation = ref(0)
const wheelTransitionEnabled = ref(false)
let revealTimer: ReturnType<typeof setTimeout> | null = null

const wheelSectors = computed<Array<{
  index: number
  level: PrizeLevel
  name: string
}>>(() => {
  const levels = campaign.value?.wheel?.segmentPrizeLevels
  const expectedCount = campaign.value?.wheel?.segmentCount ?? DEFAULT_SEGMENT_PRIZE_LEVELS.length
  const segmentPrizeLevels = Array.isArray(levels) && levels.length === expectedCount && levels.length > 0
    ? levels
    : DEFAULT_SEGMENT_PRIZE_LEVELS

  return segmentPrizeLevels.map((level, index) => ({
    index,
    level,
    name: PRIZE_NAME_MAP[level],
  }))
})

const pageState = computed<LotteryPageState>(() => {
  if (isLoading.value) {
    return 'loading'
  }

  if (!campaign.value) {
    return 'loading'
  }

  if (myResult.value?.hasDrawn) {
    return 'drawn'
  }

  if (!campaign.value.eligible) {
    return 'notEligible'
  }

  return 'canDraw'
})

const drawnResult = computed<LotteryDrawResult | null>(() => {
  if (!myResult.value?.hasDrawn || !myResult.value.prizeLevel || myResult.value.wheelStopIndex === undefined) {
    return null
  }

  const prizeName = myResult.value.prizeName || PRIZE_NAME_MAP[myResult.value.prizeLevel]

  return {
    campaignId: myResult.value.campaignId,
    claimCode: myResult.value.claimCode,
    drawAt: myResult.value.drawAt,
    drawId: myResult.value.drawId,
    hasDrawn: true,
    prizeLevel: myResult.value.prizeLevel,
    prizeName,
    redeemed: myResult.value.redeemed,
    wheelStopIndex: myResult.value.wheelStopIndex,
  }
})

const drawButtonText = computed(() => {
  if (pageState.value === 'loading') {
    return '加载中...'
  }

  if (isDrawing.value) {
    return '抽奖中...'
  }

  if (pageState.value === 'drawn') {
    return '已抽奖'
  }

  if (pageState.value === 'notEligible') {
    return '暂不可抽奖'
  }

  return '立即抽奖'
})

const drawDisabled = computed(() => {
  if (isLoading.value || isDrawing.value) {
    return true
  }

  return pageState.value !== 'canDraw'
})

const drawHintText = computed(() => {
  if (pageState.value === 'loading') {
    return '活动信息加载中，请稍候...'
  }

  if (pageState.value === 'drawn') {
    return '你已完成抽奖，可凭领奖编号到现场领取奖品'
  }

  if (pageState.value === 'notEligible') {
    return lotteryService.resolveIneligibleText(campaign.value?.ineligibleReason)
  }

  return '点击按钮开始抽奖，结果以系统开奖为准'
})

const prizeLines = computed(() => {
  if (!campaign.value) {
    return []
  }

  return campaign.value.prizes.map((item) => {
    const remainText = item.unlimited
      ? typeof item.issued === 'number'
        ? `已发放 ${item.issued} 份`
        : '不限量发放'
      : `剩余 ${item.remain ?? 0} / 共 ${item.total ?? 0} 份`

    return {
      level: item.level,
      meta: remainText,
      name: item.name,
    }
  })
})

const wheelStyle = computed(() => {
  const transitionText = wheelTransitionEnabled.value
    ? `transform ${WHEEL_ANIMATION_MS}ms cubic-bezier(0.16, 0.86, 0.26, 0.99)`
    : 'none'

  return `transform: rotate(${wheelRotation.value}deg); transition: ${transitionText};`
})

onShow(() => {
  void loadLotteryContext()
})

onUnmounted(() => {
  clearRevealTimer()
})

function clearRevealTimer() {
  if (!revealTimer) {
    return
  }

  clearTimeout(revealTimer)
  revealTimer = null
}

function resolveWheelSectorStyle(index: number) {
  const sectorCount = wheelSectors.value.length > 0 ? wheelSectors.value.length : DEFAULT_SEGMENT_PRIZE_LEVELS.length
  const angle = index * (360 / sectorCount)
  return `transform: rotate(${angle}deg) translateY(-248rpx);`
}

function clampWheelStopIndex(value: number | undefined) {
  const sectorCount = wheelSectors.value.length > 0 ? wheelSectors.value.length : DEFAULT_SEGMENT_PRIZE_LEVELS.length

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  const normalized = Math.round(value) % sectorCount
  return normalized >= 0 ? normalized : normalized + sectorCount
}

function resolveFinalModAngleByIndex(index: number) {
  const sectorCount = wheelSectors.value.length > 0 ? wheelSectors.value.length : DEFAULT_SEGMENT_PRIZE_LEVELS.length
  return (360 - index * (360 / sectorCount)) % 360
}

function resolveDisplayStopIndex(wheelStopIndex: number | undefined, prizeLevel?: PrizeLevel) {
  const normalized = clampWheelStopIndex(wheelStopIndex)

  if (!prizeLevel) {
    return normalized
  }

  const matchedLevel = wheelSectors.value[normalized]?.level
  if (matchedLevel === prizeLevel) {
    return normalized
  }

  const fallbackIndex = wheelSectors.value.findIndex((item) => item.level === prizeLevel)
  return fallbackIndex >= 0 ? fallbackIndex : normalized
}

function computeNextWheelRotation(stopIndex: number) {
  const targetMod = resolveFinalModAngleByIndex(stopIndex)
  const currentMod = ((wheelRotation.value % 360) + 360) % 360
  const extraDelta = (targetMod - currentMod + 360) % 360
  return wheelRotation.value + WHEEL_BASE_CIRCLES * 360 + extraDelta
}

function syncWheelForHistory(stopIndex: number) {
  wheelTransitionEnabled.value = false
  wheelRotation.value = resolveFinalModAngleByIndex(stopIndex)
}

async function loadLotteryContext() {
  isLoading.value = true

  try {
    const current = await lotteryService.getCurrentCampaign()
    campaign.value = current

    const mine = await lotteryService.getMyResult(current.campaignId)
    const normalizedMine = mine.hasDrawn
      ? {
        ...mine,
        wheelStopIndex: resolveDisplayStopIndex(mine.wheelStopIndex, mine.prizeLevel),
      }
      : mine
    myResult.value = normalizedMine

    if (normalizedMine.hasDrawn) {
      syncWheelForHistory(clampWheelStopIndex(normalizedMine.wheelStopIndex))
    }
  } catch (error) {
    showFailToast(lotteryService.resolveLotteryErrorMessage(error, '抽奖信息加载失败，请稍后重试'))
  } finally {
    isLoading.value = false
  }
}

async function handleDraw() {
  if (!campaign.value || drawDisabled.value) {
    return
  }

  isDrawing.value = true
  resultPopupVisible.value = false
  clearRevealTimer()

  try {
    const result = await lotteryService.draw({ campaignId: campaign.value.campaignId })
    const stopIndex = resolveDisplayStopIndex(result.wheelStopIndex, result.prizeLevel)

    wheelTransitionEnabled.value = true
    wheelRotation.value = computeNextWheelRotation(stopIndex)

    revealTimer = setTimeout(() => {
      myResult.value = {
        ...result,
        wheelStopIndex: stopIndex,
      }
      resultPopupVisible.value = true
      isDrawing.value = false
    }, WHEEL_ANIMATION_MS + 80)
  } catch (error) {
    isDrawing.value = false
    showFailToast(lotteryService.resolveLotteryErrorMessage(error, '抽奖失败，请稍后再试'))
    void loadLotteryContext()
  }
}

function closeResultPopup() {
  resultPopupVisible.value = false
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-lottery {
  min-height: 100vh;
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #edf4ff 0%, #f8fbff 36%, #f7f9fc 100%);
  box-sizing: border-box;
}

.lottery-card {
  margin-top: 18rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 32rpx rgba(30, 97, 255, 0.08);
}

.lottery-card--light {
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.lottery-wheel-shell {
  position: relative;
  width: 560rpx;
  height: 560rpx;
  margin: 0 auto;
}

.lottery-pointer {
  position: absolute;
  left: 50%;
  top: 6rpx;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  z-index: 8;
  border-left: 24rpx solid transparent;
  border-right: 24rpx solid transparent;
  border-top: 58rpx solid #ef4444;
}

.lottery-pointer__text {
  position: absolute;
  top: -56rpx;
  left: -16rpx;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
}

.lottery-wheel {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 0 0 0 10rpx #fef3c7, 0 16rpx 36rpx rgba(15, 23, 42, 0.14);
}

.lottery-wheel__surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    conic-gradient(
      #fef3c7 0deg 30deg,
      #fde68a 30deg 60deg,
      #dbeafe 60deg 90deg,
      #fef3c7 90deg 120deg,
      #fde68a 120deg 150deg,
      #dbeafe 150deg 180deg,
      #fef3c7 180deg 210deg,
      #fde68a 210deg 240deg,
      #dbeafe 240deg 270deg,
      #fef3c7 270deg 300deg,
      #fde68a 300deg 330deg,
      #dbeafe 330deg 360deg
    );
}

.lottery-wheel__label {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-origin: center center;
}

.lottery-wheel__label-chip {
  position: absolute;
  left: -52rpx;
  top: -26rpx;
  min-width: 104rpx;
  height: 52rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 600;
}

.lottery-wheel__label-chip--first {
  color: #b91c1c;
  background: #fee2e2;
  border: 2rpx solid #fecaca;
}

.lottery-wheel__label-chip--second {
  color: #7c2d12;
  background: #ffedd5;
  border: 2rpx solid #fed7aa;
}

.lottery-wheel__label-chip--third {
  color: #1e3a8a;
  background: #dbeafe;
  border: 2rpx solid #bfdbfe;
}

.lottery-wheel__center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1e61ff 0%, #1c4edd 100%);
  box-shadow: 0 8rpx 22rpx rgba(30, 97, 255, 0.32);
  border: 8rpx solid #eff6ff;
}

.lottery-card__hint {
  display: block;
  margin-top: 24rpx;
  color: $slate-500;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.5;
}

.lottery-inline-result {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 14rpx;
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
}

.lottery-inline-result__title {
  display: block;
  color: #1e3a8a;
  font-size: 26rpx;
  font-weight: 600;
}

.lottery-inline-result__desc {
  display: block;
  margin-top: 6rpx;
  color: #1d4ed8;
  font-size: 24rpx;
}

.lottery-section__title {
  display: block;
  color: $slate-900;
  font-size: 28rpx;
  font-weight: 600;
}

.lottery-prize-list {
  margin-top: 14rpx;
}

.lottery-prize-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #eef2ff;
}

.lottery-prize-item:last-child {
  border-bottom: 0;
}

.lottery-prize-item__name {
  color: $slate-700;
  font-size: 25rpx;
  font-weight: 600;
}

.lottery-prize-item__meta {
  color: $slate-500;
  font-size: 22rpx;
}

.lottery-empty {
  margin-top: 12rpx;
  color: $slate-400;
  font-size: 24rpx;
}

.lottery-rule-list {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.lottery-rule-item {
  color: $slate-600;
  font-size: 24rpx;
  line-height: 1.6;
}

.lottery-result-mask {
  position: fixed;
  inset: 0;
  padding: 24rpx;
  background: rgba(2, 6, 23, 0.54);
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lottery-result-card {
  width: 100%;
  max-width: 620rpx;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 32rpx 28rpx;
  box-sizing: border-box;
}

.lottery-result-card__title {
  display: block;
  color: $slate-900;
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
}

.lottery-result-card__subtitle {
  display: block;
  margin-top: 10rpx;
  color: $slate-500;
  text-align: center;
  font-size: 24rpx;
}

.lottery-result-card__code {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
}

.lottery-result-card__code-label {
  display: block;
  color: #1e3a8a;
  font-size: 22rpx;
}

.lottery-result-card__code-value {
  display: block;
  margin-top: 8rpx;
  color: #1e40af;
  font-size: 32rpx;
  font-weight: 700;
}
</style>
