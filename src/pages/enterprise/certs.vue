<template>
  <view class="page-enterprise-certs">
    <view class="certs-hero">
      <text class="certs-hero__title">企业资质档案</text>
      <text class="certs-hero__desc">统一管理企业证书信息，支持新增、查看与删除。</text>
      <text class="certs-hero__meta">{{ enterpriseName || '未绑定企业' }}</text>
      <text class="certs-hero__meta-id">企业ID：{{ enterpriseId || '-' }}</text>
    </view>

    <view class="certs-actions">
      <AppButton
        block
        custom-style="min-height: 72rpx;"
        plain
        round
        text="刷新列表"
        type="default"
        @click="loadCerts"
      />
      <AppButton
        block
        custom-style="min-height: 72rpx;"
        round
        text="新增证书"
        type="info"
        @click="openCreatePopup"
      />
    </view>

    <view v-if="pageMessage" class="certs-message">
      <text>{{ pageMessage }}</text>
    </view>

    <AppList :finished="!isLoading" :finished-text="finishedText" :loading="isLoading">
      <view v-for="item in certs" :key="item.id" class="certs-card">
        <view class="certs-card__head">
          <text class="certs-card__name">{{ item.certName }}</text>
          <text class="certs-card__type">{{ item.certType }}</text>
        </view>
        <text class="certs-card__meta">证书编号：{{ item.certNo }}</text>
        <text class="certs-card__meta">有效期：{{ item.expireDate || '-' }}</text>
        <text class="certs-card__meta">{{ item.certFile ? `附件地址：${item.certFile}` : '附件地址：-' }}</text>
        <view class="certs-card__footer">
          <text class="certs-card__status">{{ item.status || '已入档' }}</text>
          <AppButton
            :loading="deletingId === item.id"
            custom-style="min-height: 60rpx; padding: 0 20rpx; border-radius: 14rpx; font-size: 22rpx;"
            plain
            text="删除"
            type="danger"
            @click="confirmDelete(item)"
          />
        </view>
      </view>
    </AppList>

    <AppPopup
      :show="showCreatePopup"
      closeable
      custom-style="padding: 30rpx 24rpx; border-top-left-radius: 30rpx; border-top-right-radius: 30rpx;"
      position="bottom"
      round
      @close="closeCreatePopup"
      @update:show="showCreatePopup = $event"
    >
      <view class="cert-editor">
        <text class="cert-editor__title">新增资质证书</text>
        <view class="cert-editor__form">
          <AppField
            v-model="form.certName"
            :custom-style="fieldStyle"
            :error="fieldErrors.certName"
            label="证书名称"
            placeholder="请输入证书名称"
            @blur="validateField('certName')"
          />
          <AppField
            v-model="form.certNo"
            :custom-style="fieldStyle"
            :error="fieldErrors.certNo"
            label="证书编号"
            placeholder="请输入证书编号"
            @blur="validateField('certNo')"
          />
          <AppField
            v-model="form.certType"
            :custom-style="fieldStyle"
            :error="fieldErrors.certType"
            label="证书类型"
            placeholder="例如：CMA / CNAS / ISO"
            @blur="validateField('certType')"
          />
          <AppField
            v-model="form.expireDate"
            :custom-style="fieldStyle"
            :error="fieldErrors.expireDate"
            label="到期日期"
            placeholder="请输入 YYYY-MM-DD"
            @blur="validateField('expireDate')"
          />
          <AppField
            v-model="form.certFile"
            :custom-style="fieldStyle"
            :error="fieldErrors.certFile"
            label="证书附件地址"
            placeholder="请输入证书附件 URL"
            @blur="validateField('certFile')"
          />
        </view>
        <view class="cert-editor__actions">
          <AppButton
            block
            custom-style="min-height: 76rpx;"
            plain
            round
            text="取消"
            type="default"
            @click="closeCreatePopup"
          />
          <AppButton
            block
            :loading="isSubmitting"
            custom-style="min-height: 76rpx;"
            round
            text="保存证书"
            type="info"
            @click="submitCreate"
          />
        </view>
      </view>
    </AppPopup>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppPopup from '@/components/ui/AppPopup/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { enterpriseService } from '@/services/api'
import { normalizeEnterpriseContext } from '@/services/api/enterprise'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

