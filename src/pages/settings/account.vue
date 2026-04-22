<template>
  <view class="page-account-settings">
    <scroll-view class="page-account-settings__scroll" scroll-y>
      <view class="page-account-settings__content">
        <view class="settings-hero">
          <view class="settings-hero__top">
            <view class="settings-avatar-editor settings-avatar-editor--hero">
              <!-- #ifdef MP-WEIXIN -->
              <button
                class="settings-avatar-editor__picker"
                open-type="chooseAvatar"
                @chooseavatar="chooseWechatAvatar"
              >
                <image
                  v-if="profile.avatarUrl"
                  :src="profile.avatarUrl"
                  class="settings-avatar-editor__image"
                  mode="aspectFill"
                />
                <view v-else class="settings-avatar-editor__placeholder">{{ isUploadingWechatAvatar ? '上传中' : '上传头像' }}</view>
              </button>
              <!-- #endif -->
              <!-- #ifndef MP-WEIXIN -->
              <view class="settings-avatar-editor__picker" @tap="chooseLocalAvatar">
                <image
                  v-if="profile.avatarUrl"
                  :src="profile.avatarUrl"
                  class="settings-avatar-editor__image"
                  mode="aspectFill"
                />
                <view v-else class="settings-avatar-editor__placeholder">{{ isUploadingWechatAvatar ? '上传中' : '上传头像' }}</view>
              </view>
              <!-- #endif -->
            </view>
            <view class="settings-hero__identity">
              <text class="settings-hero__title">{{ profile.nickname || '未设置昵称' }}</text>
              <text class="settings-hero__subtitle">{{ maskedPhone || '未绑定手机号' }}</text>
              <view class="settings-hero__chips">
                <text class="settings-chip settings-chip--sync">{{ isLoadingProfile ? '资料同步中' : '资料已同步' }}</text>
                <text
                  class="settings-chip"
                  :class="{
                    'settings-chip--success': realNameStatus === 1,
                    'settings-chip--warning': realNameStatus === 0,
                    'settings-chip--danger': realNameStatus === 2,
                    'settings-chip--muted': realNameStatus === null,
                  }"
                >
                  实名：{{ realNameStatusText }}
                </text>
              </view>
            </view>
          </view>
          <view class="settings-meta-grid settings-meta-grid--hero">
            <view class="settings-meta-item">
              <text class="settings-meta-item__label">手机号</text>
              <text class="settings-meta-item__value">{{ maskedPhone || '-' }}</text>
            </view>
            <view class="settings-meta-item">
              <text class="settings-meta-item__label">用户名</text>
              <text class="settings-meta-item__value">{{ profile.username || '-' }}</text>
            </view>
          </view>
        </view>

        <view class="settings-section">
          <view class="settings-section__head">
            <text class="settings-section__title">基础资料</text>
          </view>
          <AppForm class="settings-form settings-form--panel">
            <AppField
              v-model="profile.nickname"
              :custom-style="fieldStyle"
              label="昵称"
              placeholder="请输入昵称"
            />
            <AppField
              v-model="profile.username"
              :custom-style="fieldStyle"
              label="用户名"
              placeholder="请输入用户名"
            />

            <AppButton
              :loading="isSavingProfile"
              block
              custom-style="min-height: 88rpx; margin-top: 18rpx;"
              text="保存资料"
              type="info"
              @click="saveProfileBasics"
            />
          </AppForm>
        </view>

        <view class="settings-section">
          <view class="settings-section__head">
            <text class="settings-section__title">安全与认证</text>
          </view>
          <view class="entry-list">
            <view class="entry-row" @tap="goSecurity">
              <text class="entry-row__title">账号安全</text>
              <view class="entry-row__right">
                <text class="entry-row__arrow">›</text>
              </view>
            </view>
            <view class="entry-row" @tap="goRealName">
              <text class="entry-row__title">实名认证</text>
              <view class="entry-row__right">
                <text class="entry-row__value">{{ realNameStatusText }}</text>
                <text class="entry-row__arrow">›</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { accountService, fileService, userService } from '@/services/api'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const fieldStyle = 'border-radius: 20rpx; background: #ffffff; border-color: #e5e7eb;'

const isLoadingProfile = ref(false)
const isSavingProfile = ref(false)
const isUploadingWechatAvatar = ref(false)
const realNameStatus = ref<number | null>(null)

const profile = reactive({
  avatarUrl: '',
  nickname: '',
  phone: '',
  username: '',
})

const profileSnapshot = reactive({
  avatarUrl: '',
  nickname: '',
  username: '',
})

const maskedPhone = computed(() => {
  const value = profile.phone.trim()

  if (!value) {
    return ''
  }

  if (value.length < 7) {
    return value
  }

  return `${value.slice(0, 3)}****${value.slice(-4)}`
})

