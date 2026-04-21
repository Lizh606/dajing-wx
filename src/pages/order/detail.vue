<template>
  <view class="page-order-detail">
    <scroll-view class="page-order-detail__scroll" scroll-y>
      <view class="page-order-detail__hero">
        <view class="page-order-detail__hero-content">
          <text class="page-order-detail__hero-title">{{ order.statusText }}</text>
          <text class="page-order-detail__hero-subtitle">{{ order.progressText }}</text>
        </view>
        <view class="page-order-detail__hero-icon">
          <AppIcon color="#ffffff" :name="order.statusIconName" size="36" />
        </view>
      </view>

      <view class="page-order-detail__card">
        <text class="page-order-detail__card-title">委托信息</text>
        <view class="page-order-detail__info-row">
          <text class="page-order-detail__info-label">委托编号</text>
          <text class="page-order-detail__info-value">{{ order.orderNo }}</text>
        </view>
        <view class="page-order-detail__info-row">
          <text class="page-order-detail__info-label">检测项目</text>
          <text class="page-order-detail__info-value">{{ order.title }}</text>
        </view>
        <view class="page-order-detail__info-row">
          <text class="page-order-detail__info-label">委托机构</text>
          <text class="page-order-detail__info-value">{{ order.institution }}</text>
        </view>
        <view class="page-order-detail__info-row">
          <text class="page-order-detail__info-label">样品名称</text>
          <text class="page-order-detail__info-value">锂电池正极材料</text>
        </view>
        <view class="page-order-detail__info-row">
          <text class="page-order-detail__info-label">样品数量</text>
          <text class="page-order-detail__info-value">5件</text>
        </view>
        <view class="page-order-detail__info-row">
          <text class="page-order-detail__info-label">检测标准</text>
          <text class="page-order-detail__info-value">GB/T 24533-2019</text>
        </view>
        <view class="page-order-detail__info-row page-order-detail__info-row--last">
          <text class="page-order-detail__info-label">提交时间</text>
          <text class="page-order-detail__info-value">{{ order.createdAt }}</text>
        </view>
      </view>

      <view class="page-order-detail__card">
        <text class="page-order-detail__card-title">报价信息</text>
        <view class="page-order-detail__quote-box">
          <view class="page-order-detail__quote-row">
            <text class="page-order-detail__quote-label">检测费用</text>
            <text class="page-order-detail__quote-value">¥850.00</text>
          </view>
          <view class="page-order-detail__quote-row">
            <text class="page-order-detail__quote-label">快递费用</text>
            <text class="page-order-detail__quote-value">¥15.00</text>
          </view>
          <view class="page-order-detail__quote-row">
            <text class="page-order-detail__quote-label">加急费用</text>
            <text class="page-order-detail__quote-value">¥135.00</text>
          </view>
          <view class="page-order-detail__quote-divider"></view>
          <view class="page-order-detail__quote-row page-order-detail__quote-row--total">
            <text class="page-order-detail__quote-label">合计</text>
            <text class="page-order-detail__quote-total">¥{{ order.amount.toLocaleString() }}.00</text>
          </view>
        </view>
      </view>

      <view class="page-order-detail__card">
        <text class="page-order-detail__card-title">寄样状态</text>
        <view class="page-order-detail__timeline">
          <view v-for="item in timeline" :key="item.title" class="page-order-detail__timeline-item">
            <view
              class="page-order-detail__timeline-dot"
              :class="item.done ? 'page-order-detail__timeline-dot--done' : 'page-order-detail__timeline-dot--pending'"
            ></view>
            <view class="page-order-detail__timeline-content">
              <text class="page-order-detail__timeline-title">{{ item.title }}</text>
              <text class="page-order-detail__timeline-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="page-order-detail__actions">
        <AppButton
          block
          custom-style="min-height: 88rpx; border-radius: 16rpx;"
          plain
          round
          text="返回列表"
          type="default"
          @click="goBack"
        />
        <AppButton
          v-if="order.status === 'unpaid'"
          block
          custom-style="min-height: 88rpx; border-radius: 16rpx;"
          round
          text="立即支付"
          type="primary"
          @click="handlePrimaryAction"
        />
        <AppButton
          v-else-if="order.status === 'completed'"
          block
          custom-style="min-height: 88rpx; border-radius: 16rpx;"
          round
          text="下载报告"
          type="primary"
          @click="handlePrimaryAction"
        />
        <AppButton
          v-else
          block
          custom-style="min-height: 88rpx; border-radius: 16rpx;"
          plain
          round
          text="联系机构"
          type="primary"
          @click="handleSecondaryAction"
        />
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppToast } from '@/services/ui/toast'

