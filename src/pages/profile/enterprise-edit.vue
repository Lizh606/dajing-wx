<template>
  <view class="page-enterprise-edit">
    <scroll-view class="page-enterprise-edit__scroll" scroll-y>
      <view class="page-enterprise-edit__content">
        <view class="edit-hero">
          <text class="edit-hero__title">{{ headerTitle }}</text>
          <text class="edit-hero__desc">{{ headerDescription }}</text>
        </view>

        <view class="edit-card">
          <AppForm class="edit-form">
            <AppField
              v-model="editForm.enterpriseName"
              :custom-style="editFieldStyle"
              :error="editErrors.enterpriseName"
              label="企业名称"
              placeholder="请输入企业名称"
            />

            <view class="edit-type">
              <text class="edit-type__label">企业类型</text>
              <view class="edit-type__chips">
                <view
                  class="edit-type__chip"
                  :class="{ 'edit-type__chip--active': editForm.enterpriseType === 1 }"
                  @tap="editForm.enterpriseType = 1"
                >需求发布方</view>
                <view
                  class="edit-type__chip"
                  :class="{ 'edit-type__chip--active': editForm.enterpriseType === 2 }"
                  @tap="editForm.enterpriseType = 2"
                >服务提供方</view>
              </view>
            </view>

            <AppField
              v-model="editForm.unifiedCreditCode"
              :custom-style="editFieldStyle"
              label="统一社会信用代码"
              placeholder="请输入统一社会信用代码"
            />
            <AppField
              v-model="editForm.legalPerson"
              :custom-style="editFieldStyle"
              :error="editErrors.legalPerson"
              label="法人姓名"
              placeholder="请输入法人姓名"
            />
            <AppField
              v-model="editForm.contactName"
              :custom-style="editFieldStyle"
              :error="editErrors.contactName"
              label="联系人"
              placeholder="请输入联系人"
            />
            <AppField
              v-model="editForm.contactPhone"
              :custom-style="editFieldStyle"
              :error="editErrors.contactPhone"
              input-mode="numeric"
              label="联系电话"
              placeholder="请输入11位手机号"
              type="number"
            />
            <AppField
              v-model="editForm.region"
              :custom-style="editFieldStyle"
              label="所在地区"
              placeholder="请输入所在地区"
            />
            <AppField
              v-model="editForm.address"
              :custom-style="editFieldStyle"
              label="详细地址"
              placeholder="请输入详细地址"
            />
            <AppField
              v-model="editForm.email"
              :custom-style="editFieldStyle"
              label="企业邮箱"
              placeholder="请输入企业邮箱"
            />
            <AppField
              v-model="editForm.registeredCapital"
              :custom-style="editFieldStyle"
              label="注册资本"
              placeholder="例如：500万元人民币"
            />
            <AppField
              v-model="editForm.serviceRange"
              :custom-style="editFieldStyle"
              label="服务范围"
              placeholder="例如：检测、认证、计量"
            />
            <AppField
              v-model="editForm.qualification"
              :custom-style="editFieldStyle"
              label="资质描述"
              placeholder="例如：CMA/CNAS认证机构"
            />
            <AppField
              v-model="editForm.certNo"
              :custom-style="editFieldStyle"
              label="资质证书编号"
              placeholder="请输入资质证书编号"
            />
            <AppField
              v-model="editForm.certExpiry"
              :custom-style="editFieldStyle"
              label="资质有效期"
              placeholder="请输入 YYYY-MM-DD"
            />
            <AppField
              v-model="editForm.certScope"
              :custom-style="editFieldStyle"
              label="资质范围"
              placeholder="请输入资质范围"
            />

            <view
              v-for="attachment in attachmentItems"
              :key="attachment.key"
              class="edit-form__upload-card"
            >
              <AppImageUploadCard
                :disabled="Boolean(uploadingAttachmentKey) && uploadingAttachmentKey !== attachment.key"
                :image-load-error="editAttachmentErrorMap[attachment.key]"
                :image-src="resolveEditAttachmentPreview(attachment.key)"
                :label="attachment.label"
                :loading="isUploadingAttachment(attachment.key)"
                :placeholder="hasEditAttachment(attachment.key) ? getAttachmentName(attachment.key) : '点击上传'"
                :placeholder-on-error="getAttachmentName(attachment.key)"
                @image-error="handleEditAttachmentError(attachment.key)"
                @tap="uploadAttachment(attachment.key, attachment.label)"
              />
            </view>

            <AppField
              v-model="editForm.introduction"
              :autosize="{ minHeight: 120 }"
              :custom-style="editFieldStyle"
              label="企业简介"
              placeholder="请输入企业简介"
              type="textarea"
            />
          </AppForm>
        </view>
      </view>
    </scroll-view>

    <view class="edit-actions">
      <AppButton
        custom-style="min-height: 76rpx; min-width: 188rpx; border-radius: 16rpx;"
        plain
        text="取消"
        type="info"
        @click="cancelEdit"
      />
      <AppButton
        :loading="isSaving"
        custom-style="min-height: 76rpx; min-width: 188rpx; border-radius: 16rpx;"
        :text="submitButtonText"
        type="info"
        @click="saveEnterpriseInfo"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppImageUploadCard from '@/components/ui/AppImageUploadCard/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getApiBaseUrl } from '@/config/api'
