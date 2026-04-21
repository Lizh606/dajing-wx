<template>
  <view class="page-account-settings">
    <scroll-view class="page-account-settings__scroll" scroll-y>
      <view class="page-account-settings__content">
        <view class="settings-card settings-card--account">
          <view class="settings-card__head">
            <view>
              <text class="settings-card__title">当前账号</text>
              <text class="settings-card__hint">资料与安全信息统一在此管理</text>
            </view>
            <text class="settings-card__badge">{{ isLoadingProfile ? '同步中' : '已同步' }}</text>
          </view>
          <view class="settings-meta-grid">
            <view class="settings-meta-item">
              <text class="settings-meta-item__label">手机号</text>
              <text class="settings-meta-item__value">{{ maskedPhone || '未获取' }}</text>
            </view>
            <view class="settings-meta-item">
              <text class="settings-meta-item__label">昵称</text>
              <text class="settings-meta-item__value">{{ profile.nickname || '-' }}</text>
            </view>
            <view class="settings-meta-item settings-meta-item--full">
              <text class="settings-meta-item__label">用户名</text>
              <text class="settings-meta-item__value">{{ profile.username || '-' }}</text>
            </view>
          </view>
        </view>

        <view class="settings-card">
          <view class="settings-card__head">
            <view>
              <text class="settings-card__title">基础资料</text>
              <text class="settings-card__hint">修改后统一保存，减少重复操作</text>
            </view>
          </view>
          <AppForm class="settings-form">
            <AppField
              v-model="profile.nickname"
              :custom-style="fieldStyle"
              label="昵称"
              placeholder="请输入昵称"
            />
            <AppField
              v-model="profile.avatarUrl"
              :custom-style="fieldStyle"
              label="头像地址"
              placeholder="请输入头像 URL"
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
              custom-style="min-height: 72rpx; margin-top: 14rpx;"
              text="保存资料"
              type="info"
              @click="saveProfileBasics"
            />
          </AppForm>
        </view>

        <view class="settings-card">
          <view class="settings-card__head">
            <view>
              <text class="settings-card__title">账号安全</text>
              <text class="settings-card__hint">支持一次性提交多个安全项</text>
            </view>
          </view>
          <AppForm class="settings-form">
            <view class="settings-form-block settings-form-block--password">
              <text class="settings-form-block__title">修改密码（可选）</text>
              <AppField
                v-model="passwordForm.oldPassword"
                :custom-style="fieldStyle"
                label="旧密码"
                placeholder="首次设置可留空"
                type="password"
              />
              <AppField
                v-model="passwordForm.newPassword"
                :custom-style="fieldStyle"
                label="新密码"
                placeholder="至少 8 位"
                type="password"
              />
            </view>

            <view class="settings-form-block settings-form-block--phone">
              <text class="settings-form-block__title">更换手机号（可选）</text>
              <AppField
                v-model="phoneForm.newPhone"
                :custom-style="fieldStyle"
                input-mode="numeric"
                label="新手机号"
                placeholder="请输入新手机号"
                type="number"
              />
              <view class="settings-inline">
                <AppField
                  v-model="phoneForm.smsCode"
                  :custom-style="fieldStyle"
                  input-mode="numeric"
                  label="验证码"
                  placeholder="请输入验证码"
                  type="number"
                />
                <AppButton
                  :disabled="!canSendPhoneCode || isSavingSecurity"
                  :loading="isSendingPhoneCode"
                  custom-style="min-height: 64rpx; min-width: 168rpx; margin-top: 34rpx;"
                  plain
                  text="发送验证码"
                  type="info"
                  @click="sendPhoneCode"
                />
              </view>
            </view>

            <view class="settings-form-block settings-form-block--email">
              <text class="settings-form-block__title">绑定/更换邮箱（可选）</text>
              <AppField
                v-model="emailForm.newEmail"
                :custom-style="fieldStyle"
                input-mode="email"
                label="邮箱"
                placeholder="请输入邮箱"
              />
              <AppField
                v-model="emailForm.password"
                :custom-style="fieldStyle"
                label="当前密码"
                placeholder="请输入当前密码"
                type="password"
              />
            </view>

            <AppButton
              :loading="isSavingSecurity"
              block
              custom-style="min-height: 72rpx; margin-top: 14rpx;"
              text="保存安全设置"
              type="info"
              @click="saveSecuritySettings"
            />
          </AppForm>
        </view>

        <view v-if="false" class="settings-card">
          <view class="settings-card__head">
            <view>
              <text class="settings-card__title">微信账号</text>
              <text class="settings-card__hint">小程序环境支持快捷绑定</text>
            </view>
          </view>
          <AppForm class="settings-form">
            <AppButton
              :loading="isBindingWechat"
              block
              custom-style="min-height: 72rpx; margin-top: 4rpx; background: linear-gradient(135deg,#22c55e 0%,#16a34a 100%); border-color: #16a34a;"
              text="绑定微信账号"
              type="info"
              @click="bindWechatAccount"
            />
            <button
              class="wechat-phone-btn"
              open-type="getPhoneNumber"
              @getphonenumber="bindWechatPhone"
            >
              {{ isBindingWechatPhone ? '绑定中...' : '一键绑定微信手机号' }}
            </button>
            <text class="settings-card__meta">仅微信小程序环境支持微信账号绑定。</text>
          </AppForm>
        </view>

        <view class="settings-card">
          <view class="settings-card__head">
            <view>
              <text class="settings-card__title">个人实名认证</text>
              <text class="settings-card__hint">上传证件并提交审核</text>
            </view>
            <text class="settings-card__status">{{ realNameStatusText }}</text>
          </view>
          <AppForm class="settings-form">
            <AppField
              v-model="realNameForm.realName"
              :custom-style="fieldStyle"
              label="真实姓名"
              placeholder="请输入真实姓名"
            />
            <AppField
              v-model="realNameForm.idCardNo"
              :custom-style="fieldStyle"
              label="身份证号"
              placeholder="请输入身份证号"
            />

            <view class="settings-upload-grid">
              <view
                class="settings-upload-item"
                :class="{
                  'settings-upload-item--busy': uploadingSide === 'front',
                  'settings-upload-item--disabled': Boolean(uploadingSide) && uploadingSide !== 'front',
                }"
                @tap="uploadIdCard('front')"
              >
                <text class="settings-upload-item__label">身份证正面</text>
                <text class="settings-upload-item__value">{{ idCardFrontText }}</text>
                <text class="settings-upload-item__action">{{ uploadingSide === 'front' ? '上传中...' : '上传图片' }}</text>
              </view>
              <view
                class="settings-upload-item"
                :class="{
                  'settings-upload-item--busy': uploadingSide === 'back',
                  'settings-upload-item--disabled': Boolean(uploadingSide) && uploadingSide !== 'back',
                }"
                @tap="uploadIdCard('back')"
              >
                <text class="settings-upload-item__label">身份证反面</text>
                <text class="settings-upload-item__value">{{ idCardBackText }}</text>
                <text class="settings-upload-item__action">{{ uploadingSide === 'back' ? '上传中...' : '上传图片' }}</text>
              </view>
            </view>

            <AppButton
              :loading="isSubmittingRealName"
              block
              custom-style="min-height: 72rpx; margin-top: 14rpx;"
              text="提交实名认证"
              type="info"
              @click="submitRealName"
            />
          </AppForm>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { accountService, authService, userService } from '@/services/api'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

