<template>
  <view class="page-mine" :class="isEnterprise ? 'is-enterprise' : 'is-personal'">
    <!-- 顶部信息 -->
    <view class="mine-hero">
      <view class="mine-hero__head">
        <view class="mine-hero__identity">
          <text class="mine-hero__name">
            {{ isEnterprise ? '株洲某制造有限公司' : '张工' }}
          </text>
          <text class="mine-hero__type">
            {{ isEnterprise ? '企业账号' : '个人账号' }}
          </text>
        </view>
        <view class="mine-hero__avatar">
          {{ isEnterprise ? '🏢' : '👤' }}
        </view>
      </view>
      <view class="mine-member">
        <view class="mine-member__copy">
          <text class="mine-member__label">当前会员</text>
          <text class="mine-member__title">
            {{ isEnterprise ? '企业标准版' : '个人免费版' }}
          </text>
        </view>
        <view class="mine-member__btn" @tap="onUpgrade">升级会员</view>
      </view>
      <view class="mine-stats">
        <view class="mine-stats__item">
          <text class="mine-stats__value">{{ isEnterprise ? '12' : '3' }}</text>
          <text class="mine-stats__label">进行中订单</text>
        </view>
        <view class="mine-stats__item">
          <text class="mine-stats__value">{{ isEnterprise ? '38' : '7' }}</text>
          <text class="mine-stats__label">历史报告</text>
        </view>
        <view class="mine-stats__item mine-stats__item--message" @tap="goMessage">
          <text class="mine-stats__label">消息通知</text>
          <view class="mine-stats__message-icon">
            <text>💬</text>
            <view class="mine-stats__badge">3</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="mine-section">
      <text class="mine-section__title">快捷入口</text>
      <view class="mine-quick__grid">
        <view class="mine-quick__item" @tap="goPublishDemand">
          <view class="mine-quick__icon mine-quick__icon--publish">✍</view>
          <text class="mine-quick__text">发布需求</text>
        </view>
        <view class="mine-quick__item" @tap="goOrder">
          <view class="mine-quick__icon mine-quick__icon--order">📋</view>
          <text class="mine-quick__text">我的订单</text>
        </view>
        <view class="mine-quick__item" @tap="goReport">
          <view class="mine-quick__icon mine-quick__icon--report">📂</view>
          <text class="mine-quick__text">我的报告</text>
        </view>
        <view class="mine-quick__item" @tap="goMessage">
          <view class="mine-quick__icon mine-quick__icon--message">📬</view>
          <text class="mine-quick__text">消息中心</text>
        </view>
      </view>
    </view>

    <!-- 档案管理 -->
    <view class="mine-section">
      <text class="mine-section__title">档案管理</text>
      <view v-if="isEnterprise" class="mine-list">
        <view class="mine-list__item mine-list__item--divider" @tap="() => {}">
          <text class="mine-list__emoji">🏢</text>
          <text class="mine-list__text">企业资质档案</text>
          <text class="mine-list__arrow">›</text>
        </view>
        <view class="mine-list__item mine-list__item--divider" @tap="() => {}">
          <text class="mine-list__emoji">📄</text>
          <text class="mine-list__text">委托记录管理</text>
          <text class="mine-list__arrow">›</text>
        </view>
        <view class="mine-list__item" @tap="() => {}">
          <text class="mine-list__emoji">📊</text>
          <text class="mine-list__text">检测报告归档</text>
          <text class="mine-list__arrow">›</text>
        </view>
      </view>
      <view v-else class="mine-list">
        <view class="mine-list__item mine-list__item--divider" @tap="() => {}">
          <text class="mine-list__emoji">👤</text>
          <text class="mine-list__text">个人资质认证</text>
          <text class="mine-list__arrow">›</text>
        </view>
        <view class="mine-list__item" @tap="() => {}">
          <text class="mine-list__emoji">📄</text>
          <text class="mine-list__text">我的委托记录</text>
          <text class="mine-list__arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 系统设置 -->
    <view class="mine-section">
      <text class="mine-section__title">系统设置</text>
      <view class="mine-list">
        <view class="mine-list__item mine-list__item--divider" @tap="goSettings">
          <text class="mine-list__emoji">⚙️</text>
          <text class="mine-list__text">系统设置</text>
          <text class="mine-list__arrow">›</text>
        </view>
        <view class="mine-list__item" @tap="toggleUserType">
          <text class="mine-list__emoji">🔄</text>
          <text class="mine-list__text">切换视角（{{ isEnterprise ? '企业' : '个人' }}）</text>
          <text class="mine-list__arrow">›</text>
        </view>
      </view>
    </view>
    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
