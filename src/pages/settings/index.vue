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

    <AppUiProvider />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppCell from '@/components/ui/AppCell/index.vue'
import AppCellGroup from '@/components/ui/AppCellGroup/index.vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppConfirm } from '@/services/ui/dialog'
import { showAppToast, showSuccessToast } from '@/services/ui/toast'

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

const nav = (key: string) => {
  if (key === 'auth') {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }

  showAppToast({ message: '功能开发中', icon: 'none' })
}

const logout = async () => {
  try {
    await showAppConfirm({
      title: '退出登录',
      message: '确定要退出当前账号吗？',
    })
    showSuccessToast('已退出登录')
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/auth/login' })
    }, 300)
  } catch {
    // 用户取消时保持静默
  }
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

.settings-list {
  display: block;
}

.settings-card--logout {
  padding: 20rpx;
}
</style>
