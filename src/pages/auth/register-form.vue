<template>
  <view class="page-register-form">
    <view class="register-card">
      <view class="register-card__hero">
        <image :src="logoUrl" class="register-card__hero-logo" mode="aspectFit" />
        <text class="register-card__hero-title">{{ roleMeta.title }}</text>

        <view class="register-card__hero-tags"></view>
      </view>

      <view v-if="feedback.message" class="register-feedback" :class="`register-feedback--${feedback.tone}`">
        <text class="register-feedback__text">{{ feedback.message }}</text>
      </view>

      <AppForm class="register-form">
        <view class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">账号信息</text>
          </view>

          <view class="register-section__stack">
            <AppField
              v-model="form.phone"
              :custom-style="fieldStyle"
              :error="fieldErrors.phone"
              input-mode="numeric"
              label="注册手机号"
              placeholder="请输入手机号"
              type="number"
              @blur="validatePhone"
            />

            <view class="register-form__code">
              <AppField
                v-model="form.code"
                :custom-style="codeFieldStyle"
                :error="fieldErrors.code"
                input-mode="numeric"
                label="验证码"
                placeholder="请输入验证码"
                type="number"
                @blur="validateCode"
              />
              <view class="register-form__code-action">
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

            <AppField
              v-if="role === 'individual'"
              v-model="form.organization"
              :custom-style="fieldStyle"
              :error="fieldErrors.organization"
              label="所在单位"
              placeholder="请输入所在单位"
            />
          </view>
        </view>

        <view v-if="showCompany" class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">主体信息</text>
          </view>

          <view class="register-section__stack">
            <view class="register-ocr">
              <AppField
                v-model="form.businessLicense"
                :custom-style="fieldStyle"
                :error="fieldErrors.businessLicense"
                label="营业执照"
                placeholder="请输入营业执照 URL（可手动输入或上传）"
                @blur="validateBusinessLicense"
              />
              <view class="register-ocr__actions">
                <AppButton
                  :loading="isUploadingLicense"
                  custom-style="min-height: 60rpx; min-width: 178rpx; padding: 0 18rpx; border-radius: 14rpx; font-size: 22rpx;"
                  plain
                  text="上传执照"
                  type="info"
                  @click="uploadBusinessLicense"
                />
              </view>
            </view>

            <view class="register-type" @tap="openEnterpriseTypePicker">
              <AppField
                :model-value="enterpriseTypeLabel"
                :custom-style="fieldStyle"
                :error="fieldErrors.enterpriseType"
                label="主体类型"
                placeholder="请点击选择主体类型"
                readonly
                @focus="openEnterpriseTypePicker"
              />
            </view>

            <AppField
              v-model="form.companyName"
              :custom-style="fieldStyle"
              :error="fieldErrors.companyName"
              label="主体名称"
              placeholder="请输入企业或机构名称"
              @blur="validateCompanyName"
            />
            <AppField
              v-model="form.creditCode"
              :custom-style="fieldStyle"
              :error="fieldErrors.creditCode"
              label="统一社会信用代码"
              placeholder="请输入统一社会信用代码"
              @blur="validateCreditCode"
            />
            <AppField
              v-model="form.region"
              :custom-style="fieldStyle"
              :error="fieldErrors.region"
              label="所属地区"
              placeholder="请输入所属地区"
              @blur="validateRegion"
            />
            <AppField
              v-model="form.address"
              :custom-style="fieldStyle"
              :error="fieldErrors.address"
              label="详细地址"
              placeholder="请输入详细地址"
              @blur="validateAddress"
            />

            <AppField
              v-model="form.serviceRange"
              :custom-style="fieldStyle"
              label="服务范围"
              placeholder="例如：检测、认证、计量"
            />
            <AppField
              v-model="form.qualification"
              :custom-style="fieldStyle"
              label="资质描述"
              placeholder="例如：CMA/CNAS认证机构"
            />
            <AppField
              v-model="form.introduction"
              :custom-style="fieldStyle"
              label="企业简介"
              placeholder="请输入企业简介"
            />
            <AppField
              v-model="form.registeredCapital"
              :custom-style="fieldStyle"
              label="注册资本"
              placeholder="例如：500万元人民币"
            />
            <AppField
              v-model="form.email"
              :custom-style="fieldStyle"
              label="企业邮箱"
              placeholder="请输入企业邮箱（可选）"
            />
          </view>
        </view>

        <view v-if="showCompany" class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">联系信息</text>
          </view>

          <view class="register-section__stack">
            <AppField
              v-model="form.principalName"
              :custom-style="fieldStyle"
              :error="fieldErrors.principalName"
              label="负责人姓名"
              placeholder="请输入负责人姓名"
              @blur="validatePrincipalName"
            />
            <AppField
              v-model="form.principalPhone"
              :custom-style="fieldStyle"
              :error="fieldErrors.principalPhone"
              input-mode="numeric"
              label="负责人手机"
              placeholder="请输入负责人手机"
              type="number"
              @blur="validatePrincipalPhone"
            />
            <AppField
              v-model="form.contactName"
              :custom-style="fieldStyle"
              :error="fieldErrors.contactName"
              label="对接人姓名"
              placeholder="请输入业务对接人姓名"
              @blur="validateContactName"
            />
            <AppField
              v-model="form.contactJob"
              :custom-style="fieldStyle"
              label="对接人职位"
              placeholder="请输入业务对接人职位"
            />
            <AppField
              v-model="form.contactPhone"
              :custom-style="fieldStyle"
              :error="fieldErrors.contactPhone"
              input-mode="numeric"
              label="对接人手机"
              placeholder="请输入业务对接人手机"
              type="number"
              @blur="validateContactPhone"
            />
          </view>
        </view>

        <view v-if="showCompany" class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">资质附件</text>
          </view>

          <view class="register-section__stack">
            <view class="register-ocr">
              <AppField
                v-model="form.authorizationLetter"
                :custom-style="fieldStyle"
                label="授权委托书"
                placeholder="可选，上传后自动填充"
                readonly
              />
              <view class="register-ocr__actions">
                <AppButton
                  :loading="isUploadingAuthorizationLetter"
                  custom-style="min-height: 60rpx; min-width: 178rpx; padding: 0 18rpx; border-radius: 14rpx; font-size: 22rpx;"
                  plain
                  text="上传委托书"
                  type="info"
                  @click="uploadAuthorizationLetter"
                />
              </view>
            </view>

            <view v-if="role === 'agency'" class="register-ocr">
              <AppField
                v-model="form.certFileUrl"
                :custom-style="fieldStyle"
                label="检测资质"
                placeholder="可选，上传后自动填充"
                readonly
              />
              <view class="register-ocr__actions">
                <AppButton
                  :loading="isUploadingCertFile"
                  custom-style="min-height: 60rpx; min-width: 178rpx; padding: 0 18rpx; border-radius: 14rpx; font-size: 22rpx;"
                  plain
                  text="上传资质"
                  type="info"
                  @click="uploadCertFile"
                />
              </view>
            </view>

            <AppField
              v-if="role === 'agency'"
              v-model="form.certNo"
              :custom-style="fieldStyle"
              label="资质证书编号"
              placeholder="请输入资质证书编号（可选）"
            />
            <AppField
              v-if="role === 'agency'"
              v-model="form.certExpiry"
              :custom-style="fieldStyle"
              :error="fieldErrors.certExpiry"
              label="资质有效期"
              placeholder="请输入 YYYY-MM-DD（可选）"
              @blur="validateCertExpiry"
            />
            <AppField
              v-if="role === 'agency'"
              v-model="form.certScope"
              :custom-style="fieldStyle"
              label="资质范围"
              placeholder="请输入资质范围（可选）"
            />
          </view>
        </view>

        <view class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">安全设置</text>
          </view>

          <view class="register-section__stack">
            <AppField
              v-model="form.inviteCode"
              :custom-style="fieldStyle"
              label="推荐码"
              placeholder="请输入推荐码"
            />
            <AppField
              v-model="form.password"
              :custom-style="fieldStyle"
              :error="fieldErrors.password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              @blur="validatePassword"
            />
            <AppField
              v-model="form.confirmPassword"
              :custom-style="fieldStyle"
              :error="fieldErrors.confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              type="password"
              @blur="validateConfirmPassword"
            />
          </view>
        </view>
      </AppForm>

      <view class="register-form__agreement" @tap="toggleAgreement">
        <view class="register-form__checkbox" :class="{ 'register-form__checkbox--active': agreed }">
          <AppIcon v-if="agreed" color="#ffffff" name="success" size="12" />
        </view>
        <view class="register-form__agreement-copy">
          <text class="register-form__agreement-title">我已阅读并同意《注册协议》</text>
          <text v-if="fieldErrors.agreement" class="register-form__agreement-error">{{ fieldErrors.agreement }}</text>
        </view>
      </view>

      <AppButton
        block
        :loading="isSubmitting"
        custom-style="min-height: 84rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 20rpx;"
        :text="submitButtonText"
        type="info"
        @click="submitRegister"
      />
    </view>

    <AppPopup
      :show="showEnterpriseTypePicker"
      custom-style="padding: 20rpx 0 0; border-top-left-radius: 30rpx; border-top-right-radius: 30rpx;"
      position="bottom"
      round
      @close="closeEnterpriseTypePicker"
      @update:show="showEnterpriseTypePicker = $event"
    >
      <AppPicker
        :columns="enterpriseTypePickerOptions"
        :default-index="enterpriseTypePickerIndex"
        title="请选择主体类型"
        value-key="text"
        @cancel="closeEnterpriseTypePicker"
        @confirm="confirmEnterpriseType"
      />
    </AppPopup>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import logoUrl from '@/assets/logo.png'
