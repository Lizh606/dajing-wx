<template>
  <view class="page-wechat-profile">
    <view class="wechat-profile-card">
      <!-- #ifdef MP-WEIXIN -->
      <button
        class="wechat-profile-card__avatar-btn"
        open-type="chooseAvatar"
        @chooseavatar="onChooseAvatar"
      >
        <image
          v-if="avatarUrl"
          :src="avatarUrl"
          class="wechat-profile-card__avatar"
          mode="aspectFill"
        />
        <view v-else class="wechat-profile-card__avatar-placeholder">选择头像</view>
      </button>

      <input
        v-model="nickname"
        class="wechat-profile-card__nickname-input"
        maxlength="30"
        placeholder="请输入昵称（可使用微信昵称）"
        type="nickname"
      />

      <input
        v-model="manualPhone"
        class="wechat-profile-card__phone-input"
        maxlength="11"
        placeholder="请输入手机号"
        type="number"
      />

      <view class="wechat-profile-card__sms-row">
        <input
          v-model="smsCode"
          class="wechat-profile-card__sms-input"
          maxlength="6"
          placeholder="请输入短信验证码"
          type="number"
        />
        <AppButton
          :disabled="sendCodeDisabled"
          :loading="isSendingCode"
          tone="brand"
          variant="secondary"
          custom-style="min-height: 84rpx; min-width: 188rpx; border-radius: 16rpx; margin-top: 0;"
          :text="sendCodeText"
          @click="sendPhoneCode"
        />
      </view>

      <AppButton
        block
        :loading="isSubmitting"
        tone="brand"
        variant="primary"
        custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 22rpx;"
        text="确认并登录"
        @click="submitWechatLogin"
      />
      <!-- #endif -->

      <AppButton
        block
        tone="neutral"
        variant="secondary"
        custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 14rpx;"
        text="返回登录页"
        @click="goBack"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { onBackPress, onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onUnmounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { accountService, authService, enterpriseService, fileService, userService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const avatarUrl = ref('')
const nickname = ref('')
const manualPhone = ref('')
const smsCode = ref('')
const isSubmitting = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)

let countdownTimer: ReturnType<typeof setInterval> | null = null

const sendCodeDisabled = computed(() => {
  return isSubmitting.value || isSendingCode.value || countdown.value > 0 || !/^1[3-9]\d{9}$/.test(resolvePhoneValue())
})

const sendCodeText = computed(() => {
  if (isSendingCode.value) {
    return '发送中...'
  }

  if (countdown.value > 0) {
    return `${countdown.value}s后重发`
  }

  return '发送验证码'
})

onLoad(() => {
  if (!ensureProfileCompletionAccess()) {
    return
  }

  nickname.value = userStore.nickname || ''
})

onShow(() => {
  ensureProfileCompletionAccess()
})

onBackPress(() => {
  cancelProfileCompletion()
  return true
})

onUnmounted(() => {
  stopCountdown()
})

function normalizeText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  return ''
}

function onChooseAvatar(event: any) {
  const nextAvatarUrl = normalizeText(event?.detail?.avatarUrl)

  if (!nextAvatarUrl) {
    showFailToast('未获取到头像，请重试')
    return
  }

  avatarUrl.value = nextAvatarUrl
}

function normalizePhone(value: unknown) {
  return normalizeText(value).replace(/\s+/g, '')
}

function resolvePhoneValue() {
  return normalizePhone(manualPhone.value)
}

function normalizeSmsCode(value: unknown) {
  return normalizeText(value).replace(/\s+/g, '')
}

