<template>
  <view class="page-institution-detail">
    <scroll-view class="page-institution-detail__scroll" scroll-y>
      <view class="page-institution-detail__hero">
        <view class="page-institution-detail__hero-icon-wrap">
          <AppIcon color="#2563eb" name="institution" size="40" />
        </view>
        <text class="page-institution-detail__hero-title">湖南质量检测研究院</text>
        <view class="page-institution-detail__tag-list">
          <text v-for="cert in ['CMA', 'CNAS', 'ILAC']" :key="cert" class="page-institution-detail__tag">{{ cert }}</text>
        </view>
        <view class="page-institution-detail__hero-location">
          <AppIcon color="#64748b" name="location" size="14" />
          <text>湖南省长沙市岳麓区</text>
        </view>
        <view class="page-institution-detail__hero-rating">
          <text class="page-institution-detail__hero-score">4.9</text>
          <view class="page-institution-detail__hero-stars">
            <AppIcon v-for="star in 5" :key="star" color="#d97706" name="star" size="14" />
          </view>
          <text class="page-institution-detail__hero-count">（2,341 条评价）</text>
        </view>
      </view>

      <view class="page-institution-detail__card page-institution-detail__stats">
        <view class="page-institution-detail__stats-grid">
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">128</text>
            <text class="page-institution-detail__stats-label">服务项目</text>
          </view>
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">2,341</text>
            <text class="page-institution-detail__stats-label">累计订单</text>
          </view>
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">3天</text>
            <text class="page-institution-detail__stats-label">平均周期</text>
          </view>
          <view class="page-institution-detail__stats-item">
            <text class="page-institution-detail__stats-value">8分钟</text>
            <text class="page-institution-detail__stats-label">响应时间</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__card">
        <text class="page-institution-detail__card-title">能力简介</text>
        <text class="page-institution-detail__paragraph">
          湖南质量检测研究院是具备独立法人资格的第三方检测机构，持有 CMA 计量认证和 CNAS 国家认可资质，
          专注于金属材料、化学成分、机械性能等领域的检验检测服务，年检测样品超过 10,000 件。
        </text>
      </view>

      <view class="page-institution-detail__card">
        <view class="page-institution-detail__card-header">
          <text class="page-institution-detail__card-title">服务项目</text>
          <text class="page-institution-detail__more" @tap="goServices">全部服务</text>
        </view>
        <view class="page-institution-detail__service-list">
          <view v-for="service in services" :key="service.name" class="page-institution-detail__service-item">
            <view class="page-institution-detail__service-icon" :style="{ background: service.iconBg }">
              <AppIcon :name="service.iconName" size="28" />
            </view>
            <view class="page-institution-detail__service-body">
              <text class="page-institution-detail__service-name">{{ service.name }}</text>
              <text class="page-institution-detail__service-desc">{{ service.desc }}</text>
            </view>
            <view class="page-institution-detail__service-side">
              <text class="page-institution-detail__service-price">¥{{ service.price }}起</text>
              <AppButton
                custom-style="min-height: 64rpx; height: 64rpx; min-width: 128rpx; padding: 0 24rpx; border-radius: 18rpx; font-size: 24rpx; font-weight: 600;"
                text="下单"
                type="info"
                @click="goOrder"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__card">
        <text class="page-institution-detail__card-title">履约表现</text>
        <view class="page-institution-detail__stats-grid page-institution-detail__stats-grid--performance">
          <view v-for="item in performance" :key="item.label" class="page-institution-detail__performance-item">
            <text class="page-institution-detail__performance-value" :style="{ color: item.color }">{{ item.value }}</text>
            <text class="page-institution-detail__performance-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__actions">
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          plain
          text="立即咨询"
          type="default"
          @click="goConsult"
        />
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          text="立即下单"
          type="info"
          @click="goOrder"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'

const services = [
  { name: '金属材料成分检测', desc: 'CMA · 3天出报告', iconName: 'lab', iconBg: '#dbeafe', price: 980 },
  { name: '机械性能测试', desc: 'CMA/CNAS · 5天出报告', iconName: 'automation', iconBg: '#fef3c7', price: 1200 },
  { name: '化学成分分析', desc: 'CNAS · 4天出报告', iconName: 'chemistry', iconBg: '#d1fae5', price: 850 },
]

const performance = [
  { value: '98.6%', label: '准时交付率', color: '#059669' },
  { value: '99.1%', label: '质量合格率', color: '#2563eb' },
  { value: '4.9', label: '客户评分', color: '#d97706' },
  { value: '0件', label: '投诉纠纷', color: '#64748b' },
]

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}

function goOrder() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/order/create' })
}

function goServices() {
  uni.navigateTo({ url: '/pages/institution/services' })
}
</script>

<style scoped lang="scss">
.page-institution-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-institution-detail__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.page-institution-detail__hero {
  position: relative;
  margin-bottom: 16rpx;
  padding: 36rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #1e40af, #2563eb, #3b82f6);
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.page-institution-detail__hero::before {
  content: '';
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.15);
  filter: blur(40rpx);
  pointer-events: none;
}

.page-institution-detail__hero::after {
  content: '';
  position: absolute;
  bottom: -30rpx;
  left: -30rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  filter: blur(40rpx);
  pointer-events: none;
}

.page-institution-detail__hero-icon-wrap {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 20rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
}

.page-institution-detail__hero-title {
  display: block;
  position: relative;
  margin-bottom: 16rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
}

.page-institution-detail__tag-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.page-institution-detail__tag {
  @include pill-tag(24rpx, 8rpx, 6rpx 16rpx);
  @include pill-tag-tone(#ffffff, rgba(255, 255, 255, 0.25));
}

.page-institution-detail__hero-location {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.page-institution-detail__hero-rating {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
}

.page-institution-detail__hero-score {
  font-size: 40rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-institution-detail__hero-stars {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
}

.page-institution-detail__hero-count {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.page-institution-detail__card {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.page-institution-detail__card-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-institution-detail__stats {
  padding: 24rpx;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
}

.page-institution-detail__stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.page-institution-detail__stats-item {
  text-align: center;
}

.page-institution-detail__stats-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-institution-detail__stats-label {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-institution-detail__paragraph {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: #475569;
}

.page-institution-detail__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.page-institution-detail__more {
  font-size: 24rpx;
  color: #2563eb;
}

.page-institution-detail__service-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.page-institution-detail__service-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
}

.page-institution-detail__service-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.page-institution-detail__service-body {
  flex: 1;
  min-width: 0;
}

.page-institution-detail__service-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-institution-detail__service-desc {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-institution-detail__service-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
  flex-shrink: 0;
}

.page-institution-detail__service-price {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-institution-detail__stats-grid--performance {
  gap: 16rpx;
}

.page-institution-detail__performance-item {
  border-radius: 16rpx;
  text-align: center;
  padding: 20rpx 8rpx;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  transition: all 0.2s ease;
}

.page-institution-detail__performance-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.page-institution-detail__performance-label {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-institution-detail__actions {
  margin-top: 8rpx;
  padding-bottom: 40rpx;
  display: flex;
  gap: 16rpx;

  :deep(.van-button),
  :deep(.app-button) {
    flex: 1 1 0;
    width: auto;
  }
}
</style>