import { enterpriseService, profileService, userService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import type { ContactInfo } from '@/types/business'

type EnterpriseTypeValue = 1 | 2
type EditableAttachmentField = 'authorizationLetter' | 'businessLicense' | 'certFileUrl'

interface EnterpriseProfile {
  address?: string
  authorizationLetter?: string
  businessLicense?: string
  certExpiry?: string
  certFileUrl?: string
  certNo?: string
  certScope?: string
  contactName?: string
  contactPhone?: string
  creditCode?: string
  email?: string
  enterpriseName?: string
  enterpriseType?: number
  introduction?: string
  legalPerson?: string
  qualification?: string
  region?: string
  registeredCapital?: string
  serviceRange?: string
  unifiedCreditCode?: string
}

interface EnterpriseEditForm {
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
  enterpriseType: EnterpriseTypeValue
  introduction: string
  legalPerson: string
  qualification: string
  region: string
  registeredCapital: string
  serviceRange: string
  unifiedCreditCode: string
}

const userStore = useUserStore()
const pageMode = ref<'auth' | 'edit'>('edit')
const profile = ref<EnterpriseProfile>({})
const contacts = ref<ContactInfo[]>([])
const currentUserPhone = ref('')
const enterpriseId = ref('')
const isSaving = ref(false)
const uploadingAttachmentKey = ref<EditableAttachmentField | ''>('')
const editAttachmentErrorMap = reactive<Record<EditableAttachmentField, boolean>>({
  authorizationLetter: false,
  businessLicense: false,
  certFileUrl: false,
})
const editAttachmentLocalPreviewMap = reactive<Record<EditableAttachmentField, string>>({
  authorizationLetter: '',
  businessLicense: '',
  certFileUrl: '',
})

const editFieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'
const editForm = reactive<EnterpriseEditForm>({
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

const editErrors = reactive({
  contactName: '',
  contactPhone: '',
  enterpriseName: '',
  legalPerson: '',
})

const attachmentItems: Array<{ key: EditableAttachmentField; label: string }> = [
  { key: 'businessLicense', label: '营业执照' },
  { key: 'authorizationLetter', label: '授权委托书' },
  { key: 'certFileUrl', label: '资质文件' },
]

const headerTitle = computed(() => (pageMode.value === 'auth' ? '企业认证' : '编辑企业信息'))
const headerDescription = computed(() => {
  if (pageMode.value === 'auth') {
    return '请完善企业基础资料与附件信息，提交后进入企业认证审核流程。'
  }

  return '你可以在这里维护企业资料，保存后会同步更新企业信息页。'
})
const submitButtonText = computed(() => (pageMode.value === 'auth' ? '提交认证' : '保存修改'))

onLoad((options) => {
  pageMode.value = options?.mode === 'auth' ? 'auth' : 'edit'
  void loadInitialData()
})

function rawToText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : []
}

function toNormalizedText(value: string) {
  return value.trim()
}

function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value.trim())
}

