<template>
  <view class="page-auth">
    <view class="auth-hero">
      <view class="auth-hero__surface">
        <view class="auth-brand">
          <image :src="logoUrl" class="auth-brand__logo" mode="aspectFit" />
          <view class="auth-brand__copy">
            <text class="auth-brand__title">AI质享质量基础创新中心</text>
          </view>
        </view>

        <view class="auth-badges"></view>
      </view>
    </view>

    <view class="auth-panel">
      <view class="auth-panel__header">
        <text class="auth-panel__title">{{ activePanelMeta.title }}</text>
      </view>

      <view v-if="feedback.message" class="auth-feedback" :class="`auth-feedback--${feedback.tone}`">
        <text class="auth-feedback__text">{{ feedback.message }}</text>
      </view>

      <AppTabs v-model="loginType" layout="fill">
        <AppTab name="phone" title="手机验证码">
          <AppForm class="auth-form">
            <view class="auth-form__stack">
              <AppField
                v-model="phone"
                :custom-style="fieldStyle"
                :error="fieldErrors.phone"
                input-mode="numeric"
                label="手机号"
                placeholder="请输入手机号"
                type="number"
                @blur="validatePhone"
              />

              <view class="auth-code">
                <AppField
                  v-model="code"
                  :custom-style="codeFieldStyle"
                  :error="fieldErrors.code"
                  input-mode="numeric"
                  label="验证码"
                  placeholder="请输入验证码"
                  type="number"
                  @blur="validateCode"
                />
                <view class="auth-code__action">
                  <AppButton
                    :disabled="codeButtonDisabled"
                    :loading="isSendingCode"
                    custom-style="min-height: 64rpx; padding: 0 18rpx; border-radius: 14rpx; font-size: 22rpx; min-width: 168rpx;"
                    plain
                    :text="codeButtonText"
                    type="info"
                    @click="sendCode"
                  />
                </view>
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
                :error="fieldErrors.account"
                label="账号"
                placeholder="请输入手机号或账号"
                @blur="validateAccount"
              />
              <AppField
                v-model="password"
                :custom-style="fieldStyle"
                :error="fieldErrors.password"
                label="密码"
                placeholder="请输入密码"
                type="password"
                @blur="validatePassword"
              />
            </view>
          </AppForm>
        </AppTab>
      </AppTabs>

      <view class="auth-actions">
        <view class="auth-actions__meta">
          <text class="auth-actions__link" @tap="goRegister">去注册</text>
        </view>
        <AppButton
          block
          :loading="isSubmitting"
          custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx;"
          :text="submitButtonText"
          type="info"
          @click="submitLogin"
        />

        <!-- #ifdef MP-WEIXIN -->
        <AppButton
          block
          class="auth-actions__wechat"
          color="#07C160"
          custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 12rpx;"
          text="微信一键登录"
          type="default"
          @click="submitWechatMiniLogin"
        />
        <!-- #endif -->
      </view>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService, enterpriseService, userService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import { onLoad } from '@dcloudio/uni-app'
import { computed, onUnmounted, reactive, ref } from 'vue'

type LoginType = 'phone' | 'password'
type FeedbackTone = 'error' | 'success' | 'warning'

