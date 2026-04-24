<template>
  <view class="page-sample-manage">
    <scroll-view class="page-sample-manage__scroll" scroll-y>
      <view v-if="orderId" class="page-sample-manage__shipping-card">
        <view class="page-sample-manage__shipping-head">
          <text class="page-sample-manage__shipping-title">寄样提交</text>
          <text class="page-sample-manage__shipping-status">订单状态：{{ currentOrderStatusLabel }}</text>
        </view>

        <text class="page-sample-manage__shipping-desc">
          {{ canSubmitShipping ? '请完善寄样信息，提交后订单将流转至待收样。' : '当前状态不可提交寄样，请等待机构侧处理。' }}
        </text>

        <view v-if="canSubmitShipping" class="page-sample-manage__shipping-form">
          <view class="page-sample-manage__shipping-mode">
            <text
              class="page-sample-manage__shipping-chip"
              :class="{ 'page-sample-manage__shipping-chip--active': shippingDispatchType === 'self' }"
              @tap="shippingDispatchType = 'self'"
            >快递寄样</text>
            <text
              class="page-sample-manage__shipping-chip"
              :class="{ 'page-sample-manage__shipping-chip--active': shippingDispatchType === 'door' }"
              @tap="shippingDispatchType = 'door'"
            >上门取样</text>
          </view>

          <view class="page-sample-manage__shipping-field">
            <text class="page-sample-manage__shipping-label">联系人</text>
            <AppField
              v-model="shippingForm.contactName"
              :border="false"
              :custom-style="shippingFieldStyle"
              placeholder="请输入联系人"
            />
          </view>

          <view class="page-sample-manage__shipping-field">
            <text class="page-sample-manage__shipping-label">联系电话</text>
            <AppField
              v-model="shippingForm.contactPhone"
              :border="false"
              :custom-style="shippingFieldStyle"
              placeholder="请输入联系电话"
            />
          </view>

          <template v-if="shippingDispatchType === 'self'">
            <view class="page-sample-manage__shipping-field">
              <text class="page-sample-manage__shipping-label">快递公司</text>
              <AppField
                v-model="shippingForm.expressCompany"
                :border="false"
                :custom-style="shippingFieldStyle"
                placeholder="请输入快递公司"
              />
            </view>
            <view class="page-sample-manage__shipping-field">
              <text class="page-sample-manage__shipping-label">运单号</text>
              <AppField
                v-model="shippingForm.expressNo"
                :border="false"
                :custom-style="shippingFieldStyle"
                placeholder="请输入运单号"
              />
            </view>
          </template>

          <view v-else class="page-sample-manage__shipping-field">
            <text class="page-sample-manage__shipping-label">上门地址</text>
            <AppField
              v-model="shippingForm.receiveAddress"
              :autosize="{ minHeight: 88 }"
              :border="false"
              :custom-style="shippingTextareaStyle"
              placeholder="请输入上门取样地址"
              type="textarea"
            />
          </view>

          <AppButton
            block
            :loading="shippingSubmitting"
            custom-style="min-height: 72rpx; border-radius: 14rpx;"
            text="确认寄样"
            type="info"
            @click="submitShipping"
          />
        </view>
      </view>

      <view class="page-sample-manage__search">
        <view class="page-sample-manage__search-row">
          <view class="page-sample-manage__search-box">
            <AppIcon class="page-sample-manage__search-icon" color="#94a3b8" name="search" size="18" />
            <AppField
              v-model="keyword"
              class="page-sample-manage__search-input-wrap"
              :border="false"
              custom-style="height: 72rpx; min-height: 72rpx; padding: 0; border: none; background: transparent;"
              placeholder="搜索样品名称 / 样品编号 / 订单号 / 状态"
              @confirm="handleSearch"
            />
          </view>
        </view>
      </view>

      <AppList :finished="!loading" :loading="loading">
        <view v-for="sample in filteredSamples" :key="sample.id" class="sample-card">
          <view class="sample-card__head">
            <view>
              <text class="sample-card__name">{{ sample.sampleName }}</text>
              <text class="sample-card__meta">样品编号：{{ sample.sampleNo }} · 订单：{{ sample.orderId }}</text>
            </view>
            <text class="sample-card__status" :class="`sample-card__status--${sample.currentStatus}`">
              {{ getSampleStatusLabel(sample.currentStatus) }}
            </text>
          </view>

          <view class="sample-card__latest">{{ sample.latestNote }}</view>

          <view class="sample-card__timeline">
            <view v-for="track in sample.tracks" :key="`${track.time}-${track.status}`" class="sample-card__timeline-item">
              <view class="sample-card__dot"></view>
              <view class="sample-card__timeline-content">
                <text class="sample-card__timeline-title">{{ getSampleStatusLabel(track.status) }}</text>
                <text class="sample-card__timeline-note">{{ track.note }}</text>
                <text class="sample-card__timeline-time">{{ track.time }}</text>
              </view>
            </view>
          </view>

          <view class="sample-card__actions">
            <AppButton
              block
              plain
              preset="action"
              size="small"
              text="上报异常"
              type="default"
              @click="reportAbnormal(sample.id)"
            />
            <AppButton
              v-if="shouldShowRetainAction(sample)"
              block
              preset="action"
              size="small"
              :disabled="isRetainActionDisabled(sample)"
              :loading="isRetainSubmitting(sample.id)"
              :text="getRetainActionText(sample)"
              type="info"
              @click="toggleRetain(sample.id)"
            />
          </view>
        </view>
      </AppList>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { orderProgressService, orderService, sampleService } from '@/services/api'
