<template>
  <view class="page-profile-enterprise">
    <scroll-view class="page-profile-enterprise__scroll" scroll-y>
      <view class="page-profile-enterprise__content">
        <view v-if="hasEnterpriseProfile" class="enterprise-hero">
          <view class="enterprise-hero__head">
            <view>
              <text class="enterprise-hero__name">{{ enterpriseName }}</text>
              <text class="enterprise-hero__code">统一社会信用代码：{{ creditCodeText }}</text>
              <text v-if="profile.rejectReason" class="enterprise-hero__reject">驳回原因：{{ profile.rejectReason }}</text>
            </view>
            <text class="enterprise-hero__status">{{ enterpriseStatus }}</text>
          </view>

          <view class="enterprise-hero__stats">
            <view class="enterprise-hero__stat">
              <text class="enterprise-hero__stat-value">{{ contacts.length }}</text>
              <text class="enterprise-hero__stat-label">常用联系人</text>
            </view>
            <view class="enterprise-hero__stat">
              <text class="enterprise-hero__stat-value">{{ invoices.length }}</text>
              <text class="enterprise-hero__stat-label">开票资料</text>
            </view>
            <view class="enterprise-hero__stat">
              <text class="enterprise-hero__stat-value">{{ addresses.length }}</text>
              <text class="enterprise-hero__stat-label">收样地址</text>
            </view>
          </view>
        </view>

        <view v-else class="enterprise-hero enterprise-hero--empty">
          <text class="enterprise-hero__empty-title">当前账号未完成企业认证</text>
          <text class="enterprise-hero__empty-desc">{{ enterpriseAuthDesc }}</text>
        </view>

        <view class="enterprise-card">
          <view class="enterprise-row" @tap="goEnterpriseAuth">
            <view>
              <text class="enterprise-row__title">企业认证</text>
              <text class="enterprise-row__desc">{{ enterpriseAuthDesc }}</text>
            </view>
            <text class="enterprise-row__value enterprise-row__value--primary">{{ enterpriseStatus }} ›</text>
          </view>

          <view class="enterprise-row" @tap="goContacts">
            <view>
              <text class="enterprise-row__title">联系人管理</text>
              <text class="enterprise-row__desc">维护委托联系人、报告接收人、电话信息</text>
            </view>
            <text class="enterprise-row__value">{{ contacts.length }} 个 ›</text>
          </view>

          <view class="enterprise-row" @tap="goInvoices">
            <view>
              <text class="enterprise-row__title">开票资料</text>
              <text class="enterprise-row__desc">发票抬头、税号、开户地址、银行账号</text>
            </view>
            <text class="enterprise-row__value">{{ invoices.length > 0 ? '已配置' : '未配置' }} ›</text>
          </view>

          <view class="enterprise-row" @tap="goAddresses">
            <view>
              <text class="enterprise-row__title">收样地址管理</text>
              <text class="enterprise-row__desc">维护默认收样地址、寄回地址、现场收样地点</text>
            </view>
            <text class="enterprise-row__value">{{ addresses.length }} 个 ›</text>
          </view>
        </view>

        <view class="enterprise-card">
          <text class="enterprise-card__title">最近使用</text>
          <view class="enterprise-row enterprise-row--plain" @tap="goContacts">
            <view>
              <text class="enterprise-row__title">默认联系人</text>
              <text class="enterprise-row__desc">{{ recentContactText }}</text>
            </view>
            <text class="enterprise-row__value">›</text>
          </view>
          <view class="enterprise-row enterprise-row--plain" @tap="goAddresses">
            <view>
              <text class="enterprise-row__title">默认收样地址</text>
              <text class="enterprise-row__desc">{{ recentAddressText }}</text>
            </view>
            <text class="enterprise-row__value">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppPopup
      :show="showAuthPopup"
      custom-style="padding: 20rpx 0 0; border-top-left-radius: 30rpx; border-top-right-radius: 30rpx;"
      position="bottom"
      round
      @close="closeAuthPopup"
      @update:show="showAuthPopup = $event"
    >
      <view class="auth-popup">
        <view class="auth-popup__head">
          <text class="auth-popup__title">企业认证申请</text>
          <text class="auth-popup__close" @tap="closeAuthPopup">关闭</text>
        </view>

        <scroll-view class="auth-popup__scroll" scroll-y>
          <AppForm class="auth-popup__form">
            <view class="auth-popup__section">
              <view class="auth-upload">
                <view class="auth-upload__field">
                  <AppField
                    v-model="authForm.businessLicense"
                    :custom-style="authFieldStyle"
                    :error="authErrors.businessLicense"
                    label="营业执照"
                    placeholder="请输入营业执照 URL（可手动输入或上传）"
                  />
                </view>
                <AppButton
                  :loading="isUploadingLicense"
                  custom-style="min-height: 64rpx; min-width: 172rpx; margin-top: 36rpx;"
                  plain
                  text="上传执照"
                  type="info"
                  @click="uploadBusinessLicense"
                />
              </view>

              <view class="auth-type" @tap="openEnterpriseTypePicker">
                <AppField
                  :model-value="enterpriseTypeLabel"
                  :custom-style="authFieldStyle"
                  :error="authErrors.enterpriseType"
                  label="企业类型"
                  placeholder="请选择企业类型"
                  readonly
                />
              </view>

              <AppField
                v-model="authForm.enterpriseName"
                :custom-style="authFieldStyle"
                :error="authErrors.enterpriseName"
                label="企业名称"
                placeholder="请输入企业名称"
              />
              <AppField
                v-model="authForm.unifiedCreditCode"
                :custom-style="authFieldStyle"
                label="统一社会信用代码"
                placeholder="请输入统一社会信用代码"
              />
              <AppField
                v-model="authForm.legalPerson"
                :custom-style="authFieldStyle"
                :error="authErrors.legalPerson"
                label="法人姓名"
                placeholder="请输入法人姓名"
              />
              <AppField
                v-model="authForm.contactName"
                :custom-style="authFieldStyle"
                :error="authErrors.contactName"
                label="联系人姓名"
                placeholder="请输入联系人姓名"
              />
              <AppField
                v-model="authForm.contactPhone"
                :custom-style="authFieldStyle"
                :error="authErrors.contactPhone"
                input-mode="numeric"
                label="联系人手机号"
                placeholder="请输入11位手机号"
                type="number"
              />
              <AppField
                v-model="authForm.region"
                :custom-style="authFieldStyle"
                label="所在地区"
                placeholder="例如：湖南省株洲市"
              />
              <AppField
                v-model="authForm.address"
                :custom-style="authFieldStyle"
                label="详细地址"
                placeholder="请输入详细地址"
              />
              <AppField
                v-model="authForm.serviceRange"
                :custom-style="authFieldStyle"
                label="服务范围"
                placeholder="例如：检测、认证、计量"
              />
              <AppField
                v-model="authForm.qualification"
                :custom-style="authFieldStyle"
                label="资质描述"
                placeholder="例如：CMA/CNAS认证机构"
              />
              <AppField
                v-model="authForm.introduction"
                :custom-style="authFieldStyle"
                label="企业简介"
                placeholder="请输入企业简介"
              />
              <AppField
                v-model="authForm.registeredCapital"
                :custom-style="authFieldStyle"
                label="注册资本"
                placeholder="例如：500万元人民币"
              />
              <AppField
                v-model="authForm.email"
                :custom-style="authFieldStyle"
                label="企业邮箱"
                placeholder="请输入企业邮箱（可选）"
              />
            </view>

            <view class="auth-popup__section">
              <view class="auth-upload">
                <view class="auth-upload__field">
                  <AppField
                    v-model="authForm.authorizationLetter"
                    :custom-style="authFieldStyle"
                    label="授权委托书"
                    placeholder="可选，上传后自动填充"
                    readonly
                  />
                </view>
                <AppButton
                  :loading="isUploadingAuthorizationLetter"
                  custom-style="min-height: 64rpx; min-width: 172rpx; margin-top: 36rpx;"
                  plain
                  text="上传委托书"
                  type="info"
                  @click="uploadAuthorizationLetter"
                />
              </view>

              <template v-if="needsProviderFields">
                <view class="auth-upload">
                  <view class="auth-upload__field">
                    <AppField
                      v-model="authForm.certFileUrl"
                      :custom-style="authFieldStyle"
                      label="资质文件"
                      placeholder="服务提供方请上传资质文件"
                      readonly
                    />
                  </view>
                  <AppButton
                    :loading="isUploadingCertFile"
                    custom-style="min-height: 64rpx; min-width: 172rpx; margin-top: 36rpx;"
                    plain
                    text="上传资质"
                    type="info"
                    @click="uploadCertFile"
                  />
                </view>

                <AppField
                  v-model="authForm.certNo"
                  :custom-style="authFieldStyle"
                  label="资质证书编号"
                  placeholder="请输入资质证书编号（可选）"
                />
                <AppField
                  v-model="authForm.certExpiry"
                  :custom-style="authFieldStyle"
                  :error="authErrors.certExpiry"
                  label="资质有效期"
                  placeholder="请输入 YYYY-MM-DD（可选）"
                />
                <AppField
                  v-model="authForm.certScope"
                  :custom-style="authFieldStyle"
                  label="资质范围"
                  placeholder="请输入资质范围（可选）"
                />
              </template>
            </view>
          </AppForm>
        </scroll-view>

        <view class="auth-popup__actions">
          <AppButton
            custom-style="min-height: 76rpx; border-radius: 16rpx;"
            plain
            text="取消"
            type="info"
            @click="closeAuthPopup"
          />
          <AppButton
            :loading="isSubmittingAuth"
            custom-style="min-height: 76rpx; border-radius: 16rpx;"
            text="提交认证申请"
            type="info"
            @click="submitEnterpriseAuth"
          />
        </view>
      </view>
    </AppPopup>

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
        title="请选择企业类型"
        value-key="text"
        @cancel="closeEnterpriseTypePicker"
        @confirm="confirmEnterpriseType"
      />
    </AppPopup>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppPicker from '@/components/ui/AppPicker/index.vue'