type AnyRecord = Record<string, any>

interface EnterpriseCertCard {
  certFile: string
  certName: string
  certNo: string
  certType: string
  expireDate: string
  id: string
  status: string
}

interface CertForm {
  certFile: string
  certName: string
  certNo: string
  certType: string
  expireDate: string
}

const userStore = useUserStore()
const enterpriseId = ref('')
const enterpriseName = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const deletingId = ref('')
const pageMessage = ref('')
const showCreatePopup = ref(false)
const certs = ref<EnterpriseCertCard[]>([])
const fieldStyle = 'border-radius: 16rpx; background: #ffffff; border-color: #dbe3ee;'

const form = reactive<CertForm>({
  certFile: '',
  certName: '',
  certNo: '',
  certType: '',
  expireDate: '',
})

const fieldErrors = reactive<Record<keyof CertForm, string>>({
  certFile: '',
  certName: '',
  certNo: '',
  certType: '',
  expireDate: '',
})

const finishedText = computed(() => (certs.value.length > 0 ? '没有更多证书了' : '暂无资质证书'))

onLoad(() => {
  initPage()
})

function isObject(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pickValue(source: unknown, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = source

    for (const key of path) {
      if (!isObject(current) || !(key in current)) {
        current = undefined
        break
      }

      current = current[key]
    }

    if (current !== undefined && current !== null) {
      return current
    }
  }

  return undefined
}

function toText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function extractList(source: unknown): unknown[] {
  if (Array.isArray(source)) {
    return source
  }

  if (!isObject(source)) {
    return []
  }

  const directList = pickValue(source, [['list'], ['records'], ['items'], ['rows'], ['content']])

  if (Array.isArray(directList)) {
    return directList
  }

  const data = source.data

  if (Array.isArray(data)) {
    return data
  }

  if (isObject(data)) {
    const nested = pickValue(data, [['list'], ['records'], ['items'], ['rows'], ['content']])

    if (Array.isArray(nested)) {
      return nested
    }
  }

  return []
}

function normalizeCert(source: unknown, index: number): EnterpriseCertCard {
  return {
    certFile: toText(pickValue(source, [['certFile'], ['certUrl'], ['file'], ['url']])),
    certName: toText(pickValue(source, [['certName'], ['name'], ['certificateName']])) || `证书-${index + 1}`,
    certNo: toText(pickValue(source, [['certNo'], ['certCode'], ['no'], ['certificateNo']])) || '-',
    certType: toText(pickValue(source, [['certType'], ['type'], ['certificateType']])) || '未分类',
    expireDate: toText(pickValue(source, [['expireDate'], ['validTo'], ['expiryDate']])),
    id: toText(pickValue(source, [['certId'], ['id'], ['certificateId']])) || `cert-${index + 1}`,
    status: toText(pickValue(source, [['status'], ['statusText']])),
  }
}

function validateDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

function validateField(field: keyof CertForm) {
  const value = form[field].trim()

  if (!value) {
    fieldErrors[field] = '该字段不能为空'
    return false
  }

  if (field === 'expireDate' && !validateDate(value)) {
    fieldErrors[field] = '请输入有效日期，格式 YYYY-MM-DD'
    return false
  }

  fieldErrors[field] = ''
  return true
}

function validateForm() {
  return (Object.keys(form) as Array<keyof CertForm>).map((field) => validateField(field)).every(Boolean)
}

function resetForm() {
  form.certName = ''
  form.certNo = ''
  form.certType = ''
  form.expireDate = ''
  form.certFile = ''
  fieldErrors.certName = ''
  fieldErrors.certNo = ''
  fieldErrors.certType = ''
  fieldErrors.expireDate = ''
  fieldErrors.certFile = ''
}

function openCreatePopup() {
  if (!enterpriseId.value) {
    showFailToast('当前账号未绑定企业，无法新增证书')
    return
  }

  resetForm()
  showCreatePopup.value = true
}

function closeCreatePopup() {
  showCreatePopup.value = false
}

