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
            <AppButton
              block
              plain
              custom-style="min-height: 76rpx; border-radius: 16rpx;"
              text="更多操作"
              type="default"
              @click="handleExtraAction"
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
import { orderProgressService, orderService } from '@/services/api'
import { getStatusLabel, getStatusTone } from '@/services/api/order'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { EntrustOrder, OrderStatus } from '@/types/business'

interface ProgressTimelineItem {
  key: string
  note: string
  time: string
  title: string
}

interface OrderProgressNodeRecord {
  id: string
  node: string
  remark: string
  time: string
}

const order = ref<EntrustOrder | null>(null)
const quoteExpanded = ref(false)
const progressExpanded = ref(false)
const currentOrderId = ref('')
const orderProgressNodes = ref<OrderProgressNodeRecord[]>([])

onLoad(async (query) => {
  const id = typeof query?.id === 'string' ? query.id : ''

  if (!id) {
    return
  }

  currentOrderId.value = id
  try {
    await loadOrder(id)
  } catch (error) {
    showFailToast(getErrorMessage(error, '订单详情加载失败'))
  }
})

async function loadOrder(id: string) {
  const [orderResult, progressResult] = await Promise.allSettled([
    orderService.getDetail(id),
    orderProgressService.getOrderProgressList(id),
  ])

  if (orderResult.status === 'fulfilled') {
    order.value = orderResult.value
  } else {
    throw orderResult.reason
  }

  if (progressResult.status === 'fulfilled') {
    orderProgressNodes.value = normalizeOrderProgressNodes(progressResult.value)
  } else {
    orderProgressNodes.value = []
  }
}

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

function normalizeOrderProgressNodes(raw: unknown) {
  if (!Array.isArray(raw)) {
    return []
  }

  const rows = raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const source = item as Record<string, unknown>
      const time = normalizeDateTime(source.createTime ?? source.updateTime)

      return {
        id: toText(source.id) || `progress-${index + 1}`,
        node: toText(source.node) || '进度更新',
        remark: toText(source.remark) || '无补充说明',
        time: time || '-',
      } satisfies OrderProgressNodeRecord
    })
    .filter((item): item is OrderProgressNodeRecord => Boolean(item))

  return rows.sort((left, right) => {
    const leftTime = Date.parse(left.time.replace(' ', 'T'))
    const rightTime = Date.parse(right.time.replace(' ', 'T'))

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return 0
    }

    return leftTime - rightTime
  })
}

function buildTimelineFromOrderProgressNodes(): ProgressTimelineItem[] {
  return orderProgressNodes.value.map((item) => ({
    key: `progress-${item.id}`,
    note: item.remark,
    time: item.time,
    title: item.node,
  }))
}

const progressTimeline = computed<ProgressTimelineItem[]>(() => {
  const progressFromServer = buildTimelineFromOrderProgressNodes()

  if (progressFromServer.length > 0) {
    return progressFromServer
  }

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

async function handleExtraAction() {
  if (!order.value) {
    return
  }

  const actions = [
    '取消订单',
    '修改委托信息',
    '补录寄样信息',
    '申请退样',
    '确认收样',
    '提交评价',
    '查看评价',
    '删除评价',
  ]

  const selected = await new Promise<number>((resolve) => {
    uni.showActionSheet({
      itemList: actions,
      success: (result) => resolve(result.tapIndex),
      fail: () => resolve(-1),
    })
  })

  if (selected < 0) {
    return
  }

  const orderId = currentOrderId.value || order.value.id

  try {
    if (selected === 0) {
      const reason = '需求方主动取消'
      await orderService.cancelOrder(orderId, reason)
      await appendOrderProgressNode('订单已取消', reason)
      showSuccessToast('订单已取消')
      await loadOrder(orderId)
      return
    }

    if (selected === 1) {
      await orderService.amendEntrust(orderId, {
        remark: '需求方更新了检测要求',
        testProject: order.value.projectName,
        testStandard: order.value.serviceStandard,
      })
      await appendOrderProgressNode('委托信息已修改', '需求方更新了检测要求')
      showSuccessToast('委托信息已更新')
      await loadOrder(orderId)
      return
    }

    if (selected === 2) {
      const expressNo = `BL${Date.now().toString().slice(-8)}`
      await orderService.submitSampleSupplement(orderId, expressNo, '顺丰速运')
      await appendOrderProgressNode('已补录寄样信息', `快递单号：${expressNo}`)
      showSuccessToast('补录寄样成功')
      await loadOrder(orderId)
      return
    }

    if (selected === 3) {
      await orderService.applySampleReturn(orderId, '检测完成后申请退样')
      await appendOrderProgressNode('已申请退样', '检测完成后申请退样')
      showSuccessToast('退样申请已提交')
      await loadOrder(orderId)
      return
    }

    if (selected === 4) {
      await orderService.confirmReceive(orderId, {
        normal: true,
        receiveRemark: '页面快捷确认收样',
      })
      await appendOrderProgressNode('已确认收样', '页面快捷确认收样')
      showSuccessToast('已确认收样')
      await loadOrder(orderId)
      return
    }

    if (selected === 5) {
      await orderService.createEvaluation(orderId, 5, '服务响应及时，沟通顺畅')
      showSuccessToast('评价已提交')
      return
    }

    if (selected === 6) {
      const evaluation = await orderService.getEvaluationByOrder(orderId)
      if (!evaluation) {
        showAppToast({ icon: 'none', message: '暂无评价记录' })
        return
      }

      const evaluationText = JSON.stringify(evaluation).slice(0, 120)
      showAppToast({ icon: 'none', message: `评价详情：${evaluationText}` })
      return
    }

    if (selected === 7) {
      const deleted = await orderService.deleteLatestEvaluation(orderId)
      if (!deleted) {
        showAppToast({ icon: 'none', message: '暂无可删除的评价' })
        return
      }

      showSuccessToast('评价已删除')
    }
  } catch (error) {
    showFailToast(getErrorMessage(error, '操作失败，请稍后再试'))
  }
}

async function appendOrderProgressNode(node: string, remark?: string) {
  const targetOrderId = currentOrderId.value || order.value?.id

  if (!targetOrderId) {
    return
  }

  try {
    await orderProgressService.addOrderProgressNode(targetOrderId, {
      node,
      remark: remark?.trim() || undefined,
    })
  } catch {
    // 忽略进度写入失败，避免影响主流程
  }
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
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
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
  color: #1E61FF;
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
  color: #1E61FF;
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
  background: #1E61FF;
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