import AppPopup from '@/components/ui/AppPopup/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { enterpriseService, profileService, userService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import type { ContactInfo, InvoiceInfo, SampleAddress } from '@/types/business'

type EnterpriseTypeValue = 1 | 2
type AuthFieldErrorKey = keyof EnterpriseAuthForm

interface EnterpriseProfile {
  address?: string
  authorizationLetter?: string
  businessLicense?: string
  certExpiry?: string
  certFileUrl?: string
  certNo?: string
  certScope?: string
  certStatus?: number
  contactName?: string
  contactPhone?: string
  createTime?: string
  creditCode?: string
  email?: string
  enterpriseName?: string
  enterpriseType?: number
  introduction?: string
  legalPerson?: string
  qualification?: string
  region?: string
  registeredCapital?: string
  rejectReason?: string
  serviceRange?: string
  unifiedCreditCode?: string
}

interface EnterpriseAuthForm {
  address: string
  authorizationLetter: string
  businessLicense: string
  certExpiry: string
  certFileUrl: string
  certNo: string
  certScope: string
  contactName: string
  contactPhone: string
  email: string
  enterpriseName: string
  enterpriseType: EnterpriseTypeValue | null
  introduction: string
  legalPerson: string
  qualification: string
  region: string
  registeredCapital: string
  serviceRange: string
  unifiedCreditCode: string
}