const loginType = ref<LoginType>('phone')
const phone = ref('')
const code = ref('')
const account = ref('')
const password = ref('')
const countdown = ref(0)
const isSendingCode = ref(false)
const isSubmitting = ref(false)
const userStore = useUserStore()
const fieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const codeFieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const fieldErrors = reactive({
  account: '',
  code: '',
  password: '',
  phone: '',
})
const feedback = reactive<{
  message: string
  tone: FeedbackTone
}>({
  message: '',
  tone: 'warning',
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

const activePanelMeta = computed(() => {
  if (loginType.value === 'phone') {
    return {
      title: '验证码快捷登录',
    }
  }

  return {
    title: '账号密码登录',
  }
})

const codeButtonDisabled = computed(() => isSendingCode.value || countdown.value > 0)
const codeButtonText = computed(() => {
  if (isSendingCode.value) {
    return '发送中...'
  }

  if (countdown.value > 0) {
    return `${countdown.value}s 后重试`
  }

  return '获取验证码'
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return loginType.value === 'phone' ? '正在登录...' : '正在校验...'
  }

  return '登录'
})

onLoad((query) => {
  const presetPhone = typeof query?.phone === 'string' ? query.phone : ''

  if (presetPhone) {
    phone.value = presetPhone
    account.value = presetPhone
    loginType.value = 'phone'
  }
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

function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value.trim())
}

function validatePhone() {
  const value = phone.value.trim()

  if (!value) {
    fieldErrors.phone = '请输入手机号'
    return false
  }

  if (!isPhoneNumber(value)) {
    fieldErrors.phone = '请输入正确的 11 位手机号'
    return false
  }

  fieldErrors.phone = ''
  return true
}

function validateCode() {
  const value = code.value.trim()

  if (!value) {
    fieldErrors.code = '请输入验证码'
    return false
  }

  if (!/^\d{4,6}$/.test(value)) {
    fieldErrors.code = '验证码通常为 4 至 6 位数字'
    return false
  }

  fieldErrors.code = ''
  return true
}

function validateAccount() {
  const value = account.value.trim()

  if (!value) {
    fieldErrors.account = '请输入账号或手机号'
    return false
  }

  fieldErrors.account = ''
  return true
}

function validatePassword() {
  const value = password.value

  if (!value) {
    fieldErrors.password = '请输入密码'
    return false
  }

  if (value.length < 6) {
    fieldErrors.password = '密码长度不能少于 6 位'
    return false
  }

  fieldErrors.password = ''
  return true
}

async function syncEnterpriseProfile() {
  try {
    const enterprise = normalizeEnterpriseContext(await enterpriseService.getMy())

    if (!enterprise) {
      return
    }

    userStore.setEnterpriseContext({
      company: enterprise.company,
      enterpriseId: enterprise.enterpriseId,
      userType: 'enterprise',
    })

    if (enterprise.contactName && !userStore.nickname) {
      userStore.setProfile({ nickname: enterprise.contactName })
    }
  } catch {
    // 个人用户或企业资料未建立时忽略
  }
}

function resolveStoreUserType(userType?: number, accountType?: number) {
  const value = userType ?? accountType

  if (value === undefined || value === null) {
    return undefined
  }

  return value === 0 ? 'personal' : 'enterprise'
}

async function syncCurrentUserProfile() {
  try {
    const currentUser = await userService.getCurrentUser()
    userStore.setProfile({
      accountType: currentUser.userType ?? currentUser.accountType,
      avatar: currentUser.avatar,
      company: currentUser.enterpriseName,
      nickname: currentUser.nickname,
      userType: resolveStoreUserType(currentUser.userType, currentUser.accountType),
    })

    if (currentUser.enterpriseId || currentUser.enterpriseName) {
      userStore.setEnterpriseContext({
        company: currentUser.enterpriseName,
        enterpriseId: currentUser.enterpriseId,
        userType: resolveStoreUserType(currentUser.userType, currentUser.accountType),
      })
    }
  } catch {
    // 用户详情拉取失败时不阻断登录流程
  }
}

async function sendCode() {
  clearFeedback()

  if (!validatePhone()) {
    setFeedback(fieldErrors.phone, 'warning')
    return
  }

  isSendingCode.value = true

  try {
    await authService.sendSmsCode({
      phone: phone.value.trim(),
      scene: 'LOGIN',
    })
    startCountdown()
    setFeedback('验证码已发送，请注意查收短信。', 'success')
    showSuccessToast('验证码已发送')
  } catch (error) {
    const message = getErrorMessage(error, '验证码发送失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isSendingCode.value = false
  }
}

async function finalizeLogin(
  session: Awaited<ReturnType<typeof authService.loginBySms>>,
  fallbackName: string,
) {
  if (!session.token) {
    throw new Error('登录成功，但未获取到认证凭证')
  }

  userStore.setSession({
    accountType: session.accountType,
    avatar: session.avatar,
    company: session.company,
    enterpriseId: session.enterpriseId,
    nickname: session.nickname ?? fallbackName,
    refreshToken: session.refreshToken,
    token: session.token,
    userType: session.userType,
  })

  await syncCurrentUserProfile()
  await syncEnterpriseProfile()
  setFeedback('认证成功，正在进入个人中心。', 'success')
  showSuccessToast('登录成功')
  setTimeout(() => {
    uni.switchTab({ url: '/pages/mine/index' })
  }, 320)
}

async function submitLogin() {
  clearFeedback()

  const valid = loginType.value === 'phone'
    ? [validatePhone(), validateCode()].every(Boolean)
    : [validateAccount(), validatePassword()].every(Boolean)

  if (!valid) {
    setFeedback('请先修正表单中的错误信息。', 'warning')
    return
  }

  isSubmitting.value = true

  try {
    const session = loginType.value === 'phone'
      ? await authService.loginBySms({
        phone: phone.value.trim(),
        smsCode: code.value.trim(),
      })
      : await authService.loginByPassword({
        account: account.value.trim(),
        password: password.value,
      })

    await finalizeLogin(session, loginType.value === 'phone' ? phone.value.trim() : account.value.trim())
  } catch (error) {
    const message = getErrorMessage(error, '登录失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isSubmitting.value = false
  }
}

async function submitWechatMiniLogin() {
  clearFeedback()
  uni.navigateTo({ url: '/pages/auth/wechat-profile' })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register-role' })
}
</script>

<style scoped lang="scss">
.page-auth {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background:
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.88), transparent 26%),
    linear-gradient(180deg, #e0ecff 0%, #f8fbff 220rpx, #f8fafc 100%);
  box-sizing: border-box;
}

.auth-hero {
  margin: 0 -24rpx;
  padding: 36rpx 24rpx 0;
  background: linear-gradient(180deg, rgba(30, 58, 138, 0.96) 0%, rgba(37, 99, 235, 0.94) 70%, rgba(37, 99, 235, 0) 100%);
}

.auth-hero__surface {
  padding: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12rpx);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.auth-brand__logo {
  width: 132rpx;
  height: 132rpx;
  padding: 18rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.16);
}

.auth-brand__copy {
  flex: 1;
  min-width: 0;
}

.auth-brand__eyebrow {
  display: block;
  color: $auth-hero-muted;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.auth-brand__title {
  display: block;
  margin-top: 10rpx;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.3;
}

.auth-brand__desc {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  line-height: 1.6;
}

.auth-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
}

.auth-badges__item {
  padding: 10rpx 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 999rpx;
  color: #ffffff;
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.12);
}

