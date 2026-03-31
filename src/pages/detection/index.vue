<template>
  <view class="page-detection">
    <view class="search-header">
      <view class="search-box">
        <text class="search-box__text">🔍 搜索检测项目 / 标准 / 机构</text>
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
    <scroll-view class="page-detection__scroll" scroll-y>
      <view class="filter-grid">
        <view class="filter-item">
          <text class="filter-item__label">地区：株洲市</text>
          <text class="filter-item__arrow">⌄</text>
        </view>
        <view class="filter-item">
          <text class="filter-item__label">排序：综合推荐</text>
          <text class="filter-item__arrow">⌄</text>
        </view>
        <view class="filter-item">
          <text class="filter-item__label">机构资质</text>
          <text class="filter-item__arrow">⌄</text>
        </view>
        <view class="filter-item">
          <text class="filter-item__label">服务周期</text>
          <text class="filter-item__arrow">⌄</text>
        </view>
      </view>
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
                class="service-card__tag"
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
const categories = ['全部','材料检测','电气安全','环境可靠性','食品检测','化工检测','汽车零部件']
const services = ref([
  { name: '金属材料成分检测', org: '湖南质量检测研究院', price: 980, sold: '1,286', icon: '🧪', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CMA', '3天出报告'] },
  { name: '电气安全检测', org: '广州检验检测认证集团', price: 1200, sold: '876', icon: '⚡', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', tags: ['CNAS', '5天出报告'] },
  { name: '新能源电池包安全检测', org: '中汽研汽车检验中心', price: 8500, sold: '312', icon: '🔋', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CMA', 'CNAS', '7天出报告'] },
  { name: '盐雾试验检测', org: '湖南工业检测技术有限公司', price: 1560, sold: '732', icon: '⚙️', imgBg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', tags: ['环境可靠性', '4天出结果'] },
  { name: '食品安全快速检测', org: '长沙市食品药品检验所', price: 560, sold: '2,104', icon: '🥦', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['食品', '1天出报告'] },
  { name: '土壤污染物检测', org: '湖南省环境监测中心', price: 2400, sold: '489', icon: '🌱', imgBg: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)', tags: ['环境', '5天出报告'] },
])
const goOrder = (item: any) => {
  uni.navigateTo({ url: '/pages/order/create?service=' + encodeURIComponent(item.name) })
}
const goConsult = () => {
  uni.navigateTo({ url: '/pages/institution/consult' })
}
</script>

<style scoped lang="scss">
.page-detection {
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

.page-detection__scroll {
  flex: 1;
  min-height: 0;
}

.filter-grid {
  padding: 20rpx 24rpx 8rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.filter-item {
  background: #ffffff;
  border: 1rpx solid #cbd5e1;
  border-radius: 12rpx;
  padding: 14rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-item__label {
  font-size: 24rpx;
  color: #475569;
}

.filter-item__arrow {
  font-size: 24rpx;
  color: #94a3b8;
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
  background: #dbeafe;
  color: #2563eb;
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
