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
              :disabled="secondaryActionDisabled"
              :plain="secondaryActionPlain"
              custom-style="min-height: 76rpx; border-radius: 16rpx;"
              :text="secondaryActionText"
              :type="secondaryActionPlain ? 'default' : 'info'"
              @click="handleSecondaryAction"
            />
            <AppButton
              block
              :disabled="primaryActionDisabled"
              :loading="processingPrimaryAction"
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
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { orderProgressService, orderService, reportService } from '@/services/api'
import { getStatusLabel, getStatusTone } from '@/services/api/order'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'
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

type ViewerRole = 'demand' | 'service'
type ActionKey =
  | 'none'
  | 'manage_sample'
  | 'upload_voucher'
  | 'confirm_payment'
  | 'confirm_receive'
  | 'confirm_report'
  | 'view_report'
  | 'contact_institution'
  | 'contact_demander'
  | 'wait_voucher'
  | 'wait_shipping'
  | 'update_progress'

type UpdateProgressActionKey =
  | 'testing_started'
  | 'testing_running'
  | 'reviewing'
  | 'abnormal'
  | 'report_ready'

interface UpdateProgressActionOption {
  key: UpdateProgressActionKey
  label: string
  node: string
  remark: string
  submitReport?: boolean
}

const updateProgressActionOptions: UpdateProgressActionOption[] = [
  {
    key: 'testing_started',
    label: '记录：开始检测',
    node: '开始检测',
    remark: '机构已安排检测任务，进入执行阶段',
  },
  {
    key: 'testing_running',
    label: '记录：检测进行中',
    node: '检测进行中',
    remark: '实验室正在执行检测流程',
  },
  {
    key: 'reviewing',
    label: '记录：结果复核中',
    node: '结果复核中',
    remark: '检测结果进入复核与校验环节',
  },
  {
    key: 'abnormal',
    label: '记录：检测异常',
    node: '检测异常',
    remark: '检测环节出现异常，待人工处理',
  },
  {
    key: 'report_ready',
    label: '上传并提交报告',
    node: '报告已生成',
    remark: '机构已提交检测报告，订单进入已出报告',
    submitReport: true,
  },
]
const updateProgressActionOptionMap = updateProgressActionOptions.reduce<Record<UpdateProgressActionKey, UpdateProgressActionOption>>(
  (acc, option) => {
    acc[option.key] = option
    return acc
  },
  {} as Record<UpdateProgressActionKey, UpdateProgressActionOption>,
)
const updateProgressLinearActionKeys: UpdateProgressActionKey[] = [
  'testing_started',
  'testing_running',
  'reviewing',
  'report_ready',
]
const CONFIRM_REPORT_TIMEOUT_MS = 15000

const order = ref<EntrustOrder | null>(null)
const quoteExpanded = ref(false)
const progressExpanded = ref(false)
const currentOrderId = ref('')
const currentUseType = ref<number | null>(null)
const orderProgressNodes = ref<OrderProgressNodeRecord[]>([])
const processingPrimaryAction = ref(false)
const processingReportNavigation = ref(false)
const refreshingDetail = ref(false)
const hasLoadedOrderOnce = ref(false)
const hasConfirmedReportLocally = ref(false)
const hasSubmittedOfflineVoucherLocally = ref(false)
const userStore = useUserStore()

onLoad(async (query) => {
  const id = toText(query?.id)
  currentUseType.value = parseUseType(query?.useType) ?? parseUseType(query?.accountType)
  hasConfirmedReportLocally.value = false
  hasSubmittedOfflineVoucherLocally.value = false

  if (!id) {
    return
  }

  currentOrderId.value = id
})

onShow(() => {
  void refreshOrderDetailOnShow()
})

async function loadOrder(id: string) {
  const [orderResult, progressResult] = await Promise.allSettled([
    orderService.getDetail(id),
    orderProgressService.getOrderProgressList(id),
  ])

  if (orderResult.status === 'fulfilled') {
    order.value = orderResult.value
    if (orderResult.value.status !== 'reported') {
      hasConfirmedReportLocally.value = false
    }
    if (
      orderResult.value.status !== 'pending_payment'
      || orderResult.value.offlinePaymentConfirmed
      || Boolean(orderResult.value.offlinePaymentVoucher)
    ) {
      hasSubmittedOfflineVoucherLocally.value = false
    }
  } else {
    throw orderResult.reason
  }

  if (progressResult.status === 'fulfilled') {
    orderProgressNodes.value = normalizeOrderProgressNodes(progressResult.value)
  } else {
    orderProgressNodes.value = []
  }
}

