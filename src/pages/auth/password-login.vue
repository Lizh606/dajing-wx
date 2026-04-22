<template>
  <view class="page-auth-sub">
    <view class="page-auth-sub__main">
      <AuthHeaderMinimal :logo-url="logoUrl" :title="AUTH_BRAND_TITLE" />

      <view v-if="feedback.message" class="auth-feedback" :class="`auth-feedback--${feedback.tone}`" role="alert">
        <text>{{ feedback.message }}</text>
      </view>

      <view class="auth-form-stack">
        <AppField
          v-model="account"
          :custom-style="fieldStyle"
          :error="accountError"
          label="账号"
          placeholder="请输入手机号或账号"
          @blur="validateAccount"
        />

        <AppField
          v-model="password"
          :custom-style="fieldStyle"
          :error="passwordError"
          label="密码"
          placeholder="请输入密码"
          type="password"
          @blur="validatePassword"
        />
      </view>

      <AuthAgreement
        v-model="agreed"
        :error="agreementError"
        @open-privacy="openProtocol('privacy')"
        @open-service="openProtocol('service')"
      />

      <AuthPrimaryActions
        :primary-loading="isSubmitting"
        primary-text="登录"
        @primary="submitLogin"
      />

      <view class="auth-split-links">
        <text class="auth-split-links__item" @tap="goPhoneLogin">手机号登录</text>
        <text class="auth-split-links__item" @tap="goRegister">注册</text>
      </view>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import AuthAgreement from './components/AuthAgreement/index.vue'
import AuthHeaderMinimal from './components/AuthHeaderMinimal/index.vue'
import AuthPrimaryActions from './components/AuthPrimaryActions/index.vue'
import { AUTH_BRAND_TITLE, completePostLogin } from './shared'

type FeedbackTone = 'error' | 'success' | 'warning'

const userStore = useUserStore()
const account = ref('')
const password = ref('')
const agreed = ref(false)
const isSubmitting = ref(false)
const accountError = ref('')
const passwordError = ref('')
const agreementError = ref('')
const fieldStyle = 'border-radius: 12rpx; background: #ffffff; border-color: #e5e7eb;'

const feedback = reactive<{
  message: string
  tone: FeedbackTone
}>({
  message: '',
  tone: 'warning',
})

function setFeedback(message = '', tone: FeedbackTone = 'warning') {
  feedback.message = message
  feedback.tone = tone
}

function clearFeedback() {
  setFeedback('', 'warning')
}

function validateAccount() {
  const value = account.value.trim()

  if (!value) {
    accountError.value = '请输入账号或手机号'
    return false
  }

  accountError.value = ''
  return true
}

function validatePassword() {
  const value = password.value

  if (!value) {
    passwordError.value = '请输入密码'
    return false
  }

  if (value.length < 6) {
    passwordError.value = '密码长度不能少于 6 位'
    return false
  }

  passwordError.value = ''
  return true
}

function validateAgreement() {
  if (agreed.value) {
    agreementError.value = ''
    return true
  }

  agreementError.value = '请先勾选并同意相关协议'
  return false
}

function openProtocol(type: 'privacy' | 'service') {
  const title = type === 'service' ? '服务协议' : '个人信息保护指引'

  uni.showModal({
    cancelText: '知道了',
    confirmText: '关闭',
    content: `${title}页面正在完善中，当前版本请联系平台运营人员获取完整文本。`,
    showCancel: false,
    title,
  })
}

function goPhoneLogin() {
  uni.redirectTo({ url: '/pages/auth/phone-login' })
}

function goRegister() {
  uni.redirectTo({ url: '/pages/auth/register-form' })
}

async function submitLogin() {
  clearFeedback()

  const valid = [validateAccount(), validatePassword(), validateAgreement()].every(Boolean)

  if (!valid) {
    setFeedback('请先完善表单信息', 'warning')
    showFailToast('请完善表单后继续')
    return
  }

  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    const session = await authService.loginByPassword({
      account: account.value.trim(),
      password: password.value,
    })

    await completePostLogin(userStore, session, account.value.trim())

    showSuccessToast('登录成功')
    setTimeout(() => {
      uni.switchTab({ url: '/pages/mine/index' })
    }, 260)
  } catch (error) {
    const message = getErrorMessage(error, '登录失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page-auth-sub {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background: linear-gradient(180deg, #f1f6ff 0%, #f8fafc 220rpx, #f8fafc 100%);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-auth-sub__main {
  width: 100%;
  max-width: 680rpx;
}

.auth-form-stack {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.auth-feedback {
  margin-bottom: 10rpx;
  color: $slate-600;
  font-size: 24rpx;
  line-height: 1.5;
}

.auth-feedback--error {
  color: $danger-strong;
}

.auth-feedback--success {
  color: $success;
}

.auth-split-links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding: 0 4rpx;
}

.auth-split-links__item {
  min-height: 44rpx;
  color: $slate-500;
  font-size: 24rpx;
  line-height: 44rpx;
}

@media (prefers-reduced-motion: reduce) {
  .page-auth-sub {
    background: #f8fafc;
  }
}
</style>
