<template>
  <view class="page-wechat-profile">
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
        custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 22rpx;"
        text="确认并登录"
        type="info"
        @click="submitWechatLogin"
      />
      <!-- #endif -->

      <!-- #ifndef MP-WEIXIN -->
      <text class="wechat-profile-card__hint">仅微信小程序环境支持微信资料确认登录。</text>
      <!-- #endif -->

      <AppButton
        block
        plain
        custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 14rpx;"
        text="返回登录页"
        type="info"
        @click="goBack"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { authService, enterpriseService, userService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const avatarUrl = ref('')
const nickname = ref('')
const isSubmitting = ref(false)

onLoad(() => {
  nickname.value = userStore.nickname || ''
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

function getWechatMiniCode() {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      fail: (error) => {
        reject(new Error(error?.errMsg || '微信登录失败'))
      },
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
    // 用户详情拉取失败时不阻断登录
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

async function finalizeWechatLogin(session: Awaited<ReturnType<typeof authService.loginByWechatMini>>) {
  if (!session.token) {
    throw new Error('登录成功，但未获取到认证凭证')
  }

  userStore.setSession({
    accountType: session.accountType,
    avatar: session.avatar,
    company: session.company,
    enterpriseId: session.enterpriseId,
    nickname: session.nickname ?? (nickname.value.trim() || '微信用户'),
    refreshToken: session.refreshToken,
    token: session.token,
    userType: session.userType,
  })

  await syncCurrentUserProfile()
  await syncEnterpriseProfile()

  showSuccessToast('登录成功')
  setTimeout(() => {
    uni.switchTab({ url: '/pages/mine/index' })
  }, 320)
}

async function submitWechatLogin() {
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
    const code = await getWechatMiniCode()
    const session = await authService.loginByWechatMini({
      avatarUrl: nextAvatarUrl,
      code,
      nickname: nextNickname,
    })
    await finalizeWechatLogin(session)
  } catch (error) {
    showFailToast(getErrorMessage(error, '微信登录失败，请稍后重试'))
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  const pages = getCurrentPages()

  if (pages.length <= 1) {
    uni.redirectTo({ url: '/pages/auth/login' })
    return
  }

  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped lang="scss">
.page-wechat-profile {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.32), transparent 34%),
    linear-gradient(180deg, #eef4ff 0%, #f8fafc 55%, #ffffff 100%);
}

.wechat-profile-card {
  padding: 26rpx;
  border: 1rpx solid #dbeafe;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 16rpx 36rpx rgba(37, 99, 235, 0.08);
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

.wechat-profile-card__hint {
  display: block;
  margin: 20rpx 0;
  color: #475569;
  font-size: 24rpx;
  line-height: 1.6;
}
</style>
