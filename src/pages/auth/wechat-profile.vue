<template>
  <view class="page-wechat-profile">
    <view class="wechat-profile-top">
      <text class="wechat-profile-top__title">微信首次登录</text>
      <text class="wechat-profile-top__desc">完成头像与昵称确认后即可进入平台。</text>
    </view>

    <view class="wechat-profile-card">
      <text class="wechat-profile-card__title">完善微信资料</text>
      <text class="wechat-profile-card__desc">请先选择头像、填写昵称并设置手机号后再确认登录。</text>

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

      <button
        class="wechat-profile-card__phone-btn"
        @tap="openPhonePicker"
      >
        {{ wechatPhoneText }}
      </button>
      <text class="wechat-profile-card__phone-tip">必填：点击可选择微信手机号或手动输入</text>

      <input
        v-if="phoneMode === 'manual'"
        v-model="manualPhone"
        class="wechat-profile-card__phone-input"
        maxlength="11"
        placeholder="请输入手机号"
        type="number"
      />

      <view v-if="phonePickerVisible" class="phone-picker-mask" @tap.self="closePhonePicker">
        <view class="phone-picker-panel">
          <text class="phone-picker-panel__title">选择手机号</text>
          <button
            class="phone-picker-panel__item phone-picker-panel__item--wechat"
            open-type="getPhoneNumber"
            @getphonenumber="onGetPhoneNumber"
          >
            使用当前微信手机号
          </button>
          <button
            class="phone-picker-panel__item phone-picker-panel__item--manual"
            @tap="selectManualPhone"
          >
            手动输入手机号
          </button>
          <button
            class="phone-picker-panel__cancel"
            @tap="closePhonePicker"
          >
            取消
          </button>
        </view>
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
import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService, enterpriseService, fileService, userService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const avatarUrl = ref('')
const nickname = ref('')
const manualPhone = ref('')
const wechatPhone = ref('')
const phoneMode = ref<'none' | 'wechat' | 'manual'>('none')
const phonePickerVisible = ref(false)
const isSubmitting = ref(false)

const wechatPhoneText = computed(() => {
  if (phoneMode.value === 'wechat' && wechatPhone.value) {
    return `微信手机号 ${maskPhone(wechatPhone.value)}`
  }

  if (phoneMode.value === 'manual' && manualPhone.value.trim()) {
    return `手动手机号 ${maskPhone(manualPhone.value.trim())}`
  }

  return '选择手机号（必填）'
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

function maskPhone(phone: string) {
  if (!/^1\d{10}$/.test(phone)) {
    return phone
  }

  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function normalizePhone(value: unknown) {
  return normalizeText(value).replace(/\s+/g, '')
}

function resolvePhoneValue() {
  if (phoneMode.value === 'wechat') {
    return normalizePhone(wechatPhone.value)
  }

  if (phoneMode.value === 'manual') {
    return normalizePhone(manualPhone.value)
  }

  return ''
}

function openPhonePicker() {
  phonePickerVisible.value = true
}

function closePhonePicker() {
  phonePickerVisible.value = false
}

function selectManualPhone() {
  phoneMode.value = 'manual'
  wechatPhone.value = ''
  closePhonePicker()
}

function onGetPhoneNumber(event: any) {
  const detail = event?.detail
  const errMsg = normalizeText(detail?.errMsg)
  const phoneNumber = normalizePhone(detail?.phoneNumber)

  if (!phoneNumber) {
    if (errMsg.includes('deny') || errMsg.includes('cancel') || errMsg.includes('fail')) {
      showFailToast('你已取消微信手机号授权')
      return
    }

    showFailToast('未获取到微信手机号，请改为手动输入')
    selectManualPhone()
    return
  }

  wechatPhone.value = phoneNumber
  manualPhone.value = ''
  phoneMode.value = 'wechat'
  closePhonePicker()
  showSuccessToast('已选择微信手机号')
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

async function submitWechatLogin() {
  if (!ensureProfileCompletionAccess()) {
    return
  }

  const nextNickname = nickname.value.trim()
  const nextAvatarUrl = avatarUrl.value.trim()
  const nextPhone = resolvePhoneValue()

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

  isSubmitting.value = true

  try {
    const uploadedAvatarUrl = await uploadAvatar(nextAvatarUrl)
    const code = await getWechatMiniCode()
    const session = await authService.loginByWechatMini({
      avatarUrl: uploadedAvatarUrl,
      code,
      nickname: nextNickname,
      phone: nextPhone,
    })

    if (!session.token) {
      throw new Error('登录成功，但未获取到认证凭证')
    }

    userStore.setSession({
      accountType: session.accountType,
      avatar: session.avatar ?? uploadedAvatarUrl,
      company: session.company,
      enterpriseId: session.enterpriseId,
      nickname: session.nickname ?? nextNickname,
      refreshToken: session.refreshToken,
      token: session.token,
      userType: session.userType,
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

.wechat-profile-top {
  margin-bottom: 16rpx;
  padding: 22rpx 20rpx 20rpx;
  border-radius: 24rpx;
  border: 1rpx solid rgba(191, 219, 254, 0.66);
  background: rgba(255, 255, 255, 0.8);
}

.wechat-profile-top__title {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
}

.wechat-profile-top__desc {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.5;
}

.wechat-profile-card {
  padding: 26rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
}

.wechat-profile-card__title {
  display: block;
  color: #0f172a;
  font-size: 36rpx;
  font-weight: 700;
}

.wechat-profile-card__desc {
  display: block;
  margin-top: 10rpx;
  margin-bottom: 24rpx;
  color: #475569;
  font-size: 24rpx;
  line-height: 1.6;
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

.wechat-profile-card__phone-btn {
  width: 100%;
  min-height: 84rpx;
  margin-top: 14rpx;
  border: 1rpx solid #cbd5e1;
  border-radius: 16rpx;
  background: #f8fafc;
  color: #0f172a;
  font-size: 26rpx;
  line-height: 84rpx;
  text-align: center;
}

.wechat-profile-card__phone-btn::after {
  border: none;
}

.wechat-profile-card__phone-tip {
  display: block;
  margin-top: 8rpx;
  margin-bottom: 6rpx;
  margin-left: 2rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.45;
}

.wechat-profile-card__phone-input {
  height: 84rpx;
  margin-top: 10rpx;
  margin-bottom: 6rpx;
  padding: 0 22rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 16rpx;
  color: #0f172a;
  font-size: 28rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.phone-picker-mask {
  position: fixed;
  inset: 0;
  z-index: 99;
  display: flex;
  align-items: flex-end;
  background: rgba(2, 6, 23, 0.45);
}

.phone-picker-panel {
  width: 100%;
  padding: 22rpx 24rpx 36rpx;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
}

.phone-picker-panel__title {
  display: block;
  margin-bottom: 16rpx;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
}

.phone-picker-panel__item {
  width: 100%;
  min-height: 84rpx;
  margin-top: 12rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 84rpx;
  text-align: center;
}

.phone-picker-panel__item::after {
  border: none;
}

.phone-picker-panel__item--wechat {
  border: 1rpx solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.phone-picker-panel__item--manual {
  border: 1rpx solid #dbe3ee;
  background: #f8fafc;
  color: #0f172a;
}

.phone-picker-panel__cancel {
  width: 100%;
  min-height: 84rpx;
  margin-top: 18rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 26rpx;
  line-height: 84rpx;
  text-align: center;
}

.phone-picker-panel__cancel::after {
  border: none;
}

</style>
