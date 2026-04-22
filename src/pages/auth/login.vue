<template>
  <view class="page-auth">
    <view class="page-auth__main">
      <AuthHeaderMinimal :logo-url="logoUrl" :title="AUTH_BRAND_TITLE" />

      <view v-if="feedback.message" class="auth-feedback" :class="`auth-feedback--${feedback.tone}`" role="alert">
        <text>{{ feedback.message }}</text>
      </view>

      <AuthAgreement
        v-model="agreed"
        :error="agreementError"
        @open-privacy="openProtocol('privacy')"
        @open-service="openProtocol('service')"
      />

      <AuthPrimaryActions
        :primary-loading="isWechatSubmitting"
        primary-text="微信一键登录"
        secondary-text="手机号登录"
        @primary="submitWechatMiniLogin"
        @secondary="goPhoneLogin"
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
import logoUrl from '@/assets/logo.png'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import { reactive, ref } from 'vue'
import AuthAgreement from './components/AuthAgreement/index.vue'
import AuthHeaderMinimal from './components/AuthHeaderMinimal/index.vue'
import AuthPrimaryActions from './components/AuthPrimaryActions/index.vue'
import { AUTH_BRAND_TITLE, completePostLogin } from './shared'

type FeedbackTone = 'error' | 'success' | 'warning'

const userStore = useUserStore()
const agreed = ref(false)
const agreementError = ref('')
const isWechatSubmitting = ref(false)

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

function validateAgreement() {
  if (agreed.value) {
    agreementError.value = ''
    return true
  }

  agreementError.value = '请先勾选并同意相关协议'
  setFeedback('请先同意协议', 'warning')
  showFailToast('请先同意协议')
  return false
}

function getWechatMiniCode() {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      fail: (error) => reject(new Error(resolveMiniProgramErrorMessage(error, '微信登录失败'))),
      success: (result) => {
        const code = typeof result.code === 'string' ? result.code.trim() : ''

        if (!code) {
          reject(new Error('微信登录未返回有效 code'))
          return
        }

        resolve(code)
      },
    })
  })
}

function resolveMiniProgramErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'errMsg' in error) {
    const errMsg = (error as { errMsg?: unknown }).errMsg

    if (typeof errMsg === 'string' && errMsg.trim()) {
      return errMsg.trim()
    }
  }

  return fallback
}

function goPhoneLogin() {
  uni.navigateTo({ url: '/pages/auth/phone-login' })
}

function goPasswordLogin() {
  uni.navigateTo({ url: '/pages/auth/password-login' })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register-form' })
}

async function guideEnterpriseCompletionIfNeeded(session: Awaited<ReturnType<typeof authService.loginByWechatMini>>) {
  if (session.userType !== 'enterprise' || session.enterpriseId) {
    return false
  }

  const result = await new Promise<UniApp.ShowModalRes>((resolve) => {
    uni.showModal({
      cancelText: '稍后再说',
      confirmText: '去完善',
      content: '可补充企业认证资料，用于采购和开票协作。',
      title: '完善企业资料',
      success: resolve,
    })
  })

  if (result.confirm) {
    uni.navigateTo({ url: '/pages/profile/enterprise' })
  } else {
    uni.switchTab({ url: '/pages/mine/index' })
  }

  return true
}

async function submitWechatMiniLogin() {
  clearFeedback()

  if (!validateAgreement() || isWechatSubmitting.value) {
    return
  }

  isWechatSubmitting.value = true

  try {
    const code = await getWechatMiniCode()
    const session = await authService.loginByWechatMini({ code })

    if (!session.token) {
      throw new Error('登录成功，但未获取到认证凭证')
    }

    if (session.isNewUser) {
      userStore.setSession({
        accountType: session.accountType,
        avatar: session.avatar,
        company: session.company,
        enterpriseId: session.enterpriseId,
        nickname: session.nickname ?? '微信用户',
        refreshToken: session.refreshToken,
        token: session.token,
        userType: session.userType,
      })
      userStore.setPendingProfileCompletion(true)
      showSuccessToast('首次登录，请先完善资料')
      uni.navigateTo({ url: '/pages/auth/wechat-profile' })
      return
    }

    await completePostLogin(userStore, session, session.nickname ?? '微信用户')
    showSuccessToast('登录成功')

    if (await guideEnterpriseCompletionIfNeeded(session)) {
      return
    }

    setTimeout(() => {
      uni.switchTab({ url: '/pages/mine/index' })
    }, 260)
  } catch (error) {
    const message = getErrorMessage(error, '微信登录失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isWechatSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page-auth {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background: linear-gradient(180deg, #f1f6ff 0%, #f8fafc 220rpx, #f8fafc 100%);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-auth__main {
  width: 100%;
  max-width: 680rpx;
}

.auth-feedback {
  margin-bottom: 8rpx;
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
  .page-auth {
    background: #f8fafc;
  }
}
</style>
