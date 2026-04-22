<template>
  <view class="page-service-form">
    <scroll-view class="page-service-form__scroll" scroll-y>
      <view class="page-service-form__section">
        <text class="page-service-form__section-title">基础信息</text>

        <view class="page-service-form__field">
          <text class="page-service-form__label">服务名称 <text class="page-service-form__required">*</text></text>
          <AppField
            v-model="form.serviceName"
            :border="false"
            :custom-style="fieldStyle"
            :maxlength="60"
            placeholder="例如：金属材料拉伸试验"
          />
        </view>

        <view class="page-service-form__field">
          <text class="page-service-form__label">服务分类 <text class="page-service-form__required">*</text></text>
          <AppField
            v-model="form.category"
            :border="false"
            :custom-style="fieldStyle"
            :maxlength="30"
            placeholder="例如：力学性能"
          />
        </view>

        <view class="page-service-form__field-grid">
          <view class="page-service-form__field">
            <text class="page-service-form__label">单价（元）<text class="page-service-form__required">*</text></text>
            <AppField
              v-model="form.price"
              :border="false"
              :custom-style="fieldStyle"
              input-mode="decimal"
              placeholder="请输入价格"
              type="digit"
            />
          </view>

          <view class="page-service-form__field">
            <text class="page-service-form__label">周期（天）<text class="page-service-form__required">*</text></text>
            <AppField
              v-model="form.cycleDays"
              :border="false"
              :custom-style="fieldStyle"
              input-mode="numeric"
              placeholder="请输入天数"
              type="number"
            />
          </view>
        </view>

        <view class="page-service-form__field-grid">
          <view class="page-service-form__field">
            <text class="page-service-form__label">样品类型</text>
            <AppField
              v-model="form.sampleType"
              :border="false"
              :custom-style="fieldStyle"
              :maxlength="30"
              placeholder="例如：金属材料"
            />
          </view>

          <view class="page-service-form__field">
            <text class="page-service-form__label">默认标准</text>
            <AppField
              v-model="form.defaultStd"
              :border="false"
              :custom-style="fieldStyle"
              :maxlength="60"
              placeholder="例如：GB/T 228.1-2021"
            />
          </view>
        </view>
      </view>

      <view class="page-service-form__section">
        <text class="page-service-form__section-title">资质与加急</text>

        <view class="page-service-form__field">
          <text class="page-service-form__label">支持资质</text>
          <view class="page-service-form__chips">
            <view class="chip-switch" :class="{ 'chip-switch--active': form.supportCma === 1 }" @tap="toggleSwitch('supportCma')">CMA</view>
            <view class="chip-switch" :class="{ 'chip-switch--active': form.supportCnas === 1 }" @tap="toggleSwitch('supportCnas')">CNAS</view>
          </view>
        </view>

        <view class="page-service-form__field">
          <text class="page-service-form__label">是否支持加急</text>
          <view class="page-service-form__chips">
            <view class="chip-switch" :class="{ 'chip-switch--active': form.supportUrgent === 1 }" @tap="setUrgent(1)">支持</view>
            <view class="chip-switch" :class="{ 'chip-switch--active': form.supportUrgent === 0 }" @tap="setUrgent(0)">不支持</view>
          </view>
        </view>

        <view class="page-service-form__field">
          <text class="page-service-form__label">加急附加费（元）</text>
          <AppField
            v-model="form.urgentExtraFee"
            :border="false"
            :custom-style="fieldStyle"
            :disabled="form.supportUrgent === 0"
            input-mode="decimal"
            placeholder="支持加急时可填写"
            type="digit"
          />
        </view>
      </view>

      <view class="page-service-form__section">
        <text class="page-service-form__section-title">封面与描述</text>

        <view class="page-service-form__field">
          <text class="page-service-form__label">服务封面</text>
          <view class="cover-uploader" @tap="uploadCover">
            <image v-if="form.coverUrl" class="cover-uploader__image" :src="form.coverUrl" mode="aspectFill" />
            <view v-else class="cover-uploader__placeholder">
              <AppIcon color="#94a3b8" name="plus" size="24" />
              <text class="cover-uploader__placeholder-text">上传封面图</text>
            </view>
          </view>
          <text class="cover-uploader__hint">{{ uploadingCover ? '上传中...' : '建议使用 4:3 比例，提升展示效果' }}</text>
        </view>

        <view class="page-service-form__field">
          <text class="page-service-form__label">服务描述</text>
          <AppField
            v-model="form.description"
            :autosize="{ minHeight: 130 }"
            :border="false"
            :custom-style="textareaStyle"
            :maxlength="300"
            placeholder="可填写检测内容、交付说明、注意事项等"
            type="textarea"
          />
        </view>
      </view>

      <view class="page-service-form__bottom-spacer" />
    </scroll-view>

    <view class="page-service-form__actions">
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 18rpx;"
        plain
        text="取消"
        type="default"
        @click="goBack"
      />
      <AppButton
        block
        :loading="submitting"
        custom-style="min-height: 84rpx; border-radius: 18rpx;"
        :text="submitButtonText"
        type="info"
        @click="handleSubmit"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import * as fileService from '@/services/api/file'