async function ensureEnterpriseContext() {
  enterpriseId.value = userStore.enterpriseId || ''
  enterpriseName.value = userStore.company || ''

  if (enterpriseId.value) {
    return true
  }

  try {
    const myEnterprise = await enterpriseService.getMy()
    const context = normalizeEnterpriseContext(myEnterprise)

    if (!context?.enterpriseId) {
      return false
    }

    enterpriseId.value = context.enterpriseId
    enterpriseName.value = context.company || enterpriseName.value
    userStore.setEnterpriseContext({
      company: context.company,
      enterpriseId: context.enterpriseId,
      userType: 'enterprise',
    })
    return true
  } catch {
    return false
  }
}

async function initPage() {
  if (!userStore.isLoggedIn) {
    pageMessage.value = '请先登录后查看企业资质档案。'
    showFailToast('请先登录')
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 320)
    return
  }

  const hasEnterprise = await ensureEnterpriseContext()

  if (!hasEnterprise) {
    pageMessage.value = '当前账号暂未绑定企业主体，请先完成企业入驻。'
    return
  }

  pageMessage.value = ''
  await loadCerts()
}

async function loadCerts() {
  if (!enterpriseId.value) {
    return
  }

  isLoading.value = true

  try {
    const response = await enterpriseService.getCertList(enterpriseId.value)
    const records = extractList(response)
    certs.value = records.map((item, index) => normalizeCert(item, index))
  } catch (error) {
    showFailToast(getErrorMessage(error, '资质证书加载失败'))
  } finally {
    isLoading.value = false
  }
}

async function submitCreate() {
  if (!enterpriseId.value) {
    showFailToast('当前账号未绑定企业')
    return
  }

  if (!validateForm()) {
    showFailToast('请先完善证书信息')
    return
  }

  isSubmitting.value = true

  try {
    await enterpriseService.createCert(enterpriseId.value, {
      certFile: form.certFile.trim(),
      certName: form.certName.trim(),
      certNo: form.certNo.trim(),
      certType: form.certType.trim(),
      expireDate: form.expireDate.trim(),
    })
    showSuccessToast('证书新增成功')
    closeCreatePopup()
    await loadCerts()
  } catch (error) {
    showFailToast(getErrorMessage(error, '证书新增失败'))
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(item: EnterpriseCertCard) {
  uni.showModal({
    content: `确定删除证书「${item.certName}」吗？`,
    success: (result) => {
      if (result.confirm) {
        void removeCert(item)
      }
    },
    title: '删除确认',
  })
}

async function removeCert(item: EnterpriseCertCard) {
  if (!enterpriseId.value) {
    return
  }

  deletingId.value = item.id

  try {
    await enterpriseService.deleteCert(enterpriseId.value, item.id)
    showSuccessToast('证书已删除')
    certs.value = certs.value.filter((cert) => cert.id !== item.id)
  } catch (error) {
    showFailToast(getErrorMessage(error, '证书删除失败'))
  } finally {
    deletingId.value = ''
  }
}
</script>

<style scoped lang="scss">
.page-enterprise-certs {
  min-height: 100vh;
  padding: 24rpx;
  background: #f8fafc;
}

.certs-hero {
  padding: 24rpx;
  border: 1rpx solid rgba(191, 219, 254, 0.88);
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.certs-hero__title {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
}

.certs-hero__desc {
  display: block;
  margin-top: 10rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.55;
}

.certs-hero__meta {
  display: block;
  margin-top: 14rpx;
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 600;
}

.certs-hero__meta-id {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
}

.certs-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 16rpx;
}

.certs-message {
  margin-top: 14rpx;
  padding: 18rpx;
  border: 1rpx solid #fde68a;
  border-radius: 16rpx;
  color: #92400e;
  font-size: 22rpx;
  background: #fffbeb;
}

.certs-card {
  margin-top: 14rpx;
  padding: 20rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 18rpx;
  background: #ffffff;
}

.certs-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.certs-card__name {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.certs-card__type {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  color: #1d4ed8;
  font-size: 20rpx;
  background: #dbeafe;
}

.certs-card__meta {
  display: block;
  margin-top: 10rpx;
  color: #475569;
  font-size: 22rpx;
  line-height: 1.5;
  word-break: break-all;
}

.certs-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 14rpx;
}

.certs-card__status {
  color: #059669;
  font-size: 22rpx;
}

.cert-editor__title {
  display: block;
  margin-bottom: 12rpx;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.cert-editor__form {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.cert-editor__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 16rpx;
}
</style>
