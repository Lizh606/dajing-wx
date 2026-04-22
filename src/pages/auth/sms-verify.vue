<template>
  <view class="page-auth-sub">
    <view class="page-auth-sub__main">
      <AuthHeaderMinimal :logo-url="logoUrl" :title="AUTH_BRAND_TITLE" />

      <text class="auth-phone-tip">{{ displayPhone }}</text>

      <view v-if="feedback.message" class="auth-feedback" :class="`auth-feedback--${feedback.tone}`" role="alert">
        <text>{{ feedback.message }}</text>
      </view>

      <OtpCodeInput v-model="code" :disabled="isSubmitting" @complete="submitByCode" />

      <view class="auth-resend">
        <text class="auth-resend__time">{{ resendText }}</text>
        <text class="auth-resend__link" :class="{ 'auth-resend__link--disabled': resendDisabled }" @tap="resendCode">重发</text>
      </view>

      <AuthPrimaryActions
        :primary-loading="isSubmitting"
        :primary-text="primaryText"
        @primary="submitByCode(code)"
      />

      <view class="auth-split-links">
        <text class="auth-split-links__item" @tap="goBack">返回修改手机号</text>
      </view>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import logoUrl from '@/assets/logo.png'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService } from '@/services/api'
import type { AuthSession } from '@/services/api/auth'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import AuthHeaderMinimal from './components/AuthHeaderMinimal/index.vue'
import AuthPrimaryActions from './components/AuthPrimaryActions/index.vue'
import OtpCodeInput from './components/OtpCodeInput/index.vue'
import { AUTH_BRAND_TITLE, buildAutoRegisterPassword, completePostLogin } from './shared'

type VerifyIntent = 'login' | 'register'
type FeedbackTone = 'error' | 'success' | 'warning'

const userStore = useUserStore()
const phone = ref('')
const code = ref('')
const intent = ref<VerifyIntent>('login')
const countdown = ref(60)
const isSubmitting = ref(false)
const isResending = ref(false)

const feedback = reactive<{
  message: string
  tone: FeedbackTone
}>({
  message: '',
  tone: 'warning',
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

const primaryText = computed(() => intent.value === 'register' ? '注册并登录' : '验证并登录')
const displayPhone = computed(() => {
  const value = phone.value.trim()

  if (/^1\d{10}$/.test(value)) {
    return `${value.slice(0, 3)}****${value.slice(-4)}`
  }

  return value || '--'
})

const resendDisabled = computed(() => isSubmitting.value || isResending.value || countdown.value > 0)
const resendText = computed(() => {
  if (isResending.value) {
    return '发送中...'
  }

  if (countdown.value > 0) {
    return `${countdown.value}s`
  }

  return '可重发'
})

onLoad((query) => {
  const nextPhone = typeof query?.phone === 'string' ? query.phone.trim() : ''
  const nextIntent = query?.intent === 'register' ? 'register' : 'login'

  if (!nextPhone) {
    showFailToast('缺少手机号，请返回重试')
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 240)
    return
  }

  phone.value = nextPhone
  intent.value = nextIntent
  startCountdown()
})

onUnmounted(() => {
  stopCountdown()
})

function setFeedback(message = '', tone: FeedbackTone = 'warning') {
  feedback.message = message
  feedback.tone = tone
}

function clearFeedback() {
  setFeedback('', 'warning')
}

function stopCountdown() {
  if (!countdownTimer) {
    return
  }

  clearInterval(countdownTimer)
  countdownTimer = null
}

function startCountdown() {
  stopCountdown()
  countdown.value = 60

  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      stopCountdown()
      return
    }

    countdown.value -= 1
  }, 1000)
}

async function resendCode() {
  if (resendDisabled.value) {
    return
  }

  clearFeedback()
  isResending.value = true

  try {
    await authService.sendSmsCode({
      phone: phone.value.trim(),
      scene: intent.value === 'register' ? 'REGISTER' : 'LOGIN',
    })
    startCountdown()
    showSuccessToast('验证码已重新发送')
  } catch (error) {
    const message = getErrorMessage(error, '验证码发送失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isResending.value = false
  }
}

function buildNickname() {
  return `用户${phone.value.trim().slice(-4)}`
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

async function resolveRegisterSession(smsCode: string): Promise<AuthSession> {
  const registerSession = await authService.registerAccount({
    nickname: buildNickname(),
    password: buildAutoRegisterPassword(phone.value, smsCode),
    phone: phone.value.trim(),
    smsCode,
  })

  if (registerSession.token) {
    return registerSession
  }

  return authService.loginBySms({
    phone: phone.value.trim(),
    smsCode,
  })
}

async function guideEnterpriseCompletionForRegister() {
  const result = await new Promise<UniApp.ShowModalRes>((resolve) => {
    uni.showModal({
      cancelText: '稍后再说',
      confirmText: '去完善',
      content: '注册完成，可后续补充企业认证资料。',
      title: '是否完善企业资料',
      success: resolve,
    })
  })

  if (result.confirm) {
    uni.navigateTo({ url: '/pages/profile/enterprise' })
  } else {
    uni.switchTab({ url: '/pages/mine/index' })
  }
}

async function submitByCode(rawCode: string) {
  const smsCode = rawCode.trim()

  if (!/^\d{6}$/.test(smsCode)) {
    if (smsCode.length > 0) {
      setFeedback('请输入 6 位数字验证码', 'warning')
    }
    return
  }

  if (isSubmitting.value) {
    return
  }

  clearFeedback()
  isSubmitting.value = true

  try {
    const session = intent.value === 'register'
      ? await resolveRegisterSession(smsCode)
      : await authService.loginBySms({
        phone: phone.value.trim(),
        smsCode,
      })

    await completePostLogin(userStore, session, phone.value.trim())

    if (intent.value === 'register') {
      showSuccessToast('注册成功')
      await guideEnterpriseCompletionForRegister()
      return
    }

    showSuccessToast('登录成功')
    setTimeout(() => {
      uni.switchTab({ url: '/pages/mine/index' })
    }, 260)
  } catch (error) {
    const message = getErrorMessage(error, intent.value === 'register' ? '注册失败，请重试' : '登录失败，请重试')
    setFeedback(message, 'error')
    showFailToast(message)
    code.value = ''
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

.auth-phone-tip {
  display: block;
  margin-bottom: 16rpx;
  color: $slate-500;
  font-size: 24rpx;
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

.auth-resend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
  margin-top: 16rpx;
}

.auth-resend__time {
  color: $slate-500;
  font-size: 22rpx;
}

.auth-resend__link {
  color: $primary;
  font-size: 24rpx;
}

.auth-resend__link--disabled {
  color: $slate-400;
}

.auth-split-links {
  display: flex;
  justify-content: center;
  margin-top: 18rpx;
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
