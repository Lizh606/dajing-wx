<template>
  <view class="page-institution-detail">
    <scroll-view class="page-institution-detail__scroll" scroll-y>
      <view class="page-institution-detail__hero">
        <view class="page-institution-detail__hero-icon-wrap">
          <text class="page-institution-detail__hero-icon">🏛️</text>
        </view>
        <text class="page-institution-detail__hero-title">湖南质量检测研究院</text>
        <view class="page-institution-detail__tag-list">
          <text v-for="c in ['CMA','CNAS','ILAC']" :key="c" class="page-institution-detail__tag">{{ c }}</text>
        </view>
        <text class="page-institution-detail__hero-location">📍 湖南省长沙市岳麓区</text>
        <view class="page-institution-detail__hero-rating">
          <text class="page-institution-detail__hero-score">4.9</text>
          <text class="page-institution-detail__hero-stars">★★★★★</text>
          <text class="page-institution-detail__hero-count">（2,341条评价）</text>
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
        <text class="page-institution-detail__paragraph">湖南质量检测研究院是具有独立法人资格的第三方检测机构，持有CMA计量认证和CNAS国家认可资质，专注于金属材料、化学成分、机械性能等领域的检验检测服务，年检测样品超过50,000件。</text>
      </view>

      <view class="page-institution-detail__card">
        <view class="page-institution-detail__card-header">
          <text class="page-institution-detail__card-title">服务项目</text>
          <text class="page-institution-detail__more" @tap="goServices">所有服务项目 ›</text>
        </view>
        <view class="page-institution-detail__service-list">
          <view v-for="s in services" :key="s.name" class="page-institution-detail__service-item">
            <view class="page-institution-detail__service-icon" :style="{ background: s.iconBg }">
              <text class="page-institution-detail__service-icon-text">{{ s.icon }}</text>
            </view>
            <view class="page-institution-detail__service-body">
              <text class="page-institution-detail__service-name">{{ s.name }}</text>
              <text class="page-institution-detail__service-desc">{{ s.desc }}</text>
            </view>
            <view class="page-institution-detail__service-side">
              <text class="page-institution-detail__service-price">¥{{ s.price }}起</text>
              <text class="page-institution-detail__service-button" @tap="goOrder">下单</text>
            </view>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__card">
        <text class="page-institution-detail__card-title">履约表现</text>
        <view class="page-institution-detail__stats-grid page-institution-detail__stats-grid--performance">
          <view v-for="p in performance" :key="p.label" class="page-institution-detail__performance-item">
            <text class="page-institution-detail__performance-value" :style="{ color: p.color }">{{ p.value }}</text>
            <text class="page-institution-detail__performance-label">{{ p.label }}</text>
          </view>
        </view>
      </view>

      <view class="page-institution-detail__actions">
        <text class="page-institution-detail__action-button page-institution-detail__action-button--secondary" @tap="goConsult">立即咨询</text>
        <text class="page-institution-detail__action-button page-institution-detail__action-button--primary" @tap="goOrder">立即下单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
const services = [
  { name:'金属材料成分检测', desc:'CMA · 3天出报告', icon:'🧪', iconBg:'#dbeafe', price:980 },
  { name:'机械性能测试', desc:'CMA/CNAS · 5天出报告', icon:'⚙️', iconBg:'#fef3c7', price:1200 },
  { name:'化学成分分析', desc:'CNAS · 4天出报告', icon:'🔬', iconBg:'#d1fae5', price:850 },
]
const performance = [
  { value:'98.6%', label:'准时交付率', color:'#059669' },
  { value:'99.1%', label:'质量合格率', color:'#2563eb' },
  { value:'4.9', label:'客户评分', color:'#d97706' },
  { value:'0件', label:'投诉纠纷', color:'#64748b' },
]
const goConsult = () => uni.navigateTo({ url: '/pages/institution/consult' })
const goOrder = () => uni.navigateTo({ url: '/pages/order/create' })
const goServices = () => uni.navigateTo({ url: '/pages/institution/services' })
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
  margin-bottom: 16rpx;
  padding: 36rpx;
  border-radius: 24rpx;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-institution-detail__hero-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 20rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe;
}

.page-institution-detail__hero-icon {
  font-size: 60rpx;
}

.page-institution-detail__hero-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-institution-detail__tag-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.page-institution-detail__tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #2563eb;
  background: #dbeafe;
}

.page-institution-detail__hero-location {
  display: block;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #64748b;
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
  color: #d97706;
}

.page-institution-detail__hero-stars {
  font-size: 24rpx;
  color: #d97706;
}

.page-institution-detail__hero-count {
  font-size: 22rpx;
  color: #94a3b8;
}

.page-institution-detail__card {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
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
}

.page-institution-detail__service-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-institution-detail__service-icon-text {
  font-size: 40rpx;
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
  flex-shrink: 0;
  text-align: right;
}

.page-institution-detail__service-price {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #2563eb;
}

.page-institution-detail__service-button {
  display: block;
  margin-top: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  text-align: center;
  color: #ffffff;
  background: #2563eb;
}

.page-institution-detail__stats-grid--performance {
  gap: 16rpx;
}

.page-institution-detail__performance-item {
  border-radius: 12rpx;
  text-align: center;
  padding: 20rpx 8rpx;
  background: #f8fafc;
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
}

.page-institution-detail__action-button {
  flex: 1;
  border-radius: 16rpx;
  text-align: center;
  padding: 28rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.page-institution-detail__action-button--secondary {
  color: #334155;
  background: #f1f5f9;
}

.page-institution-detail__action-button--primary {
  color: #ffffff;
  background: #2563eb;
}
</style>