function resolveFileName(filePath: string) {
  const normalized = filePath
    .split('?')[0]
    .split('#')[0]
    .replace(/\\/g, '/')
  const segments = normalized.split('/').filter(Boolean)
  const name = segments[segments.length - 1] || ''

  if (!name || /^https?:$/i.test(name)) {
    return '已上传附件'
  }

  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

function resolvePreviewUrl(raw: string) {
  const value = raw.trim()

  if (!value) {
    return ''
  }

  if (value.startsWith('data:image')) {
    return value
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  if (value.startsWith('//')) {
    return `https:${value}`
  }

  if (/^[\w.-]+\.[a-z]{2,}\/.*$/i.test(value)) {
    return `https://${value}`
  }

  const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
  return `${baseUrl}/${value.replace(/^\/+/, '')}`
}

function clearEditErrors() {
  editErrors.contactName = ''
  editErrors.contactPhone = ''
  editErrors.enterpriseName = ''
  editErrors.legalPerson = ''
}

function clearEditAttachmentErrors() {
  editAttachmentErrorMap.authorizationLetter = false
  editAttachmentErrorMap.businessLicense = false
  editAttachmentErrorMap.certFileUrl = false
}

function clearEditAttachmentLocalPreviews() {
  editAttachmentLocalPreviewMap.authorizationLetter = ''
  editAttachmentLocalPreviewMap.businessLicense = ''
  editAttachmentLocalPreviewMap.certFileUrl = ''
}

function hasEditAttachment(key: EditableAttachmentField) {
  return Boolean(rawToText(editForm[key]))
}

function getAttachmentName(key: EditableAttachmentField) {
  const raw = rawToText(editForm[key])
  return raw ? resolveFileName(raw) : '未上传附件'
}

function handleEditAttachmentError(key: EditableAttachmentField) {
  editAttachmentErrorMap[key] = true
}

function resolveEditAttachmentPreview(key: EditableAttachmentField) {
  const localPreview = rawToText(editAttachmentLocalPreviewMap[key])
  if (localPreview) {
    return localPreview
  }

  return resolvePreviewUrl(rawToText(editForm[key]))
}

function isChooseCanceled(error: unknown) {
  const message = getErrorMessage(error, '')
  return /取消|cancel/i.test(message)
}

function isUploadingAttachment(key: EditableAttachmentField) {
  return uploadingAttachmentKey.value === key
}

function fillEditForm() {
  const firstContact = contacts.value[0]
  editForm.address = rawToText(profile.value.address)
  editForm.authorizationLetter = rawToText(profile.value.authorizationLetter)
  editForm.businessLicense = rawToText(profile.value.businessLicense)
  editForm.certExpiry = rawToText(profile.value.certExpiry)
  editForm.certFileUrl = rawToText(profile.value.certFileUrl)
  editForm.certNo = rawToText(profile.value.certNo)
  editForm.certScope = rawToText(profile.value.certScope)
  editForm.contactName = rawToText(profile.value.contactName) || rawToText(firstContact?.name)
  editForm.contactPhone = rawToText(profile.value.contactPhone) || rawToText(firstContact?.mobile) || currentUserPhone.value
  editForm.email = rawToText(profile.value.email)
  editForm.enterpriseName = rawToText(profile.value.enterpriseName) || userStore.company.trim()
  editForm.enterpriseType = profile.value.enterpriseType === 2 ? 2 : 1
  editForm.introduction = rawToText(profile.value.introduction)
  editForm.legalPerson = rawToText(profile.value.legalPerson)
  editForm.qualification = rawToText(profile.value.qualification)
  editForm.region = rawToText(profile.value.region)
  editForm.registeredCapital = rawToText(profile.value.registeredCapital)
  editForm.serviceRange = rawToText(profile.value.serviceRange)
  editForm.unifiedCreditCode = rawToText(profile.value.unifiedCreditCode || profile.value.creditCode)
  clearEditAttachmentLocalPreviews()
  clearEditAttachmentErrors()
  clearEditErrors()
}

async function loadInitialData() {
  const [enterpriseResult, contactResult, currentUserResult] = await Promise.allSettled([
    enterpriseService.getMy(),
    profileService.getContacts(),
    userService.getCurrentUser(),
  ])

  contacts.value = contactResult.status === 'fulfilled' ? ensureArray<ContactInfo>(contactResult.value) : []

  if (currentUserResult.status === 'fulfilled') {
    currentUserPhone.value = rawToText(currentUserResult.value?.phone)
  }

  if (enterpriseResult.status === 'fulfilled' && enterpriseResult.value) {
    const enterpriseInfo = enterpriseResult.value as Record<string, any>
    profile.value = {
      address: enterpriseInfo?.address,
      authorizationLetter: enterpriseInfo?.authorizationLetter,
      businessLicense: enterpriseInfo?.businessLicense,
      certExpiry: enterpriseInfo?.certExpiry,
      certFileUrl: enterpriseInfo?.certFileUrl,
      certNo: enterpriseInfo?.certNo,
      certScope: enterpriseInfo?.certScope,
      contactName: enterpriseInfo?.contactName,
      contactPhone: enterpriseInfo?.contactPhone,
      creditCode: enterpriseInfo?.creditCode,
      email: enterpriseInfo?.email,
      enterpriseName: enterpriseInfo?.enterpriseName,
      enterpriseType: enterpriseInfo?.enterpriseType,
      introduction: enterpriseInfo?.introduction,
      legalPerson: enterpriseInfo?.legalPerson,
      qualification: enterpriseInfo?.qualification,
      region: enterpriseInfo?.region,
      registeredCapital: enterpriseInfo?.registeredCapital,
      serviceRange: enterpriseInfo?.serviceRange,
      unifiedCreditCode: enterpriseInfo?.unifiedCreditCode,
    }

    const normalizedContext = enterpriseService.normalizeEnterpriseContext(enterpriseInfo)
    enterpriseId.value = rawToText(normalizedContext?.enterpriseId || enterpriseInfo?.enterpriseId || enterpriseInfo?.id)

    if (normalizedContext?.company || enterpriseId.value) {
      userStore.setEnterpriseContext({
        company: normalizedContext?.company,
        enterpriseId: enterpriseId.value || undefined,
      })
    }
  } else {
    profile.value = {}
    enterpriseId.value = userStore.enterpriseId || ''
  }

  fillEditForm()
}

function validateEditForm() {
  clearEditErrors()

  if (!editForm.enterpriseName.trim()) {
    editErrors.enterpriseName = '请输入企业名称'
  }

  if (!editForm.legalPerson.trim()) {
    editErrors.legalPerson = '请输入法人姓名'
  }

  if (!editForm.contactName.trim()) {
    editErrors.contactName = '请输入联系人'
  }

  const phone = editForm.contactPhone.trim()
  if (!phone) {
    editErrors.contactPhone = '请输入联系人手机号'
  } else if (!isPhoneNumber(phone)) {
    editErrors.contactPhone = '请输入正确的11位手机号'
  }

  return !editErrors.enterpriseName && !editErrors.legalPerson && !editErrors.contactName && !editErrors.contactPhone
}

async function chooseImageAttachmentFile() {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      fail: () => {
        reject(new Error('已取消选择附件'))
      },
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const filePath = result.tempFilePaths?.[0]

        if (!filePath) {
          reject(new Error('未获取到可上传的附件'))
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

async function chooseAttachmentFile() {
  return chooseImageAttachmentFile()
}

async function uploadAttachment(key: EditableAttachmentField, label: string) {
  uploadingAttachmentKey.value = key

  try {
    const selected = await chooseAttachmentFile()
    const result = await enterpriseService.uploadCert(selected.filePath)
    const objectName = rawToText(result.objectName || result.fileKey)

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    editForm[key] = objectName
    editAttachmentLocalPreviewMap[key] = selected.filePath
    editAttachmentErrorMap[key] = false
    showSuccessToast(`${label}上传成功`)
  } catch (error) {
    if (!isChooseCanceled(error)) {
      showFailToast(getErrorMessage(error, `${label}上传失败，请稍后重试`))
    }
  } finally {
    uploadingAttachmentKey.value = ''
  }
}

async function saveEnterpriseInfo() {
  if (!validateEditForm()) {
    showFailToast('请先完善必填信息')
    return
  }

  isSaving.value = true

  try {
    const payload = {
      address: toNormalizedText(editForm.address),
      authorizationLetter: toNormalizedText(editForm.authorizationLetter),
      businessLicense: toNormalizedText(editForm.businessLicense),
      certExpiry: toNormalizedText(editForm.certExpiry),
      certFileUrl: toNormalizedText(editForm.certFileUrl),
      certNo: toNormalizedText(editForm.certNo),
      certScope: toNormalizedText(editForm.certScope),
      contactName: editForm.contactName.trim(),
      contactPhone: editForm.contactPhone.trim(),
      email: toNormalizedText(editForm.email),
      enterpriseName: editForm.enterpriseName.trim(),
      enterpriseType: Number(editForm.enterpriseType || 1),
      introduction: toNormalizedText(editForm.introduction),
      legalPerson: editForm.legalPerson.trim(),
      qualification: toNormalizedText(editForm.qualification),
      region: toNormalizedText(editForm.region),
      registeredCapital: toNormalizedText(editForm.registeredCapital),
      serviceRange: toNormalizedText(editForm.serviceRange),
      unifiedCreditCode: toNormalizedText(editForm.unifiedCreditCode),
    }

    if (enterpriseId.value) {
      await enterpriseService.update(enterpriseId.value, payload)
    } else {
      await enterpriseService.register(payload)
    }

    showSuccessToast(pageMode.value === 'auth' ? '企业认证信息已提交' : '企业信息已更新')
    uni.navigateBack()
  } catch (error) {
    showFailToast(getErrorMessage(error, pageMode.value === 'auth' ? '企业认证提交失败，请稍后重试' : '企业信息更新失败，请稍后重试'))
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  if (isSaving.value) {
    return
  }

  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page-enterprise-edit {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f9ff 0%, #f8fafc 220rpx, #f8fafc 100%);
}

.page-enterprise-edit__scroll {
  flex: 1;
  min-height: 0;
}

.page-enterprise-edit__content {
  padding: 24rpx;
  box-sizing: border-box;
}

.edit-hero {
  padding: 26rpx;
  border-radius: 22rpx;
  background: linear-gradient(136deg, #dbeafe 0%, #eff6ff 52%, #f0f9ff 100%);
  border: 1rpx solid #bfdbfe;
  box-shadow: 0 8rpx 22rpx rgba(30, 64, 175, 0.08);
  margin-bottom: 18rpx;
}

.edit-hero__title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.edit-hero__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #334155;
}

.edit-card {
  border-radius: 22rpx;
  background: #ffffff;
  border: 1rpx solid #dbe5f2;
  box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, 0.05);
  padding: 22rpx;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.edit-form :deep(.app-field__label) {
  margin-bottom: 10rpx;
  color: #475569;
}

.edit-form :deep(.app-field) {
  border-color: #dbe5f2;
  box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.02);
}

.edit-type {
  padding: 14rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #fbfdff;
}

.edit-type__label {
  display: block;
  margin-bottom: 14rpx;
  font-size: 24rpx;
  color: #475569;
  font-weight: 600;
}

.edit-type__chips {
  display: flex;
  gap: 14rpx;
}

.edit-type__chip {
  min-width: 168rpx;
  height: 68rpx;
  border-radius: 14rpx;
  border: 1rpx solid #dbe3ee;
  background: #f8fafc;
  color: #475569;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-type__chip--active {
  border-color: #93c5fd;
  background: #eaf3ff;
  color: #1d4ed8;
  font-weight: 600;
}

.edit-form__upload-card {
  margin-top: 4rpx;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
}

@media (max-width: 360px) {
  .edit-type__chips {
    flex-wrap: wrap;
  }
}
</style>
