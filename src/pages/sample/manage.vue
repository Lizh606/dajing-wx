<template>
  <view class="page-sample-manage">
    <scroll-view class="page-sample-manage__scroll" scroll-y>
      <view class="page-sample-manage__tip">
        <text class="page-sample-manage__tip-title">样品管理</text>
        <text class="page-sample-manage__tip-desc">覆盖样品流转、异常处理、留样/退样全流程，提升履约可视化能力。</text>
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
              block
              preset="action"
              size="small"
              :text="sample.retained ? '登记退样' : '登记留样'"
              type="info"
              @click="toggleRetain(sample.id, !sample.retained)"
            />
          </view>
        </view>
      </AppList>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { orderProgressService, sampleService } from '@/services/api'
import { getSampleStatusLabel } from '@/services/api/sample'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { SampleRecord, SampleStatus } from '@/types/business'

const loading = ref(false)
const samples = ref<SampleRecord[]>([])
const orderId = ref('')
const keyword = ref('')

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

async function toggleRetain(sampleId: string, retained: boolean) {
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

.page-sample-manage__tip {
  margin-bottom: 18rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  border: 1rpx solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
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

.page-sample-manage__tip-title {
  display: block;
  color: #1e3a8a;
  font-size: 30rpx;
  font-weight: 700;
}

.page-sample-manage__tip-desc {
  display: block;
  margin-top: 10rpx;
  color: #1e40af;
  font-size: 24rpx;
  line-height: 1.5;
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
  background: #2563eb;
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