import { getStatusLabel } from '@/services/api/order'
import { getErrorMessage } from '@/services/http'
import { getSampleStatusLabel } from '@/services/api/sample'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { OrderStatus, SampleRecord, SampleStatus } from '@/types/business'

const shippingFieldStyle = 'padding: 16rpx 20rpx; border: 1rpx solid #dbe3ef; border-radius: 12rpx; background: #f8fafc;'
const shippingTextareaStyle = `${shippingFieldStyle} min-height: 120rpx;`

const loading = ref(false)
const samples = ref<SampleRecord[]>([])
const orderId = ref('')
const keyword = ref('')
const shippingSubmitting = ref(false)
const retainSubmittingMap = ref<Record<string, boolean>>({})
const shippingDispatchType = ref<'self' | 'door'>('self')
const currentOrderStatus = ref<OrderStatus | ''>('')
const shippingForm = reactive({
  contactName: '',
  contactPhone: '',
  expressCompany: '',
  expressNo: '',
  receiveAddress: '',
})

interface OrderProgressRecord {
  createTime?: string
  id?: number
  node?: string
  photos?: string
  remark?: string
  updateTime?: string
}

const filteredSamples = computed(() => {
  const key = keyword.value.trim().toLowerCase()

  if (!key) {
    return samples.value
  }

  return samples.value.filter((item) => {
    const status = getSampleStatusLabel(item.currentStatus)
    const text = `${item.sampleName} ${item.sampleNo} ${item.orderId} ${item.latestNote} ${status}`.toLowerCase()
    return text.includes(key)
  })
})

const canSubmitShipping = computed(() => Boolean(orderId.value) && currentOrderStatus.value === 'pending_sample')
const currentOrderStatusLabel = computed(() => currentOrderStatus.value ? getStatusLabel(currentOrderStatus.value) : '-')

onLoad((query) => {
  orderId.value = typeof query?.orderId === 'string' ? query.orderId : ''
})

onShow(() => {
  loadSamples()
})

function toText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function normalizeDateTime(value: unknown) {
  const text = toText(value)
  if (!text) {
    return ''
  }

  return text.replace('T', ' ').slice(0, 19)
}