function resolveSmsCodeValue() {
  return normalizeSmsCode(smsCode.value)
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

function stopCountdown() {
  if (!countdownTimer) {
    return
  }

  clearInterval(countdownTimer)
  countdownTimer = null
}

function ensureProfileCompletionAccess() {
  if (userStore.pendingProfileCompletion && userStore.isLoggedIn) {
    return true
  }

  userStore.setPendingProfileCompletion(false)
  uni.reLaunch({ url: '/pages/auth/login' })
  return false
}

function cancelProfileCompletion() {
  userStore.clearSession()
  uni.reLaunch({ url: '/pages/auth/login' })
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
    // 用户详情拉取失败时不阻断流程
  }
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

function resolveUploadedAvatarUrl(uploaded: fileService.CommonFileUploadResult) {
  const candidates = [uploaded.url, uploaded.objectName, uploaded.fileKey]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return ''
}

async function uploadAvatar(filePath: string) {
  const uploaded = await fileService.uploadWxAvatar(filePath)
  const avatar = resolveUploadedAvatarUrl(uploaded)

  if (!avatar) {
    throw new Error('头像上传成功，但未返回可用地址')
  }

  return avatar
}

async function sendPhoneCode() {
  if (!ensureProfileCompletionAccess() || isSendingCode.value || countdown.value > 0) {
    return
  }

  const nextPhone = resolvePhoneValue()

  if (!nextPhone) {
    showFailToast('请先设置手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(nextPhone)) {
    showFailToast('请输入有效的手机号')
    return
  }

  isSendingCode.value = true

  try {
    await authService.sendSmsCode({
      phone: nextPhone,
      scene: 'RESET_PWD',
    })
    startCountdown()
    showSuccessToast('验证码已发送')
  } catch (error) {
    showFailToast(getErrorMessage(error, '验证码发送失败，请稍后重试'))
  } finally {
    isSendingCode.value = false
  }
}

async function submitWechatLogin() {
  if (!ensureProfileCompletionAccess()) {
    return
  }

  const nextNickname = nickname.value.trim()
  const nextAvatarUrl = avatarUrl.value.trim()
  const nextPhone = resolvePhoneValue()
  const nextSmsCode = resolveSmsCodeValue()

  if (!nextNickname) {
    showFailToast('请先填写昵称')
    return
  }

  if (!nextAvatarUrl) {
    showFailToast('请先选择头像')
    return
  }

  if (!nextPhone) {
    showFailToast('请先设置手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(nextPhone)) {
    showFailToast('请输入有效的手机号')
    return
  }

  if (!/^\d{6}$/.test(nextSmsCode)) {
    showFailToast('请输入 6 位短信验证码')
    return
  }

  isSubmitting.value = true

  try {
    await accountService.changePhone({
      newPhone: nextPhone,
      smsCode: nextSmsCode,
    })

    const uploadedAvatarUrl = await uploadAvatar(nextAvatarUrl)
    await accountService.updateProfile({
      avatar: uploadedAvatarUrl,
      nickname: nextNickname,
    })
    userStore.setProfile({
      avatar: uploadedAvatarUrl,
      nickname: nextNickname,
    })
    await syncCurrentUserProfile()
    await syncEnterpriseProfile()
    userStore.setPendingProfileCompletion(false)

    showSuccessToast('资料完善成功')
    setTimeout(() => {
      uni.switchTab({ url: '/pages/mine/index' })
    }, 320)
  } catch (error) {
    showFailToast(getErrorMessage(error, '资料保存失败，请稍后重试'))
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  cancelProfileCompletion()
}
</script>

<style scoped lang="scss">
.page-wechat-profile {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.46), transparent 36%),
    linear-gradient(180deg, #f3f8ff 0%, #f8fbff 32%, #ffffff 100%);
}

.wechat-profile-card {
  padding: 26rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
}

.wechat-profile-card__avatar-btn {
  width: 146rpx;
  height: 146rpx;
  margin: 0 auto;
  padding: 0;
  border: 1rpx solid #bfdbfe;
  border-radius: 73rpx;
  overflow: hidden;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-profile-card__avatar-btn::after {
  border: none;
}

.wechat-profile-card__avatar {
  width: 100%;
  height: 100%;
}

.wechat-profile-card__avatar-placeholder {
  color: #1d4ed8;
  font-size: 22rpx;
}

.wechat-profile-card__nickname-input {
  height: 84rpx;
  margin-top: 18rpx;
  margin-bottom: 6rpx;
  padding: 0 22rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 16rpx;
  color: #0f172a;
  font-size: 28rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.wechat-profile-card__phone-input,
.wechat-profile-card__sms-input {
  height: 84rpx;
  margin-top: 14rpx;
  margin-bottom: 6rpx;
  padding: 0 22rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 16rpx;
  color: #0f172a;
  font-size: 28rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.wechat-profile-card__sms-row {
  margin-top: 4rpx;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12rpx;
  align-items: center;
}

.wechat-profile-card__sms-input {
  margin-top: 0;
  margin-bottom: 0;
}

</style>
