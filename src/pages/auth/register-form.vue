<template>
  <view class="page-register-form">
    <view class="register-card">
      <view class="register-card__hero">
        <image :src="logoUrl" class="register-card__hero-logo" mode="aspectFit" />
        <text class="register-card__hero-eyebrow">统一注册流程</text>
        <text class="register-card__hero-title">{{ roleMeta.title }}</text>
        <text class="register-card__hero-desc">{{ roleMeta.desc }}</text>

        <view class="register-card__hero-tags">
          <text class="register-card__hero-tag">{{ roleMeta.tag }}</text>
          <text class="register-card__hero-tag">移动端优先</text>
          <text v-if="showCompany" class="register-card__hero-tag">主体资料入驻</text>
        </view>
      </view>

      <view v-if="feedback.message" class="register-feedback" :class="`register-feedback--${feedback.tone}`">
        <text class="register-feedback__text">{{ feedback.message }}</text>
      </view>

      <AppForm class="register-form">
        <view class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">账号信息</text>
            <text class="register-section__desc">用于接收验证码并建立统一账号。</text>
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
                  custom-style="min-height: 76rpx; padding: 0 22rpx; border-radius: 16rpx; font-size: 24rpx;"
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
            <text class="register-section__desc">用于企业或机构入驻申请，提交后会进入主体审核流程。</text>
          </view>

          <view class="register-section__stack">
            <AppField
              v-model="form.businessLicense"
              :custom-style="fieldStyle"
              :error="fieldErrors.businessLicense"
              label="营业执照地址"
              placeholder="请输入营业执照 URL"
              @blur="validateBusinessLicense"
            />

            <view class="register-inline">
              <text class="register-inline__hint">可选辅助：自动识别并尝试回填企业资料。</text>
              <AppButton
                :disabled="!form.businessLicense.trim()"
                :loading="isOcrLoading"
                custom-style="min-height: 60rpx; padding: 0 18rpx; border-radius: 14rpx; font-size: 22rpx;"
                plain
                text="营业执照识别"
                type="info"
                @click="runBusinessLicenseOcr"
              />
            </view>

            <view class="register-type">
              <text class="register-type__label">主体类型</text>
              <view class="register-type__grid">
                <view
                  v-for="option in enterpriseTypeOptions"
                  :key="option.value"
                  class="register-type__item"
                  :class="{ 'register-type__item--active': form.enterpriseType === option.value }"
                  @tap="selectEnterpriseType(option.value)"
                >
                  <text class="register-type__name">{{ option.label }}</text>
                  <text class="register-type__desc">{{ option.desc }}</text>
                </view>
              </view>
              <text v-if="fieldErrors.enterpriseType" class="register-type__error">{{ fieldErrors.enterpriseType }}</text>
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
              v-if="role === 'enterprise'"
              v-model="form.standardCount"
              :custom-style="fieldStyle"
              input-mode="numeric"
              label="标准数量"
              placeholder="请输入企业标准数量"
              type="number"
            />
          </view>
        </view>

        <view v-if="showCompany" class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">联系信息</text>
            <text class="register-section__desc">用于平台联系负责人和业务对接人。</text>
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

        <view class="register-section">
          <view class="register-section__head">
            <text class="register-section__title">安全设置</text>
            <text class="register-section__desc">建议使用便于记忆且不低于 6 位的登录密码。</text>
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
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'

type RegisterRoleKey = 'individual' | 'enterprise' | 'agency'
type FeedbackTone = 'error' | 'success' | 'warning'

interface RegisterFormState {
  address: string
  businessLicense: string
  code: string
  companyName: string
  confirmPassword: string
  contactJob: string
  contactName: string
  contactPhone: string
  creditCode: string
  enterpriseType: number | null
  inviteCode: string
  organization: string
  password: string
  phone: string
  principalName: string
  principalPhone: string
  region: string
  standardCount: string
}

type FieldErrorKey = keyof RegisterFormState | 'agreement'