const realNameStatusText = computed(() => {
  if (realNameStatus.value === 1) {
    return '已通过'
  }

  if (realNameStatus.value === 2) {
    return '已驳回'
  }

  if (realNameStatus.value === 0) {
    return '待审核'
  }

  return '未提交'
})

function resolveStoreUserType(userType?: number, accountType?: number) {
  const value = userType ?? accountType

  if (value === undefined || value === null) {
    return undefined
  }

  return value === 0 ? 'personal' : 'enterprise'
}

function resolveFileName(filePath: string) {
  const segments = filePath.split('/')
  return segments[segments.length - 1] || 'file'
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

onLoad(() => {
  void loadProfile()
})

onShow(() => {
  void loadProfile()
})

async function loadProfile() {
  if (!userStore.isLoggedIn) {
    return
  }

  isLoadingProfile.value = true

  try {
    const [currentUser, realNameInfo] = await Promise.all([
      userService.getCurrentUser(),
      accountService.getRealNameStatus().catch(() => null),
    ])

    profile.nickname = (currentUser.nickname || '').trim()
    profile.avatarUrl = (currentUser.avatar || '').trim()
    profile.phone = currentUser.phone || ''
    profile.username = (currentUser.username || '').trim()

    profileSnapshot.nickname = profile.nickname
    profileSnapshot.avatarUrl = profile.avatarUrl
    profileSnapshot.username = profile.username

    realNameStatus.value = typeof realNameInfo?.realNameStatus === 'number' ? realNameInfo.realNameStatus : null

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
  } catch (error) {
    showFailToast(getErrorMessage(error, '账号信息加载失败'))
  } finally {
    isLoadingProfile.value = false
  }
}

async function saveProfileBasics() {
  const nickname = profile.nickname.trim()
  const avatarUrl = profile.avatarUrl.trim()
  const username = profile.username.trim()

  if (!nickname) {
    showFailToast('请输入昵称')
    return
  }

  if (!username) {
    showFailToast('请输入用户名')
    return
  }

  const nicknameChanged = nickname !== profileSnapshot.nickname
  const avatarChanged = avatarUrl !== profileSnapshot.avatarUrl
  const usernameChanged = username !== profileSnapshot.username

  if (!nicknameChanged && !avatarChanged && !usernameChanged) {
    showSuccessToast('资料已是最新')
    return
  }

  if (avatarChanged && !avatarUrl) {
    showFailToast('头像地址不能为空')
    return
  }

  isSavingProfile.value = true
  let currentAction = '资料'

  try {
    if (nicknameChanged || avatarChanged) {
      currentAction = '基础资料'

      try {
        await accountService.updateProfile({
          avatar: avatarChanged ? avatarUrl : undefined,
          nickname: nicknameChanged ? nickname : undefined,
        })
      } catch {
        if (nicknameChanged) {
          currentAction = '昵称'
          await userService.updateNickname(nickname)
        }

        if (avatarChanged) {
          currentAction = '头像'
          await userService.updateAvatar(avatarUrl)
        }
      }

      if (nicknameChanged) {
        userStore.setProfile({ nickname })
      }

      if (avatarChanged) {
        userStore.setProfile({ avatar: avatarUrl })
      }
    }

    if (usernameChanged) {
      currentAction = '用户名'
      await accountService.setUsername(username)
    }

    profileSnapshot.nickname = nickname
    profileSnapshot.avatarUrl = avatarUrl
    profileSnapshot.username = username
    showSuccessToast('资料已更新')
  } catch (error) {
    showFailToast(getErrorMessage(error, `${currentAction}更新失败`))
  } finally {
    isSavingProfile.value = false
  }
}

async function chooseImageFile() {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      fail: () => {
        reject(new Error('已取消选择图片'))
      },
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const filePath = result.tempFilePaths?.[0]

        if (!filePath) {
          reject(new Error('未获取到可上传的图片'))
          return
        }

        resolve({
          fileName: resolveFileName(filePath),
          filePath,
        })
      },
    })
  })
}

async function uploadAndPersistAvatar(avatarFilePath: string) {
  if (isUploadingWechatAvatar.value || isSavingProfile.value) {
    return
  }

  isUploadingWechatAvatar.value = true

  try {
    const uploaded = await fileService.uploadWxAvatar(avatarFilePath)
    const uploadedAvatarUrl = resolveUploadedAvatarUrl(uploaded)

    if (!uploadedAvatarUrl) {
      throw new Error('头像上传成功，但未返回可用地址')
    }

    await userService.updateAvatar(uploadedAvatarUrl)
    profile.avatarUrl = uploadedAvatarUrl
    profileSnapshot.avatarUrl = uploadedAvatarUrl
    userStore.setProfile({ avatar: uploadedAvatarUrl })
    showSuccessToast('微信头像已同步')
  } catch (error) {
    showFailToast(getErrorMessage(error, '微信头像上传失败'))
  } finally {
    isUploadingWechatAvatar.value = false
  }
}

