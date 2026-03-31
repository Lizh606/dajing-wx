<template>
  <view class="page-service">
    <view class="search-header search-header--primary">
      <view class="search-box">
        <text class="search-box__text">🔍 搜索服务项目 / 机构 / 认证</text>
      </view>
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs">
          <text
            v-for="c in categories"
            :key="c.key"
            class="tab"
            :class="{ 'tab--active': activecat === c.key }"
            @tap="activecat = c.key"
          >{{ c.label }}</text>
        </view>
      </scroll-view>
    </view>
    <scroll-view class="page-service__scroll" scroll-y>
      <view v-for="group in serviceGroups" :key="group.title" class="service-group">
        <view class="service-group__head">
          <view
            class="service-group__icon-wrap"
            :style="{ background: group.iconBg }"
          >
            <text class="service-group__icon">{{ group.icon }}</text>
          </view>
          <view class="service-group__meta">
            <text class="service-group__title">{{ group.title }}</text>
            <text class="service-group__sub">{{ group.sub }}</text>
          </view>
          <text class="service-group__more" @tap="goMore(group)">查看全部 ›</text>
        </view>
        <view class="card-grid">
          <view
            v-for="item in group.items"
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
const activecat = ref('all')
const categories = [
  { key: 'all', label: '全部' },
  { key: 'detection', label: '检验检测' },
  { key: 'cert', label: '认证认可' },
  { key: 'measure', label: '计量校准' },
  { key: 'standard', label: '标准服务' },
  { key: 'consult', label: '质量咨询' },
  { key: 'training', label: '质量培训' },
]
const serviceGroups = ref([
  {
    title: '检验检测', sub: '全平台检测服务', icon: '🔬', iconBg: '#eff6ff',
    items: [
      { name: '金属材料成分检测', org: '湖南质量检测研究院', price: 980, sold: '1,286', icon: '🧪', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CMA', '3天出报告'] },
      { name: '电气安全检测', org: '广州检验检测认证集团', price: 1200, sold: '876', icon: '⚡', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', tags: ['CNAS', '5天出报告'] },
    ]
  },
  {
    title: '认证认可', sub: '权威机构认证服务', icon: '🏅', iconBg: '#fffbeb',
    items: [
      { name: 'CE认证咨询', org: '深圳华检技术服务', price: 3800, sold: '654', icon: '🏅', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CE', '欧盟认证'] },
      { name: 'ISO9001认证', org: '北京中质协认证中心', price: 5600, sold: '432', icon: '📋', imgBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', tags: ['ISO', '质量管理'] },
    ]
  },
])
function goMore(group: any) {
  const url = group.title === '认证认可' ? '/pages/certification/index' : '/pages/detection/index'
  uni.navigateTo({ url })
}
function goOrder(item: any) {
  uni.navigateTo({ url: `/pages/order/create?service=${encodeURIComponent(item.name)}` })
}
function goConsult() {
  uni.navigateTo({ url: '/pages/institution/consult' })
}
</script>

<style scoped lang="scss">
.page-service {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
  background: #f0f4f8;
}

.search-header {
  padding: 20rpx 32rpx 32rpx;
}

.search-header--primary {
  background: #1a56db;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 48rpx;
  padding: 16rpx 24rpx;
}

.search-box__text {
  font-size: 28rpx;
  color: #94a3b8;
}

.tabs-scroll {
  margin-top: 24rpx;
}

.tabs {
  display: flex;
  gap: 8rpx;
  padding-bottom: 4rpx;
}

.tab {
  white-space: nowrap;
  font-size: 24rpx;
  padding: 12rpx 28rpx;
  border-radius: 12rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

.tab--active {
  color: #2563eb;
  background: #ffffff;
}

.page-service__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.service-group {
  margin-bottom: 32rpx;
}

.service-group__head {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.service-group__icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-group__icon {
  font-size: 36rpx;
}

.service-group__meta {
  min-width: 0;
}

.service-group__title {
  display: block;
  font-size: 30rpx;
  line-height: 1.3;
  font-weight: 600;
  color: #0f172a;
}

.service-group__sub {
  display: block;
  font-size: 22rpx;
  line-height: 1.3;
  color: #64748b;
}

.service-group__more {
  margin-left: auto;
  font-size: 24rpx;
  color: #2563eb;
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
  line-height: 1.375;
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
  font-size: 26rpx;
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
  color: #2563eb;
  background: #eff6ff;
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
}

.service-card__actions {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.action-btn {
  text-align: center;
  font-size: 22rpx;
  font-weight: 500;
  padding: 14rpx 0;
  border-radius: 10rpx;
}

.action-btn--secondary {
  background: #f1f5f9;
  color: #334155;
}

.action-btn--primary {
  background: #2563eb;
  color: #ffffff;
}
</style>