.auth-panel {
  position: relative;
  margin-top: -20rpx;
  padding: 24rpx;
  border: 1rpx solid $auth-panel-border;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: $shadow-auth-card;
}

.auth-panel__header {
  margin-bottom: 24rpx;
}

.auth-panel__title {
  display: block;
  color: $slate-900;
  font-size: 36rpx;
  font-weight: 700;
}

.auth-panel__desc {
  display: block;
  margin-top: 10rpx;
  color: $slate-500;
  font-size: 24rpx;
  line-height: 1.6;
}

.auth-feedback {
  margin-bottom: 18rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  border: 1rpx solid transparent;
}

.auth-feedback--success {
  background: $auth-success-bg;
  border-color: #a7f3d0;
}

.auth-feedback--warning {
  background: $auth-warning-bg;
  border-color: #fde68a;
}

.auth-feedback--error {
  background: $auth-error-bg;
  border-color: #fecdd3;
}

.auth-feedback__text {
  color: $slate-700;
  font-size: 24rpx;
  line-height: 1.5;
}

.auth-form {
  margin-top: 8rpx;
}

.auth-form__stack {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.auth-code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12rpx;
  align-items: start;
}

.auth-code :deep(.app-field__control) {
  min-height: 76rpx;
}

.auth-code__action {
  margin-top: 34rpx;
}

.auth-actions {
  margin-top: 20rpx;
}

.auth-actions__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.auth-actions__hint {
  flex: 1;
  min-width: 0;
  color: $slate-500;
  font-size: 24rpx;
  line-height: 1.5;
}

.auth-actions__link {
  flex-shrink: 0;
  color: $primary;
  font-size: 26rpx;
  font-weight: 600;
}

.auth-actions__wechat {
  color: #ffffff !important;
}
</style>