type UploadSide = 'front' | 'back'

const userStore = useUserStore()
const fieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'

const isLoadingProfile = ref(false)
const isSavingProfile = ref(false)
const isSendingPhoneCode = ref(false)
const isSavingSecurity = ref(false)
const isBindingWechat = ref(false)
const isBindingWechatPhone = ref(false)
const isSubmittingRealName = ref(false)
const uploadingSide = ref<UploadSide | ''>('')
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

const passwordForm = reactive({
  newPassword: '',
  oldPassword: '',
})

const phoneForm = reactive({
  newPhone: '',
  smsCode: '',
})

const emailForm = reactive({
  newEmail: '',
  password: '',
})

const realNameForm = reactive({
  idCardBack: '',
  idCardFront: '',
  idCardNo: '',
  realName: '',
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

const canSendPhoneCode = computed(() => (
  isPhoneNumber(phoneForm.newPhone) && !isSendingPhoneCode.value
))

const idCardFrontText = computed(() => formatUploadValue(realNameForm.idCardFront))
const idCardBackText = computed(() => formatUploadValue(realNameForm.idCardBack))

function resolveStoreUserType(userType?: number, accountType?: number) {
  const value = userType ?? accountType

  if (value === undefined || value === null) {
    return undefined
  }

  return value === 0 ? 'personal' : 'enterprise'
}

onLoad(() => {
  void loadProfile()
})

onShow(() => {
  void loadProfile()
})

function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value.trim())
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function resolveFileName(filePath: string) {
  const segments = filePath.split('/')
  return segments[segments.length - 1] || 'file'
}

function formatUploadValue(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return '点击上传'
  }

  if (trimmed.length <= 28) {
    return trimmed
  }

  return `${trimmed.slice(0, 12)}...${trimmed.slice(-10)}`
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
      fail: (error) => {
        reject(new Error(resolveMiniProgramErrorMessage(error, '微信授权失败')))
      },
      success: (result) => {
        const loginCode = typeof result.code === 'string' ? result.code.trim() : ''

        if (!loginCode) {
          reject(new Error('微信授权未返回有效 code'))
          return
        }

        resolve(loginCode)
      },
    })
  })
}

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

    if (realNameInfo?.realName && !realNameForm.realName) {
      realNameForm.realName = realNameInfo.realName
    }

    if (realNameInfo?.idCardNo && !realNameForm.idCardNo) {
      realNameForm.idCardNo = realNameInfo.idCardNo
    }

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

