<template>
  <view class="page-report-detail">
    <scroll-view class="page-report-detail__scroll" scroll-y>
      <view v-if="loading && !report" class="state-card">
        <text class="state-card__title">报告详情加载中...</text>
      </view>

      <template v-else-if="report">
        <view class="hero-card card">
          <view class="hero-card__head">
            <text class="hero-card__title">{{ displayText(report.reportName) }}</text>
            <view class="hero-card__tags">
              <text class="tag tag--stage">{{ stageLabel }}</text>
              <text class="tag" :class="report.status === 'valid' ? 'tag--valid' : 'tag--void'">{{ statusLabel }}</text>
            </view>
          </view>
          <text class="hero-card__meta">报告编号：{{ displayText(report.reportNo) }}</text>
          <text class="hero-card__meta">检测机构：{{ displayText(report.institution) }}</text>
        </view>

        <view class="card">
          <text class="section-title">检测结论</text>
          <view class="result-grid">
            <view class="result-item">
              <text class="result-item__label">样品名称</text>
              <text class="result-item__value">{{ displayText(report.sampleName) }}</text>
            </view>
            <view class="result-item">
              <text class="result-item__label">检测结果</text>
              <text class="result-item__value">{{ displayText(report.testResult) }}</text>
            </view>
          </view>
          <view class="conclusion-box">
            <text class="conclusion-box__label">结论</text>
            <text class="conclusion-box__value">{{ displayText(report.conclusion) }}</text>
          </view>
        </view>

        <view class="card">
          <text class="section-title">报告文件</text>
          <view class="file-box" :class="{ 'file-box--active': hasFile }">
            <text class="file-box__name" :class="{ 'file-box__name--active': hasFile }" @tap="handleFileNameTap">
              {{ fileNameText }}
            </text>
            <text class="file-box__tip">{{ hasFile ? '点击文件名可预览/复制文件地址' : '当前无可用文件' }}</text>
          </view>
        </view>

        <view class="card">
          <text class="section-title">报告信息</text>
          <view class="kv-list">
            <view v-for="row in reportInfoRows" :key="row.label" class="kv-row">
              <text class="kv-row__label">{{ row.label }}</text>
              <text class="kv-row__value" :class="{ 'kv-row__value--break': row.break }">{{ row.value }}</text>
            </view>
          </view>
        </view>

        <view class="card">
          <text class="section-title">防伪信息</text>
          <view class="kv-list">
            <view class="kv-row">
              <text class="kv-row__label">防伪码</text>
              <text class="kv-row__value">{{ displayText(report.antiFakeCode) }}</text>
            </view>
            <view class="kv-row">
              <text class="kv-row__label">二维码内容</text>
              <text class="kv-row__value kv-row__value--break">{{ displayText(report.antiFakeQr) }}</text>
            </view>
          </view>
        </view>

        <view class="card">
          <text class="section-title">版本记录</text>
          <view v-if="versionRows.length > 0" class="timeline">
            <view v-for="(item, index) in versionRows" :key="`${item.version}-${item.time}-${index}`" class="timeline-item">
              <view class="timeline-item__dot" />
              <view class="timeline-item__content">
                <text class="timeline-item__title">{{ item.version }} · {{ versionActionLabel(item.action) }}</text>
                <text class="timeline-item__meta">{{ item.time }} · {{ item.actor }}</text>
                <text class="timeline-item__note">{{ item.note }}</text>
              </view>
            </view>
          </view>
          <text v-else class="timeline-empty">暂无版本记录</text>
        </view>
      </template>

      <view v-else class="state-card">
        <text class="state-card__title">未查询到报告详情</text>
        <text class="state-card__desc">请返回订单重试，或稍后刷新页面</text>
      </view>

      <view class="page-report-detail__spacer" />
    </scroll-view>

    <view class="page-report-detail__actions" :class="{ 'page-report-detail__actions--triple': canConfirmReport }">
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        plain
        text="去报告查验"
        type="default"
        @click="goVerify"
      />
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        text="下载报告"
        type="info"
        @click="downloadReport"
      />
      <AppButton
        v-if="canConfirmReport"
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        :loading="confirmingReport"
        text="确认报告"
        type="info"
        @click="confirmReport"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { orderService, reportService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { getReportStageLabel, getReportStatusLabel } from '@/services/api/report'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
import type { ReportRecord, ReportVersionRecord } from '@/types/business'

type ViewerRole = 'demand' | 'service'
const CONFIRM_REPORT_TIMEOUT_MS = 15000

const reportId = ref('')
const orderId = ref('')
const currentUseType = ref<number | null>(null)
const report = ref<ReportRecord | null>(null)
const loading = ref(false)
const confirmingReport = ref(false)
const hasConfirmedReportLocally = ref(false)
const userStore = useUserStore()

onLoad((query) => {
  reportId.value = toText(query?.id)
  orderId.value = toText(query?.orderId)
  currentUseType.value = parseUseType(query?.useType)
  hasConfirmedReportLocally.value = false

  if (!reportId.value && !orderId.value) {
    showFailToast('缺少报告ID，无法查看详情')
    setTimeout(() => {
      uni.navigateBack()
    }, 240)
  }
})

onShow(() => {
  void loadDetail()
})

const hasFile = computed(() => Boolean(report.value?.fileUrl?.trim()))
const fileNameText = computed(() => resolveFileName(report.value?.fileUrl || ''))
const statusLabel = computed(() => getReportStatusLabel(report.value?.status || 'valid'))
const stageLabel = computed(() => getReportStageLabel(report.value?.reportStage))
const versionRows = computed(() => report.value?.versionRecords || [])
const viewerRole = computed<ViewerRole>(() => {
  const resolvedByUseType = resolveViewerRoleByUseType(currentUseType.value ?? userStore.accountType)
  if (resolvedByUseType) {
    return resolvedByUseType
  }

  return userStore.userType === 'enterprise' ? 'service' : 'demand'
})
const canConfirmReport = computed(() => {
  if (hasConfirmedReportLocally.value || viewerRole.value !== 'demand' || !report.value) {
    return false
  }

  if (!resolveConfirmOrderId()) {
    return false
  }

  return report.value.reportStage === 'submitted' || report.value.reportStageCode === 1
})
const reportInfoRows = computed(() => {
  const current = report.value
  if (!current) {
    return []
  }

  return [
    { label: '报告ID', value: displayText(current.id) },
    { label: '流程状态', value: stageLabel.value },
    { label: '流程状态码', value: current.reportStageCode === undefined ? '--' : String(current.reportStageCode) },
    { label: '订单ID', value: displayText(current.orderId) },
    { label: '订单编号', value: displayText(current.orderNo) },
    { label: '需求ID', value: displayText(current.demandId) },
    { label: '机构ID', value: displayText(current.institutionId) },
    { label: '创建时间', value: displayText(current.createdAt) },
    { label: '更新时间', value: displayText(current.updatedAt) },
    { label: '报告文件地址', value: displayText(current.fileUrl), break: true },
    { label: '版本号', value: displayText(current.version) },
  ]
})

async function loadDetail() {
  if (loading.value || (!reportId.value && !orderId.value)) {
    return
  }

  loading.value = true

  try {
    const detail = reportId.value
      ? await reportService.getDetail(reportId.value)
      : await reportService.getByOrderId(orderId.value)

    if (!detail) {
      report.value = null
      return
    }

    report.value = detail
    reportId.value = detail.id || reportId.value
    const stillNeedConfirm = detail.reportStage === 'submitted' || detail.reportStageCode === 1
    if (!stillNeedConfirm) {
      hasConfirmedReportLocally.value = false
    }
  } catch (error) {
    report.value = null
    showFailToast(getErrorMessage(error, '报告详情加载失败'))
  } finally {
    loading.value = false
  }
}

function parseUseType(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return null
}

function resolveViewerRoleByUseType(useType: number | null): ViewerRole | null {
  if (useType === 0 || useType === 1) {
    return 'demand'
  }

  if (useType === 2 || useType === 4) {
    return 'service'
  }

  return null
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

function displayText(value: unknown) {
  const text = toText(value)
  return text || '--'
}

function resolveFileName(filePath: string) {
  const value = filePath.trim()
  if (!value) {
    return '暂未上传报告文件'
  }

  const normalized = value.split('?')[0]
  const segments = normalized.split('/')
  return segments[segments.length - 1] || value
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

function copyText(value: string, successMessage: string) {
  if (!value.trim()) {
    showFailToast('暂无可复制内容')
    return
  }

  uni.setClipboardData({
    data: value,
    fail: () => {
      showFailToast('复制失败，请稍后重试')
    },
    success: () => {
      showSuccessToast(successMessage)
    },
  })
}

function copyFileUrl() {
  const value = report.value?.fileUrl || ''
  copyText(value, '文件地址已复制')
}

async function previewFile() {
  const value = report.value?.fileUrl?.trim() || ''
  if (!value) {
    showFailToast('当前无可预览文件')
    return
  }

  const previewUrl = resolvePreviewUrl(value)
  if (!previewUrl) {
    copyFileUrl()
    showAppToast({ icon: 'none', message: '地址不支持直接预览，已复制链接' })
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
    fail: () => {
      copyFileUrl()
      showFailToast('文件下载失败，已复制文件地址')
    },
    success: (result) => {
      if (result.statusCode >= 400 || !result.tempFilePath) {
        copyFileUrl()
        showFailToast('文件预览失败，已复制文件地址')
        return
      }

      uni.openDocument({
        fail: () => {
          copyFileUrl()
          showFailToast('暂不支持直接打开该文件，已复制文件地址')
        },
        filePath: result.tempFilePath,
      })
    },
    url: previewUrl,
  })
}

function handleFileNameTap() {
  if (!hasFile.value) {
    showFailToast('当前无可预览文件')
    return
  }

  uni.showActionSheet({
    itemList: ['预览文件', '复制文件地址'],
    success: (result) => {
      if (result.tapIndex === 0) {
        void previewFile()
        return
      }

      copyFileUrl()
    },
  })
}

async function downloadReport() {
  const current = report.value
  if (!current?.id) {
    showFailToast('暂无可下载报告')
    return
  }

  try {
    const downloadUrl = await reportService.getDownloadUrl(current.id)

    if (!downloadUrl) {
      showFailToast('未获取到可下载地址')
      return
    }

    copyText(downloadUrl, '下载链接已复制，请在浏览器打开')
  } catch (error) {
    showFailToast(getErrorMessage(error, '下载地址获取失败'))
  }
}

function resolveConfirmOrderId() {
  const fromReport = normalizeOrderIdentifier(report.value?.orderId)
  if (fromReport) {
    return fromReport
  }

  return normalizeOrderIdentifier(orderId.value)
}

function normalizeOrderIdentifier(value: unknown) {
  const normalized = toText(value)
  if (!normalized || normalized === '-' || normalized === '--') {
    return ''
  }

  return normalized
}

function isUserCancelError(error: unknown) {
  if (typeof error === 'string') {
    return /cancel|取消/i.test(error)
  }

  if (!error || typeof error !== 'object') {
    return false
  }

  const source = error as Record<string, unknown>
  if (source.cancel === true || source.confirm === false) {
    return true
  }

  const errMsg = toText(source.errMsg)
  if (errMsg) {
    return /cancel|取消/i.test(errMsg)
  }

  return false
}

async function confirmReport() {
  const confirmOrderId = resolveConfirmOrderId()
  if (!confirmOrderId) {
    showFailToast('缺少订单号，无法确认报告')
    return
  }

  if (confirmingReport.value) {
    return
  }

  const confirmed = await requestConfirmReportAction()
  if (!confirmed) {
    return
  }

  confirmingReport.value = true
  try {
    await withTimeout(
      orderService.confirmReport(confirmOrderId),
      CONFIRM_REPORT_TIMEOUT_MS,
      '确认报告请求超时，请稍后重试',
    )
    hasConfirmedReportLocally.value = true
    showSuccessToast('报告已确认，订单已完成')
    await loadDetail()
  } catch (error) {
    showFailToast(getErrorMessage(error, '报告确认失败，请稍后再试'))
  } finally {
    confirmingReport.value = false
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string) {
  return new Promise<T>((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) {
        return
      }

      settled = true
      reject(new Error(timeoutMessage))
    }, timeoutMs)

    promise
      .then((result) => {
        if (settled) {
          return
        }

        settled = true
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        if (settled) {
          return
        }

        settled = true
        clearTimeout(timer)
        reject(error)
      })
  })
}

