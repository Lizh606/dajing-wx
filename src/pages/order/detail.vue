<template>
  <view class="page-order-detail">
    <scroll-view class="page-order-detail__scroll" scroll-y>
      <view class="page-order-detail__hero">
        <view class="page-order-detail__hero-content">
          <text class="page-order-detail__hero-title">{{ order.statusText }}</text>
          <text class="page-order-detail__hero-subtitle">{{ order.progressText }}</text>
        </view>
        <text class="page-order-detail__hero-icon">{{ order.statusIcon }}</text>
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
        <view class="page-order-detail__quote-box page-order-detail__stats">
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
          <view class="page-order-detail__timeline-item">
            <view class="page-order-detail__timeline-dot page-order-detail__timeline-dot--done"></view>
            <view class="page-order-detail__timeline-content">
              <text class="page-order-detail__timeline-title">已完成寄样</text>
              <text class="page-order-detail__timeline-time">2026-04-16 14:32</text>
            </view>
          </view>
          <view class="page-order-detail__timeline-item">
            <view class="page-order-detail__timeline-dot page-order-detail__timeline-dot--done"></view>
            <view class="page-order-detail__timeline-content">
              <text class="page-order-detail__timeline-title">机构签收样品</text>
              <text class="page-order-detail__timeline-time">2026-04-17 09:15</text>
            </view>
          </view>
          <view class="page-order-detail__timeline-item">
            <view
              class="page-order-detail__timeline-dot"
              :class="order.status==='testing'||order.status==='completed' ? 'page-order-detail__timeline-dot--done' : 'page-order-detail__timeline-dot--pending'"
            ></view>
            <view class="page-order-detail__timeline-content">
              <text class="page-order-detail__timeline-title">检测进行中</text>
              <text class="page-order-detail__timeline-time">预计 2026-04-20 完成</text>
            </view>
          </view>
          <view class="page-order-detail__timeline-item">
            <view
              class="page-order-detail__timeline-dot"
              :class="order.status==='completed' ? 'page-order-detail__timeline-dot--done' : 'page-order-detail__timeline-dot--pending'"
            ></view>
            <view class="page-order-detail__timeline-content">
              <text class="page-order-detail__timeline-title">报告已出具</text>
              <text class="page-order-detail__timeline-time">-</text>
            </view>
          </view>
        </view>
      </view>

      <view class="page-order-detail__actions">
        <text class="page-order-detail__action-button page-order-detail__action-button--secondary" @tap="goBack">返回列表</text>
        <text
          v-if="order.status==='unpaid'"
          class="page-order-detail__action-button page-order-detail__action-button--primary"
          @tap="() => {}"
        >立即支付</text>
        <text
          v-else-if="order.status==='completed'"
          class="page-order-detail__action-button page-order-detail__action-button--primary"
          @tap="() => {}"
        >下载报告</text>
        <text
          v-else
          class="page-order-detail__action-button page-order-detail__action-button--outline"
          @tap="() => {}"
        >联系机构</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const order = ref({
  id: '2',
  title: '电子产品安规认证',
  status: 'testing',
  statusText: '检测中',
  statusIcon: '🔬',
  statusColor: '#2563eb',
  progress: 60,
  progressText: '样品检测中，预计3天完成',
  institution: '广州检验检测认证集团',
  amount: 1000,
  orderNo: 'DD20260415003',
  createdAt: '2026-04-15'
})

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page-order-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-order-detail__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.page-order-detail__hero {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-order-detail__hero-content {
  flex: 1;
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
  color: rgba(255, 255, 255, 0.8);
}

.page-order-detail__hero-icon {
  font-size: 64rpx;
}

.page-order-detail__card {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
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
  padding: 16rpx 0;
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
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
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
  margin: 8rpx 0;
  background: #e2e8f0;
}

.page-order-detail__quote-total {
  font-size: 34rpx;
  font-weight: 700;
  color: #2563eb;
}

.page-order-detail__timeline {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.page-order-detail__timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.page-order-detail__timeline-dot {
  width: 20rpx;
  height: 20rpx;
  margin-top: 6rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.page-order-detail__timeline-dot--done {
  background: #2563eb;
}

.page-order-detail__timeline-dot--pending {
  background: #e2e8f0;
}

.page-order-detail__timeline-content {
  flex: 1;
}

.page-order-detail__timeline-title {
  display: block;
  font-size: 26rpx;
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

.page-order-detail__action-button {
  flex: 1;
  text-align: center;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.page-order-detail__action-button--secondary {
  color: #334155;
  background: #f1f5f9;
}

.page-order-detail__action-button--primary {
  color: #ffffff;
  background: #2563eb;
}

.page-order-detail__action-button--outline {
  color: #2563eb;
  border: 2rpx solid #2563eb;
  background: #ffffff;
}
</style>