const userStore = useUserStore()
const authFieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const profile = ref<EnterpriseProfile>({})
const contacts = ref<ContactInfo[]>([])
const invoices = ref<InvoiceInfo[]>([])
const addresses = ref<SampleAddress[]>([])
const currentUserPhone = ref('')
const showAuthPopup = ref(false)
const isSubmittingAuth = ref(false)
const isUploadingLicense = ref(false)
const isUploadingAuthorizationLetter = ref(false)
const isUploadingCertFile = ref(false)
const showEnterpriseTypePicker = ref(false)
const authForm = reactive<EnterpriseAuthForm>({
  address: '',
  authorizationLetter: '',
  businessLicense: '',
  certExpiry: '',
  certFileUrl: '',
  certNo: '',
  certScope: '',
  contactName: '',
  contactPhone: '',
  email: '',
  enterpriseName: '',
  enterpriseType: 1,
  introduction: '',
  legalPerson: '',
  qualification: '',
  region: '',
  registeredCapital: '',
  serviceRange: '',
  unifiedCreditCode: '',
})
const authErrors = reactive<Record<AuthFieldErrorKey, string>>({
  address: '',
  authorizationLetter: '',
  businessLicense: '',
  certExpiry: '',
  certFileUrl: '',
  certNo: '',
  certScope: '',
  contactName: '',
  contactPhone: '',
  email: '',
  enterpriseName: '',
  enterpriseType: '',
  introduction: '',
  legalPerson: '',
  qualification: '',
  region: '',
  registeredCapital: '',
  serviceRange: '',
  unifiedCreditCode: '',
})