async function requestConfirmReportAction() {
  const title = '确认报告'
  const message = '确认后订单将进入已完成状态，并触发放款流程，是否继续？'

  return new Promise<boolean>((resolve) => {
    uni.showModal({
      cancelText: '取消',
      confirmText: '确认完成',
      content: message,
      fail: () => {
        resolve(false)
      },
      success: (result) => {
        resolve(Boolean(result.confirm))
      },
      title,
    })
  })
}

function goVerify() {
  const reportNo = report.value?.reportNo?.trim()
  if (reportNo) {
    uni.navigateTo({ url: `/pages/report/verify?reportNo=${encodeURIComponent(reportNo)}` })
    return
  }

  uni.navigateTo({ url: '/pages/report/verify' })
}

function versionActionLabel(action: ReportVersionRecord['action']) {
  if (action === 'create') {
    return '初次生成'
  }

  if (action === 'reissue') {
    return '重发版本'
  }

  if (action === 'void') {
    return '作废处理'
  }

  return '状态更新'
}
</script>

<style scoped lang="scss">
.page-report-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 12% 0%, rgba(30, 97, 255, 0.14), transparent 42%),
    linear-gradient(180deg, #f4f8ff 0%, #f8fafc 24%, #f8fafc 100%);
}

.page-report-detail__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx 24rpx 0;
  box-sizing: border-box;
}