const order = ref({
  id: '2',
  title: '电子产品安规认证',
  status: 'testing',
  statusText: '检测中',
  statusIconName: 'lab',
  progressText: '样品检测中，预计 3 天完成',
  institution: '广州检验检测认证集团',
  amount: 1000,
  orderNo: 'DD20260415003',
  createdAt: '2026-04-15',
})

const timeline = computed(() => [
  { title: '已完成寄样', time: '2026-04-16 14:32', done: true },
  { title: '机构签收样品', time: '2026-04-17 09:15', done: true },
  {
    title: '检测进行中',
    time: '预计 2026-04-20 完成',
    done: order.value.status === 'testing' || order.value.status === 'completed',
  },
  {
    title: '报告已出具',
    time: '-',
    done: order.value.status === 'completed',
  },
])

function goBack() {
  uni.navigateBack()
}

function handlePrimaryAction() {
  showAppToast({ message: order.value.status === 'completed' ? '下载能力建设中' : '支付能力建设中', icon: 'none' })
}

function handleSecondaryAction() {
  showAppToast({ message: '联系机构能力建设中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-order-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}

.page-order-detail__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.page-order-detail__hero {
  margin-bottom: 16rpx;
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.page-order-detail__hero::before {
  content: '';
  position: absolute;
  top: -40rpx;
  right: -20rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.page-order-detail__hero::after {
  content: '';
  position: absolute;
  bottom: -50rpx;
  left: 30rpx;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.page-order-detail__hero-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.page-order-detail__hero-title {
  display: block;
  margin-bottom: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
}

.page-order-detail__hero-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.page-order-detail__hero-icon {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.page-order-detail__card {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.04), 0 4rpx 24rpx rgba(15, 23, 42, 0.03);
  transition: box-shadow 0.2s ease;
}

.page-order-detail__card-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-order-detail__info-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f8fafc;
}

.page-order-detail__info-row--last {
  border-bottom: 0;
}

.page-order-detail__info-label {
  font-size: 26rpx;
  color: #64748b;
}

.page-order-detail__info-value {
  max-width: 60%;
  text-align: right;
  font-size: 26rpx;
  font-weight: 500;
  color: #0f172a;
}

.page-order-detail__quote-box {
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
}

.page-order-detail__quote-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
}

.page-order-detail__quote-row--total {
  padding-top: 16rpx;
}

.page-order-detail__quote-label {
  font-size: 26rpx;
  color: #64748b;
}

.page-order-detail__quote-value {
  font-size: 26rpx;
  color: #0f172a;
}

.page-order-detail__quote-divider {
  height: 1rpx;
  margin: 12rpx 0;
  background: linear-gradient(90deg, #e2e8f0, #f1f5f9, #e2e8f0);
}

.page-order-detail__quote-total {
  font-size: 34rpx;
  font-weight: 700;
  color: #2563eb;
}

.page-order-detail__timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.page-order-detail__timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 20rpx 0;
  position: relative;
}

.page-order-detail__timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 9rpx;
  top: 46rpx;
  bottom: 0;
  width: 2rpx;
  background: #e2e8f0;
}

.page-order-detail__timeline-dot {
  width: 20rpx;
  height: 20rpx;
  margin-top: 6rpx;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.page-order-detail__timeline-dot--done {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.15);
}

.page-order-detail__timeline-dot--pending {
  background: #e2e8f0;
  box-shadow: 0 0 0 4rpx rgba(226, 232, 240, 0.4);
}

.page-order-detail__timeline-content {
  flex: 1;
}

.page-order-detail__timeline-title {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #0f172a;
}

.page-order-detail__timeline-time {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.page-order-detail__actions {
  margin-top: 8rpx;
  padding-bottom: 40rpx;
  display: flex;
  gap: 16rpx;
}
</style>
