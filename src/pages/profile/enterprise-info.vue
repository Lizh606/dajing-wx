<template>
  <view class="page-enterprise-info">
    <scroll-view class="page-enterprise-info__scroll" scroll-y>
      <view class="page-enterprise-info__content">
        <view class="enterprise-hero" :class="{ 'enterprise-hero--empty': !hasEnterpriseProfile }">
          <view class="enterprise-hero__head">
            <view class="enterprise-hero__left">
              <text class="enterprise-hero__name">{{ hasEnterpriseProfile ? enterpriseName : '暂无企业信息' }}</text>
              <text class="enterprise-hero__status">认证状态：{{ enterpriseStatus }}</text>
              <text v-if="profile.rejectReason" class="enterprise-hero__reject">驳回原因：{{ profile.rejectReason }}</text>
            </view>
            <view class="enterprise-hero__edit-action" @tap="openEditPopup">
              <AppIcon color="#1d4ed8" name="edit" :size="18" />
            </view>
          </view>
        </view>

        <view class="enterprise-card">
          <text class="enterprise-card__title">企业信息</text>
          <view v-if="hasEnterpriseProfile" class="enterprise-card__rows">
            <view v-for="item in infoRows" :key="item.label" class="enterprise-info-row">
              <text class="enterprise-info-row__label">{{ item.label }}</text>
              <text class="enterprise-info-row__value">{{ item.value }}</text>
            </view>
          </view>
          <text v-else class="enterprise-card__empty">暂无企业资料可展示</text>
        </view>

        <view class="enterprise-card">
          <text class="enterprise-card__title">证照图片</text>
          <view class="attachment-list">
            <view v-for="item in attachmentViews" :key="item.key" class="attachment-item">
              <text class="attachment-item__label">{{ item.label }}</text>
              <view class="attachment-item__body">
                <image
                  v-if="item.previewUrl && !item.loadError"
                  class="attachment-item__image"
                  :src="item.previewUrl"
                  mode="aspectFill"
                  @error="handleAttachmentError(item.key)"
                  @tap="previewAttachment(item)"
                />
                <view v-else class="attachment-item__empty">
                  <text class="attachment-item__empty-text">{{ item.raw ? '图片加载失败' : '暂未上传' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="enterprise-card">
          <text class="enterprise-card__title">关联资料</text>
          <view class="enterprise-link-row" @tap="goContacts">
            <view>
              <text class="enterprise-link-row__title">联系人管理</text>
              <text class="enterprise-link-row__desc">查看常用联系人信息</text>
            </view>
            <text class="enterprise-link-row__value">{{ contacts.length }} 个 ›</text>
          </view>
          <view class="enterprise-link-row" @tap="goInvoices">
            <view>
              <text class="enterprise-link-row__title">开票资料</text>
              <text class="enterprise-link-row__desc">查看发票抬头与税号等信息</text>
            </view>
            <text class="enterprise-link-row__value">{{ invoices.length > 0 ? '已配置' : '未配置' }} ›</text>
          </view>
          <view class="enterprise-link-row" @tap="goAddresses">
            <view>
              <text class="enterprise-link-row__title">收样地址</text>
              <text class="enterprise-link-row__desc">查看寄样与收样地址信息</text>
            </view>
            <text class="enterprise-link-row__value">{{ addresses.length }} 个 ›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppPopup
      :show="showEditPopup"
      custom-style="padding: 20rpx 0 0; border-top-left-radius: 30rpx; border-top-right-radius: 30rpx;"
      position="bottom"
      round
      @close="closeEditPopup"
      @update:show="showEditPopup = $event"
    >
      <view class="edit-popup">
        <view class="edit-popup__head">
          <text class="edit-popup__title">编辑企业信息</text>
          <text class="edit-popup__close" @tap="closeEditPopup">关闭</text>
        </view>

        <scroll-view class="edit-popup__scroll" scroll-y>
          <AppForm class="edit-popup__form">
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

            <view class="edit-upload">
              <view class="edit-upload__field">
                <text class="edit-upload__label">营业执照</text>
                <view class="edit-upload__preview" @tap="previewEditAttachment('businessLicense')">
                  <image
                    v-if="resolveEditAttachmentPreview('businessLicense') && !editAttachmentErrorMap.businessLicense"
                    class="edit-upload__image"
                    :src="resolveEditAttachmentPreview('businessLicense')"
                    mode="aspectFill"
                    @error="handleEditAttachmentError('businessLicense')"
                  />
                  <view v-else class="edit-upload__empty">
                    <text class="edit-upload__empty-text">{{ editForm.businessLicense ? '图片加载失败' : '暂未上传' }}</text>
                  </view>
                </view>
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

            <view class="edit-upload">
              <view class="edit-upload__field">
                <text class="edit-upload__label">授权委托书</text>
                <view class="edit-upload__preview" @tap="previewEditAttachment('authorizationLetter')">
                  <image
                    v-if="resolveEditAttachmentPreview('authorizationLetter') && !editAttachmentErrorMap.authorizationLetter"
                    class="edit-upload__image"
                    :src="resolveEditAttachmentPreview('authorizationLetter')"
                    mode="aspectFill"
                    @error="handleEditAttachmentError('authorizationLetter')"
                  />
                  <view v-else class="edit-upload__empty">
                    <text class="edit-upload__empty-text">{{ editForm.authorizationLetter ? '图片加载失败' : '暂未上传' }}</text>
                  </view>
                </view>
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

            <view class="edit-upload">
              <view class="edit-upload__field">
                <text class="edit-upload__label">资质文件</text>
                <view class="edit-upload__preview" @tap="previewEditAttachment('certFileUrl')">
                  <image
                    v-if="resolveEditAttachmentPreview('certFileUrl') && !editAttachmentErrorMap.certFileUrl"
                    class="edit-upload__image"
                    :src="resolveEditAttachmentPreview('certFileUrl')"
                    mode="aspectFill"
                    @error="handleEditAttachmentError('certFileUrl')"
                  />
                  <view v-else class="edit-upload__empty">
                    <text class="edit-upload__empty-text">{{ editForm.certFileUrl ? '图片加载失败' : '暂未上传' }}</text>
                  </view>
                </view>
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
              v-model="editForm.introduction"
              :autosize="{ minHeight: 120 }"
              :custom-style="editFieldStyle"
              label="企业简介"
              placeholder="请输入企业简介"
              type="textarea"
            />
          </AppForm>
        </scroll-view>

        <view class="edit-popup__actions">
          <AppButton
            custom-style="min-height: 76rpx; min-width: 188rpx; border-radius: 16rpx;"
            plain
            text="取消"
            type="info"
            @click="closeEditPopup"
          />
          <AppButton
            :loading="isSaving"
            custom-style="min-height: 76rpx; min-width: 188rpx; border-radius: 16rpx;"
            text="保存修改"
            type="info"
            @click="saveEnterpriseInfo"
          />
        </view>
      </view>
    </AppPopup>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppPopup from '@/components/ui/AppPopup/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getApiBaseUrl } from '@/config/api'
import { enterpriseService, profileService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import type { ContactInfo, InvoiceInfo, SampleAddress } from '@/types/business'

type EnterpriseTypeValue = 1 | 2

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

interface EnterpriseInfoRow {
  label: string
  value: string
}

interface AttachmentViewItem {
  key: 'authorizationLetter' | 'businessLicense' | 'certFileUrl'
  label: string
  loadError: boolean
  previewUrl: string
  raw: string
}
type EditableAttachmentField = 'authorizationLetter' | 'businessLicense' | 'certFileUrl'

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
const profile = ref<EnterpriseProfile>({})
const contacts = ref<ContactInfo[]>([])
const invoices = ref<InvoiceInfo[]>([])
const addresses = ref<SampleAddress[]>([])
const enterpriseId = ref('')
const attachmentErrorMap = reactive<Record<string, boolean>>({
  authorizationLetter: false,
  businessLicense: false,
  certFileUrl: false,
})
const editAttachmentErrorMap = reactive<Record<EditableAttachmentField, boolean>>({
  authorizationLetter: false,
  businessLicense: false,
  certFileUrl: false,
})

const showEditPopup = ref(false)
const isSaving = ref(false)
const isUploadingLicense = ref(false)
const isUploadingAuthorizationLetter = ref(false)
const isUploadingCertFile = ref(false)

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

const hasEnterpriseProfile = computed(() => Boolean(profile.value.enterpriseName?.trim()))
const enterpriseName = computed(() => profile.value.enterpriseName?.trim() || '未命名企业')

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

const enterpriseTypeText = computed(() => {
  if (profile.value.enterpriseType === 1) {
    return '需求发布方'
  }

  if (profile.value.enterpriseType === 2) {
    return '服务提供方'
  }

  return '-'
})

const infoRows = computed<EnterpriseInfoRow[]>(() => [
  { label: '企业名称', value: normalizeText(profile.value.enterpriseName) },
  { label: '企业类型', value: enterpriseTypeText.value },
  { label: '认证状态', value: enterpriseStatus.value },
  { label: '统一社会信用代码', value: normalizeText(profile.value.unifiedCreditCode || profile.value.creditCode) },
  { label: '法人姓名', value: normalizeText(profile.value.legalPerson) },
  { label: '联系人', value: normalizeText(profile.value.contactName) },
  { label: '联系电话', value: normalizeText(profile.value.contactPhone) },
  { label: '所在地区', value: normalizeText(profile.value.region) },
  { label: '详细地址', value: normalizeText(profile.value.address) },
  { label: '企业邮箱', value: normalizeText(profile.value.email) },
  { label: '注册资本', value: normalizeText(profile.value.registeredCapital) },
  { label: '服务范围', value: normalizeText(profile.value.serviceRange) },
  { label: '资质描述', value: normalizeText(profile.value.qualification) },
  { label: '资质证书编号', value: normalizeText(profile.value.certNo) },
  { label: '资质有效期', value: normalizeText(profile.value.certExpiry) },
  { label: '资质范围', value: normalizeText(profile.value.certScope) },
  { label: '企业简介', value: normalizeText(profile.value.introduction) },
])

const attachmentViews = computed<AttachmentViewItem[]>(() => {
  const items: Array<Omit<AttachmentViewItem, 'loadError' | 'previewUrl'>> = [
    {
      key: 'businessLicense',
      label: '营业执照',
      raw: rawToText(profile.value.businessLicense),
    },
    {
      key: 'authorizationLetter',
      label: '授权委托书',
      raw: rawToText(profile.value.authorizationLetter),
    },
    {
      key: 'certFileUrl',
      label: '资质文件',
      raw: rawToText(profile.value.certFileUrl),
    },
  ]

  return items.map((item) => ({
    ...item,
    loadError: Boolean(attachmentErrorMap[item.key]),
    previewUrl: resolvePreviewUrl(item.raw),
  }))
})

onLoad(() => {
  void loadAll()
})

onShow(() => {
  void loadAll()
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

function normalizeText(value: unknown) {
  const text = rawToText(value)
  return text || '-'
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : []
}

function toOptionalText(value: string) {
  const next = value.trim()
  return next || undefined
}

function isPhoneNumber(value: string) {
  return /^1\d{10}$/.test(value.trim())
}

function resolveFileName(filePath: string) {
  const normalized = filePath.split('?')[0]
  const segments = normalized.split('/')
  return segments[segments.length - 1] || 'file'
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

function clearAttachmentErrors() {
  attachmentErrorMap.authorizationLetter = false
  attachmentErrorMap.businessLicense = false
  attachmentErrorMap.certFileUrl = false
}

function clearEditAttachmentErrors() {
  editAttachmentErrorMap.authorizationLetter = false
  editAttachmentErrorMap.businessLicense = false
  editAttachmentErrorMap.certFileUrl = false
}

function handleAttachmentError(key: AttachmentViewItem['key']) {
  attachmentErrorMap[key] = true
}

function handleEditAttachmentError(key: EditableAttachmentField) {
  editAttachmentErrorMap[key] = true
}

function previewAttachment(item: AttachmentViewItem) {
  if (!item.previewUrl || item.loadError) {
    showAppToast({ icon: 'none', message: '当前附件暂不可预览，请先更新图片' })
    return
  }

  uni.previewImage({
    current: item.previewUrl,
    urls: [item.previewUrl],
  })
}

function resolveEditAttachmentPreview(key: EditableAttachmentField) {
  return resolvePreviewUrl(rawToText(editForm[key]))
}

function previewEditAttachment(key: EditableAttachmentField) {
  const previewUrl = resolveEditAttachmentPreview(key)

  if (!previewUrl || editAttachmentErrorMap[key]) {
    showAppToast({ icon: 'none', message: '当前附件暂不可预览，请先更新图片' })
    return
  }

  uni.previewImage({
    current: previewUrl,
    urls: [previewUrl],
  })
}

async function loadAll() {
  const [enterpriseResult, contactResult, invoiceResult, addressResult] = await Promise.allSettled([
    enterpriseService.getMy(),
    profileService.getContacts(),
    profileService.getInvoices(),
    profileService.getSampleAddresses(),
  ])

  clearAttachmentErrors()

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
      certStatus: enterpriseInfo?.certStatus,
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
      rejectReason: enterpriseInfo?.rejectReason,
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

  contacts.value = contactResult.status === 'fulfilled' ? ensureArray<ContactInfo>(contactResult.value) : []
  invoices.value = invoiceResult.status === 'fulfilled' ? ensureArray<InvoiceInfo>(invoiceResult.value) : []
  addresses.value = addressResult.status === 'fulfilled' ? ensureArray<SampleAddress>(addressResult.value) : []
}

function clearEditErrors() {
  editErrors.contactName = ''
  editErrors.contactPhone = ''
  editErrors.enterpriseName = ''
  editErrors.legalPerson = ''
}

function fillEditForm() {
  editForm.address = rawToText(profile.value.address)
  editForm.authorizationLetter = rawToText(profile.value.authorizationLetter)
  editForm.businessLicense = rawToText(profile.value.businessLicense)
  editForm.certExpiry = rawToText(profile.value.certExpiry)
  editForm.certFileUrl = rawToText(profile.value.certFileUrl)
  editForm.certNo = rawToText(profile.value.certNo)
  editForm.certScope = rawToText(profile.value.certScope)
  editForm.contactName = rawToText(profile.value.contactName)
  editForm.contactPhone = rawToText(profile.value.contactPhone)
  editForm.email = rawToText(profile.value.email)
  editForm.enterpriseName = rawToText(profile.value.enterpriseName)
  editForm.enterpriseType = profile.value.enterpriseType === 2 ? 2 : 1
  editForm.introduction = rawToText(profile.value.introduction)
  editForm.legalPerson = rawToText(profile.value.legalPerson)
  editForm.qualification = rawToText(profile.value.qualification)
  editForm.region = rawToText(profile.value.region)
  editForm.registeredCapital = rawToText(profile.value.registeredCapital)
  editForm.serviceRange = rawToText(profile.value.serviceRange)
  editForm.unifiedCreditCode = rawToText(profile.value.unifiedCreditCode || profile.value.creditCode)
  clearEditAttachmentErrors()
  clearEditErrors()
}

function openEditPopup() {
  fillEditForm()
  showEditPopup.value = true
}

function closeEditPopup() {
  if (isSaving.value) {
    return
  }

  showEditPopup.value = false
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

async function saveEnterpriseInfo() {
  if (!validateEditForm()) {
    showFailToast('请先完善必填信息')
    return
  }

  isSaving.value = true

  try {
    const payload = {
      address: toOptionalText(editForm.address),
      authorizationLetter: toOptionalText(editForm.authorizationLetter),
      businessLicense: toOptionalText(editForm.businessLicense),
      certExpiry: toOptionalText(editForm.certExpiry),
      certFileUrl: toOptionalText(editForm.certFileUrl),
      certNo: toOptionalText(editForm.certNo),
      certScope: toOptionalText(editForm.certScope),
      contactName: editForm.contactName.trim(),
      contactPhone: editForm.contactPhone.trim(),
      email: toOptionalText(editForm.email),
      enterpriseName: editForm.enterpriseName.trim(),
      enterpriseType: Number(editForm.enterpriseType || 1),
      introduction: toOptionalText(editForm.introduction),
      legalPerson: editForm.legalPerson.trim(),
      qualification: toOptionalText(editForm.qualification),
      region: toOptionalText(editForm.region),
      registeredCapital: toOptionalText(editForm.registeredCapital),
      serviceRange: toOptionalText(editForm.serviceRange),
      unifiedCreditCode: toOptionalText(editForm.unifiedCreditCode),
    }

    if (enterpriseId.value) {
      await enterpriseService.update(enterpriseId.value, payload)
    } else {
      await enterpriseService.register(payload)
    }

    showSuccessToast('企业信息已更新')
    showEditPopup.value = false
    await loadAll()
  } catch (error) {
    showFailToast(getErrorMessage(error, '企业信息更新失败，请稍后重试'))
  } finally {
    isSaving.value = false
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
  isUploadingLicense.value = true

  try {
    const selected = await chooseImageFile()
    const result = await enterpriseService.uploadLicense(selected.filePath)
    const objectName = rawToText(result.objectName || result.fileKey)

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    editForm.businessLicense = objectName
    editAttachmentErrorMap.businessLicense = false
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
    const objectName = rawToText(result.objectName || result.fileKey)

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    editForm.authorizationLetter = objectName
    editAttachmentErrorMap.authorizationLetter = false
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
    const objectName = rawToText(result.objectName || result.fileKey)

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    editForm.certFileUrl = objectName
    editAttachmentErrorMap.certFileUrl = false
    showSuccessToast('资质文件上传成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '资质文件上传失败，请稍后重试'))
  } finally {
    isUploadingCertFile.value = false
  }
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
</script>

<style scoped lang="scss">
.page-enterprise-info {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-enterprise-info__scroll {
  flex: 1;
  min-height: 0;
}

.page-enterprise-info__content {
  padding: 20rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.enterprise-hero {
  border-radius: 22rpx;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #ecfeff 100%);
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
  gap: 16rpx;
}

.enterprise-hero__left {
  min-width: 0;
  flex: 1;
}

.enterprise-hero__edit-action {
  width: 58rpx;
  height: 58rpx;
  border-radius: 999rpx;
  border: 1rpx solid #bfdbfe;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.enterprise-hero__name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}

.enterprise-hero__status {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #2563eb;
  font-weight: 600;
}

.enterprise-hero__reject {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  line-height: 1.45;
  color: #dc2626;
}

.enterprise-card {
  margin-top: 18rpx;
  border-radius: 20rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
  padding: 20rpx;
}

.enterprise-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12rpx;
}

.enterprise-card__rows {
  display: flex;
  flex-direction: column;
}

.enterprise-card__empty {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

.enterprise-info-row {
  display: flex;
  gap: 16rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.enterprise-info-row:last-child {
  border-bottom: none;
}

.enterprise-info-row__label {
  width: 200rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #64748b;
}

.enterprise-info-row__value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  line-height: 1.45;
  color: #0f172a;
  word-break: break-all;
}

.attachment-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.attachment-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.attachment-item__label {
  font-size: 23rpx;
  color: #475569;
}

.attachment-item__body {
  border-radius: 14rpx;
  border: 1rpx solid #dbeafe;
  background: #f8fbff;
  padding: 10rpx;
}

.attachment-item__image {
  width: 100%;
  height: 180rpx;
  border-radius: 10rpx;
  display: block;
}

.attachment-item__empty {
  height: 180rpx;
  border-radius: 10rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-item__empty-text {
  font-size: 22rpx;
  color: #64748b;
}

.enterprise-link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.enterprise-link-row:last-child {
  border-bottom: none;
}

.enterprise-link-row__title {
  display: block;
  font-size: 26rpx;
  color: #0f172a;
  font-weight: 600;
}

.enterprise-link-row__desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.45;
  color: #64748b;
}

.enterprise-link-row__value {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #1e40af;
}

.edit-popup {
  display: flex;
  flex-direction: column;
  height: 78vh;
}

.edit-popup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx 14rpx;
}

.edit-popup__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.edit-popup__close {
  font-size: 24rpx;
  color: #64748b;
}

.edit-popup__scroll {
  flex: 1;
  min-height: 0;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.edit-popup__form {
  padding-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.edit-type__label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #64748b;
}

.edit-type__chips {
  display: flex;
  gap: 12rpx;
}

.edit-type__chip {
  min-width: 152rpx;
  height: 64rpx;
  border-radius: 12rpx;
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

.edit-upload {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.edit-upload__field {
  flex: 1;
  min-width: 0;
}

.edit-upload__label {
  display: block;
  margin-bottom: 8rpx;
  color: #64748b;
  font-size: 24rpx;
}

.edit-upload__preview {
  border-radius: 14rpx;
  border: 1rpx solid #dbeafe;
  background: #f8fbff;
  padding: 10rpx;
}

.edit-upload__image {
  width: 100%;
  height: 180rpx;
  border-radius: 10rpx;
  display: block;
}

.edit-upload__empty {
  height: 180rpx;
  border-radius: 10rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-upload__empty-text {
  font-size: 22rpx;
  color: #64748b;
}

.edit-popup__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
}

@media (max-width: 360px) {
  .attachment-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .edit-upload {
    flex-direction: column;
  }
}
</style>
