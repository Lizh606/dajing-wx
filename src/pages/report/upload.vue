<template>
  <view class="page-report-upload">
    <scroll-view class="page-report-upload__scroll" scroll-y>
      <view class="page-report-upload__card">
        <view class="page-report-upload__field">
          <text class="page-report-upload__label">报告编号</text>
          <AppField
            v-model="form.reportNo"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入报告编号"
          />
        </view>

        <view class="page-report-upload__field">
          <text class="page-report-upload__label">报告标题</text>
          <AppField
            v-model="form.title"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入报告标题"
          />
        </view>

        <view class="page-report-upload__field">
          <text class="page-report-upload__label">样品名称</text>
          <AppField
            v-model="form.sampleName"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入样品名称"
          />
        </view>

        <view class="page-report-upload__field">
          <text class="page-report-upload__label">检测结果</text>
          <AppField
            v-model="form.testResult"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="例如：合格/不合格"
          />
        </view>

        <view class="page-report-upload__field">
          <text class="page-report-upload__label">结论</text>
          <AppField
            v-model="form.conclusion"
            :autosize="{ minHeight: 96 }"
            :border="false"
            :custom-style="textareaStyle"
            placeholder="请输入结论说明"
            type="textarea"
          />
        </view>

        <view class="page-report-upload__field page-report-upload__field--last">
          <text class="page-report-upload__label">报告文件</text>
          <view class="page-report-upload__file-shell">
            <text
              class="page-report-upload__file-name"
              :class="{ 'page-report-upload__file-name--active': hasUploadedFile }"
              @tap="handleFileNameTap"
            >{{ uploadedFileDisplayName }}</text>
            <text class="page-report-upload__file-action-tip">{{ hasUploadedFile ? '点击文件名可预览 / 复制 / 清空' : '上传后可点击文件名进行操作' }}</text>
            <AppButton
              :loading="uploadingFile"
              plain
              text="选择并上传文件"
              type="default"
              @click="uploadReportFile"
            />
          </view>
          <text class="page-report-upload__file-tip">仅支持 PDF / Word（.pdf / .doc / .docx），提交报告前必须上传文件。</text>
        </view>
      </view>

      <view class="page-report-upload__actions">
        <AppButton
          block
          :loading="submittingMode === 'draft'"
          plain
          text="保存草稿"
          type="default"
          @click="saveDraft"
        />
        <AppButton
          block
          :loading="submittingMode === 'submit'"
          text="提交报告"
          type="info"
          @click="submitReport"
        />
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { fileService, orderProgressService, orderService, reportService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

const fieldStyle = 'padding: 18rpx 20rpx; border: 1rpx solid #dbe3ef; border-radius: 14rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 132rpx;`
const REPORT_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'] as const
type ReportAllowedExtension = typeof REPORT_ALLOWED_EXTENSIONS[number]

const orderId = ref('')
const reportId = ref('')
const submittingMode = ref<'draft' | 'submit' | ''>('')
const uploadingFile = ref(false)
const uploadedFileName = ref('')

interface ReportDraftCache {
  conclusion: string
  fileUrl: string
  reportId: string
  reportNo: string
  sampleName: string
  savedAt: string
  testResult: string
  title: string
}

const form = reactive({
  conclusion: '',
  fileUrl: '',
  reportNo: '',
  sampleName: '',
  testResult: '',
  title: '',
})

const uploadedFileDisplayName = computed(() => {
  if (uploadedFileName.value.trim()) {
    return uploadedFileName.value.trim()
  }

  const fileValue = form.fileUrl.trim()
  if (!fileValue) {
    return '暂未上传报告文件'
  }

  const normalized = fileValue.split('?')[0]
  const segments = normalized.split('/')
  return segments[segments.length - 1] || fileValue
})
const hasUploadedFile = computed(() => Boolean(form.fileUrl.trim()))

onLoad((query) => {
  const targetOrderId = toText(query?.orderId)

  if (!targetOrderId) {
    showFailToast('缺少订单号，无法上传报告')
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
    return
  }

  orderId.value = targetOrderId
  form.reportNo = buildDefaultReportNo(targetOrderId)
  restoreLocalDraft(targetOrderId)
  void initializeContext(targetOrderId)
})

async function initializeContext(targetOrderId: string) {
  const [orderResult, reportResult] = await Promise.allSettled([
    orderService.getDetail(targetOrderId),
    reportService.getUploadDraftByOrder(targetOrderId),
  ])

  if (orderResult.status === 'fulfilled') {
    const detail = orderResult.value

    if (!form.title.trim()) {
      form.title = `${detail.projectName || '检测项目'}报告`
    }

    if (!form.sampleName.trim()) {
      form.sampleName = detail.projectName || '测试样品'
    }
  }

  if (reportResult.status === 'fulfilled' && reportResult.value) {
    const snapshot = reportResult.value
    applyDraftFields({
      conclusion: snapshot.conclusion,
      fileUrl: snapshot.fileUrl,
      reportId: snapshot.id,
      reportNo: snapshot.reportNo,
      sampleName: snapshot.sampleName,
      savedAt: '',
      testResult: snapshot.testResult,
      title: snapshot.title,
    })

    if (snapshot.status === 0) {
      saveLocalDraft(targetOrderId)
    } else if (snapshot.status === 1 || snapshot.status === 2) {
      clearLocalDraft(targetOrderId)
    }
  }
}

function buildDefaultReportNo(seed: string) {
  const now = new Date()
  const year = `${now.getFullYear()}`
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  const suffix = seed.slice(-4).padStart(4, '0')
  return `REP-${year}${month}${day}-${suffix}`
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

function validateBeforeSubmit(submit: boolean) {
  if (!orderId.value) {
    return '缺少订单号，无法提交'
  }

  if (!form.reportNo.trim()) {
    return '请填写报告编号'
  }

  const currentFileIdentity = uploadedFileName.value.trim() || form.fileUrl.trim()
  if (currentFileIdentity && !isSupportedReportFile(currentFileIdentity)) {
    return '报告仅支持 PDF / Word（.pdf / .doc / .docx）'
  }

  if (!submit) {
    return ''
  }

  if (!form.sampleName.trim()) {
    return '请填写样品名称'
  }

  if (!form.testResult.trim()) {
    return '请填写检测结果'
  }

  if (!form.conclusion.trim()) {
    return '请填写结论'
  }

  if (!form.fileUrl.trim()) {
    return '请先上传报告文件'
  }

  return ''
}

function resolveFileName(filePath: string) {
  const normalized = filePath.split('?')[0]
  const segments = normalized.split('/')
  return segments[segments.length - 1] || '报告文件'
}

function extractFileExtension(fileIdentity: string) {
  const normalized = fileIdentity.split('?')[0].toLowerCase()
  const dotIndex = normalized.lastIndexOf('.')
  if (dotIndex < 0 || dotIndex === normalized.length - 1) {
    return ''
  }

  return normalized.slice(dotIndex + 1)
}

function isSupportedReportFile(fileIdentity: string) {
  const ext = extractFileExtension(fileIdentity)
  if (!ext) {
    return false
  }

  return REPORT_ALLOWED_EXTENSIONS.includes(ext as ReportAllowedExtension)
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

function getDraftStorageKey(targetOrderId: string) {
  return `report_upload_draft_${targetOrderId}`
}

function applyDraftFields(draft: ReportDraftCache) {
  if (draft.reportId) {
    reportId.value = draft.reportId
  }

  if (draft.reportNo) {
    form.reportNo = draft.reportNo
  }

  if (draft.title) {
    form.title = draft.title
  }

  if (draft.sampleName) {
    form.sampleName = draft.sampleName
  }

  if (draft.testResult) {
    form.testResult = draft.testResult
  }

  if (draft.conclusion) {
    form.conclusion = draft.conclusion
  }

  if (draft.fileUrl) {
    form.fileUrl = draft.fileUrl
    uploadedFileName.value = resolveFileName(draft.fileUrl)
  }
}

function restoreLocalDraft(targetOrderId: string) {
  try {
    const raw = uni.getStorageSync(getDraftStorageKey(targetOrderId))
    if (!raw) {
      return
    }

    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (!parsed || typeof parsed !== 'object') {
      return
    }

    const draft: ReportDraftCache = {
      conclusion: toText((parsed as Record<string, unknown>).conclusion),
      fileUrl: toText((parsed as Record<string, unknown>).fileUrl),
      reportId: toText((parsed as Record<string, unknown>).reportId),
      reportNo: toText((parsed as Record<string, unknown>).reportNo),
      sampleName: toText((parsed as Record<string, unknown>).sampleName),
      savedAt: toText((parsed as Record<string, unknown>).savedAt),
      testResult: toText((parsed as Record<string, unknown>).testResult),
      title: toText((parsed as Record<string, unknown>).title),
    }

    applyDraftFields(draft)
  } catch {
    // ignore local draft parse failure
  }
}

function saveLocalDraft(targetOrderId: string) {
  const draft: ReportDraftCache = {
    conclusion: form.conclusion.trim(),
    fileUrl: form.fileUrl.trim(),
    reportId: reportId.value.trim(),
    reportNo: form.reportNo.trim(),
    sampleName: form.sampleName.trim(),
    savedAt: new Date().toISOString(),
    testResult: form.testResult.trim(),
    title: form.title.trim(),
  }

  uni.setStorageSync(getDraftStorageKey(targetOrderId), draft)
}

function clearLocalDraft(targetOrderId: string) {
  uni.removeStorageSync(getDraftStorageKey(targetOrderId))
}

async function chooseReportFile() {
  const uniLike = uni as any

  if (typeof uniLike.chooseMessageFile === 'function') {
    return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
      uniLike.chooseMessageFile({
        count: 1,
        extension: [...REPORT_ALLOWED_EXTENSIONS],
        fail: () => {
          reject(new Error('已取消选择文件'))
        },
        success: (result: any) => {
          const file = Array.isArray(result?.tempFiles) ? result.tempFiles[0] : null
          const filePath = file?.path || file?.tempFilePath
          const fileName = file?.name || (filePath ? resolveFileName(filePath) : '')

          if (!filePath) {
            reject(new Error('未获取到可上传文件'))
            return
          }

          const normalizedFileName = String(fileName || resolveFileName(filePath) || '报告文件')
          if (!isSupportedReportFile(normalizedFileName)) {
            reject(new Error('报告仅支持 PDF / Word（.pdf / .doc / .docx）'))
            return
          }

          resolve({
            fileName: normalizedFileName,
            filePath: String(filePath),
          })
        },
        type: 'file',
      })
    })
  }

  throw new Error('当前端不支持文件选择，请在支持文件上传的端内操作')
}

function shouldIgnoreUploadCancel(error: unknown) {
  const message = getErrorMessage(error, '')
  return message.includes('取消')
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

  return ''
}

function isImageFile(url: string) {
  if (url.startsWith('data:image')) {
    return true
  }

  return /\.(png|jpe?g|gif|bmp|webp|svg)(\?.*)?$/i.test(url)
}

function copyCurrentFileUrl() {
  const fileValue = form.fileUrl.trim()
  if (!fileValue) {
    showFailToast('当前没有可复制的文件地址')
    return
  }

  uni.setClipboardData({
    data: fileValue,
    fail: () => {
      showFailToast('文件地址复制失败，请稍后重试')
    },
    success: () => {
      showSuccessToast('文件地址已复制')
    },
  })
}

function clearCurrentFile() {
  form.fileUrl = ''
  uploadedFileName.value = ''
  if (orderId.value) {
    saveLocalDraft(orderId.value)
  }
  showSuccessToast('已清空当前文件')
}

async function previewCurrentFile() {
  const fileValue = form.fileUrl.trim()
  if (!fileValue) {
    showFailToast('请先上传报告文件')
    return
  }

  const previewUrl = resolvePreviewUrl(fileValue)
  if (!previewUrl) {
    copyCurrentFileUrl()
    showFailToast('当前文件地址暂不支持直接预览，已为你复制')
    return
  }

  if (isImageFile(previewUrl)) {
    uni.previewImage({
      current: previewUrl,
      urls: [previewUrl],
    })
    return
  }

  uni.downloadFile({
    success: (result) => {
      if (result.statusCode >= 400 || !result.tempFilePath) {
        copyCurrentFileUrl()
        showFailToast('文件预览失败，已为你复制地址')
        return
      }

      uni.openDocument({
        filePath: result.tempFilePath,
        fail: () => {
          copyCurrentFileUrl()
          showFailToast('暂不支持直接打开该文件，已为你复制地址')
        },
      })
    },
    fail: () => {
      copyCurrentFileUrl()
      showFailToast('文件下载失败，已为你复制地址')
    },
    url: previewUrl,
  })
}

function handleFileNameTap() {
  if (!hasUploadedFile.value) {
    showFailToast('请先上传报告文件')
    return
  }

  const fileValue = form.fileUrl.trim()
  const previewUrl = resolvePreviewUrl(fileValue)
  const allowPreview = Boolean(previewUrl)
  const options = allowPreview
    ? ['预览文件', '复制文件地址', '清空当前文件']
    : ['复制文件地址', '清空当前文件']

  uni.showActionSheet({
    itemList: options,
    success: (result) => {
      const selected = options[result.tapIndex]
      if (selected === '预览文件') {
        void previewCurrentFile()
        return
      }

      if (selected === '复制文件地址') {
        copyCurrentFileUrl()
        return
      }

      if (selected === '清空当前文件') {
        clearCurrentFile()
      }
    },
  })
}

async function uploadReportFile() {
  if (uploadingFile.value || submittingMode.value) {
    return
  }

  uploadingFile.value = true

  try {
    const selected = await chooseReportFile()
    if (!isSupportedReportFile(selected.fileName)) {
      showFailToast('报告仅支持 PDF / Word（.pdf / .doc / .docx）')
      return
    }

    const uploaded = await fileService.uploadCommon(selected.filePath, { dir: 'report' })
    const filePath = resolveUploadPath(uploaded)

    if (!filePath) {
      throw new Error('上传成功，但未返回文件地址')
    }

    form.fileUrl = filePath
    uploadedFileName.value = selected.fileName || resolveFileName(filePath)
    showSuccessToast('报告文件上传成功')
  } catch (error) {
    if (shouldIgnoreUploadCancel(error)) {
      return
    }

    showFailToast(getErrorMessage(error, '报告文件上传失败，请稍后重试'))
  } finally {
    uploadingFile.value = false
  }
}

async function saveDraft() {
  await submit(false)
}

async function submitReport() {
  await submit(true)
}

async function submit(submitAsFinal: boolean) {
  if (submittingMode.value) {
    return
  }

  const message = validateBeforeSubmit(submitAsFinal)
  if (message) {
    showFailToast(message)
    return
  }

  submittingMode.value = submitAsFinal ? 'submit' : 'draft'

  try {
    const uploadedId = await reportService.uploadReport({
      conclusion: form.conclusion,
      fileUrl: form.fileUrl,
      id: reportId.value || undefined,
      orderId: orderId.value,
      reportNo: form.reportNo,
      sampleName: form.sampleName,
      status: submitAsFinal ? 1 : 0,
      testResult: form.testResult,
      title: form.title,
    })

    if (uploadedId) {
      reportId.value = uploadedId
    }

    if (!submitAsFinal) {
      saveLocalDraft(orderId.value)
      showSuccessToast('报告草稿已保存')
      return
    }

    try {
      await orderProgressService.addOrderProgressNode(orderId.value, {
        node: '报告已提交',
        remark: `报告编号：${form.reportNo.trim()}`,
      })
    } catch {
      // ignore progress sync failure
    }

    showSuccessToast('报告已提交，待需求方确认')
    clearLocalDraft(orderId.value)
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    const fallback = submitAsFinal ? '报告提交失败，请稍后重试' : '草稿保存失败，请稍后重试'
    showFailToast(getErrorMessage(error, fallback))
  } finally {
    submittingMode.value = ''
  }
}
</script>

<style scoped lang="scss">
.page-report-upload {
  min-height: 100vh;
  background: #f8fafc;
}

.page-report-upload__scroll {
  height: 100vh;
  box-sizing: border-box;
  padding: 24rpx;
}

.page-report-upload__card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-report-upload__field {
  margin-bottom: 12rpx;
}

.page-report-upload__field--last {
  margin-bottom: 0;
}

.page-report-upload__label {
  display: block;
  margin-bottom: 8rpx;
  color: #334155;
  font-size: 22rpx;
}

.page-report-upload__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.page-report-upload__file-shell {
  padding: 18rpx 20rpx;
  border: 1rpx solid #dbe3ef;
  border-radius: 14rpx;
  background: #f8fafc;
}

.page-report-upload__file-name {
  display: block;
  margin-bottom: 12rpx;
  color: #334155;
  font-size: 22rpx;
  word-break: break-all;
}

.page-report-upload__file-name--active {
  color: #1d4ed8;
  text-decoration: underline;
}

.page-report-upload__file-action-tip {
  display: block;
  margin-bottom: 12rpx;
  color: #64748b;
  font-size: 20rpx;
}

.page-report-upload__file-tip {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 20rpx;
}
</style>