const enterpriseTypeOptions = [
  { label: '需求发布方', value: 1 },
  { label: '服务提供方', value: 2 },
] as const

const enterpriseTypePickerOptions = enterpriseTypeOptions.map((item) => ({
  text: item.label,
  value: item.value,
}))

const isPersonalAccount = computed(() => userStore.userType === 'personal')
const hasEnterpriseProfile = computed(() => Boolean(profile.value.enterpriseName?.trim()))
const needsProviderFields = computed(() => authForm.enterpriseType === 2)

const enterpriseTypePickerIndex = computed(() => {
  const index = enterpriseTypePickerOptions.findIndex((item) => item.value === authForm.enterpriseType)
  return index >= 0 ? index : 0
})

const enterpriseTypeLabel = computed(() => {
  const matched = enterpriseTypeOptions.find((item) => item.value === authForm.enterpriseType)
  return matched?.label ?? ''
})

const enterpriseName = computed(() => profile.value.enterpriseName?.trim() || '未认证企业')

const enterpriseAuthDesc = computed(() => {
  if (hasEnterpriseProfile.value) {
    return '企业资料、资质证书、认证状态查看'
  }

  if (isPersonalAccount.value) {
    return '个人用户可提交企业认证申请，升级为企业用户'
  }

  return '请补充企业信息、联系人等资料后提交企业认证'
})

const creditCodeText = computed(() => {
  const code = profile.value.unifiedCreditCode?.trim() || profile.value.creditCode?.trim()

  if (!code) {
    return '未完善'
  }

  if (code.length <= 8) {
    return code
  }

  return `${code.slice(0, 4)}**********${code.slice(-2)}`
})

const enterpriseStatus = computed(() => {
  if (!profile.value.enterpriseName) {
    return '待完善'
  }

  if (profile.value.certStatus === 1) {
    return '已通过'
  }

  if (profile.value.certStatus === 2) {
    return '已驳回'
  }

  return '待审核'
})

const recentContactText = computed(() => {
  const first = contacts.value[0]

  if (!first) {
    return '暂无联系人信息'
  }

  return `${first.name} / ${maskMobile(first.mobile)}`
})

const recentAddressText = computed(() => {
  const first = addresses.value[0]

  if (!first) {
    return '暂无收样地址'
  }

  return first.address
})

onLoad(() => {
  void loadAll()
})

onShow(() => {
  void loadAll()
})

function toOptionalText(value: string) {
  const next = value.trim()
  return next || undefined
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : []
}

function setAuthError(key: AuthFieldErrorKey, message: string) {
  authErrors[key] = message
  return !message
}

function clearAuthErrors() {
  const keys = Object.keys(authErrors) as AuthFieldErrorKey[]
  keys.forEach((key) => {
    authErrors[key] = ''
  })
}

function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value.trim())
}

