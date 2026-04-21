<template>
  <view class="page-wechat-profile">
    <view class="wechat-profile-top">
      <text class="wechat-profile-top__title">微信首次登录</text>
      <text class="wechat-profile-top__desc">完成头像与昵称确认后即可进入平台。</text>
    </view>

    <view class="wechat-profile-card">
      <text class="wechat-profile-card__title">完善微信资料</text>
      <text class="wechat-profile-card__desc">请先选择头像并填写昵称，再确认登录。</text>

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
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { accountService, enterpriseService, fileService, userService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const avatarUrl = ref('')
const nickname = ref('')
const isSubmitting = ref(false)

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

  if (!nextNickname) {
    showFailToast('请先填写昵称')
    return
  }

  if (!nextAvatarUrl) {
    showFailToast('请先选择头像')
    return
  }

  isSubmitting.value = true

  try {
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

</style>
