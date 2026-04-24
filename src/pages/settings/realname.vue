<template>
  <view class="page-realname">
    <scroll-view class="page-realname__scroll" scroll-y>
      <view class="page-realname__content">
        <view class="realname-panel">
          <view class="realname-panel__head">
            <text class="realname-panel__title">实名认证</text>
            <text
              class="realname-status-chip"
              :class="{
                'realname-status-chip--success': realNameStatus === 1,
                'realname-status-chip--warning': realNameStatus === 0,
                'realname-status-chip--danger': realNameStatus === 2,
                'realname-status-chip--muted': realNameStatus === null,
              }"
            >
              {{ realNameStatusText }}
            </text>
          </view>

          <AppForm class="realname-form">
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

            <view class="realname-upload-grid">
              <AppImageUploadCard
                :disabled="Boolean(uploadingSide) && uploadingSide !== 'front'"
                :image-load-error="imageLoadError.front"
                :image-src="idCardFrontPreview"
                :loading="uploadingSide === 'front'"
                label="身份证正面"
                @image-error="handleImageError('front')"
                @tap="uploadIdCard('front')"
              />
              <AppImageUploadCard
                :disabled="Boolean(uploadingSide) && uploadingSide !== 'back'"
                :image-load-error="imageLoadError.back"
                :image-src="idCardBackPreview"
                :loading="uploadingSide === 'back'"
                label="身份证反面"
                @image-error="handleImageError('back')"
                @tap="uploadIdCard('back')"
              />
            </view>

            <AppButton
              :loading="isSubmittingRealName"
              block
              custom-style="min-height: 88rpx; margin-top: 18rpx;"
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
import { accountService } from '@/services/api'
import { getApiBaseUrl } from '@/config/api'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppImageUploadCard from '@/components/ui/AppImageUploadCard/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

type UploadSide = 'front' | 'back'

const fieldStyle = 'border-radius: 20rpx; background: #ffffff; border-color: #e5e7eb;'

const isSubmittingRealName = ref(false)
const isPickingImage = ref(false)
const uploadingSide = ref<UploadSide | ''>('')
const realNameStatus = ref<number | null>(null)

