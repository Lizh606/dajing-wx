<template>
  <view class="page-auth-sub">
    <view class="page-auth-sub__main">
      <AuthHeaderMinimal :logo-url="logoUrl" :title="AUTH_BRAND_TITLE" />

      <view v-if="feedback.message" class="auth-feedback" :class="`auth-feedback--${feedback.tone}`" role="alert">
        <text>{{ feedback.message }}</text>
      </view>

      <AppField
        v-model="phone"
        :custom-style="fieldStyle"
        :error="phoneError"
        input-mode="numeric"
        label="手机号"
        :maxlength="11"
        placeholder="请输入 11 位手机号"
        type="number"
        @blur="validatePhone"
      />

      <AuthAgreement
        v-model="agreed"
        :error="agreementError"
        @open-privacy="openProtocol('privacy')"
        @open-service="openProtocol('service')"
      />

      <AuthPrimaryActions
        :primary-loading="isSendingCode"
        primary-text="获取验证码"
        @primary="sendCode"
      />

      <view class="auth-split-links">
        <text class="auth-split-links__item" @tap="goPasswordLogin">账号密码登录</text>
        <text class="auth-split-links__item" @tap="goRegister">注册</text>
      </view>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import AuthAgreement from './components/AuthAgreement/index.vue'
import AuthHeaderMinimal from './components/AuthHeaderMinimal/index.vue'
import AuthPrimaryActions from './components/AuthPrimaryActions/index.vue'
import { AUTH_BRAND_TITLE } from './shared'

type FeedbackTone = 'error' | 'success' | 'warning'

const phone = ref('')
const agreed = ref(false)
const isSendingCode = ref(false)
const phoneError = ref('')
const agreementError = ref('')
const fieldStyle = 'border-radius: 12rpx; background: #ffffff; border-color: #e5e7eb;'

const feedback = reactive<{
  message: string
  tone: FeedbackTone
}>({
  message: '',
  tone: 'warning',
})

onLoad((query) => {
  const presetPhone = typeof query?.phone === 'string' ? query.phone.trim() : ''

  if (presetPhone) {
    phone.value = presetPhone
  }
})

function setFeedback(message = '', tone: FeedbackTone = 'warning') {
  feedback.message = message
  feedback.tone = tone
}

function clearFeedback() {
  setFeedback('', 'warning')
}

function validatePhone() {
  const value = phone.value.trim()

  if (!value) {
    phoneError.value = '请输入手机号'
    return false
  }

  if (!/^1\d{10}$/.test(value)) {
    phoneError.value = '请输入正确的 11 位手机号'
    return false
  }

  phoneError.value = ''
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

function goPasswordLogin() {
  uni.navigateTo({ url: '/pages/auth/password-login' })
}

function goRegister() {
  uni.redirectTo({ url: '/pages/auth/register-form' })
}

async function sendCode() {
  clearFeedback()

  const valid = [validatePhone(), validateAgreement()].every(Boolean)

  if (!valid) {
    setFeedback('请先完善手机号并同意协议', 'warning')
    showFailToast('请完善表单后继续')
    return
  }

  if (isSendingCode.value) {
    return
  }

  isSendingCode.value = true

  try {
    await authService.sendSmsCode({
      phone: phone.value.trim(),
      scene: 'LOGIN',
    })

    showSuccessToast('验证码已发送')
    uni.navigateTo({
      url: `/pages/auth/sms-verify?intent=login&phone=${encodeURIComponent(phone.value.trim())}`,
    })
  } catch (error) {
    const message = getErrorMessage(error, '验证码发送失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isSendingCode.value = false
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