async function refreshOrderDetailOnShow() {
  const id = currentOrderId.value
  if (!id || refreshingDetail.value) {
    return
  }

  refreshingDetail.value = true

  try {
    await loadOrder(id)
    hasLoadedOrderOnce.value = true
  } catch (error) {
    const defaultMessage = hasLoadedOrderOnce.value ? '订单详情刷新失败' : '订单详情加载失败'
    showFailToast(getErrorMessage(error, defaultMessage))
  } finally {
    refreshingDetail.value = false
  }
}

const statusLabel = computed(() => {
  if (!order.value) {
    return '加载中'
  }

  if (order.value.status === 'pending_payment' && hasSubmittedOfflineVoucher.value) {
    return '待确认收款'
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
const hasSubmittedOfflineVoucher = computed(() => {
  return Boolean(
    hasSubmittedOfflineVoucherLocally.value
    || order.value?.offlinePaymentConfirmed
    || order.value?.offlinePaymentVoucher,
  )
})

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
        statusText: hasSubmittedOfflineVoucher.value
          ? '支付凭证已提交，待机构确认收款'
          : '报价确认后可获取寄样信息',
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
        statusText: '样品寄送中，待机构收样',
        waybillNo: 'SF1234567890',
      }
    case 'testing':
      return {
        company: '顺丰速运',
        statusText: '样品已签收，实验室检测中',
        waybillNo: 'SF1234567890',
      }
    case 'cancelled':
      return {
        company: '-',
        statusText: '订单已取消，样品流转已终止',
        waybillNo: '-',
      }
    case 'abnormal':
      return {
        company: '顺丰速运',
        statusText: '订单异常，请联系机构处理',
        waybillNo: '请联系机构确认',
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

  const parseSortTime = (value: string) => {
    const timestamp = Date.parse(value.replace(' ', 'T'))
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
  }

  return rows.sort((left, right) => parseSortTime(right.time) - parseSortTime(left.time))
}

function resolveUpdateProgressActionKeyByNode(node: string): UpdateProgressActionKey | null {
  const normalizedNode = node.trim().replace(/\s+/g, '')
  if (!normalizedNode) {
    return null
  }

  if (normalizedNode.includes('开始检测')) {
    return 'testing_started'
  }

  if (normalizedNode.includes('检测进行中')) {
    return 'testing_running'
  }

  if (normalizedNode.includes('结果复核中')) {
    return 'reviewing'
  }

  if (normalizedNode.includes('检测异常') || normalizedNode.includes('订单异常')) {
    return 'abnormal'
  }

  if (normalizedNode.includes('报告已生成') || normalizedNode.includes('报告已提交')) {
    return 'report_ready'
  }

  return null
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

  const currentStatus = order.value?.status ?? 'pending_quote'
  const baseDate = order.value?.createdAt || '2026-04-01'

  if (currentStatus === 'cancelled') {
    return [{
      key: 'cancelled',
      note: '订单已终止，如有疑问请联系机构',
      time: buildTimelineTime(baseDate, 0),
      title: '订单已取消',
    }]
  }

  if (currentStatus === 'abnormal') {
    return [{
      key: 'abnormal',
      note: '订单进入异常状态，请联系机构处理',
      time: buildTimelineTime(baseDate, 0),
      title: '订单异常',
    }]
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
    sample_received: '样品待收样',
    testing: '检测中',
    reported: '报告已生成',
    cancelled: '订单已取消',
    abnormal: '订单异常',
    completed: '订单已完成',
  }

  const noteMap: Record<OrderStatus, string> = {
    pending_quote: '平台已创建检测委托单',
    pending_payment: hasSubmittedOfflineVoucher.value
      ? '需求方已提交支付凭证，待机构确认收款'
      : '机构已反馈报价，等待支付确认',
    pending_sample: '订单已生效，按指引寄送样品',
    sample_received: '样品已寄出，等待机构签收',
    testing: '实验室正在进行检测分析',
    reported: '检测报告已生成并可查看',
    cancelled: '订单已终止，如有疑问请联系机构',
    abnormal: '订单进入异常状态，请联系机构处理',
    completed: '订单服务闭环，报告归档完成',
  }

  const currentIndex = Math.max(steps.indexOf(currentStatus), 0)

  return steps
    .slice(0, currentIndex + 1)
    .map((status, index) => ({
      key: status,
      note: noteMap[status],
      time: buildTimelineTime(baseDate, index),
      title: titleMap[status],
    }))
    .reverse()
})

const currentProgressText = computed(() => {
  const latest = progressTimeline.value[0]

  if (!latest) {
    return '进度暂未更新'
  }

  return `${latest.time} ${latest.title}`
})

const viewerRole = computed<ViewerRole>(() => {
  const useType = currentUseType.value ?? userStore.accountType
  const resolvedByUseType = resolveViewerRoleByUseType(useType)

  if (resolvedByUseType) {
    return resolvedByUseType
  }

  return userStore.userType === 'enterprise' ? 'service' : 'demand'
})

const completedUpdateProgressActionKeys = computed<Set<UpdateProgressActionKey>>(() => {
  const keys = new Set<UpdateProgressActionKey>()
  for (const item of orderProgressNodes.value) {
    const key = resolveUpdateProgressActionKeyByNode(item.node)
    if (key) {
      keys.add(key)
    }
  }
  return keys
})

const availableUpdateProgressActions = computed<UpdateProgressActionOption[]>(() => {
  const completedKeys = completedUpdateProgressActionKeys.value
  const nextLinearKey = updateProgressLinearActionKeys.find((key) => !completedKeys.has(key))
  if (!nextLinearKey) {
    return []
  }

  const nextLinearAction = updateProgressActionOptionMap[nextLinearKey]
  const options: UpdateProgressActionOption[] = []
  if (nextLinearAction) {
    options.push(nextLinearAction)
  }

  if (!completedKeys.has('abnormal')) {
    const abnormalAction = updateProgressActionOptionMap.abnormal
    if (abnormalAction) {
      options.push(abnormalAction)
    }
  }

  return options
})

const secondaryAction = computed<{ disabled: boolean; key: ActionKey; plain: boolean; text: string }>(() => {
  if (viewerRole.value === 'service') {
    return {
      disabled: false,
      key: 'contact_demander',
      plain: true,
      text: '联系需求方',
    }
  }

  if (order.value?.status === 'reported') {
    return {
      disabled: false,
      key: 'view_report',
      plain: true,
      text: '查看报告',
    }
  }

  if (order.value?.status === 'completed') {
    return {
      disabled: false,
      key: 'contact_institution',
      plain: true,
      text: '联系机构',
    }
  }

  return {
    disabled: false,
    key: 'manage_sample',
    plain: true,
    text: '进入样品管理',
  }
})

const primaryAction = computed<{ disabled: boolean; key: ActionKey; plain: boolean; text: string }>(() => {
  if (!order.value) {
    return {
      disabled: true,
      key: 'none',
      plain: true,
      text: '处理中',
    }
  }

  const status = order.value.status

  if (viewerRole.value === 'service') {
    if (status === 'pending_payment') {
      if (order.value.offlinePaymentVoucher || order.value.offlinePaymentConfirmed) {
        return {
          disabled: false,
          key: 'confirm_payment',
          plain: false,
          text: '确认收款',
        }
      }

      return {
        disabled: true,
        key: 'wait_voucher',
        plain: true,
        text: '待凭证上传',
      }
    }

    if (status === 'pending_sample') {
      return {
        disabled: true,
        key: 'wait_shipping',
        plain: true,
        text: '等待寄样',
      }
    }

    if (status === 'sample_received') {
      return {
        disabled: false,
        key: 'confirm_receive',
        plain: false,
        text: '确认收样',
      }
    }

    if (status === 'testing') {
      const hasAvailableProgressAction = availableUpdateProgressActions.value.length > 0
      return {
        disabled: !hasAvailableProgressAction,
        key: hasAvailableProgressAction ? 'update_progress' : 'none',
        plain: !hasAvailableProgressAction,
        text: hasAvailableProgressAction ? '更新进度' : '无可更新进度',
      }
    }

    if (status === 'reported' || status === 'completed') {
      return {
        disabled: false,
        key: 'view_report',
        plain: false,
        text: '查看报告',
      }
    }

    return {
      disabled: false,
      key: 'contact_demander',
      plain: true,
      text: '联系需求方',
    }
  }

  if (status === 'pending_payment') {
    if (hasSubmittedOfflineVoucher.value) {
      return {
        disabled: true,
        key: 'wait_voucher',
        plain: true,
        text: '待机构确认收款',
      }
    }

    return {
      disabled: false,
      key: 'upload_voucher',
      plain: false,
      text: '确认支付',
    }
  }

  if (status === 'pending_sample') {
    return {
      disabled: false,
      key: 'manage_sample',
      plain: false,
      text: '确认寄样',
    }
  }

  if (status === 'reported') {
    if (hasConfirmedReportLocally.value) {
      return {
        disabled: false,
        key: 'view_report',
        plain: false,
        text: '查看报告',
      }
    }

    return {
      disabled: false,
      key: 'confirm_report',
      plain: false,
      text: '确认报告',
    }
  }

  if (status === 'completed') {
    return {
      disabled: false,
      key: 'view_report',
      plain: false,
      text: '查看报告',
    }
  }

  return {
    disabled: false,
    key: 'contact_institution',
    plain: true,
    text: '联系机构',
  }
})

const secondaryActionText = computed(() => secondaryAction.value.text)
const secondaryActionPlain = computed(() => secondaryAction.value.plain)
const secondaryActionDisabled = computed(() => secondaryAction.value.disabled)
const primaryActionText = computed(() => primaryAction.value.text)
const primaryActionPlain = computed(() => primaryAction.value.plain)
const primaryActionDisabled = computed(() => primaryAction.value.disabled || processingPrimaryAction.value)

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

async function handlePrimaryAction() {
  if (primaryActionDisabled.value || !order.value) {
    return
  }

  const orderId = currentOrderId.value || order.value.id
  const actionKey = primaryAction.value.key

  if (
    actionKey === 'upload_voucher'
    || actionKey === 'confirm_payment'
    || actionKey === 'confirm_receive'
    || actionKey === 'update_progress'
  ) {
    processingPrimaryAction.value = true
  }

  try {
    if (actionKey === 'upload_voucher') {
      await orderService.submitOfflinePaymentVoucher(orderId, orderService.DEFAULT_OFFLINE_VOUCHER_URL)
      hasSubmittedOfflineVoucherLocally.value = true
      showSuccessToast('凭证已提交，待机构确认收款')
      await loadOrder(orderId)
      return
    }

    if (actionKey === 'confirm_payment') {
      await orderService.confirmOfflinePayment(orderId)
      await appendOrderProgressNode('机构已确认收款', '订单进入待寄样阶段')
      showSuccessToast('收款已确认，订单已进入待寄样')
      await loadOrder(orderId)
      return
    }

    if (actionKey === 'confirm_receive') {
      await orderService.confirmReceive(orderId, { normal: true })
      await appendOrderProgressNode('机构已确认收样', '订单进入检测阶段')
      showSuccessToast('已确认收样，订单进入检测中')
      await loadOrder(orderId)
      return
    }

    if (actionKey === 'confirm_report') {
      const confirmed = await requestConfirmReportAction()
      if (!confirmed) {
        return
      }

      processingPrimaryAction.value = true
      await withTimeout(
        orderService.confirmReport(orderId),
        CONFIRM_REPORT_TIMEOUT_MS,
        '确认报告请求超时，请稍后重试',
      )
      hasConfirmedReportLocally.value = true
      await appendOrderProgressNode('需求方已确认报告', '订单已完成，进入放款流程')
      showSuccessToast('报告已确认，订单已完成')
      await loadOrder(orderId)
      return
    }

    if (actionKey === 'manage_sample') {
      goSampleManage()
      return
    }

    if (actionKey === 'view_report') {
      await goReport()
      return
    }

    if (actionKey === 'update_progress') {
      await handleUpdateProgress(orderId)
      return
    }

    if (actionKey === 'contact_demander') {
      goDemandContact()
      return
    }

    goConsult()
  } catch (error) {
    if (actionKey === 'upload_voucher') {
      showFailToast(getErrorMessage(error, '凭证提交失败，请稍后再试'))
      return
    }

    if (actionKey === 'confirm_payment') {
      showFailToast(getErrorMessage(error, '收款确认失败，请稍后再试'))
      return
    }

    if (actionKey === 'confirm_receive') {
      showFailToast(getErrorMessage(error, '收样确认失败，请稍后再试'))
      return
    }

    if (actionKey === 'confirm_report') {
      if (isUserCancelError(error)) {
        return
      }

      showFailToast(getErrorMessage(error, '报告确认失败，请稍后再试'))
      return
    }

    if (actionKey === 'update_progress') {
      showFailToast(getErrorMessage(error, '进度更新失败，请稍后再试'))
      return
    }

    showFailToast(getErrorMessage(error, '操作失败，请稍后再试'))
  } finally {
    processingPrimaryAction.value = false
  }
}

function handleSecondaryAction() {
  const actionKey = secondaryAction.value.key

  if (actionKey === 'manage_sample') {
    goSampleManage()
    return
  }

  if (actionKey === 'view_report') {
    void goReport()
    return
  }

  if (actionKey === 'contact_institution') {
    goConsult()
    return
  }

  if (actionKey === 'contact_demander') {
    goDemandContact()
  }
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

function selectUpdateProgressAction(options: UpdateProgressActionOption[]) {
  if (options.length === 0) {
    return Promise.resolve<UpdateProgressActionOption | null>(null)
  }

  if (options.length === 1) {
    return Promise.resolve(options[0] || null)
  }

  return new Promise<UpdateProgressActionOption | null>((resolve) => {
    uni.showActionSheet({
      itemList: options.map((item) => item.label),
      success: (res) => {
        resolve(options[res.tapIndex] || null)
      },
      fail: () => {
        resolve(null)
      },
    })
  })
}

async function handleUpdateProgress(orderId: string) {
  const options = availableUpdateProgressActions.value
  if (options.length === 0) {
    showAppToast({ message: '当前阶段暂无可更新进度', icon: 'none' })
    return
  }

  const selected = await selectUpdateProgressAction(options)
  if (!selected) {
    return
  }

  const stillAvailable = availableUpdateProgressActions.value.some((item) => item.key === selected.key)
  if (!stillAvailable) {
    showAppToast({ message: '进度已更新，请刷新后重试', icon: 'none' })
    await loadOrder(orderId)
    return
  }

  if (selected.submitReport) {
    goReportUpload(orderId)
    return
  }

  await appendOrderProgressNode(selected.node, selected.remark, false)
  showSuccessToast('进度节点已更新')
  await loadOrder(orderId)
}

async function appendOrderProgressNode(node: string, remark?: string, ignoreError = true) {
  const targetOrderId = currentOrderId.value || order.value?.id

  if (!targetOrderId) {
    return
  }

  try {
    await orderProgressService.addOrderProgressNode(targetOrderId, {
      node,
      remark: remark?.trim() || undefined,
    })
  } catch (error) {
    if (ignoreError) {
      return
    }

    throw error
  }
}

function goSampleManage() {
  if (!order.value) {
    return
  }

  uni.navigateTo({ url: `/pages/sample/manage?orderId=${order.value.id}` })
}

function goReportUpload(orderId: string) {
  const targetId = orderId.trim()
  if (!targetId) {
    showFailToast('缺少订单号，无法上传报告')
    return
  }

  uni.navigateTo({ url: `/pages/report/upload?orderId=${encodeURIComponent(targetId)}` })
}

function goDemandContact() {
  if (!order.value) {
    return
  }

  const phone = order.value.buyerContactPhone || order.value.demandUserPhone || ''

  if (!phone) {
    showAppToast({ icon: 'none', message: '需求方联系方式暂缺' })
    return
  }

  uni.makePhoneCall({
    fail: () => {
      uni.setClipboardData({
        data: phone,
        success: () => {
          showSuccessToast('已复制需求方手机号')
        },
      })
    },
    phoneNumber: phone,
  })
}

async function goReport() {
  if (!order.value) {
    return
  }

  let reportId = order.value.reportId

  if (!reportId) {
    if (processingReportNavigation.value) {
      return
    }

    processingReportNavigation.value = true
    try {
      const report = await reportService.getByOrderId(order.value.id)
      reportId = report?.id

      if (reportId && order.value) {
        order.value = {
          ...order.value,
          canDownloadReport: true,
          reportId,
        }
      }
    } catch {
      // 保持静默，按无报告处理
    } finally {
      processingReportNavigation.value = false
    }
  }

  if (!reportId) {
    showComingSoon('报告正在生成中')
    return
  }

  const queryParts = [
    `id=${encodeURIComponent(reportId)}`,
    `orderId=${encodeURIComponent(order.value.id)}`,
  ]
  const useType = currentUseType.value ?? userStore.accountType
  if (typeof useType === 'number' && Number.isFinite(useType)) {
    queryParts.push(`useType=${encodeURIComponent(String(useType))}`)
  }

  uni.navigateTo({ url: `/pages/report/detail?${queryParts.join('&')}` })
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

.page-order-detail__status--slate {
  background: #f1f5f9;
  color: #475569;
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