async function sendPhoneCode() {
  const phone = phoneForm.newPhone.trim()

  if (!isPhoneNumber(phone)) {
    showFailToast('请输入正确的手机号')
    return
  }

  isSendingPhoneCode.value = true

  try {
    await authService.sendSmsCode({
      phone,
      scene: 'RESET_PWD',
    })
    showSuccessToast('验证码已发送')
  } catch (error) {
    showFailToast(getErrorMessage(error, '验证码发送失败'))
  } finally {
    isSendingPhoneCode.value = false
  }
}

async function saveSecuritySettings() {
  const newPassword = passwordForm.newPassword
  const oldPassword = passwordForm.oldPassword.trim()
  const newPhone = phoneForm.newPhone.trim()
  const smsCode = phoneForm.smsCode.trim()
  const newEmail = emailForm.newEmail.trim()
  const emailPassword = emailForm.password

  const shouldUpdatePassword = Boolean(newPassword || oldPassword)
  const shouldUpdatePhone = Boolean(newPhone || smsCode)
  const shouldUpdateEmail = Boolean(newEmail || emailPassword)

  if (!shouldUpdatePassword && !shouldUpdatePhone && !shouldUpdateEmail) {
    showFailToast('请先填写要更新的安全信息')
    return
  }

  if (shouldUpdatePassword) {
    if (!newPassword) {
      showFailToast('请输入新密码')
      return
    }

    if (newPassword.length < 8) {
      showFailToast('新密码至少 8 位')
      return
    }
  }

  if (shouldUpdatePhone) {
    if (!isPhoneNumber(newPhone)) {
      showFailToast('请输入正确的新手机号')
      return
    }

    if (!smsCode) {
      showFailToast('请输入验证码')
      return
    }
  }

  if (shouldUpdateEmail) {
    if (!isEmail(newEmail)) {
      showFailToast('请输入正确邮箱格式')
      return
    }

    if (!emailPassword) {
      showFailToast('请输入当前密码')
      return
    }
  }

  isSavingSecurity.value = true
  let currentAction = '安全设置'

  try {
    if (shouldUpdatePassword) {
      currentAction = '密码'
      await accountService.changePassword({
        newPassword,
        oldPassword: oldPassword || undefined,
      })
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
    }

    if (shouldUpdatePhone) {
      currentAction = '手机号'
      await accountService.changePhone({
        newPhone,
        smsCode,
      })
      phoneForm.newPhone = ''
      phoneForm.smsCode = ''
      await loadProfile()
    }

    if (shouldUpdateEmail) {
      currentAction = '邮箱'
      await accountService.changeEmail({
        newEmail,
        password: emailPassword,
      })
      emailForm.newEmail = ''
      emailForm.password = ''
    }

    showSuccessToast('安全设置已更新')
  } catch (error) {
    showFailToast(getErrorMessage(error, `${currentAction}更新失败`))
  } finally {
    isSavingSecurity.value = false
  }
}

