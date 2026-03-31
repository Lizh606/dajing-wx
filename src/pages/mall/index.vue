<template>
  <view class="page-mall">
    <view class="search-header">
      <view class="search-box">
        <text class="search-box__text">🔍 搜索商品 / 软件 / 耗材</text>
      </view>
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs">
          <text
            v-for="c in categories"
            :key="c.key"
            class="tab"
            :class="{ 'tab--active': activeCat === c.key }"
            @tap="activeCat = c.key"
          >{{ c.label }}</text>
        </view>
      </scroll-view>
    </view>
    <scroll-view class="page-mall__scroll" scroll-y>
      <view class="card-grid">
        <view v-for="item in mallItems" :key="item.id" class="service-card" @tap="() => {}">
          <view class="service-card__media" :style="{ background: item.imgBg }">
            <text class="service-card__media-icon">{{ item.icon }}</text>
          </view>
          <view class="service-card__body">
            <text class="service-card__title">{{ item.name }}</text>
            <text class="service-card__org">{{ item.sub }}</text>
            <view class="service-card__price-row">
              <text class="service-card__price">¥{{ item.price }}</text>
              <text class="service-card__sold">已售 {{ item.sold }}</text>
            </view>
            <view class="service-card__tags">
              <text v-for="tag in item.tags" :key="tag" class="service-card__tag service-card__tag--muted">{{ tag }}</text>
            </view>
            <view class="service-card__single-action" @tap.stop="() => {}">加入购物车</view>
          </view>
        </view>
      </view>
    </scroll-view>
    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
const activeCat = ref('all')
const categories = [
  { key: 'all', label: '全部' },
  { key: 'goods', label: '实物商品' },
  { key: 'software', label: '软件服务' },
  { key: 'consumable', label: '检测耗材' },
  { key: 'report', label: '标准报告' },
]
const mallItems = ref([
  { id: '1', name: '质量管理软件系统', sub: '企业版年度授权', price: '4,800', sold: '312', icon: '💻', imgBg: 'linear-gradient(135deg,#dbeafe,#93c5fd)', tags: ['软件', '年度授权'] },
  { id: '2', name: 'PH值检测试剂盒', sub: '50次测量装', price: '128', sold: '2,341', icon: '🧴', imgBg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', tags: ['耗材', '实物'] },
  { id: '3', name: 'GB/T 228金属拉伸标准', sub: '2022版电子版', price: '680', sold: '891', icon: '📗', imgBg: 'linear-gradient(135deg,#fef3c7,#fbbf24)', tags: ['标准', '电子版'] },
  { id: '4', name: '检测数据分析平台', sub: '专业版月度订阅', price: '299', sold: '567', icon: '📊', imgBg: 'linear-gradient(135deg,#f3e8ff,#c084fc)', tags: ['软件', '订阅'] },
  { id: '5', name: '硬度计校准块', sub: 'HRC标准块套装', price: '860', sold: '423', icon: '🔩', imgBg: 'linear-gradient(135deg,#f1f5f9,#cbd5e1)', tags: ['耗材', '实物'] },
  { id: '6', name: 'CE认证申请指南', sub: '2025最新版', price: '199', sold: '1,102', icon: '📘', imgBg: 'linear-gradient(135deg,#ecfdf5,#6ee7b7)', tags: ['报告', '电子版'] },
])
</script>

<style scoped lang="scss">
.page-mall {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
  background: #f8fafc;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
  padding: 20rpx 24rpx 0;
}

.search-box {
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
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
  gap: 8rpx;
  padding-bottom: 20rpx;
}

.tab {
  white-space: nowrap;
  font-size: 24rpx;
  color: #475569;
  background: #f1f5f9;
  border-radius: 12rpx;
  padding: 12rpx 28rpx;
}

.tab--active {
  color: #ffffff;
  background: #2563eb;
}

.page-mall__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.service-card {
  background: #ffffff;
  border-radius: 20rpx;
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
  font-size: 64rpx;
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
  margin-top: 4rpx;
  font-size: 20rpx;
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
  margin-top: 10rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
}

.service-card__tag {
  font-size: 18rpx;
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
}

.service-card__tag--muted {
  background: #f1f5f9;
  color: #475569;
}

.service-card__single-action {
  margin-top: 16rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
  color: #ffffff;
  background: #2563eb;
  border-radius: 12rpx;
  padding: 16rpx 0;
}
</style>