function mapNodeToSampleStatus(node: string): SampleStatus {
  const normalizedNode = node.toLowerCase()

  if (normalizedNode.includes('异常')) {
    return 'abnormal'
  }

  if (normalizedNode.includes('留样')) {
    return 'retained'
  }

  if (normalizedNode.includes('退样') || normalizedNode.includes('寄回')) {
    return 'returned'
  }

  if (normalizedNode.includes('检测')) {
    return 'testing'
  }

  if (normalizedNode.includes('收样') || normalizedNode.includes('收件')) {
    return 'received'
  }

  if (normalizedNode.includes('寄样') || normalizedNode.includes('发样') || normalizedNode.includes('在途')) {
    return 'in_transit'
  }

  return 'pending_dispatch'
}

function isRetainSubmitting(sampleId: string) {
  return Boolean(retainSubmittingMap.value[sampleId])
}

function isAbnormalOrderScene(sample: SampleRecord) {
  if (orderId.value) {
    return currentOrderStatus.value === 'abnormal'
  }

  return sample.currentStatus === 'abnormal' || sample.currentStatus === 'retained'
}

function shouldShowRetainAction(sample: SampleRecord) {
  if (sample.currentStatus === 'returned') {
    return false
  }

  return isAbnormalOrderScene(sample)
}

function canToggleRetain(sample: SampleRecord) {
  if (!isAbnormalOrderScene(sample)) {
    return false
  }

  if (sample.currentStatus === 'returned') {
    return false
  }

  return sample.currentStatus === 'abnormal' || sample.currentStatus === 'retained'
}

function isRetainActionDisabled(sample: SampleRecord) {
  return isRetainSubmitting(sample.id) || !canToggleRetain(sample)
}

function getRetainActionText(sample: SampleRecord) {
  if (sample.currentStatus === 'returned') {
    return '已登记退样'
  }

  if (sample.currentStatus === 'retained') {
    return '登记退样'
  }

  return '登记留样'
}

function buildSampleFromOrderProgress(records: OrderProgressRecord[], targetOrderId: string): SampleRecord {
  const tracks = records
    .map((item) => {
      const node = toText(item.node) || '进度更新'
      const note = toText(item.remark) || node
      const time = normalizeDateTime(item.createTime ?? item.updateTime) || '-'
      const status = mapNodeToSampleStatus(node)

      return {
        note,
        status,
        time,
      }
    })
    .sort((left, right) => {
      const leftTime = Date.parse(left.time.replace(' ', 'T'))
      const rightTime = Date.parse(right.time.replace(' ', 'T'))

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return 0
      }

      return rightTime - leftTime
    })

  const latestTrack = tracks[0]
  const currentStatus = latestTrack?.status ?? 'pending_dispatch'

  return {
    currentStatus,
    id: `progress-${targetOrderId}`,
    latestNote: latestTrack?.note || '暂无进度更新',
    orderId: targetOrderId,
    retained: currentStatus === 'retained',
    sampleName: '订单样品',
    sampleNo: `PG-${targetOrderId}`,
    tracks,
  }
}

async function loadSamples() {
  loading.value = true

  try {
    if (orderId.value) {
      await loadOrderContext(orderId.value)

      try {
        const progressList = await orderProgressService.getOrderProgressList(orderId.value)

        if (Array.isArray(progressList) && progressList.length > 0) {
          samples.value = [buildSampleFromOrderProgress(progressList as OrderProgressRecord[], orderId.value)]
          return
        }
      } catch {
        // ignore and fallback
      }

      samples.value = await sampleService.getByOrder(orderId.value)
      return
    }

    samples.value = await sampleService.getList()
  } finally {
    loading.value = false
  }
}

async function loadOrderContext(targetOrderId: string) {
  try {
    const detail = await orderService.getDetail(targetOrderId)
    currentOrderStatus.value = detail.status

    if (!shippingForm.contactName.trim()) {
      shippingForm.contactName = detail.buyerContactName || detail.demandUserName || ''
    }

    if (!shippingForm.contactPhone.trim()) {
      shippingForm.contactPhone = detail.buyerContactPhone || detail.demandUserPhone || ''
    }
  } catch {
    currentOrderStatus.value = ''
  }
}