const realNameForm = reactive({
  idCardBack: '',
  idCardFront: '',
  idCardNo: '',
  realName: '',
})
const localPreview = reactive<{ back: string; front: string }>({
  back: '',
  front: '',
})
const imageLoadError = reactive<{ back: boolean; front: boolean }>({
  back: false,
  front: false,
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

const idCardFrontPreview = computed(() => (
  localPreview.front || resolvePreviewUrl(realNameForm.idCardFront)
))
const idCardBackPreview = computed(() => (
  localPreview.back || resolvePreviewUrl(realNameForm.idCardBack)
))

onLoad(() => {
  void loadRealNameStatus()
})

onShow(() => {
  if (isPickingImage.value || Boolean(uploadingSide.value) || isSubmittingRealName.value) {
    return
  }

  void loadRealNameStatus({ preserveLocalCardState: true })
})

function resolveFileName(filePath: string) {
  const segments = filePath.split('/')
  return segments[segments.length - 1] || 'file'
}

function rawToText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function resolveRecordText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = rawToText(record[key])

    if (value) {
      return value
    }
  }

  return ''
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

function handleImageError(side: UploadSide) {
  imageLoadError[side] = true
}

function isImagePickCancelled(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  return message.includes('cancel') || message.includes('取消')
}

interface LoadRealNameStatusOptions {
  preserveLocalCardState?: boolean
}

async function loadRealNameStatus(options: LoadRealNameStatusOptions = {}) {
  const preserveLocalCardState = options.preserveLocalCardState ?? false

  try {
    const realNameInfo = await accountService.getRealNameStatus().catch(() => null)
    const infoRecord = (realNameInfo && typeof realNameInfo === 'object'
      ? realNameInfo as Record<string, unknown>
      : {}) as Record<string, unknown>

    realNameStatus.value = typeof realNameInfo?.realNameStatus === 'number' ? realNameInfo.realNameStatus : null

    if (realNameInfo?.realName && !realNameForm.realName) {
      realNameForm.realName = realNameInfo.realName
    }

    if (realNameInfo?.idCardNo && !realNameForm.idCardNo) {
      realNameForm.idCardNo = realNameInfo.idCardNo
    }

    const idCardFront = resolveRecordText(infoRecord, ['idCardFront', 'idCardFrontUrl', 'frontIdCard', 'frontImage'])
    const idCardBack = resolveRecordText(infoRecord, ['idCardBack', 'idCardBackUrl', 'backIdCard', 'backImage'])

    if (idCardFront && !(preserveLocalCardState && localPreview.front)) {
      realNameForm.idCardFront = idCardFront
    }

    if (idCardBack && !(preserveLocalCardState && localPreview.back)) {
      realNameForm.idCardBack = idCardBack
    }

    if (!preserveLocalCardState) {
      localPreview.front = ''
      localPreview.back = ''
      imageLoadError.front = false
      imageLoadError.back = false
    }
  } catch (error) {
    showFailToast(getErrorMessage(error, '实名信息加载失败'))
  }
}

async function chooseImageFile() {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      fail: (error) => {
        const errorMessage = rawToText((error as { errMsg?: unknown })?.errMsg).toLowerCase()

        if (errorMessage.includes('cancel') || errorMessage.includes('取消')) {
          reject(new Error('已取消选择图片'))
          return
        }

        reject(new Error(rawToText((error as { errMsg?: unknown })?.errMsg) || '选择图片失败'))
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
  if (uploadingSide.value || isPickingImage.value) {
    return
  }

  uploadingSide.value = side

  try {
    isPickingImage.value = true
    const selected = await chooseImageFile()
    isPickingImage.value = false

    const uploaded = await accountService.uploadIdCard(selected.filePath)
    const objectName = uploaded.objectName || uploaded.fileKey

    if (!objectName) {
      throw new Error('上传成功，但未返回 objectName')
    }

    if (side === 'front') {
      realNameForm.idCardFront = objectName
      localPreview.front = selected.filePath
      imageLoadError.front = false
    } else {
      realNameForm.idCardBack = objectName
      localPreview.back = selected.filePath
      imageLoadError.back = false
    }

    showSuccessToast(`${side === 'front' ? '正面' : '反面'}上传成功：${selected.fileName}`)
  } catch (error) {
    if (isImagePickCancelled(error)) {
      return
    }

    showFailToast(getErrorMessage(error, '身份证上传失败'))
  } finally {
    isPickingImage.value = false
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
    await loadRealNameStatus()
    showSuccessToast('实名认证已提交')
  } catch (error) {
    showFailToast(getErrorMessage(error, '实名认证提交失败'))
  } finally {
    isSubmittingRealName.value = false
  }
}
</script>

<style scoped lang="scss">
.page-realname {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f9fafb;
}

.page-realname__scroll {
  flex: 1;
  min-height: 0;
}

.page-realname__content {
  padding: 24rpx;
  box-sizing: border-box;
}

.realname-panel {
  border-radius: 24rpx;
  border: 1rpx solid #e5e7eb;
  background: #ffffff;
  padding: 22rpx;
}

.realname-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.realname-panel__title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.35;
}

.realname-status-chip {
  min-width: 116rpx;
  min-height: 50rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e5e7eb;
  background: #f9fafb;
  text-align: center;
  color: #374151;
  font-size: 20rpx;
  line-height: 50rpx;
  font-weight: 500;
}

.realname-status-chip--success {
  border-color: #a7f3d0;
  background: #ecfdf5;
  color: #047857;
}

.realname-status-chip--warning {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.realname-status-chip--danger {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.realname-status-chip--muted {
  border-color: #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
}

.realname-form {
  margin-top: 16rpx;
  border-top: 1rpx solid #f3f4f6;
  padding-top: 16rpx;
  display: flex;
  flex-direction: column;
}

.realname-upload-grid {
  margin-top: 10rpx;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12rpx;
}
</style>
