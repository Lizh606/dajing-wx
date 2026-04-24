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
            <view class="enterprise-hero__edit-action" @tap="goEditPage">
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
          <text class="enterprise-card__title">证照附件</text>
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
                  <text class="attachment-item__empty-text">{{ item.raw ? '附件暂不可预览' : '暂未上传' }}</text>
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

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getApiBaseUrl } from '@/config/api'
import { enterpriseService, profileService } from '@/services/api'
import { showAppToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import type { ContactInfo, InvoiceInfo, SampleAddress } from '@/types/business'

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

const userStore = useUserStore()
const profile = ref<EnterpriseProfile>({})
const contacts = ref<ContactInfo[]>([])
const invoices = ref<InvoiceInfo[]>([])
const addresses = ref<SampleAddress[]>([])
const attachmentErrorMap = reactive<Record<string, boolean>>({
  authorizationLetter: false,
  businessLicense: false,
  certFileUrl: false,
})

const isPersonalAccount = computed(() => userStore.userType === 'personal')
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
  if (isPersonalAccount.value) {
    uni.redirectTo({ url: '/pages/profile/enterprise-edit?mode=auth' })
    return
  }

  void loadAll()
})

onShow(() => {
  if (isPersonalAccount.value) {
    return
  }

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

function handleAttachmentError(key: AttachmentViewItem['key']) {
  attachmentErrorMap[key] = true
}

function previewAttachment(item: AttachmentViewItem) {
  if (!item.previewUrl || item.loadError) {
    showAppToast({ icon: 'none', message: '当前附件暂不可预览，请先更新附件' })
    return
  }

  uni.previewImage({
    current: item.previewUrl,
    urls: [item.previewUrl],
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
    const enterpriseId = rawToText(normalizedContext?.enterpriseId || enterpriseInfo?.enterpriseId || enterpriseInfo?.id)

    if (normalizedContext?.company || enterpriseId) {
      userStore.setEnterpriseContext({
        company: normalizedContext?.company,
        enterpriseId: enterpriseId || undefined,
      })
    }
  } else {
    profile.value = {}
  }

  contacts.value = contactResult.status === 'fulfilled' ? ensureArray<ContactInfo>(contactResult.value) : []
  invoices.value = invoiceResult.status === 'fulfilled' ? ensureArray<InvoiceInfo>(invoiceResult.value) : []
  addresses.value = addressResult.status === 'fulfilled' ? ensureArray<SampleAddress>(addressResult.value) : []
}

function goEditPage() {
  uni.navigateTo({ url: '/pages/profile/enterprise-edit?mode=edit' })
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
  background: linear-gradient(136deg, #dbeafe 0%, #eff6ff 52%, #f0f9ff 100%);
  border: 1rpx solid #bfdbfe;
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.08);
  padding: 24rpx;
}

.enterprise-hero--empty {
  background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
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
}

.enterprise-hero__name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.28;
  word-break: break-all;
}

.enterprise-hero__status {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #1e40af;
}

.enterprise-hero__reject {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #b91c1c;
  line-height: 1.45;
}

.enterprise-hero__edit-action {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(147, 197, 253, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.enterprise-card {
  margin-top: 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 22rpx;
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
  padding: 10rpx 0 4rpx;
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
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
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
  background: #f1f5f9;
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

@media (max-width: 360px) {
  .attachment-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
