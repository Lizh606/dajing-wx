<template>
  <view class="tabbar-shell">
    <view
      v-for="item in tabs"
      :key="item.path"
      class="tabbar-item"
      :class="currentPath === item.path ? 'tabbar-item-active' : ''"
      @tap="switchTab(item.path)"
    >
      <view class="tabbar-icon-wrap">
        <image
          class="tabbar-icon"
          :src="currentPath === item.path ? item.activeIcon : item.icon"
          mode="aspectFit"
        />
      </view>
      <text class="tabbar-text" :class="currentPath === item.path ? 'tabbar-text-active' : 'tabbar-text-normal'">
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const currentPath = computed(() => '/' + (currentPage?.route ?? ''))

const tabs = [
  {
    path: '/pages/index/index',
    text: '首页',
    icon: '/static/tab/home.png',
    activeIcon: '/static/tab/home-active.png',
  },
  {
    path: '/pages/service/index',
    text: '服务',
    icon: '/static/tab/service.png',
    activeIcon: '/static/tab/service-active.png',
  },
  {
    path: '/pages/mall/index',
    text: '商城',
    icon: '/static/tab/mall.png',
    activeIcon: '/static/tab/mall-active.png',
  },
  {
    path: '/pages/mine/index',
    text: '我的',
    icon: '/static/tab/mine.png',
    activeIcon: '/static/tab/mine-active.png',
  },
]

function switchTab(path: string) {
  uni.switchTab({ url: path })
}
</script>

<style scoped lang="scss">
.tabbar-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  height: 120rpx;
  padding: 12rpx 12rpx calc(env(safe-area-inset-bottom) + 8rpx);
  background: $bg-card;
  border-top: 1rpx solid $slate-200;
  display: flex;
  box-sizing: border-box;
}

.tabbar-item {
  flex: 1;
  margin: 0 4rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.tabbar-item-active {
  background: #eff6ff;
  box-shadow: inset 0 0 0 1rpx $primary-light;
}

.tabbar-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabbar-icon {
  width: 40rpx;
  height: 40rpx;
}

.tabbar-text {
  font-size: 20rpx;
  line-height: 1.2;
}

.tabbar-text-active {
  color: $primary;
  font-weight: 600;
}

.tabbar-text-normal {
  color: $slate-400;
}
</style>