import * as serviceManageService from '@/services/api/serviceManage'
import type { ServiceItemCreatePayload, ServiceStatus } from '@/services/api/serviceManage'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

interface ServiceFormModel {
  category: string
  coverUrl: string
  cycleDays: string
  defaultStd: string
  description: string
  price: string
  sampleType: string
  serviceName: string
  supportCma: 0 | 1
  supportCnas: 0 | 1
  supportUrgent: 0 | 1
  urgentExtraFee: string
}

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e5e7eb; border-radius: 12rpx; background: #ffffff;'
const textareaStyle = `${fieldStyle} min-height: 140rpx;`

const userStore = useUserStore()
const editId = ref('')
const initialStatus = ref<ServiceStatus>(0)
const loadingDetail = ref(false)
const submitting = ref(false)
const uploadingCover = ref(false)

const form = reactive<ServiceFormModel>({
  category: '',
  coverUrl: '',
  cycleDays: '',
  defaultStd: '',
  description: '',
  price: '',
  sampleType: '',
  serviceName: '',
  supportCma: 1,
  supportCnas: 1,
  supportUrgent: 0,
  urgentExtraFee: '',
})

const isEditMode = computed(() => editId.value.length > 0)
const submitButtonText = computed(() => {
  if (submitting.value) {
    return '保存中...'
  }

  return isEditMode.value ? '保存服务' : '保存并返回'
})

onLoad((query) => {
  const id = typeof query?.id === 'string' ? query.id.trim() : ''
  editId.value = id

  if (id) {
    void loadDetail(id)
  }
})

function goBack() {
  uni.navigateBack()
}

function setUrgent(value: 0 | 1) {
  form.supportUrgent = value

  if (value === 0) {
    form.urgentExtraFee = ''
  }
}

function toggleSwitch(key: 'supportCma' | 'supportCnas') {
  form[key] = form[key] === 1 ? 0 : 1
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

function toNumber(value: string) {
  const text = value.trim()

  if (!text) {
    return undefined
  }

  const parsed = Number(text)

  if (!Number.isFinite(parsed)) {
    return undefined
  }

  return parsed
}

function resolveUploadPath(uploaded: fileService.CommonFileUploadResult) {
  const candidates = [uploaded.url, uploaded.objectName, uploaded.fileKey]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return ''
}

async function chooseImageFile() {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      fail: () => reject(new Error('已取消选择图片')),
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const filePath = result.tempFilePaths?.[0]

        if (!filePath) {
          reject(new Error('未获取到可上传图片'))
          return
        }

        const fileName = filePath.split('/').pop() || 'cover.jpg'
        resolve({ fileName, filePath })
      },
    })
  })
}

async function uploadCover() {
  if (uploadingCover.value || submitting.value) {
    return
  }

  uploadingCover.value = true

  try {
    const selected = await chooseImageFile()
    const uploaded = await fileService.uploadCommon(selected.filePath, { dir: 'service' })
    const filePath = resolveUploadPath(uploaded)

    if (!filePath) {
      throw new Error('上传成功，但未返回文件地址')
    }

    form.coverUrl = filePath
    showSuccessToast('封面上传成功')
  } catch (error) {
    showFailToast(getErrorMessage(error, '封面上传失败，请稍后重试'))
  } finally {
    uploadingCover.value = false
  }
}

function validateForm() {
  const serviceName = form.serviceName.trim()
  const category = form.category.trim()
  const price = toNumber(form.price)
  const cycleDays = toNumber(form.cycleDays)

  if (!serviceName) {
    return '请填写服务名称'
  }

  if (!category) {
    return '请填写服务分类'
  }

  if (price === undefined || price <= 0) {
    return '请输入正确的单价（大于0）'
  }

  if (cycleDays === undefined || cycleDays < 1 || !Number.isInteger(cycleDays)) {
    return '请输入正确的周期天数（整数，且大于0）'
  }

  if (form.supportUrgent === 1) {
    const urgentExtraFee = toNumber(form.urgentExtraFee)
    if (urgentExtraFee !== undefined && urgentExtraFee < 0) {
      return '加急附加费不能小于0'
    }
  }

  return ''
}