.card,
.state-card {
  margin-bottom: 16rpx;
  border-radius: 22rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 8rpx 28rpx rgba(15, 23, 42, 0.05);
  padding: 24rpx;
}

.hero-card {
  background:
    linear-gradient(145deg, rgba(30, 97, 255, 0.08), rgba(2, 132, 199, 0.02)),
    #ffffff;
}

.hero-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-card__title {
  flex: 1;
  min-width: 0;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.45;
}

.hero-card__tags {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.tag {
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.tag--stage {
  color: #1d4ed8;
  background: #dbeafe;
}

.tag--valid {
  color: #0f766e;
  background: #ccfbf1;
}

.tag--void {
  color: #be123c;
  background: #ffe4e6;
}

.hero-card__meta {
  display: block;
  margin-top: 10rpx;
  color: #334155;
  font-size: 24rpx;
  line-height: 1.55;
  word-break: break-all;
}

.section-title {
  display: block;
  margin-bottom: 14rpx;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.result-item {
  border-radius: 16rpx;
  border: 1rpx solid #dbeafe;
  background: #f8fbff;
  padding: 16rpx;
}

.result-item__label {
  display: block;
  color: #64748b;
  font-size: 21rpx;
}

.result-item__value {
  display: block;
  margin-top: 6rpx;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}

.conclusion-box {
  margin-top: 12rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  padding: 16rpx;
}

.conclusion-box__label {
  display: block;
  color: #64748b;
  font-size: 21rpx;
}

.conclusion-box__value {
  display: block;
  margin-top: 8rpx;
  color: #1e293b;
  font-size: 24rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.file-box {
  border-radius: 16rpx;
  border: 1rpx dashed #cbd5e1;
  background: #f8fafc;
  padding: 18rpx;
}

.file-box--active {
  border-color: #60a5fa;
  background: #eff6ff;
}

.file-box__name {
  display: block;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.55;
  word-break: break-all;
}

.file-box__name--active {
  color: #1d4ed8;
  font-weight: 600;
}

.file-box__tip {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 21rpx;
}

.kv-list {
  display: grid;
  gap: 10rpx;
}

.kv-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  border-bottom: 1rpx solid #f1f5f9;
  padding-bottom: 10rpx;
}

.kv-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.kv-row__label {
  flex-shrink: 0;
  color: #64748b;
  font-size: 23rpx;
}

.kv-row__value {
  flex: 1;
  min-width: 0;
  color: #1e293b;
  font-size: 23rpx;
  text-align: right;
  line-height: 1.5;
  word-break: break-word;
}

.kv-row__value--break {
  word-break: break-all;
}

.timeline {
  display: grid;
  gap: 10rpx;
}

.timeline-item {
  display: flex;
  gap: 12rpx;
}

.timeline-item__dot {
  width: 14rpx;
  height: 14rpx;
  margin-top: 10rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #1e61ff, #0ea5e9);
  flex-shrink: 0;
}

.timeline-item__content {
  flex: 1;
  min-width: 0;
  border-radius: 14rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  padding: 14rpx;
}

.timeline-item__title {
  display: block;
  color: #0f172a;
  font-size: 23rpx;
  font-weight: 600;
}

.timeline-item__meta {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
}

.timeline-item__note {
  display: block;
  margin-top: 6rpx;
  color: #334155;
  font-size: 22rpx;
  line-height: 1.5;
  word-break: break-word;
}

.timeline-empty {
  display: block;
  color: #94a3b8;
  font-size: 22rpx;
}

.state-card__title {
  display: block;
  color: #0f172a;
  font-size: 29rpx;
  font-weight: 600;
  text-align: center;
}

.state-card__desc {
  display: block;
  margin-top: 10rpx;
  color: #64748b;
  font-size: 22rpx;
  text-align: center;
}

.page-report-detail__spacer {
  height: 38rpx;
}

.page-report-detail__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e2e8f0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
}

.page-report-detail__actions--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
</style>