async function submitShipping() {
  const targetOrderId = orderId.value.trim()
  if (!targetOrderId) {
    showFailToast('缺少订单号，无法提交寄样')
    return
  }

  if (!canSubmitShipping.value) {
    showFailToast(`当前订单状态为${currentOrderStatusLabel.value}，不可确认寄样`)
    return
  }

  if (!shippingForm.contactName.trim()) {
    showFailToast('请填写联系人')
    return
  }

  if (!shippingForm.contactPhone.trim()) {
    showFailToast('请填写联系电话')
    return
  }

  if (shippingDispatchType.value === 'self') {
    if (!shippingForm.expressCompany.trim() || !shippingForm.expressNo.trim()) {
      showFailToast('请填写快递公司与运单号')
      return
    }
  } else if (!shippingForm.receiveAddress.trim()) {
    showFailToast('请填写上门取样地址')
    return
  }

  shippingSubmitting.value = true

  try {
    await orderService.confirmEntrust(targetOrderId, {
      contactName: shippingForm.contactName.trim(),
      contactPhone: shippingForm.contactPhone.trim(),
      dispatchType: shippingDispatchType.value,
      expressCompany: shippingDispatchType.value === 'self' ? shippingForm.expressCompany.trim() : undefined,
      expressNo: shippingDispatchType.value === 'self' ? shippingForm.expressNo.trim() : undefined,
      needDoorService: shippingDispatchType.value === 'door',
      needInvoice: false,
      receiveAddress: shippingForm.receiveAddress.trim() || '按快递单地址收样',
    })

    try {
      await orderProgressService.addOrderProgressNode(targetOrderId, {
        node: '样品已寄出',
        remark: shippingDispatchType.value === 'self'
          ? `快递寄样：${shippingForm.expressCompany.trim()} ${shippingForm.expressNo.trim()}`
          : '需求方已提交上门取样地址，待机构取样',
      })
    } catch {
      // ignore progress sync failure
    }

    showSuccessToast('寄样信息已提交')
    await loadSamples()
  } catch (error) {
    showFailToast(getErrorMessage(error, '寄样提交失败，请稍后重试'))
  } finally {
    shippingSubmitting.value = false
  }
}

async function reportAbnormal(sampleId: string) {
  try {
    if (orderId.value) {
      await orderProgressService.addOrderProgressNode(orderId.value, {
        node: '样品异常',
        remark: '需求方上报样品异常，待机构确认处理',
      })
      showSuccessToast('异常已登记')
      await loadSamples()
      return
    }

    await sampleService.reportException(sampleId, '需求方上报样品异常，待机构确认处理')
    showSuccessToast('异常已登记')
    await loadSamples()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '异常登记失败')
  }
}

async function toggleRetain(sampleId: string) {
  const target = samples.value.find((item) => item.id === sampleId)

  if (!target) {
    showFailToast('样品不存在')
    return
  }

  if (!canToggleRetain(target)) {
    if (target.currentStatus === 'returned') {
      showFailToast('样品已登记退样，不可重复操作')
      return
    }

    showFailToast('仅异常订单可登记留样/退样')
    return
  }

  if (isRetainSubmitting(sampleId)) {
    return
  }

  const retained = target.currentStatus !== 'retained'
  retainSubmittingMap.value[sampleId] = true

  try {
    if (orderId.value) {
      await orderProgressService.addOrderProgressNode(orderId.value, {
        node: retained ? '样品已留样' : '样品已退样',
        remark: retained ? '需求方登记留样' : '需求方登记退样',
      })
      showSuccessToast(retained ? '已登记留样' : '已登记退样')
      await loadSamples()
      return
    }

    await sampleService.toggleRetain(sampleId, retained)
    showSuccessToast(retained ? '已登记留样' : '已登记退样')
    await loadSamples()
  } catch (error) {
    showFailToast(error instanceof Error ? error.message : '样品操作失败')
  } finally {
    retainSubmittingMap.value[sampleId] = false
  }
}