function buildPayload(): ServiceItemCreatePayload {
  const price = toNumber(form.price) || 0
  const cycleDays = toNumber(form.cycleDays) || 1
  const urgentExtraFee = toNumber(form.urgentExtraFee)

  return {
    category: form.category.trim(),
    coverUrl: form.coverUrl.trim() || undefined,
    cycleDays,
    defaultStd: form.defaultStd.trim() || undefined,
    description: form.description.trim() || undefined,
    price,
    sampleType: form.sampleType.trim() || undefined,
    serviceName: form.serviceName.trim(),
    supportCma: form.supportCma,
    supportCnas: form.supportCnas,
    supportUrgent: form.supportUrgent,
    urgentExtraFee: form.supportUrgent === 1 ? urgentExtraFee : undefined,
  }
}

async function loadDetail(id: string) {
  loadingDetail.value = true

  try {
    const detail = await serviceManageService.getDetail(id)

    form.serviceName = toText(detail.serviceName)
    form.category = toText(detail.category)
    form.price = toText(detail.price)
    form.cycleDays = toText(detail.cycleDays)
    form.sampleType = toText(detail.sampleType)
    form.defaultStd = toText(detail.defaultStd)
    form.description = toText(detail.description)
    form.coverUrl = toText(detail.coverUrl)
    form.supportCma = detail.supportCma === 1 ? 1 : 0
    form.supportCnas = detail.supportCnas === 1 ? 1 : 0
    form.supportUrgent = detail.supportUrgent === 1 ? 1 : 0
    form.urgentExtraFee = toText(detail.urgentExtraFee)
    initialStatus.value = detail.status === 1 || detail.status === 2 ? detail.status : 0
  } catch (error) {
    showFailToast(getErrorMessage(error, '服务详情加载失败'))
  } finally {
    loadingDetail.value = false
  }
}

async function handleSubmit() {
  if (submitting.value || loadingDetail.value) {
    return
  }

  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (userStore.accountType !== 2) {
    showFailToast('当前账号非服务提供方，无法提交服务')
    return
  }

  const validationError = validateForm()
  if (validationError) {
    showFailToast(validationError)
    return
  }

  submitting.value = true

  try {
    const payload = buildPayload()

    if (!isEditMode.value) {
      await serviceManageService.create(payload)
      showSuccessToast('服务已保存，当前为未上架状态')
      setTimeout(() => {
        uni.navigateBack()
      }, 300)
      return
    }

    await serviceManageService.update(editId.value, payload)

    if (initialStatus.value !== 1) {
      await serviceManageService.shelve(editId.value)
      showSuccessToast('服务已保存并自动上架')
      initialStatus.value = 1
    } else {
      showSuccessToast('服务信息已更新')
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (error) {
    showFailToast(getErrorMessage(error, '保存失败，请稍后重试'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-service-form {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $bg-page;
}

.page-service-form__scroll {
  flex: 1;
  min-height: 0;
  padding: 18rpx 24rpx 20rpx;
  box-sizing: border-box;
}

.page-service-form__section {
  margin-top: 14rpx;
  border-radius: 18rpx;
  border: 1rpx solid $border-light;
  background: #ffffff;
  padding: 20rpx 18rpx 14rpx;
}

.page-service-form__section-title {
  display: block;
  color: $text-primary;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.page-service-form__field {
  margin-bottom: 14rpx;
}

.page-service-form__field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.page-service-form__label {
  display: block;
  margin-bottom: 8rpx;
  color: $text-secondary;
  font-size: 22rpx;
}

.page-service-form__required {
  color: #dc2626;
}

.page-service-form__chips {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.chip-switch {
  min-width: 104rpx;
  min-height: 60rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid $border-base;
  background: #ffffff;
  color: $text-secondary;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chip-switch--active {
  border-color: #c7dbff;
  background: #eff6ff;
  color: #1E61FF;
}

.cover-uploader {
  width: 100%;
  height: 220rpx;
  border-radius: 14rpx;
  border: 1rpx dashed #bfdbfe;
  background: #f8fafc;
  overflow: hidden;
}

.cover-uploader__image {
  width: 100%;
  height: 100%;
  display: block;
}

.cover-uploader__placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.cover-uploader__placeholder-text {
  color: #64748b;
  font-size: 22rpx;
}

.cover-uploader__hint {
  display: block;
  margin-top: 8rpx;
  color: $text-muted;
  font-size: 20rpx;
}

.page-service-form__bottom-spacer {
  height: 24rpx;
}

.page-service-form__actions {
  padding: 12rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-light;
  background: #ffffff;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}
</style>
