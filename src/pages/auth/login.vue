<template>
  <view class="page-auth">
    <view class="auth-panel">
      <view class="auth-brand">
        <view class="auth-brand__logo">
          <AppIcon color="#2563eb" name="ai" size="40" />
        </view>
        <text class="auth-brand__title">AI质享质量基础创新中心</text>
      </view>

      <AppTabs v-model="loginType" layout="fill">
        <AppTab name="phone" title="手机验证码">
          <AppForm class="auth-form">
            <view class="auth-form__stack">
              <AppField
                v-model="phone"
                :custom-style="fieldStyle"
                label="手机号"
                placeholder="请输入手机号"
                type="number"
              />
              <view class="auth-code">
                <AppField
                  v-model="code"
                  :custom-style="fieldStyle"
                  label="验证码"
                  placeholder="请输入验证码"
                  type="number"
                />
                <AppButton
                  custom-style="min-height: 96rpx; padding: 0 28rpx; border-radius: 20rpx; font-size: 24rpx;"
                  plain
                  text="获取验证码"
                  type="info"
                  @click="sendCode"
                />
              </view>
            </view>
          </AppForm>
        </AppTab>

        <AppTab name="password" title="账号密码">
          <AppForm class="auth-form">
            <view class="auth-form__stack">
              <AppField
                v-model="account"
                :custom-style="fieldStyle"
                label="账号"
                placeholder="请输入手机号或账号"
              />
              <AppField
                v-model="password"
                :custom-style="fieldStyle"
                label="密码"
                placeholder="请输入密码"
                type="password"
              />
            </view>
          </AppForm>
        </AppTab>
      </AppTabs>

      <view class="auth-actions">
        <text class="auth-actions__link" @tap="goRegister">去注册</text>
        <AppButton
          block
          custom-style="min-height: 88rpx; border-radius: 24rpx; font-size: 28rpx;"
          text="登录"
          type="info"
          @click="submitLogin"
        />
      </view>
    </view>

    <AppUiProvider />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppToast, showSuccessToast } from '@/services/ui/toast'

const loginType = ref<'phone' | 'password'>('phone')
const phone = ref('')
const code = ref('')
const account = ref('')
const password = ref('')
const fieldStyle = 'border-radius: 20rpx; background: #f8fafc;'

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register-role' })
}

function sendCode() {
  if (!phone.value) {
    showAppToast({ message: '请先输入手机号', icon: 'none' })
    return
  }

  showSuccessToast('验证码已发送')
}

function submitLogin() {
  showSuccessToast('登录成功')
  setTimeout(() => {
    uni.switchTab({ url: '/pages/mine/index' })
  }, 300)
}
</script>

<style scoped lang="scss">
.page-auth {
  min-height: 100vh;
  padding: 32rpx 24rpx;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 260rpx, #f8fafc 100%);
  box-sizing: border-box;
}

.auth-panel {
  padding: 32rpx 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 28rpx rgba(15, 23, 42, 0.08);
}

.auth-brand {
  margin-bottom: 28rpx;
  text-align: center;
}

.auth-brand__logo {
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto 20rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-brand__title {
  display: block;
  color: $slate-900;
  font-size: 36rpx;
  font-weight: 700;
}

.auth-form {
  margin-top: 28rpx;
}

.auth-form__stack {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.auth-code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
  align-items: stretch;
}

.auth-actions {
  margin-top: 24rpx;
}

.auth-actions__link {
  display: inline-block;
  margin-bottom: 20rpx;
  color: $primary;
  font-size: 26rpx;
  font-weight: 600;
}
</style>
