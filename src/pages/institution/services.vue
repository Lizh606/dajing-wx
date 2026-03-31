<template>
  <view class="page-institution-services">
    <view class="search-header">
      <view class="search-box">
        <text class="search-box__text">🔍 搜索服务项目</text>
      </view>
    </view>
    <view class="page-institution-services__content">
      <view class="card-grid">
        <view v-for="s in services" :key="s.name" class="service-card">
          <view class="service-card__media" :style="{ background: s.imgBg }">
            <text class="service-card__media-icon">{{ s.icon }}</text>
          </view>
          <view class="service-card__body">
            <text class="service-card__title">{{ s.name }}</text>
            <text class="service-card__org">湖南质量检测研究院</text>
            <view class="service-card__price-row">
              <text class="service-card__price">¥{{ s.price }}起</text>
              <text class="service-card__sold">已售 {{ s.sold }}</text>
            </view>
            <view class="service-card__tags">
              <text v-for="t in s.tags" :key="t" class="service-card__tag">{{ t }}</text>
            </view>
            <view class="service-card__actions">
              <text class="action-btn action-btn--secondary" @tap="goConsult">咨询</text>
              <text class="action-btn action-btn--primary" @tap="goOrder">立即下单</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const services = [
  { name:'金属材料成分检测', icon:'🧪', imgBg:'linear-gradient(135deg,#dbeafe,#bfdbfe)', price:980, sold:'1,286', tags:['CMA','3天出报告'] },
  { name:'机械性能测试', icon:'⚙️', imgBg:'linear-gradient(135deg,#fef3c7,#fde68a)', price:1200, sold:'987', tags:['CMA','CNAS','5天出报告'] },
  { name:'化学成分分析', icon:'🔬', imgBg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', price:850, sold:'2,134', tags:['CNAS','4天出报告'] },
  { name:'硬度检测', icon:'🔩', imgBg:'linear-gradient(135deg,#f5f3ff,#ddd6fe)', price:560, sold:'3,421', tags:['CMA','2天出报告'] },
  { name:'无损检测', icon:'📡', imgBg:'linear-gradient(135deg,#fff7ed,#fed7aa)', price:1800, sold:'654', tags:['CNAS','7天出报告'] },
  { name:'腐蚀性测试', icon:'⚗️', imgBg:'linear-gradient(135deg,#fce7f3,#fbcfe8)', price:1500, sold:'432', tags:['CMA','6天出报告'] },
]
const goConsult = () => uni.navigateTo({ url: '/pages/institution/consult' })
const goOrder = () => uni.navigateTo({ url: '/pages/order/create' })
</script>

<style scoped lang="scss">
.page-institution-services {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.search-header {
  background: #ffffff;
  padding: 16rpx 24rpx 20rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.search-box {
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 18rpx 24rpx;
}

.search-box__text {
  font-size: 24rpx;
  color: #94a3b8;
}

.page-institution-services__content {
  flex: 1;
  min-height: 0;
}

.card-grid {
  padding: 16rpx 24rpx 40rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.service-card {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  border: 1rpx solid #f1f5f9;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.service-card__media {
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-card__media-icon {
  font-size: 72rpx;
}

.service-card__body {
  padding: 20rpx;
}

.service-card__title {
  display: block;
  margin-bottom: 6rpx;
  font-size: 26rpx;
  line-height: 1.4;
  font-weight: 600;
  color: #0f172a;
}

.service-card__org {
  display: block;
  margin-bottom: 12rpx;
  font-size: 20rpx;
  color: #94a3b8;
}

.service-card__price-row {
  margin-bottom: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-card__price {
  font-size: 26rpx;
  font-weight: 700;
  color: #2563eb;
}

.service-card__sold {
  font-size: 20rpx;
  color: #94a3b8;
}

.service-card__tags {
  margin-bottom: 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
}

.service-card__tag {
  font-size: 18rpx;
  border-radius: 6rpx;
  padding: 4rpx 10rpx;
  background: #dbeafe;
  color: #2563eb;
}

.service-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8rpx;
}

.action-btn {
  text-align: center;
  font-size: 24rpx;
  border-radius: 10rpx;
  padding: 16rpx 0;
}

.action-btn--secondary {
  color: #475569;
  background: #f1f5f9;
}

.action-btn--primary {
  color: #ffffff;
  background: #2563eb;
}
</style>
