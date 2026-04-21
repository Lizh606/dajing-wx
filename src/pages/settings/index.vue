<template>
  <view class="page-settings">
    <scroll-view class="page-settings__scroll" scroll-y>
      <view class="settings-card">
        <text class="settings-card__title">通知设置</text>
        <view class="settings-toggle">
          <view class="settings-toggle__copy">
            <text class="settings-toggle__name">消息通知</text>
            <text class="settings-toggle__desc">咨询回复、需求响应、订单进度会在这里提醒。</text>
          </view>
          <AppSwitch v-model="notifyOn" />
        </view>
        <view class="settings-toggle">
          <view class="settings-toggle__copy">
            <text class="settings-toggle__name">短信提醒</text>
            <text class="settings-toggle__desc">关键节点支持短信提醒，便于及时跟进。</text>
          </view>
          <AppSwitch v-model="smsOn" />
        </view>
      </view>

      <view class="settings-card">
        <text class="settings-card__title">账号与安全</text>
        <AppCellGroup :border="false" class="settings-list">
          <AppCell
            v-for="item in accountItems"
            :key="item.key"
            :border="item.border"
            :custom-style="cellStyle"
            :title="item.title"
            is-link
            @click="nav(item.key)"
          />
        </AppCellGroup>
      </view>

      <view class="settings-card">
        <text class="settings-card__title">隐私与帮助</text>
        <AppCellGroup :border="false" class="settings-list">
          <AppCell
            v-for="item in helpItems"
            :key="item.key"
            :border="item.border"
            :custom-style="cellStyle"
            :title="item.title"
            is-link
            @click="nav(item.key)"
          />
        </AppCellGroup>
      </view>

      <view class="settings-card settings-card--logout">
        <AppButton
          block
          custom-style="min-height: 88rpx; border-radius: 24rpx; font-size: 28rpx;"
          plain
          text="退出登录"
          type="danger"
          @click="logout"
        />
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppCell from '@/components/ui/AppCell/index.vue'
import AppCellGroup from '@/components/ui/AppCellGroup/index.vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const notifyOn = ref(true)
const smsOn = ref(false)
const cellStyle = 'padding: 24rpx 0;'

const accountItems = [
  { key: 'auth', title: '登录与注册', border: true },
  { key: 'login_password', title: '登录密码修改', border: true },
  { key: 'phone_email', title: '手机号与邮箱绑定', border: true },
  { key: 'device', title: '设备管理', border: false },
]

const helpItems = [
  { key: 'privacy', title: '隐私政策', border: true },
  { key: 'help', title: '帮助中心', border: true },
  { key: 'feedback', title: '意见反馈', border: true },
  { key: 'about', title: '关于平台', border: false },
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
  position: relative;
}

.page-settings::before {
  content: '';
  position: absolute;
  top: -40rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 600rpx;
  height: 300rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0) 100%);
  filter: blur(40rpx);
  pointer-events: none;
}

.page-settings__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx 24rpx 40rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.settings-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-card__title {
  display: block;
  margin-bottom: 24rpx;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}

.settings-toggle {
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  transition: background 0.2s ease;
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
  color: #0f172a;
  font-size: 28rpx;
}

.settings-toggle__desc {
  display: block;
  margin-top: 6rpx;
  color: #94a3b8;
  font-size: 24rpx;
  line-height: 1.5;
}

.settings-list {
  display: block;
}

.settings-card--logout {
  padding: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
}

.settings-card--logout :deep(.app-button) {
  background: linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%) !important;
  border-color: #fecaca !important;
  color: #e11d48 !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-card--logout :deep(.app-button):active {
  transform: scale(0.97);
  box-shadow: 0 2rpx 12rpx rgba(225, 29, 72, 0.15);
}
</style>