const isEnterprise = ref(true)
const toggleUserType = () => { isEnterprise.value = !isEnterprise.value }
const goMessage = () => uni.navigateTo({ url: '/pages/message/index' })
const goSettings = () => uni.navigateTo({ url: '/pages/settings/index' })
const goPublishDemand = () => uni.navigateTo({ url: '/pages/demand/publish' })
const goOrder = () => uni.switchTab({ url: '/pages/order/list' })
const goReport = () => uni.navigateTo({ url: '/pages/report/index' })
const onUpgrade = () => {}
</script>

<style scoped lang="scss">
.page-mine {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

.mine-hero {
  padding: 20rpx 24rpx 48rpx;
}

.page-mine.is-enterprise .mine-hero {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%);
}

.page-mine.is-personal .mine-hero {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #0ea5e9 100%);
}

.mine-hero__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.mine-hero__identity {
  flex: 1;
  min-width: 0;
}

.mine-hero__name {
  display: block;
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.35;
}

.mine-hero__type {
  display: block;
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
}

.mine-hero__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 44rpx;
}

.mine-member {
  margin-bottom: 24rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.mine-member__copy {
  flex: 1;
  min-width: 0;
}

.mine-member__label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

.mine-member__title {
  display: block;
  margin-top: 4rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1.4;
}

.mine-member__btn {
  flex-shrink: 0;
  padding: 10rpx 24rpx;
  border-radius: 16rpx;
  background: #fff;
  color: $primary-dark;
  font-size: 26rpx;
  font-weight: 500;
}

.mine-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.mine-stats__item {
  padding: 20rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.12);
}

.mine-stats__value {
  display: block;
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.2;
}

.mine-stats__label {
  display: block;
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 24rpx;
}

.mine-stats__item--message {
  cursor: pointer;
}

.mine-stats__message-icon {
  position: relative;
  width: 60rpx;
  height: 60rpx;
  margin-top: 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
}

.mine-stats__badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 28rpx;
  padding: 2rpx 8rpx;
  border-radius: 12rpx;
  background: #ef4444;
  color: #fff;
  font-size: 18rpx;
  text-align: center;
  line-height: 1.35;
  box-sizing: border-box;
}

.mine-section {
  margin: 0 24rpx 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $bg-card;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.06);
}

.mine-section__title {
  display: block;
  margin-bottom: 24rpx;
  color: $slate-900;
  font-size: 28rpx;
  font-weight: 600;
}

.mine-quick__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}

.mine-quick__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  text-align: center;
}

.mine-quick__icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.mine-quick__icon--publish {
  background: $primary-light;
}

.mine-quick__icon--order {
  background: #fef3c7;
}

.mine-quick__icon--report {
  background: #ecfdf5;
}

.mine-quick__icon--message {
  background: $violet-bg;
}

.mine-quick__text {
  color: $slate-600;
  font-size: 24rpx;
}

.mine-list {
  display: flex;
  flex-direction: column;
}

.mine-list__item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 0;
}

.mine-list__item--divider {
  border-bottom: 1rpx solid $slate-100;
}

.mine-list__emoji {
  width: 40rpx;
  color: $slate-900;
  font-size: 34rpx;
  line-height: 1;
}

.mine-list__text {
  flex: 1;
  color: $slate-900;
  font-size: 28rpx;
}

.mine-list__arrow {
  color: $slate-400;
  font-size: 36rpx;
  line-height: 1;
}
</style>