import { authService, enterpriseService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppPicker from '@/components/ui/AppPicker/index.vue'
import AppPopup from '@/components/ui/AppPopup/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'

type RegisterRoleKey = 'individual' | 'enterprise' | 'agency'
type FeedbackTone = 'error' | 'success' | 'warning'

interface RegisterFormState {
  address: string
  authorizationLetter: string
  businessLicense: string
  certExpiry: string
  certFileUrl: string
  certNo: string
  certScope: string
  code: string
  companyName: string
  confirmPassword: string
  contactJob: string
  contactName: string
  contactPhone: string
  creditCode: string
  email: string
  enterpriseType: number | null
  introduction: string
  inviteCode: string
  organization: string
  password: string
  phone: string
  principalName: string
  principalPhone: string
  qualification: string
  region: string
  registeredCapital: string
  serviceRange: string
}

type FieldErrorKey = keyof RegisterFormState | 'agreement'

const role = ref<RegisterRoleKey>('individual')
const agreed = ref(false)
const isSendingCode = ref(false)
const isSubmitting = ref(false)
const isUploadingLicense = ref(false)
const isUploadingAuthorizationLetter = ref(false)
const isUploadingCertFile = ref(false)
const showEnterpriseTypePicker = ref(false)
const countdown = ref(0)
const userStore = useUserStore()
const fieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const codeFieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const feedback = reactive<{ message: string; tone: FeedbackTone }>({
  message: '',
  tone: 'warning',
})
const form = reactive<RegisterFormState>({
  address: '',
  authorizationLetter: '',
  businessLicense: '',
  certExpiry: '',
  certFileUrl: '',
  certNo: '',
  certScope: '',
  code: '',
  companyName: '',
  confirmPassword: '',
  contactJob: '',
  contactName: '',
  contactPhone: '',
  creditCode: '',
  email: '',
  enterpriseType: null,
  introduction: '',
  inviteCode: '',
  organization: '',
  password: '',
  phone: '',
  principalName: '',
  principalPhone: '',
  qualification: '',
  region: '',
  registeredCapital: '',
  serviceRange: '',
})
const fieldErrors = reactive<Record<FieldErrorKey, string>>({
  address: '',
  agreement: '',
  authorizationLetter: '',
  businessLicense: '',
  certExpiry: '',
  certFileUrl: '',
  certNo: '',
  certScope: '',
  code: '',
  companyName: '',
  confirmPassword: '',
  contactJob: '',
  contactName: '',
  contactPhone: '',
  creditCode: '',
  email: '',
  enterpriseType: '',
  introduction: '',
  inviteCode: '',
  organization: '',
  password: '',
  phone: '',
  principalName: '',
  principalPhone: '',
  qualification: '',
  region: '',
  registeredCapital: '',
  serviceRange: '',
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

const enterpriseTypeOptions = [
  { label: '需求发布方', value: 1 },
  { label: '服务提供方', value: 2 },
] as const
const enterpriseTypePickerOptions = enterpriseTypeOptions.map((item) => ({
  text: item.label,
  value: item.value,
}))
const enterpriseTypePickerIndex = computed(() => {
  const index = enterpriseTypePickerOptions.findIndex((item) => item.value === form.enterpriseType)
  return index >= 0 ? index : 0
})
const enterpriseTypeLabel = computed(() => {
  const matched = enterpriseTypeOptions.find((item) => item.value === form.enterpriseType)
  return matched?.label ?? ''
})

const roleMeta = computed(() => {
  const map: Record<RegisterRoleKey, { title: string }> = {
    agency: {
      title: '服务机构注册',
    },
    enterprise: {
      title: '企业用户注册',
    },
    individual: {
      title: '个人用户注册',
    },
  }

  return map[role.value]
})

const showCompany = computed(() => role.value === 'enterprise' || role.value === 'agency')
const codeButtonDisabled = computed(() => isSendingCode.value || countdown.value > 0)
const codeButtonText = computed(() => {
  if (isSendingCode.value) {
    return '发送中...'
  }

  if (countdown.value > 0) {
    return `${countdown.value}s 后重试`
  }

  return '发送验证码'
})
const submitButtonText = computed(() => {
  if (!isSubmitting.value) {
    return '立即注册'
  }

  return showCompany.value ? '正在提交注册与入驻...' : '正在创建账号...'
})

onLoad((query) => {
  const nextRole = query?.role as RegisterRoleKey | undefined

  if (nextRole === 'individual' || nextRole === 'enterprise' || nextRole === 'agency') {
    role.value = nextRole
  }

  if (role.value === 'agency') {
    form.enterpriseType = 2
  } else if (role.value === 'enterprise') {
    form.enterpriseType = 1
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

function setFieldError(key: FieldErrorKey, message: string) {
  fieldErrors[key] = message
  return !message
}

function validatePhone() {
  const value = form.phone.trim()

  if (!value) {
    return setFieldError('phone', '请输入手机号')
  }

  if (!isPhoneNumber(value)) {
    return setFieldError('phone', '请输入正确的 11 位手机号')
  }

  return setFieldError('phone', '')
}

function validateCode() {
  const value = form.code.trim()

  if (!value) {
    return setFieldError('code', '请输入验证码')
  }

  if (!/^\d{4,6}$/.test(value)) {
    return setFieldError('code', '验证码通常为 4 至 6 位数字')
  }

  return setFieldError('code', '')
}

function validatePassword() {
  if (!form.password) {
    return setFieldError('password', '请输入密码')
  }

  if (form.password.length < 8) {
    return setFieldError('password', '密码长度不能少于 8 位')
  }

  return setFieldError('password', '')
}

function validateConfirmPassword() {
  if (!form.confirmPassword) {
    return setFieldError('confirmPassword', '请再次输入密码')
  }

  if (form.password !== form.confirmPassword) {
    return setFieldError('confirmPassword', '两次密码输入不一致')
  }

  return setFieldError('confirmPassword', '')
}

function validateBusinessLicense() {
  if (!showCompany.value) {
    return setFieldError('businessLicense', '')
  }

  return setFieldError('businessLicense', '')
}

function validateCompanyName() {
  if (!showCompany.value) {
    return setFieldError('companyName', '')
  }

  if (!form.companyName.trim()) {
    return setFieldError('companyName', '请输入主体名称')
  }

  return setFieldError('companyName', '')
}

function validateCreditCode() {
  if (!showCompany.value) {
    return setFieldError('creditCode', '')
  }

  return setFieldError('creditCode', '')
}

function validateEnterpriseType() {
  if (!showCompany.value) {
    return setFieldError('enterpriseType', '')
  }

  if (!form.enterpriseType) {
    return setFieldError('enterpriseType', '请选择主体类型')
  }

  return setFieldError('enterpriseType', '')
}

function validateRegion() {
  if (!showCompany.value) {
    return setFieldError('region', '')
  }

  return setFieldError('region', '')
}

function validateAddress() {
  if (!showCompany.value) {
    return setFieldError('address', '')
  }

  return setFieldError('address', '')
}

function validatePrincipalName() {
  if (!showCompany.value) {
    return setFieldError('principalName', '')
  }

  if (!form.principalName.trim()) {
    return setFieldError('principalName', '请输入负责人姓名')
  }

  return setFieldError('principalName', '')
}

function validatePrincipalPhone() {
  if (!showCompany.value) {
    return setFieldError('principalPhone', '')
  }

  const value = form.principalPhone.trim()

  if (value && !isPhoneNumber(value)) {
    return setFieldError('principalPhone', '请输入正确的负责人手机号')
  }

  return setFieldError('principalPhone', '')
}

function validateCertExpiry() {
  const value = form.certExpiry.trim()

  if (!value) {
    return setFieldError('certExpiry', '')
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return setFieldError('certExpiry', '请输入 YYYY-MM-DD 格式')
  }

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return setFieldError('certExpiry', '请输入有效日期')
  }

  return setFieldError('certExpiry', '')
}

function validateContactName() {
  if (!showCompany.value) {
    return setFieldError('contactName', '')
  }

  if (!form.contactName.trim()) {
    return setFieldError('contactName', '请输入对接人姓名')
  }

  return setFieldError('contactName', '')
}

function validateContactPhone() {
  if (!showCompany.value) {
    return setFieldError('contactPhone', '')
  }

  if (!form.contactPhone.trim()) {
    return setFieldError('contactPhone', '请输入对接人手机')
  }

  if (!isPhoneNumber(form.contactPhone)) {
    return setFieldError('contactPhone', '请输入正确的对接人手机号')
  }

  return setFieldError('contactPhone', '')
}

function validateAgreement() {
  if (!agreed.value) {
    return setFieldError('agreement', '请先勾选并同意注册协议')
  }

  return setFieldError('agreement', '')
}

function validateForm() {
  const validators = [
    validatePhone(),
    validateCode(),
    validatePassword(),
    validateConfirmPassword(),
    validateAgreement(),
  ]

  if (showCompany.value) {
    validators.push(
      validateEnterpriseType(),
      validateCompanyName(),
      validatePrincipalName(),
      validateContactName(),
      validateContactPhone(),
      validatePrincipalPhone(),
      validateCertExpiry(),
    )
  }

  return validators.every(Boolean)
}

function toggleAgreement() {
  agreed.value = !agreed.value

  if (agreed.value) {
    fieldErrors.agreement = ''
  }
}

function selectEnterpriseType(value: number) {
  form.enterpriseType = value
  fieldErrors.enterpriseType = ''
}

function openEnterpriseTypePicker() {
  showEnterpriseTypePicker.value = true
}

function closeEnterpriseTypePicker() {
  showEnterpriseTypePicker.value = false
}

function resolveEnterpriseTypeOptionFromPicker(payload: any) {
  const detail = payload?.detail ?? payload

  if (detail?.value && typeof detail.value === 'object' && !Array.isArray(detail.value)) {
    return detail.value
  }

  if (Array.isArray(detail?.value) && detail.value.length > 0) {
    return detail.value[0]
  }

  if (typeof detail?.index === 'number') {
    return enterpriseTypePickerOptions[detail.index]
  }

  if (Array.isArray(detail?.index) && typeof detail.index[0] === 'number') {
    return enterpriseTypePickerOptions[detail.index[0]]
  }

  return null
}

function confirmEnterpriseType(payload: any) {
  const option = resolveEnterpriseTypeOptionFromPicker(payload)

  if (option && typeof option.value === 'number') {
    selectEnterpriseType(option.value)
  }

  closeEnterpriseTypePicker()
}

function buildRegisterNickname() {
  const phoneSuffix = form.phone.trim().slice(-4)

  if (showCompany.value) {
    return form.contactName.trim()
      || form.principalName.trim()
      || form.companyName.trim()
      || `${role.value === 'agency' ? '机构用户' : '企业用户'}${phoneSuffix}`
  }

  return form.organization.trim() || `个人用户${phoneSuffix}`
}

async function ensureEnterpriseRegisterSession(
  session: Awaited<ReturnType<typeof authService.registerAccount>>,
) {
  const nextSession = session.token
    ? session
    : await authService.loginByPassword({
      account: form.phone.trim(),
      password: form.password,
    })

  if (!nextSession.token) {
    throw new Error('账号已创建，但未获取到登录凭证，请前往登录后补全主体信息')
  }

  userStore.setSession({
    avatar: nextSession.avatar,
    company: nextSession.company,
    enterpriseId: nextSession.enterpriseId,
    nickname: nextSession.nickname ?? buildRegisterNickname(),
    refreshToken: nextSession.refreshToken,
    token: nextSession.token,
    userType: nextSession.userType,
  })
}

function resolveFileName(filePath: string) {
  const segments = filePath.split('/')
  return segments[segments.length - 1] || 'file'
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

async function chooseAnyFile() {
  const uniLike = uni as any

  if (typeof uniLike.chooseMessageFile === 'function') {
    return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
      uniLike.chooseMessageFile({
        count: 1,
        fail: () => {
          reject(new Error('已取消选择文件'))
        },
        success: (result: any) => {
          const file = Array.isArray(result?.tempFiles) ? result.tempFiles[0] : null
          const filePath = file?.path || file?.tempFilePath
          const fileName = file?.name || (filePath ? resolveFileName(filePath) : '')

          if (!filePath) {
            reject(new Error('未获取到可上传的文件'))
            return
          }

          resolve({
            fileName: String(fileName || 'file'),
            filePath: String(filePath),
          })
        },
        type: 'file',
      })
    })
  }

  return chooseImageFile()
}

async function uploadBusinessLicense() {
  clearFeedback()
  isUploadingLicense.value = true

  try {
    const selected = await chooseImageFile()
    const result = await enterpriseService.uploadLicense(selected.filePath)
    const objectName = result.objectName || result.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    form.businessLicense = objectName
    fieldErrors.businessLicense = ''
    setFeedback('营业执照上传成功。', 'success')
    showSuccessToast('营业执照上传成功')
  } catch (error) {
    const message = getErrorMessage(error, '营业执照上传失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isUploadingLicense.value = false
  }
}

async function uploadAuthorizationLetter() {
  clearFeedback()
  isUploadingAuthorizationLetter.value = true

  try {
    const selected = await chooseAnyFile()
    const result = await enterpriseService.uploadCert(selected.filePath)
    const objectName = result.objectName || result.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    form.authorizationLetter = objectName
    setFeedback(`授权委托书上传成功：${selected.fileName}`, 'success')
    showSuccessToast('授权委托书上传成功')
  } catch (error) {
    const message = getErrorMessage(error, '授权委托书上传失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isUploadingAuthorizationLetter.value = false
  }
}

async function uploadCertFile() {
  clearFeedback()
  isUploadingCertFile.value = true

  try {
    const selected = await chooseAnyFile()
    const result = await enterpriseService.uploadCert(selected.filePath)
    const objectName = result.objectName || result.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    form.certFileUrl = objectName
    setFeedback(`检测资质上传成功：${selected.fileName}`, 'success')
    showSuccessToast('检测资质上传成功')
  } catch (error) {
    const message = getErrorMessage(error, '检测资质上传失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isUploadingCertFile.value = false
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
      phone: form.phone.trim(),
      scene: 'REGISTER',
    })
    startCountdown()
    setFeedback('验证码已发送，请使用短信中的验证码继续完成注册。', 'success')
    showSuccessToast('验证码已发送')
  } catch (error) {
    const message = getErrorMessage(error, '验证码发送失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isSendingCode.value = false
  }
}

function toOptionalText(value: string) {
  const next = value.trim()
  return next || undefined
}

async function submitRegister() {
  clearFeedback()

  if (!validateForm()) {
    setFeedback('请先完善并修正页面中的必填信息。', 'warning')
    return
  }

  isSubmitting.value = true

  try {
    const registerSession = await authService.registerAccount({
      nickname: buildRegisterNickname(),
      password: form.password,
      phone: form.phone.trim(),
      smsCode: form.code.trim(),
    })

    if (showCompany.value) {
      try {
        await ensureEnterpriseRegisterSession(registerSession)
        await enterpriseService.register({
          address: toOptionalText(form.address),
          authorizationLetter: toOptionalText(form.authorizationLetter),
          businessLicense: toOptionalText(form.businessLicense),
          certExpiry: toOptionalText(form.certExpiry),
          certFileUrl: toOptionalText(form.certFileUrl),
          certNo: toOptionalText(form.certNo),
          certScope: toOptionalText(form.certScope),
          contactName: form.contactName.trim(),
          contactPhone: form.contactPhone.trim(),
          email: toOptionalText(form.email),
          enterpriseName: form.companyName.trim(),
          enterpriseType: Number(form.enterpriseType),
          introduction: toOptionalText(form.introduction),
          legalPerson: form.principalName.trim(),
          qualification: toOptionalText(form.qualification),
          region: toOptionalText(form.region),
          registeredCapital: toOptionalText(form.registeredCapital),
          serviceRange: toOptionalText(form.serviceRange),
          unifiedCreditCode: toOptionalText(form.creditCode),
        })
      } catch (error) {
        const message = getErrorMessage(error, '主体入驻提交失败，请稍后重试')
        setFeedback(`账号已创建，但主体入驻未完成：${message}`, 'error')
        showFailToast('账号已创建，但主体入驻未完成')
        return
      }
    }

    setFeedback('注册成功，正在返回登录页。', 'success')
    showSuccessToast('注册成功')
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/auth/login?phone=${encodeURIComponent(form.phone.trim())}` })
    }, 320)
  } catch (error) {
    const message = getErrorMessage(error, '注册失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page-register-form {
  min-height: 100vh;
  padding: 24rpx 24rpx 40rpx;
  background:
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.84), transparent 28%),
    linear-gradient(180deg, #e6f0ff 0%, #f8fbff 260rpx, #f8fafc 100%);
  box-sizing: border-box;
}

.register-card {
  padding: 24rpx;
  border: 1rpx solid rgba(191, 219, 254, 0.86);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18rpx 44rpx rgba(37, 99, 235, 0.12);
}

.register-card__hero {
  margin-bottom: 24rpx;
  text-align: center;
}

.register-card__hero-logo {
  display: block;
  width: 184rpx;
  height: 108rpx;
  margin: 0 auto 16rpx;
}

.register-card__hero-eyebrow {
  display: block;
  color: $primary-dark;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.register-card__hero-title {
  display: block;
  margin-top: 10rpx;
  color: $slate-900;
  font-size: 36rpx;
  font-weight: 700;
}

.register-card__hero-desc {
  display: block;
  margin-top: 10rpx;
  color: $slate-500;
  font-size: 24rpx;
  line-height: 1.6;
}

.register-card__hero-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10rpx;
  margin-top: 18rpx;
}

.register-card__hero-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  color: $primary-dark;
  font-size: 20rpx;
  background: #eff6ff;
}

.register-feedback {
  margin-bottom: 18rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid transparent;
  border-radius: 16rpx;
}

.register-feedback--success {
  background: $auth-success-bg;
  border-color: #a7f3d0;
}

.register-feedback--warning {
  background: $auth-warning-bg;
  border-color: #fde68a;
}

.register-feedback--error {
  background: $auth-error-bg;
  border-color: #fecdd3;
}

.register-feedback__text {
  color: $slate-700;
  font-size: 24rpx;
  line-height: 1.5;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.register-section + .register-section {
  margin-top: 16rpx;
}

.register-section {
  padding: 20rpx;
  border: 1rpx solid rgba(226, 232, 240, 0.9);
  border-radius: 22rpx;
  background: #ffffff;
}

.register-section__head {
  margin-bottom: 14rpx;
}

.register-section__title {
  display: block;
  color: $slate-900;
  font-size: 30rpx;
  font-weight: 700;
}

.register-section__desc {
  display: block;
  margin-top: 8rpx;
  color: $slate-500;
  font-size: 22rpx;
  line-height: 1.6;
}

.register-section__stack {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.register-form__code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12rpx;
  align-items: start;
}

.register-form__code :deep(.app-field__control) {
  min-height: 76rpx;
}

.register-form__code-action {
  margin-top: 34rpx;
}

.register-ocr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12rpx;
  align-items: start;
}

.register-ocr :deep(.app-field__control) {
  min-height: 76rpx;
}

.register-ocr__actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 34rpx;
}

.register-type :deep(.app-field__control) {
  cursor: pointer;
}

.register-form__agreement {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-top: 20rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid rgba(226, 232, 240, 0.9);
  border-radius: 16rpx;
  background: #ffffff;
}

.register-form__checkbox {
  width: 34rpx;
  height: 34rpx;
  margin-top: 4rpx;
  border: 1rpx solid #cbd5e1;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.register-form__checkbox--active {
  background: #1E61FF;
  border-color: #1E61FF;
}

.register-form__agreement-copy {
  flex: 1;
  min-width: 0;
}

.register-form__agreement-title {
  display: block;
  color: $slate-600;
  font-size: 24rpx;
  line-height: 1.5;
}

.register-form__agreement-error {
  display: block;
  margin-top: 6rpx;
  color: $auth-error;
  font-size: 20rpx;
  line-height: 1.45;
}
</style>
