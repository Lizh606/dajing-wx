<template>
  <view class="page-order-detail">
    <view class="page-order-detail__header">
      <view class="page-order-detail__header-main">
        <text class="page-order-detail__header-title">订单详情</text>
        <text class="page-order-detail__header-sub">订单编号：{{ order?.orderNo || '-' }}</text>
      </view>
      <text class="page-order-detail__status" :class="`page-order-detail__status--${statusTone}`">
        {{ statusLabel }}
      </text>
    </view>

    <scroll-view class="page-order-detail__scroll" scroll-y>
      <view class="page-order-detail__body">
        <view class="page-order-detail__card">
          <view class="page-order-detail__card-head" @tap="quoteExpanded = !quoteExpanded">
            <view>
              <text class="page-order-detail__card-title page-order-detail__card-title--no-gap">报价单</text>
              <text class="page-order-detail__card-sub">总价：¥{{ quoteTotal }}</text>
            </view>
            <text class="page-order-detail__toggle">{{ quoteExpanded ? '收起' : '展开' }}</text>
          </view>

          <view v-if="quoteExpanded" class="page-order-detail__quote-detail">
            <view
              v-for="item in order?.quoteItems || []"
              :key="item.label"
              class="page-order-detail__quote-row"
            >
              <text class="page-order-detail__quote-label">{{ item.label }}</text>
              <text class="page-order-detail__quote-value">¥{{ item.amount.toLocaleString() }}</text>
            </view>
            <view class="page-order-detail__quote-row page-order-detail__quote-row--total">
              <text class="page-order-detail__quote-label page-order-detail__quote-label--total">合计</text>
              <text class="page-order-detail__quote-value page-order-detail__quote-value--total">¥{{ quoteTotal }}</text>
            </view>
          </view>
        </view>

        <view class="page-order-detail__card">
          <text class="page-order-detail__card-title">寄样信息</text>
          <view class="page-order-detail__sample-list">
            <text class="page-order-detail__sample-item">快递公司：{{ sampleInfo.company }}</text>
            <text class="page-order-detail__sample-item">运单号：{{ sampleInfo.waybillNo }}</text>
            <text class="page-order-detail__sample-item">样品状态：{{ sampleInfo.statusText }}</text>
          </view>
        </view>

        <view class="page-order-detail__card">
          <view class="page-order-detail__card-head" @tap="progressExpanded = !progressExpanded">
            <view>
              <text class="page-order-detail__card-title page-order-detail__card-title--no-gap">检测进度</text>
              <text class="page-order-detail__card-sub">当前状态：{{ currentProgressText }}</text>
            </view>
            <text class="page-order-detail__toggle">{{ progressExpanded ? '收起' : '展开' }}</text>
          </view>

          <view v-if="progressExpanded" class="page-order-detail__timeline">
            <view v-for="item in progressTimeline" :key="item.key" class="page-order-detail__timeline-item">
              <view class="page-order-detail__timeline-dot"></view>
              <view class="page-order-detail__timeline-main">
                <text class="page-order-detail__timeline-title">{{ item.time }} {{ item.title }}</text>
                <text class="page-order-detail__timeline-sub">{{ item.note }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="page-order-detail__card page-order-detail__card--actions">
          <text class="page-order-detail__card-title">快捷操作</text>
          <view class="page-order-detail__actions">
            <AppButton
              block
              plain
              custom-style="min-height: 76rpx; border-radius: 16rpx;"
              text="进入样品管理"
              type="default"
              @click="goSampleManage"
            />
            <AppButton
              block
              :plain="primaryActionPlain"
              custom-style="min-height: 76rpx; border-radius: 16rpx;"
              :text="primaryActionText"
              :type="primaryActionPlain ? 'default' : 'info'"
              @click="handlePrimaryAction"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { orderService } from '@/services/api'
import { getStatusLabel, getStatusTone } from '@/services/api/order'
import { showAppToast } from '@/services/ui/toast'
import type { EntrustOrder, OrderStatus } from '@/types/business'

interface ProgressTimelineItem {
  key: OrderStatus
  note: string
  time: string
  title: string
}

const order = ref<EntrustOrder | null>(null)
const quoteExpanded = ref(false)
const progressExpanded = ref(false)

onLoad(async (query) => {
  const id = typeof query?.id === 'string' ? query.id : ''

  if (!id) {
    return
  }

  order.value = await orderService.getDetail(id)
})

const statusLabel = computed(() => {
  if (!order.value) {
    return '加载中'
  }

  return getStatusLabel(order.value.status)
})

const statusTone = computed(() => {
  if (!order.value) {
    return 'blue'
  }

  return getStatusTone(order.value.status)
})

const quoteTotal = computed(() => order.value?.amount?.toLocaleString?.() || '0')

const sampleInfo = computed(() => {
  if (!order.value) {
    return {
      company: '待分配',
      statusText: '订单数据加载中',
      waybillNo: '-',
    }
  }

  switch (order.value.status) {
    case 'pending_quote':
    case 'pending_payment':
      return {
        company: '待分配',
        statusText: '报价确认后可获取寄样信息',
        waybillNo: '-',
      }
    case 'pending_sample':
      return {
        company: '顺丰速运',
        statusText: '订单已生效，等待寄送样品',
        waybillNo: '待填写',
      }
    case 'sample_received':
      return {
        company: '顺丰速运',
        statusText: '机构已收样并完成受理',
        waybillNo: 'SF1234567890',
      }
    case 'testing':
      return {
        company: '顺丰速运',
        statusText: '样品已签收，实验室检测中',
        waybillNo: 'SF1234567890',
      }
    default:
      return {
        company: '顺丰速运',
        statusText: '检测完成，样品流转已归档',
        waybillNo: 'SF1234567890',
      }
  }
})

const progressTimeline = computed<ProgressTimelineItem[]>(() => {
  const steps: OrderStatus[] = [
    'pending_quote',
    'pending_payment',
    'pending_sample',
    'sample_received',
    'testing',
    'reported',
    'completed',
  ]

  const titleMap: Record<OrderStatus, string> = {
    pending_quote: '已生成订单',
    pending_payment: '已完成报价',
    pending_sample: '待寄送样品',
    sample_received: '机构已收样',
    testing: '检测中',
    reported: '报告已生成',
    completed: '订单已完成',
  }

  const noteMap: Record<OrderStatus, string> = {
    pending_quote: '平台已创建检测委托单',
    pending_payment: '机构已反馈报价，等待支付确认',
    pending_sample: '订单已生效，按指引寄送样品',
    sample_received: '机构已签收样品并完成登记',
    testing: '实验室正在进行检测分析',
    reported: '检测报告已生成并可查看',
    completed: '订单服务闭环，报告归档完成',
  }

  const currentStatus = order.value?.status ?? 'pending_quote'
  const currentIndex = Math.max(steps.indexOf(currentStatus), 0)
  const baseDate = order.value?.createdAt || '2026-04-01'

  return steps.slice(0, currentIndex + 1).map((status, index) => ({
    key: status,
    note: noteMap[status],
    time: buildTimelineTime(baseDate, index),
    title: titleMap[status],
  }))
})

const currentProgressText = computed(() => {
  const latest = progressTimeline.value[progressTimeline.value.length - 1]

  if (!latest) {
    return '进度暂未更新'
  }

  return `${latest.time} ${latest.title}`
})

const primaryActionText = computed(() => {
  if (!order.value) {
    return '联系机构'
  }

  if (order.value.status === 'pending_payment') {
    return '立即支付'
  }

  if (order.value.status === 'pending_sample') {
    return '确认寄样'
  }

  if (order.value.status === 'reported' || order.value.status === 'completed') {
    return '查看报告'
  }

  return '联系机构'
})

const primaryActionPlain = computed(() => {
  if (!order.value) {
    return true
  }

  return !(order.value.status === 'pending_payment'
    || order.value.status === 'pending_sample'
    || order.value.status === 'reported'
    || order.value.status === 'completed')
})

function buildTimelineTime(baseDate: string, offsetDay: number) {
  const timeSlots = ['10:20', '14:10', '09:00', '11:30', '15:40', '17:20', '18:00']
  const parsed = new Date(`${baseDate}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return `${baseDate} ${timeSlots[offsetDay] || '10:00'}`
  }

  parsed.setDate(parsed.getDate() + offsetDay)
  const year = `${parsed.getFullYear()}`
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsed.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${timeSlots[offsetDay] || '10:00'}`
}

function handlePrimaryAction() {
  if (!order.value) {
    return
  }

  if (order.value.status === 'pending_payment') {
    showComingSoon('支付能力建设中')
    return
  }

  if (order.value.status === 'pending_sample') {
    goSampleManage()
    return
  }

  if (order.value.status === 'reported' || order.value.status === 'completed') {
    goReport()
    return
  }

  goConsult()
}

function goSampleManage() {
  if (!order.value) {
    return
  }

  uni.navigateTo({ url: `/pages/sample/manage?orderId=${order.value.id}` })
}

function goReport() {
  if (!order.value?.reportId) {
    showComingSoon('报告正在生成中')
    return
  }

  uni.navigateTo({ url: `/pages/report/detail?id=${order.value.reportId}` })
}

function goConsult() {
  uni.navigateTo({ url: '/pages/institution/consult' })
}

function showComingSoon(message: string) {
  showAppToast({ message, icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-order-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-order-detail__header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.page-order-detail__header-main {
  min-width: 0;
  flex: 1;
}

.page-order-detail__header-title {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
}

.page-order-detail__header-sub {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
}

.page-order-detail__status {
  @include status-chip(20rpx, 10rpx, 6rpx 16rpx);
  flex-shrink: 0;
}

.page-order-detail__status--rose {
  background: #fff1f2;
  color: #be123c;
}

.page-order-detail__status--amber,
.page-order-detail__status--orange {
  background: #fffbeb;
  color: #b45309;
}

.page-order-detail__status--cyan {
  background: #ecfeff;
  color: #0f766e;
}

.page-order-detail__status--blue {
  background: #eff6ff;
  color: #1d4ed8;
}

.page-order-detail__status--violet {
  background: #f5f3ff;
  color: #6d28d9;
}

.page-order-detail__status--green {
  background: #ecfdf5;
  color: #047857;
}

.page-order-detail__scroll {
  flex: 1;
  min-height: 0;
}

.page-order-detail__body {
  padding: 24rpx 24rpx calc(34rpx + env(safe-area-inset-bottom));
}

.page-order-detail__card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.page-order-detail__card--actions {
  margin-bottom: 0;
}

.page-order-detail__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.page-order-detail__card-title {
  display: block;
  margin-bottom: 14rpx;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 600;
}

.page-order-detail__card-title--no-gap {
  margin-bottom: 0;
}

.page-order-detail__card-sub {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
}

.page-order-detail__toggle {
  color: #2563eb;
  font-size: 24rpx;
  line-height: 1.4;
}

.page-order-detail__quote-detail {
  margin-top: 18rpx;
  border-top: 1rpx solid #f1f5f9;
  padding-top: 10rpx;
}

.page-order-detail__quote-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  padding: 8rpx 0;
}

.page-order-detail__quote-row--total {
  margin-top: 4rpx;
  border-top: 1rpx solid #f1f5f9;
  padding-top: 12rpx;
}

.page-order-detail__quote-label {
  color: #64748b;
  font-size: 24rpx;
}

.page-order-detail__quote-label--total {
  color: #0f172a;
  font-weight: 600;
}

.page-order-detail__quote-value {
  color: #1e293b;
  font-size: 24rpx;
}

.page-order-detail__quote-value--total {
  color: #2563eb;
  font-weight: 700;
}

.page-order-detail__sample-list {
  display: grid;
  gap: 12rpx;
}

.page-order-detail__sample-item {
  color: #475569;
  font-size: 23rpx;
}

.page-order-detail__timeline {
  margin-top: 18rpx;
  display: grid;
  gap: 14rpx;
}

.page-order-detail__timeline-item {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.page-order-detail__timeline-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #2563eb;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.page-order-detail__timeline-main {
  min-width: 0;
  flex: 1;
}

.page-order-detail__timeline-title {
  display: block;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.45;
}

.page-order-detail__timeline-sub {
  display: block;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.45;
}

.page-order-detail__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}
</style>