function isValidDateText(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

async function loadAll() {
  const [enterpriseResult, contactResult, invoiceResult, addressResult, currentUserResult] = await Promise.allSettled([
    enterpriseService.getMy(),
    profileService.getContacts(),
    profileService.getInvoices(),
    profileService.getSampleAddresses(),
    userService.getCurrentUser(),
  ])

  if (enterpriseResult.status === 'fulfilled' && enterpriseResult.value) {
    const enterpriseInfo = enterpriseResult.value
    profile.value = {
      address: enterpriseInfo?.address,
      authorizationLetter: enterpriseInfo?.authorizationLetter,
      businessLicense: enterpriseInfo?.businessLicense,
      certExpiry: enterpriseInfo?.certExpiry,
      certFileUrl: enterpriseInfo?.certFileUrl,
      certNo: enterpriseInfo?.certNo,
      certScope: enterpriseInfo?.certScope,
      certStatus: enterpriseInfo?.certStatus,
      contactName: enterpriseInfo?.contactName,
      contactPhone: enterpriseInfo?.contactPhone,
      createTime: enterpriseInfo?.createTime,
      creditCode: enterpriseInfo?.creditCode,
      email: enterpriseInfo?.email,
      enterpriseName: enterpriseInfo?.enterpriseName,
      enterpriseType: enterpriseInfo?.enterpriseType,
      introduction: enterpriseInfo?.introduction,
      legalPerson: enterpriseInfo?.legalPerson,
      qualification: enterpriseInfo?.qualification,
      region: enterpriseInfo?.region,
      registeredCapital: enterpriseInfo?.registeredCapital,
      rejectReason: enterpriseInfo?.rejectReason,
      serviceRange: enterpriseInfo?.serviceRange,
      unifiedCreditCode: enterpriseInfo?.unifiedCreditCode,
    }
  } else {
    profile.value = {}
  }

  contacts.value = contactResult.status === 'fulfilled' ? ensureArray<ContactInfo>(contactResult.value) : []
  invoices.value = invoiceResult.status === 'fulfilled' ? ensureArray<InvoiceInfo>(invoiceResult.value) : []
  addresses.value = addressResult.status === 'fulfilled' ? ensureArray<SampleAddress>(addressResult.value) : []

  if (currentUserResult.status === 'fulfilled') {
    currentUserPhone.value = currentUserResult.value.phone?.trim() || ''
  }
}

function resetAuthForm() {
  authForm.address = profile.value.address?.trim() || ''
  authForm.authorizationLetter = profile.value.authorizationLetter?.trim() || ''
  authForm.businessLicense = profile.value.businessLicense?.trim() || ''
  authForm.certExpiry = profile.value.certExpiry?.trim() || ''
  authForm.certFileUrl = profile.value.certFileUrl?.trim() || ''
  authForm.certNo = profile.value.certNo?.trim() || ''
  authForm.certScope = profile.value.certScope?.trim() || ''
  authForm.contactName = profile.value.contactName?.trim() || contacts.value[0]?.name?.trim() || ''
  authForm.contactPhone = profile.value.contactPhone?.trim() || contacts.value[0]?.mobile?.trim() || currentUserPhone.value
  authForm.email = profile.value.email?.trim() || ''
  authForm.enterpriseName = profile.value.enterpriseName?.trim() || userStore.company?.trim() || ''
  authForm.enterpriseType = profile.value.enterpriseType === 2 ? 2 : 1
  authForm.introduction = profile.value.introduction?.trim() || ''
  authForm.legalPerson = profile.value.legalPerson?.trim() || ''
  authForm.qualification = profile.value.qualification?.trim() || ''
  authForm.region = profile.value.region?.trim() || ''
  authForm.registeredCapital = profile.value.registeredCapital?.trim() || ''
  authForm.serviceRange = profile.value.serviceRange?.trim() || ''
  authForm.unifiedCreditCode = profile.value.unifiedCreditCode?.trim() || profile.value.creditCode?.trim() || ''
  clearAuthErrors()
}

function openAuthPopup() {
  resetAuthForm()
  showAuthPopup.value = true
}

function closeAuthPopup() {
  if (isSubmittingAuth.value) {
    return
  }

  showAuthPopup.value = false
}

function forceCloseAuthPopup() {
  showAuthPopup.value = false
}

function goEnterpriseAuth() {
  if (profile.value.certStatus === 1 && hasEnterpriseProfile.value) {
    showAppToast({ message: '企业认证已通过，无需重复提交', icon: 'none' })
    return
  }

  if (profile.value.certStatus === 0 && hasEnterpriseProfile.value) {
    showAppToast({ message: '企业认证审核中，请耐心等待', icon: 'none' })
    return
  }

  openAuthPopup()
}

function goContacts() {
  uni.navigateTo({ url: '/pages/profile/contacts' })
}

function goInvoices() {
  uni.navigateTo({ url: '/pages/profile/invoices' })
}

function goAddresses() {
  uni.navigateTo({ url: '/pages/profile/addresses' })
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

  if (option && typeof option.value === 'number' && (option.value === 1 || option.value === 2)) {
    authForm.enterpriseType = option.value
    authErrors.enterpriseType = ''
  }

  closeEnterpriseTypePicker()
}

async function uploadBusinessLicense() {
  isUploadingLicense.value = true

  try {
    const selected = await chooseImageFile()
    const result = await enterpriseService.uploadLicense(selected.filePath)
    const objectName = result.objectName || result.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    authForm.businessLicense = objectName
    authErrors.businessLicense = ''
    showSuccessToast('营业执照上传成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '营业执照上传失败，请稍后重试'))
  } finally {
    isUploadingLicense.value = false
  }
}

async function uploadAuthorizationLetter() {
  isUploadingAuthorizationLetter.value = true

  try {
    const selected = await chooseAnyFile()
    const result = await enterpriseService.uploadCert(selected.filePath)
    const objectName = result.objectName || result.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    authForm.authorizationLetter = objectName
    showSuccessToast('授权委托书上传成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '授权委托书上传失败，请稍后重试'))
  } finally {
    isUploadingAuthorizationLetter.value = false
  }
}

async function uploadCertFile() {
  isUploadingCertFile.value = true

  try {
    const selected = await chooseAnyFile()
    const result = await enterpriseService.uploadCert(selected.filePath)
    const objectName = result.objectName || result.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    authForm.certFileUrl = objectName
    showSuccessToast('资质文件上传成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '资质文件上传失败，请稍后重试'))
  } finally {
    isUploadingCertFile.value = false
  }
}

function validateEnterpriseAuthForm() {
  const validators = [
    setAuthError('enterpriseName', authForm.enterpriseName.trim() ? '' : '请输入企业名称'),
    setAuthError('enterpriseType', authForm.enterpriseType ? '' : '请选择企业类型'),
    setAuthError('legalPerson', authForm.legalPerson.trim() ? '' : '请输入法人姓名'),
    setAuthError('contactName', authForm.contactName.trim() ? '' : '请输入联系人姓名'),
  ]

  const phone = authForm.contactPhone.trim()
  if (!phone) {
    validators.push(setAuthError('contactPhone', '请输入联系人手机号'))
  } else {
    validators.push(setAuthError('contactPhone', isPhoneNumber(phone) ? '' : '请输入正确的11位手机号'))
  }

  const certExpiry = authForm.certExpiry.trim()
  if (certExpiry) {
    validators.push(setAuthError('certExpiry', isValidDateText(certExpiry) ? '' : '请输入 YYYY-MM-DD 格式'))
  } else {
    validators.push(setAuthError('certExpiry', ''))
  }

  return validators.every(Boolean)
}

async function submitEnterpriseAuth() {
  if (!validateEnterpriseAuthForm()) {
    showFailToast('请先完善必填信息后再提交')
    return
  }

  isSubmittingAuth.value = true

  try {
    await enterpriseService.register({
      address: toOptionalText(authForm.address),
      authorizationLetter: toOptionalText(authForm.authorizationLetter),
      businessLicense: toOptionalText(authForm.businessLicense),
      certExpiry: needsProviderFields.value ? toOptionalText(authForm.certExpiry) : undefined,
      certFileUrl: needsProviderFields.value ? toOptionalText(authForm.certFileUrl) : undefined,
      certNo: needsProviderFields.value ? toOptionalText(authForm.certNo) : undefined,
      certScope: needsProviderFields.value ? toOptionalText(authForm.certScope) : undefined,
      contactName: authForm.contactName.trim(),
      contactPhone: authForm.contactPhone.trim(),
      email: toOptionalText(authForm.email),
      enterpriseName: authForm.enterpriseName.trim(),
      enterpriseType: Number(authForm.enterpriseType || 1),
      introduction: toOptionalText(authForm.introduction),
      legalPerson: authForm.legalPerson.trim(),
      qualification: toOptionalText(authForm.qualification),
      region: toOptionalText(authForm.region),
      registeredCapital: toOptionalText(authForm.registeredCapital),
      serviceRange: toOptionalText(authForm.serviceRange),
      unifiedCreditCode: toOptionalText(authForm.unifiedCreditCode),
    })

    showSuccessToast('企业认证申请已提交')
    forceCloseAuthPopup()
    await loadAll()
  } catch (error) {
    showFailToast(getErrorMessage(error, '企业认证申请提交失败，请稍后重试'))
  } finally {
    isSubmittingAuth.value = false
  }
}

function maskMobile(mobile: string) {
  const value = mobile?.trim() || ''

  if (value.length < 7) {
    return value || '暂无'
  }

  return `${value.slice(0, 3)}****${value.slice(-4)}`
}
</script>

<style scoped lang="scss">
.page-profile-enterprise {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-profile-enterprise__scroll {
  flex: 1;
  min-height: 0;
}

.page-profile-enterprise__content {
  padding: 20rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.enterprise-hero {
  border-radius: 22rpx;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #ecfeff 100%);
  border: 1rpx solid #bfdbfe;
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.08);
  padding: 24rpx;
}

.enterprise-hero--empty {
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border-color: #cbd5e1;
}

.enterprise-hero__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.enterprise-hero__name {
  display: block;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.enterprise-hero__code {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
}

.enterprise-hero__reject {
  display: block;
  margin-top: 6rpx;
  color: #b91c1c;
  font-size: 21rpx;
}

.enterprise-hero__status {
  flex-shrink: 0;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.8);
  color: #1d4ed8;
  font-size: 20rpx;
  font-weight: 600;
}

.enterprise-hero__stats {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.enterprise-hero__stat {
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.68);
  text-align: center;
  padding: 14rpx 8rpx;
}

.enterprise-hero__stat-value {
  display: block;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.enterprise-hero__stat-label {
  display: block;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 20rpx;
}

.enterprise-hero__empty-title {
  display: block;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.4;
}

.enterprise-hero__empty-desc {
  display: block;
  margin-top: 10rpx;
  color: #475569;
  font-size: 24rpx;
  line-height: 1.6;
}

.enterprise-card {
  margin-top: 14rpx;
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
  padding: 22rpx;
}

.enterprise-card__title {
  display: block;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.enterprise-row {
  margin-top: 12rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.enterprise-row--plain {
  margin-top: 10rpx;
}

.enterprise-row__title {
  display: block;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 600;
}

.enterprise-row__desc {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
  line-height: 1.4;
}

.enterprise-row__value {
  flex-shrink: 0;
  color: #64748b;
  font-size: 22rpx;
}

.enterprise-row__value--primary {
  color: #1E61FF;
}

.auth-popup {
  height: 84vh;
  max-height: 84vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.auth-popup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 4rpx 0 14rpx;
}

.auth-popup__title {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.auth-popup__close {
  color: #64748b;
  font-size: 24rpx;
}

.auth-popup__scroll {
  flex: 1;
  min-height: 0;
}

.auth-popup__form {
  padding-bottom: 28rpx;
}

.auth-popup__section + .auth-popup__section {
  margin-top: 10rpx;
}

.auth-upload {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.auth-upload__field {
  flex: 1;
  min-width: 0;
}

.auth-type {
  margin-top: 8rpx;
}

.auth-popup__actions {
  flex-shrink: 0;
  margin-top: 0;
  padding: 14rpx 0 calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12rpx;
}
</style>