function handleSearch() {}
</script>

<style scoped lang="scss">
.page-sample-manage {
  height: 100vh;
  overflow: hidden;
  background: #f8fafc;
}

.page-sample-manage__scroll {
  height: 100%;
  padding: 24rpx;
  box-sizing: border-box;
}

.page-sample-manage__shipping-card {
  margin-bottom: 14rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-sample-manage__shipping-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.page-sample-manage__shipping-title {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.page-sample-manage__shipping-status {
  color: #475569;
  font-size: 22rpx;
}

.page-sample-manage__shipping-desc {
  display: block;
  margin-top: 10rpx;
  color: #64748b;
  font-size: 22rpx;
}

.page-sample-manage__shipping-form {
  margin-top: 16rpx;
}

.page-sample-manage__shipping-mode {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.page-sample-manage__shipping-chip {
  min-height: 54rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dbe3ef;
  border-radius: 999rpx;
  background: #f8fafc;
  color: #475569;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
}

.page-sample-manage__shipping-chip--active {
  border-color: #1e61ff;
  background: #eaf1ff;
  color: #1e61ff;
}

.page-sample-manage__shipping-field {
  margin-bottom: 10rpx;
}

.page-sample-manage__shipping-label {
  display: block;
  margin-bottom: 8rpx;
  color: #334155;
  font-size: 22rpx;
}

.page-sample-manage__search {
  margin-bottom: 14rpx;
}

.page-sample-manage__search-row {
  display: flex;
  align-items: center;
}

.page-sample-manage__search-box {
  flex: 1;
  height: 72rpx;
  min-height: 72rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
}

.page-sample-manage__search-icon {
  flex-shrink: 0;
  margin-right: 10rpx;
}

.page-sample-manage__search-input-wrap {
  flex: 1;
}

:deep(.page-sample-manage__search-input-wrap .van-field__control),
:deep(.page-sample-manage__search-input-wrap .app-field__control) {
  height: 72rpx;
  min-height: 72rpx;
  padding: 0;
  font-size: 24rpx;
  color: #0f172a;
}

:deep(.page-sample-manage__search-input-wrap .app-field) {
  border: none;
  background: transparent;
}

.sample-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.sample-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.sample-card__name {
  display: block;
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 600;
}

.sample-card__meta {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
}

.sample-card__status {
  height: fit-content;
  @include status-chip(20rpx, 999rpx, 6rpx 14rpx);
}

.sample-card__status--pending_dispatch,
.sample-card__status--in_transit {
  background: #fffbeb;
  color: #b45309;
}

.sample-card__status--received,
.sample-card__status--testing {
  background: #eff6ff;
  color: #1d4ed8;
}

.sample-card__status--retained,
.sample-card__status--returned {
  background: #ecfdf5;
  color: #059669;
}

.sample-card__status--abnormal {
  background: #fff1f2;
  color: #e11d48;
}

.sample-card__latest {
  margin-top: 12rpx;
  padding: 14rpx;
  border-radius: 14rpx;
  background: #f8fafc;
  color: #334155;
  font-size: 24rpx;
}

.sample-card__timeline {
  margin-top: 14rpx;
}

.sample-card__timeline-item {
  display: flex;
  gap: 10rpx;
  padding: 8rpx 0;
}

.sample-card__dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 10rpx;
  border-radius: 999rpx;
  background: #1E61FF;
  flex-shrink: 0;
}

.sample-card__timeline-content {
  min-width: 0;
}

.sample-card__timeline-title {
  display: block;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.sample-card__timeline-note {
  display: block;
  color: #475569;
  font-size: 22rpx;
  margin-top: 2rpx;
}

.sample-card__timeline-time {
  display: block;
  color: #94a3b8;
  font-size: 20rpx;
  margin-top: 2rpx;
}

.sample-card__actions {
  margin-top: 14rpx;
  @include service-card-actions(null, 10rpx);
}
</style>
