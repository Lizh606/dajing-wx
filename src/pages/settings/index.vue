<template>
  <view class="page-settings">
    <scroll-view class="page-settings__scroll" scroll-y>
      <!-- 通知设置 -->
      <view class="settings-card">
        <text class="settings-card__title">通知设置</text>
        <view class="settings-toggle">
          <view class="settings-toggle__copy">
            <text class="settings-toggle__name">消息通知</text>
            <text class="settings-toggle__desc">咨询回复、需求响应、订单进度提醒</text>
          </view>
          <view
            class="settings-toggle__switch"
            :class="notifyOn ? 'settings-toggle__switch--on' : ''"
            @tap="notifyOn = !notifyOn"
          >
            <view
              class="settings-toggle__thumb"
              :class="notifyOn ? 'settings-toggle__thumb--on' : ''"
            ></view>
          </view>
        </view>
        <view class="settings-toggle">
          <view class="settings-toggle__copy">
            <text class="settings-toggle__name">短信提醒</text>
            <text class="settings-toggle__desc">关键节点通过手机短信通知</text>
          </view>
          <view
            class="settings-toggle__switch"
            :class="smsOn ? 'settings-toggle__switch--on' : ''"
            @tap="smsOn = !smsOn"
          >
            <view
              class="settings-toggle__thumb"
              :class="smsOn ? 'settings-toggle__thumb--on' : ''"
            ></view>
          </view>
        </view>
      </view>

      <!-- 账号与安全 -->
      <view class="settings-card">
        <text class="settings-card__title">账号与安全</text>
        <view class="settings-list">
          <view class="settings-list__item settings-list__item--divider" @tap="nav('login_password')">
            <text class="settings-list__text">登录密码修改</text>
            <text class="settings-list__arrow">›</text>
          </view>
          <view class="settings-list__item settings-list__item--divider" @tap="nav('phone_email')">
            <text class="settings-list__text">手机号与邮箱绑定</text>
            <text class="settings-list__arrow">›</text>
          </view>
          <view class="settings-list__item" @tap="nav('device')">
            <text class="settings-list__text">设备管理</text>
            <text class="settings-list__arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 隐私与帮助 -->
      <view class="settings-card">
        <text class="settings-card__title">隐私与帮助</text>
        <view class="settings-list">
          <view class="settings-list__item settings-list__item--divider" @tap="nav('privacy')">
            <text class="settings-list__text">隐私政策</text>
            <text class="settings-list__arrow">›</text>
          </view>
          <view class="settings-list__item settings-list__item--divider" @tap="nav('help')">
            <text class="settings-list__text">帮助中心</text>
            <text class="settings-list__arrow">›</text>
          </view>
          <view class="settings-list__item settings-list__item--divider" @tap="nav('feedback')">
            <text class="settings-list__text">意见反馈</text>
            <text class="settings-list__arrow">›</text>
          </view>
          <view class="settings-list__item" @tap="nav('about')">
            <text class="settings-list__text">关于平台</text>
            <text class="settings-list__arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="settings-card settings-card--logout" @tap="logout">
        <text class="settings-card__logout">退出登录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const notifyOn = ref(true)
const smsOn = ref(false)
const nav = (key: string) => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page-settings {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.page-settings__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.settings-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $bg-card;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.settings-card__title {
  display: block;
  margin-bottom: 20rpx;
  color: $slate-900;
  font-size: 28rpx;
  font-weight: 600;
}

.settings-toggle {
  padding: 24rpx;
  border-radius: 14rpx;
  background: $slate-50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.settings-toggle + .settings-toggle {
  margin-top: 12rpx;
}

.settings-toggle__copy {
  flex: 1;
  min-width: 0;
}

.settings-toggle__name {
  display: block;
  color: $slate-900;
  font-size: 28rpx;
}

.settings-toggle__desc {
  display: block;
  margin-top: 6rpx;
  color: $slate-400;
  font-size: 24rpx;
  line-height: 1.4;
}

.settings-toggle__switch {
  flex-shrink: 0;
  width: 88rpx;
  height: 48rpx;
  padding: 4rpx;
  border-radius: 16rpx;
  background: #cbd5e1;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.settings-toggle__switch--on {
  background: $primary;
}

.settings-toggle__thumb {
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #fff;
  transform: translateX(0);
  transition: transform 0.2s ease;
}

.settings-toggle__thumb--on {
  transform: translateX(40rpx);
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.settings-list__item {
  padding: 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.settings-list__item--divider {
  border-bottom: 1rpx solid $slate-100;
}

.settings-list__text {
  color: $slate-900;
  font-size: 28rpx;
}

.settings-list__arrow {
  color: $slate-400;
  font-size: 36rpx;
  line-height: 1;
}

.settings-card--logout {
  cursor: pointer;
}

.settings-card__logout {
  display: block;
  color: #ef4444;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
}
</style>