async function chooseWechatAvatar(event: any) {
  const avatarFilePath = typeof event?.detail?.avatarUrl === 'string' ? event.detail.avatarUrl.trim() : ''

  if (!avatarFilePath) {
    showFailToast('未获取到微信头像，请重试')
    return
  }

  await uploadAndPersistAvatar(avatarFilePath)
}

async function chooseLocalAvatar() {
  if (isUploadingWechatAvatar.value || isSavingProfile.value) {
    return
  }

  try {
    const selected = await chooseImageFile()
    await uploadAndPersistAvatar(selected.filePath)
  } catch (error) {
    showFailToast(getErrorMessage(error, '头像上传失败'))
  }
}

function goSecurity() {
  uni.navigateTo({ url: '/pages/settings/security' })
}

function goRealName() {
  uni.navigateTo({ url: '/pages/settings/realname' })
}
</script>

<style scoped lang="scss">
.page-account-settings {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f5ff 0%, #f7fafe 170rpx, #f9fafb 320rpx, #f9fafb 100%);
}

.page-account-settings__scroll {
  flex: 1;
  min-height: 0;
}

.page-account-settings__content {
  padding: 22rpx 24rpx 36rpx;
  box-sizing: border-box;
}

.settings-hero {
  position: relative;
  border-radius: 28rpx;
  border: 1rpx solid #dbe7ff;
  background:
    radial-gradient(circle at 16% -10%, rgba(30, 97, 255, 0.22), transparent 54%),
    radial-gradient(circle at 80% 5%, rgba(255, 138, 0, 0.12), transparent 40%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 24rpx;
  overflow: hidden;
}

.settings-hero__top {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 20rpx;
}

.settings-hero__identity {
  flex: 1;
  min-width: 0;
  padding-top: 4rpx;
}

.settings-hero__title {
  display: block;
  color: #111827;
  font-size: 34rpx;
  line-height: 1.25;
  font-weight: 600;
}

.settings-hero__subtitle {
  display: block;
  margin-top: 10rpx;
  color: #4b5563;
  font-size: 23rpx;
  line-height: 1.55;
}

.settings-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
}

.settings-chip {
  display: inline-flex;
  align-items: center;
  min-height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  font-size: 20rpx;
  font-weight: 500;
}

.settings-chip--sync {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e61ff;
}

.settings-chip--success {
  border-color: #a7f3d0;
  background: #ecfdf5;
  color: #047857;
}

.settings-chip--warning {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.settings-chip--danger {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.settings-chip--muted {
  border-color: #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
}

.settings-meta-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.settings-meta-grid--hero {
  position: relative;
  z-index: 1;
}

.settings-meta-item {
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid #e5e7eb;
  padding: 16rpx;
  min-height: 96rpx;
  box-sizing: border-box;
}

.settings-meta-item__label {
  display: block;
  color: #6b7280;
  font-size: 20rpx;
}

.settings-meta-item__value {
  display: block;
  margin-top: 8rpx;
  color: #111827;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
}

.settings-section {
  margin-top: 18rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e5e7eb;
  background: #ffffff;
  padding: 22rpx;
}

.settings-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.settings-section__title {
  display: block;
  color: #111827;
  font-size: 30rpx;
  line-height: 1.35;
  font-weight: 600;
}

.settings-form {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.settings-form--panel {
  border-top: 1rpx solid #f3f4f6;
  padding-top: 16rpx;
}

.entry-list {
  margin-top: 16rpx;
  border-top: 1rpx solid #f3f4f6;
}

.entry-row {
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  border-bottom: 1rpx solid #f3f4f6;
  transition: opacity 0.2s ease;
}

.entry-row:active {
  opacity: 0.68;
}

.entry-row__title {
  color: #111827;
  font-size: 27rpx;
  font-weight: 500;
}

.entry-row__right {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
}

.entry-row__value {
  color: #6b7280;
  font-size: 23rpx;
}

.entry-row__arrow {
  color: #9ca3af;
  font-size: 30rpx;
}

.settings-avatar-editor {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.settings-avatar-editor--hero {
  flex-shrink: 0;
  margin-top: 2rpx;
}

.settings-avatar-editor__picker {
  width: 112rpx;
  height: 112rpx;
  border: 1rpx solid #dbe7ff;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.settings-avatar-editor__picker:active {
  transform: scale(0.98);
  opacity: 0.78;
}

.settings-avatar-editor__image,
.settings-avatar-editor__placeholder {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.settings-avatar-editor__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a56e5;
  font-size: 20rpx;
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .entry-row,
  .settings-avatar-editor__picker {
    transition: none;
  }
}
</style>