const role = ref<RegisterRoleKey>('individual')
const agreed = ref(false)
const isSendingCode = ref(false)
const isSubmitting = ref(false)
const isOcrLoading = ref(false)
const countdown = ref(0)
const fieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const codeFieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const feedback = reactive<{ message: string; tone: FeedbackTone }>({
  message: '',
  tone: 'warning',
})
const form = reactive<RegisterFormState>({
  address: '',
  businessLicense: '',
  code: '',
  companyName: '',
  confirmPassword: '',
  contactJob: '',
  contactName: '',
  contactPhone: '',
  creditCode: '',
  enterpriseType: null,
  inviteCode: '',
  organization: '',
  password: '',
  phone: '',
  principalName: '',
  principalPhone: '',
  region: '',
  standardCount: '',
})
const fieldErrors = reactive<Record<FieldErrorKey, string>>({
  address: '',
  agreement: '',
  businessLicense: '',
  code: '',
  companyName: '',
  confirmPassword: '',
  contactJob: '',
  contactName: '',
  contactPhone: '',
  creditCode: '',
  enterpriseType: '',
  inviteCode: '',
  organization: '',
  password: '',
  phone: '',
  principalName: '',
  principalPhone: '',
  region: '',
  standardCount: '',
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

const enterpriseTypeOptions = [
  { desc: '生产制造与委托检测业务主体', label: '制造企业', value: 1 },
  { desc: '检测、认证、咨询等服务供给方', label: '服务机构', value: 2 },
  { desc: '科研院所、高校与创新平台', label: '科研平台', value: 3 },
  { desc: '无法归入以上类型的主体', label: '其他主体', value: 4 },
] as const

const roleMeta = computed(() => {
  const map: Record<RegisterRoleKey, { desc: string; tag: string; title: string }> = {
    agency: {
      desc: '用于服务机构入驻、资质提交与业务承接，当前首版与企业入驻共用一套提交流程。',
      tag: '机构入驻',
      title: '服务机构注册',
    },
    enterprise: {
      desc: '用于企业认证、会员权益、标准服务与委托管理，提交后可继续补充企业资料。',
      tag: '主体入驻',
      title: '企业用户注册',
    },
    individual: {
      desc: '用于个人下单、查看报告与咨询服务，优先保留轻量而完整的注册流程。',
      tag: '轻量注册',
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

  if (form.password.length < 6) {
    return setFieldError('password', '密码长度不能少于 6 位')
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

  if (!form.businessLicense.trim()) {
    return setFieldError('businessLicense', '请输入营业执照图片地址')
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

  if (!form.creditCode.trim()) {
    return setFieldError('creditCode', '请输入统一社会信用代码')
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

  if (!form.region.trim()) {
    return setFieldError('region', '请输入所属地区')
  }

  return setFieldError('region', '')
}

function validateAddress() {
  if (!showCompany.value) {
    return setFieldError('address', '')
  }

  if (!form.address.trim()) {
    return setFieldError('address', '请输入详细地址')
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

  if (!form.principalPhone.trim()) {
    return setFieldError('principalPhone', '请输入负责人手机')
  }

  if (!isPhoneNumber(form.principalPhone)) {
    return setFieldError('principalPhone', '请输入正确的负责人手机号')
  }

  return setFieldError('principalPhone', '')
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
      validateBusinessLicense(),
      validateEnterpriseType(),
      validateCompanyName(),
      validateCreditCode(),
      validateRegion(),
      validateAddress(),
      validatePrincipalName(),
      validatePrincipalPhone(),
      validateContactName(),
      validateContactPhone(),
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

function extractOcrValue(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return ''
  }

  const target = source as Record<string, any>

  for (const key of keys) {
    const value = target[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function applyBusinessLicenseOcrResult(result: unknown) {
  const companyName = extractOcrValue(result, ['enterpriseName', 'companyName', 'name'])
  const creditCode = extractOcrValue(result, ['unifiedCreditCode', 'creditCode', 'registrationNo'])
  const address = extractOcrValue(result, ['address'])
  const region = extractOcrValue(result, ['region', 'area'])
  const legalPerson = extractOcrValue(result, ['legalPerson', 'ownerName'])

  if (companyName && !form.companyName.trim()) {
    form.companyName = companyName
    fieldErrors.companyName = ''
  }

  if (creditCode && !form.creditCode.trim()) {
    form.creditCode = creditCode
    fieldErrors.creditCode = ''
  }

  if (address && !form.address.trim()) {
    form.address = address
    fieldErrors.address = ''
  }

  if (region && !form.region.trim()) {
    form.region = region
    fieldErrors.region = ''
  }

  if (legalPerson && !form.principalName.trim()) {
    form.principalName = legalPerson
    fieldErrors.principalName = ''
  }

  return Boolean(companyName || creditCode || address || region || legalPerson)
}

async function runBusinessLicenseOcr() {
  clearFeedback()

  if (!validateBusinessLicense()) {
    setFeedback(fieldErrors.businessLicense, 'warning')
    return
  }

  isOcrLoading.value = true

  try {
    const result = await enterpriseService.ocrBusinessLicense(form.businessLicense.trim())
    const applied = applyBusinessLicenseOcrResult(result)

    if (applied) {
      setFeedback('已根据营业执照识别结果回填可用字段，请继续检查后提交。', 'success')
      showSuccessToast('已完成回填')
      return
    }

    setFeedback('识别已返回，但没有匹配到可自动回填的字段，请手工确认资料。', 'warning')
  } catch (error) {
    const message = getErrorMessage(error, '营业执照识别失败，请稍后重试')
    setFeedback(message, 'error')
    showFailToast(message)
  } finally {
    isOcrLoading.value = false
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

async function submitRegister() {
  clearFeedback()

  if (!validateForm()) {
    setFeedback('请先完善并修正页面中的必填信息。', 'warning')
    return
  }

  isSubmitting.value = true

  try {
    await authService.registerAccount({
      nickname: buildRegisterNickname(),
      password: form.password,
      phone: form.phone.trim(),
      smsCode: form.code.trim(),
    })

    if (showCompany.value) {
      try {
        await enterpriseService.register({
          address: form.address.trim(),
          businessLicense: form.businessLicense.trim(),
          contactName: form.contactName.trim(),
          contactPhone: form.contactPhone.trim(),
          enterpriseName: form.companyName.trim(),
          enterpriseType: Number(form.enterpriseType),
          legalPerson: form.principalName.trim(),
          region: form.region.trim(),
          unifiedCreditCode: form.creditCode.trim(),
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
  gap: 14rpx;
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

.register-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 14rpx 16rpx;
  border: 1rpx solid rgba(226, 232, 240, 0.9);
  border-radius: 16rpx;
  background: #ffffff;
}

.register-inline__hint {
  flex: 1;
  min-width: 0;
  color: $slate-600;
  font-size: 22rpx;
  line-height: 1.5;
}

.register-type__label {
  display: block;
  margin-bottom: 12rpx;
  color: $slate-800;
  font-size: 26rpx;
  font-weight: 600;
}

.register-type__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.register-type__item {
  padding: 16rpx;
  border: 1rpx solid #dbeafe;
  border-radius: 16rpx;
  background: #ffffff;
}

.register-type__item--active {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: inset 0 0 0 1rpx rgba(37, 99, 235, 0.12), 0 6rpx 16rpx rgba(37, 99, 235, 0.06);
}

.register-type__name {
  display: block;
  color: $slate-900;
  font-size: 26rpx;
  font-weight: 600;
}

.register-type__desc {
  display: block;
  margin-top: 8rpx;
  color: $slate-500;
  font-size: 21rpx;
  line-height: 1.5;
}

.register-type__error {
  display: block;
  margin-top: 10rpx;
  color: $auth-error;
  font-size: 20rpx;
  line-height: 1.45;
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
  background: #2563eb;
  border-color: #2563eb;
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
