<template>
  <view class="page-security">
    <scroll-view class="page-security__scroll" scroll-y>
      <view class="page-security__content">
        <view class="security-panel">
          <text class="security-panel__title">账号安全</text>
          <AppForm class="security-form">
            <view class="security-group">
              <text class="security-group__title">修改密码</text>
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

            <view class="security-group">
              <text class="security-group__title">更换手机号</text>
              <AppField
                v-model="phoneForm.newPhone"
                :custom-style="fieldStyle"
                input-mode="numeric"
                label="新手机号"
                placeholder="请输入新手机号"
                type="number"
              />
              <view class="security-inline">
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
                  custom-style="min-height: 88rpx; min-width: 196rpx; margin-top: 22rpx;"
                  plain
                  text="发送验证码"
                  type="info"
                  @click="sendPhoneCode"
                />
              </view>
            </view>

            <view class="security-group">
              <text class="security-group__title">绑定/更换邮箱</text>
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
              custom-style="min-height: 88rpx; margin-top: 20rpx;"
              text="保存安全设置"
              type="info"
              @click="saveSecuritySettings"
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
import { accountService, authService } from '@/services/api'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

const fieldStyle = 'border-radius: 20rpx; background: #ffffff; border-color: #e5e7eb;'

const isSendingPhoneCode = ref(false)
const isSavingSecurity = ref(false)

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

const canSendPhoneCode = computed(() => (
  isPhoneNumber(phoneForm.newPhone) && !isSendingPhoneCode.value
))

function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value.trim())
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
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
</script>

<style scoped lang="scss">
.page-security {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f9fafb;
}

.page-security__scroll {
  flex: 1;
  min-height: 0;
}

.page-security__content {
  padding: 24rpx;
  box-sizing: border-box;
}

.security-panel {
  border-radius: 24rpx;
  border: 1rpx solid #e5e7eb;
  background: #ffffff;
  padding: 22rpx;
}

.security-panel__title {
  display: block;
  color: #111827;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.security-form {
  margin-top: 16rpx;
  border-top: 1rpx solid #f3f4f6;
  padding-top: 16rpx;
  display: flex;
  flex-direction: column;
}

.security-group {
  border-radius: 20rpx;
  border: 1rpx solid #e5e7eb;
  background: #f9fafb;
  padding: 18rpx;
}

.security-group + .security-group {
  margin-top: 18rpx;
}

.security-group__title {
  display: block;
  color: #1f2937;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 10rpx;
}

.security-inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12rpx;
  align-items: start;
}

@media (max-width: 360px) {
  .security-inline {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
