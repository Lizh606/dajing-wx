<template>
  <view class="page-settings">
    <scroll-view class="page-settings__scroll" scroll-y>
      <view class="page-settings__content">
        <view class="settings-card">
          <text class="settings-card__title">通知设置</text>
          <view class="settings-toggle">
            <view class="settings-toggle__copy">
              <text class="settings-toggle__name">消息通知</text>
              <text class="settings-toggle__desc">咨询回复、需求响应、订单进度提醒</text>
            </view>
            <AppSwitch v-model="notifyOn" />
          </view>
          <view class="settings-toggle">
            <view class="settings-toggle__copy">
              <text class="settings-toggle__name">短信提醒</text>
              <text class="settings-toggle__desc">关键节点通过手机短信通知</text>
            </view>
            <AppSwitch v-model="smsOn" />
          </view>
        </view>

        <view class="settings-card">
          <text class="settings-card__title">账号与安全</text>
          <view
            v-for="item in accountItems"
            :key="item.key"
            class="settings-row"
            @tap="nav(item.key)"
          >
            <text class="settings-row__text">{{ item.title }}</text>
            <text class="settings-row__arrow">›</text>
          </view>
        </view>

        <view class="settings-card">
          <text class="settings-card__title">隐私与帮助</text>
          <view
            v-for="item in helpItems"
            :key="item.key"
            class="settings-row"
            @tap="nav(item.key)"
          >
            <text class="settings-row__text">{{ item.title }}</text>
            <text class="settings-row__arrow">›</text>
          </view>

          <view class="settings-row settings-row--danger" @tap="logout">
            <text class="settings-row__text">退出登录</text>
            <text class="settings-row__arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const notifyOn = ref(true)
const smsOn = ref(false)

const accountItems = [
  { key: 'login_password', title: '登录密码修改' },
  { key: 'phone_email', title: '手机号与邮箱绑定' },
  { key: 'device', title: '设备管理' },
]

const helpItems = [
  { key: 'privacy', title: '隐私政策' },
  { key: 'help', title: '帮助中心' },
  { key: 'feedback', title: '意见反馈' },
]

function nav(key: string) {
  if (key === 'auth') {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  showAppToast({ message: '功能开发中', icon: 'none' })
}

function switchToMineTab() {
  return new Promise<void>((resolve, reject) => {
    uni.switchTab({
      fail: (error) => reject(error),
      success: () => resolve(),
      url: '/pages/mine/index',
    })
  })
}

function confirmLogout() {
  return new Promise<boolean>((resolve, reject) => {
    uni.showModal({
      cancelText: '取消',
      confirmText: '确认',
      content: '确定要退出当前账号吗？',
      success: (result) => resolve(result.confirm === true),
      fail: (error) => reject(error),
      title: '退出登录',
    })
  })
}

async function logout() {
  try {
    const confirmed = await confirmLogout()

    if (!confirmed) {
      return
    }

    userStore.logout()
    await switchToMineTab()
  } catch (error) {
    console.error('logout flow failed', error)
  }
}
</script>

<style scoped lang="scss">
.page-settings {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-settings__scroll {
  flex: 1;
  min-height: 0;
}

.page-settings__content {
  padding: 20rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.settings-card {
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.06);
  padding: 24rpx;
}

.settings-card + .settings-card {
  margin-top: 14rpx;
}

.settings-card__title {
  display: block;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.settings-toggle {
  margin-top: 12rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.settings-toggle__copy {
  flex: 1;
  min-width: 0;
}

.settings-toggle__name {
  display: block;
  color: #1e293b;
  font-size: 26rpx;
  font-weight: 500;
}

.settings-toggle__desc {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
}

.settings-row {
  margin-top: 12rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.settings-row__text {
  color: #1e293b;
  font-size: 25rpx;
}

.settings-row__arrow {
  color: #94a3b8;
  font-size: 30rpx;
}

.settings-row--danger {
  background: #fff1f2;
}

.settings-row--danger .settings-row__text,
.settings-row--danger .settings-row__arrow {
  color: #be123c;
}
</style>
