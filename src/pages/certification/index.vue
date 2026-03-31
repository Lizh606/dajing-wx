<template>
  <view class="page-certification">
    <view class="search-header">
      <view class="search-box">
        <text class="search-box__text">🔍 搜索认证类型 / 机构 / 行业</text>
      </view>
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs">
          <text
            v-for="c in categories"
            :key="c"
            class="tab"
            :class="{ 'tab--active': activecat === c }"
            @tap="activecat = c"
          >{{ c }}</text>
        </view>
      </scroll-view>
    </view>
    <scroll-view class="page-certification__scroll" scroll-y>
      <view class="card-grid">
        <view
          v-for="item in services"
          :key="item.name"
          class="service-card"
          @tap="goOrder(item)"
        >
          <view class="service-card__media" :style="{ background: item.imgBg }">
            <text class="service-card__media-icon">{{ item.icon }}</text>
          </view>
          <view class="service-card__body">
            <text class="service-card__title">{{ item.name }}</text>
            <text class="service-card__org">{{ item.org }}</text>
            <view class="service-card__price-row">
              <text class="service-card__price">¥{{ item.price }}起</text>
              <text class="service-card__sold">已售 {{ item.sold }}</text>
            </view>
            <view class="service-card__tags">
              <text
                v-for="tag in item.tags"
                :key="tag"
                class="service-card__tag service-card__tag--cert"
              >{{ tag }}</text>
            </view>
            <view class="service-card__actions">
              <text class="action-btn action-btn--secondary" @tap.stop="goConsult">咨询</text>
              <text class="action-btn action-btn--primary" @tap.stop="goOrder(item)">立即下单</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const activecat = ref('全部')
const categories = ['全部','CE认证','ISO认证','CCC认证','有机认证','质量管理','环境管理']
const services = ref([
  { name: 'CE认证咨询', org: '深圳华检技术服务', price: 3800, sold: '654', icon: '🏅', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CE', '欧盟认证'] },
  { name: 'ISO 9001认证', org: '北京华质检测技术', price: 5600, sold: '432', icon: '📋', imgBg: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)', tags: ['ISO', '质量管理'] },
  { name: 'CCC强制认证', org: '中国质量认证中心', price: 4200, sold: '867', icon: '✅', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CCC', '国内强制'] },
  { name: 'ISO 14001认证', org: '湖南质量认证服务中心', price: 6800, sold: '298', icon: '🌿', imgBg: 'linear-gradient(135deg,#ecfdf5,#bbf7d0)', tags: ['ISO', '环境管理'] },
  { name: '有机产品认证', org: '中绿华夏有机食品认证', price: 9800, sold: '134', icon: '🥬', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['有机', '食品农业'] },
  { name: 'IATF 16949认证', org: '广州赛宝认证中心', price: 12000, sold: '89', icon: '🚗', imgBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', tags: ['汽车行业', 'IATF'] },
])
const goOrder = (item: any) => {
  uni.navigateTo({ url: '/pages/order/create?service=' + encodeURIComponent(item.name) })
}
const goConsult = () => {
  uni.navigateTo({ url: '/pages/institution/consult' })
}
</script>

<style scoped lang="scss">
.page-certification {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.search-header {
  background: #ffffff;
  padding: 16rpx 24rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.search-box {
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 20rpx;
}

.search-box__text {
  font-size: 26rpx;
  color: #94a3b8;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: flex;
  gap: 12rpx;
  padding-bottom: 20rpx;
}

.tab {
  white-space: nowrap;
  font-size: 24rpx;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 12rpx;
  padding: 10rpx 24rpx;
}

.tab--active {
  color: #ffffff;
  background: #2563eb;
}

.page-certification__scroll {
  flex: 1;
  min-height: 0;
}

.card-grid {
  padding: 20rpx 24rpx 40rpx;
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
  height: 180rpx;
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
  font-size: 26rpx;
  line-height: 1.4;
  font-weight: 600;
  color: #0f172a;
}

.service-card__org {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #64748b;
}

.service-card__price-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-card__price {
  font-size: 28rpx;
  font-weight: 700;
  color: #2563eb;
}

.service-card__sold {
  font-size: 20rpx;
  color: #94a3b8;
}

.service-card__tags {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.service-card__tag {
  font-size: 20rpx;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
}

.service-card__tag--cert {
  background: #fef3c7;
  color: #92400e;
}

.service-card__actions {
  margin-top: 8rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.action-btn {
  text-align: center;
  font-size: 24rpx;
  border-radius: 12rpx;
  padding: 14rpx 0;
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