async function bindWechatAccount() {
  isBindingWechat.value = true

  try {
    const code = await getWechatMiniCode()
    await authService.bindWechat({ code, device: 'MP-WEIXIN' })
    showSuccessToast('微信账号绑定成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '微信账号绑定失败'))
  } finally {
    isBindingWechat.value = false
  }
}

async function bindWechatPhone(event: any) {
  const code = typeof event?.detail?.code === 'string' ? event.detail.code.trim() : ''

  if (!code) {
    showFailToast('未获取到微信手机号授权，请重试')
    return
  }

  isBindingWechatPhone.value = true

  try {
    await authService.bindWechatMiniPhone({ code })
    await loadProfile()
    showSuccessToast('微信手机号绑定成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '微信手机号绑定失败'))
  } finally {
    isBindingWechatPhone.value = false
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

async function uploadIdCard(side: UploadSide) {
  if (uploadingSide.value) {
    return
  }

  uploadingSide.value = side

  try {
    const selected = await chooseImageFile()
    const uploaded = await accountService.uploadIdCard(selected.filePath)
    const objectName = uploaded.objectName || uploaded.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    if (side === 'front') {
      realNameForm.idCardFront = objectName
    } else {
      realNameForm.idCardBack = objectName
    }

    showSuccessToast(`${side === 'front' ? '正面' : '反面'}上传成功：${selected.fileName}`)
  } catch (error) {
    showFailToast(getErrorMessage(error, '身份证上传失败'))
  } finally {
    uploadingSide.value = ''
  }
}

async function submitRealName() {
  const realName = realNameForm.realName.trim()
  const idCardNo = realNameForm.idCardNo.trim()
  const idCardFront = realNameForm.idCardFront.trim()
  const idCardBack = realNameForm.idCardBack.trim()

  if (!realName) {
    showFailToast('请输入真实姓名')
    return
  }

  if (idCardNo.length < 15) {
    showFailToast('请输入正确的身份证号')
    return
  }

  if (!idCardFront || !idCardBack) {
    showFailToast('请先上传身份证正反面')
    return
  }

  isSubmittingRealName.value = true

  try {
    await accountService.submitRealName({
      idCardBack,
      idCardFront,
      idCardNo,
      realName,
    })
    await loadProfile()
    showSuccessToast('实名认证已提交')
  } catch (error) {
    showFailToast(getErrorMessage(error, '实名认证提交失败'))
  } finally {
    isSubmittingRealName.value = false
  }
}
</script>

<style scoped lang="scss">
.page-account-settings {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-account-settings__scroll {
  flex: 1;
  min-height: 0;
}

.page-account-settings__content {
  padding: 20rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.settings-card {
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
  padding: 22rpx;
}

.settings-card + .settings-card {
  margin-top: 14rpx;
}

.settings-card--account {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.settings-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.settings-card__title {
  display: block;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.settings-card__hint {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
}

.settings-card__status {
  color: #1E61FF;
  font-size: 22rpx;
}

.settings-card__badge {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid #bfdbfe;
  background: #eff6ff;
  color: #1E61FF;
  font-size: 20rpx;
  font-weight: 600;
}

.settings-card__meta {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
}

.settings-meta-grid {
  margin-top: 14rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.settings-meta-item {
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  padding: 14rpx 16rpx;
}

.settings-meta-item--full {
  grid-column: 1 / -1;
}

.settings-meta-item__label {
  display: block;
  color: #64748b;
  font-size: 20rpx;
}

.settings-meta-item__value {
  display: block;
  margin-top: 6rpx;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.settings-form {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
}

.settings-form-block {
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
}

.settings-form-block--phone,
.settings-form-block--email {
  margin-top: 16rpx;
}

.settings-form-block__title {
  display: block;
  margin-bottom: 10rpx;
  color: #1e293b;
  font-size: 23rpx;
  font-weight: 600;
}

.settings-inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10rpx;
  align-items: start;
}

.settings-upload-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10rpx;
}

.settings-upload-item {
  border-radius: 16rpx;
  border: 1rpx dashed #bfdbfe;
  background: #f8fbff;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.settings-upload-item--busy {
  opacity: 0.76;
}

.settings-upload-item--disabled {
  opacity: 0.48;
}

.settings-upload-item__label {
  color: #1e293b;
  font-size: 24rpx;
  font-weight: 600;
}

.settings-upload-item__value {
  flex: 1;
  min-width: 0;
  color: #64748b;
  font-size: 21rpx;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-upload-item__action {
  color: #1E61FF;
  font-size: 22rpx;
  font-weight: 600;
}

.wechat-phone-btn {
  width: 100%;
  height: 72rpx;
  margin-top: 10rpx;
  border: 1rpx solid #16a34a;
  border-radius: 16rpx;
  background: #f0fdf4;
  color: #166534;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 72rpx;
  text-align: center;
}
</style>
