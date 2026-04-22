<template>
  <view class="page-order-create">
    <scroll-view class="page-order-create__scroll" scroll-y>
      <view class="page-order-create__body">
        <view class="page-order-create__hero">
          <text class="page-order-create__hero-tag">服务下单</text>
          <text class="page-order-create__hero-title">{{ selectedPlan.serviceName }}</text>
          <view class="page-order-create__hero-meta">
            <text class="page-order-create__hero-meta-item">{{ selectedPlan.institution }}</text>
            <text class="page-order-create__hero-meta-dot">·</text>
            <text class="page-order-create__hero-meta-item">{{ selectedPlan.finishTime }}</text>
          </view>
        </view>

        <view class="page-order-create__section page-order-create__section--highlight">
          <text class="page-order-create__section-title">下单信息</text>
          <view class="summary-row">
            <text class="summary-row__label">机构名称</text>
            <text class="summary-row__value">{{ selectedPlan.institution }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-row__label">服务项目</text>
            <text class="summary-row__value">{{ selectedPlan.serviceName }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-row__label">服务类别</text>
            <text class="summary-row__value">{{ selectedPlan.category }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-row__label">样品类型</text>
            <text class="summary-row__value">{{ selectedPlan.sampleType }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-row__label">预计完成时间</text>
            <text class="summary-row__value">{{ selectedPlan.finishTime }}</text>
          </view>
          <view class="summary-row summary-row--last">
            <text class="summary-row__label">检测标准</text>
            <text class="summary-row__value">{{ selectedPlan.standard }}</text>
          </view>
        </view>

        <view class="page-order-create__section">
          <view class="page-order-create__quote-head" @tap="quoteExpanded = !quoteExpanded">
            <text class="page-order-create__section-title page-order-create__section-title--no-gap">预计费用</text>
            <view class="page-order-create__quote-right">
              <text class="summary-row__value--price">{{ displayPrice }}</text>
              <text class="page-order-create__quote-toggle">{{ quoteExpanded ? '⌃' : '⌄' }}</text>
            </view>
          </view>

          <view v-if="quoteExpanded" class="page-order-create__quote-detail">
            <template v-if="quoteRows.length > 0">
              <view
                v-for="item in quoteRows"
                :key="item.label"
                class="page-order-create__quote-row"
              >
                <text class="page-order-create__quote-label">{{ item.label }}</text>
                <text class="page-order-create__quote-value">{{ formatAmount(item.amount) }}</text>
              </view>
              <view class="page-order-create__quote-row page-order-create__quote-row--total">
                <text class="page-order-create__quote-label">预估总计</text>
                <text class="page-order-create__quote-value">{{ formatAmount(quoteTotal) }}</text>
              </view>
            </template>
            <view v-else class="page-order-create__quote-row">
              <text class="page-order-create__quote-label">预估金额</text>
              <text class="page-order-create__quote-value">待确认</text>
            </view>
          </view>
        </view>

        <view class="page-order-create__section">
          <text class="page-order-create__section-title">补充信息</text>
          <AppForm>
            <view class="page-order-create__field">
              <text class="page-order-create__label">联系人</text>
              <AppField v-model="form.contactName" :border="false" :custom-style="fieldStyle" placeholder="请输入联系人" />
            </view>

            <view class="page-order-create__field">
              <text class="page-order-create__label">寄样方式</text>
              <view class="page-order-create__chips">
                <text
                  v-for="option in dispatchOptions"
                  :key="option"
                  :class="['page-order-create__chip', form.dispatchType === option ? 'page-order-create__chip--active' : '']"
                  @tap="form.dispatchType = option"
                >{{ option }}</text>
              </view>
            </view>

            <view class="page-order-create__field">
              <text class="page-order-create__label">联系电话</text>
              <AppField v-model="form.contactPhone" :border="false" :custom-style="fieldStyle" placeholder="请输入联系电话" />
            </view>

            <view v-if="form.dispatchType === '快递寄样'" class="page-order-create__field">
              <text class="page-order-create__label">快递公司</text>
              <AppField v-model="form.expressCompany" :border="false" :custom-style="fieldStyle" placeholder="请输入快递公司" />
            </view>

            <view v-if="form.dispatchType === '快递寄样'" class="page-order-create__field">
              <text class="page-order-create__label">运单号</text>
              <AppField v-model="form.expressNo" :border="false" :custom-style="fieldStyle" placeholder="请输入运单号" />
            </view>

            <view class="page-order-create__field">
              <text class="page-order-create__label">收样地址</text>
              <AppField
                v-model="form.receiveAddress"
                :autosize="{ minHeight: 90 }"
                :border="false"
                :custom-style="textareaStyle"
                placeholder="请输入收样地址"
                type="textarea"
              />
            </view>

            <view class="page-order-create__switches">
              <view class="page-order-create__switch-item">
                <text class="page-order-create__switch-label">是否开票</text>
                <AppSwitch v-model="form.needInvoice" />
              </view>
              <view class="page-order-create__switch-item">
                <text class="page-order-create__switch-label">是否需要上门</text>
                <AppSwitch v-model="form.needDoorService" />
              </view>
            </view>
          </AppForm>
        </view>

        <view class="page-order-create__section page-order-create__section--confirm">
          <text class="page-order-create__section-title">确认提交</text>
          <view class="agreement-row" @tap="agreeService = !agreeService">
            <AppSwitch :model-value="agreeService" />
            <text class="agreement-row__text">我已阅读并同意《检测服务协议》</text>
          </view>
          <view class="agreement-row" @tap="agreeSecret = !agreeSecret">
            <AppSwitch :model-value="agreeSecret" />
            <text class="agreement-row__text">我已阅读并同意《保密协议》</text>
          </view>

          <view class="page-order-create__actions">
            <AppButton
              block
              plain
              custom-style="min-height: 84rpx; border-radius: 18rpx;"
              text="取消"
              type="default"
              @click="goBack"
            />
            <AppButton
              block
              custom-style="min-height: 84rpx; border-radius: 18rpx; font-weight: 600;"
              text="确认下单"
              type="info"
              @click="submit"
            />
          </view>
        </view>
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
import AppForm from '@/components/ui/AppForm/index.vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { institutionService, orderService, profileService, serviceManageService } from '@/services/api'
import type { TradeOrderDirectServiceType } from '@/services/api/tradeOrder'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

type AnyRecord = Record<string, any>

interface QuoteRow {
  amount: number
  label: string
}

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #d7deec; border-radius: 14rpx; background: #f7f9fc;'
const textareaStyle = `${fieldStyle} min-height: 132rpx;`
const dispatchOptions = ['快递寄样', '上门取样']

const orderId = ref('')
const bidId = ref('')
const serviceId = ref('')
const institutionId = ref('')
const agreeService = ref(false)
const agreeSecret = ref(false)
const quoteExpanded = ref(true)
const planLoading = ref(false)

const selectedPlan = reactive({
  category: '待确认',
  cycleDays: 0,
  finishTime: '周期待机构确认',
  institution: '机构信息待确认',
  price: 0,
  sampleType: '待确认',
  serviceName: '服务信息待确认',
  standard: '待确认',
  supportUrgent: false,
  urgentExtraFee: 0,
})

const form = reactive({
  contactName: '',
  contactPhone: '',
  dispatchType: '快递寄样',
  expressCompany: '',
  expressNo: '',
  needDoorService: false,
  needInvoice: false,
  receiveAddress: '',
})

const quoteRows = computed<QuoteRow[]>(() => {
  const rows: QuoteRow[] = []

  if (selectedPlan.price > 0) {
    rows.push({ amount: selectedPlan.price, label: '服务基础价' })
  }

  if (selectedPlan.supportUrgent && selectedPlan.urgentExtraFee > 0) {
    rows.push({ amount: selectedPlan.urgentExtraFee, label: '加急附加费（按需）' })
  }

  return rows
})

const quoteTotal = computed(() => quoteRows.value.reduce((total, item) => total + item.amount, 0))

const displayPrice = computed(() => {
  if (quoteTotal.value > 0) {
    return formatAmount(quoteTotal.value)
  }

  if (selectedPlan.price > 0) {
    return formatAmount(selectedPlan.price)
  }

  return '待确认'
})

onLoad((query) => {
  void initializePage(query as AnyRecord)
})

async function initializePage(query: AnyRecord) {
  applyQueryBaseInfo(query)

  planLoading.value = true
  try {
    await Promise.allSettled([
      syncInstitutionInfo(),
      syncServiceInfo(),
      prefillReceiverFromDefaultAddress(),
    ])
  } finally {
    planLoading.value = false
  }
}

function applyQueryBaseInfo(query: AnyRecord) {
  const queryBidId = toQueryText(query.bidId)
  if (queryBidId) {
    bidId.value = queryBidId
  }

  const queryOrderId = toQueryText(query.orderId)
  if (queryOrderId) {
    orderId.value = queryOrderId
  }

  const queryServiceId = toQueryText(query.serviceId)
  if (queryServiceId) {
    serviceId.value = queryServiceId
  }

  const queryInstitutionId = toQueryText(query.institutionId)
  if (queryInstitutionId) {
    institutionId.value = queryInstitutionId
  }

  const queryInstitutionName = toQueryText(query.institutionName)
  if (queryInstitutionName) {
    selectedPlan.institution = queryInstitutionName
  }

  const queryServiceName = toQueryText(query.service)
  if (queryServiceName) {
    selectedPlan.serviceName = queryServiceName
  }

  const queryStandard = toQueryText(query.standard)
  if (queryStandard) {
    selectedPlan.standard = queryStandard
  }

  const querySampleType = toQueryText(query.sampleType)
  if (querySampleType) {
    selectedPlan.sampleType = querySampleType
  }

  const queryCategory = toQueryText(query.category)
  if (queryCategory) {
    selectedPlan.category = queryCategory
  }

  const queryPrice = toQueryNumber(query.price)
  if (queryPrice > 0) {
    selectedPlan.price = queryPrice
  }

  const queryUrgentExtraFee = toQueryNumber(query.urgentExtraFee)
  if (queryUrgentExtraFee > 0) {
    selectedPlan.urgentExtraFee = queryUrgentExtraFee
  }

  const queryCycleDays = toQueryNumber(query.cycleDays)
  if (queryCycleDays > 0) {
    selectedPlan.cycleDays = queryCycleDays
    selectedPlan.finishTime = `预计 ${queryCycleDays} 个工作日`
  }
}

async function syncInstitutionInfo() {
  if (!institutionId.value.trim()) {
    return
  }

  try {
    const institution = await institutionService.getDetail(institutionId.value.trim())
    const institutionName = toText(institution?.name)

    if (institutionName) {
      selectedPlan.institution = institutionName
    }
  } catch {
    // ignore institution prefetch errors
  }
}

function normalizeTextForMatch(text: string) {
  return text.replace(/[\s\-_]/g, '').toLowerCase()
}

function applyServiceInfo(service: Awaited<ReturnType<typeof serviceManageService.getPublicDetail>>) {
  const serviceName = toText(service.serviceName)
  if (serviceName) {
    selectedPlan.serviceName = serviceName
  }

  if (service.price && service.price > 0) {
    selectedPlan.price = service.price
  }

  if (service.cycleDays && service.cycleDays > 0) {
    selectedPlan.cycleDays = service.cycleDays
    selectedPlan.finishTime = `预计 ${service.cycleDays} 个工作日`
  }

  const defaultStd = toText(service.defaultStd)
  if (defaultStd) {
    selectedPlan.standard = defaultStd
  }

  const sampleType = toText(service.sampleType)
  if (sampleType) {
    selectedPlan.sampleType = sampleType
  }

  const category = toText(service.category)
  if (category) {
    selectedPlan.category = category
  }

  selectedPlan.supportUrgent = service.supportUrgent === 1
  selectedPlan.urgentExtraFee = service.urgentExtraFee && service.urgentExtraFee > 0 ? service.urgentExtraFee : 0
}

async function syncServiceInfo() {
  const normalizedServiceId = serviceId.value.trim()

  if (normalizedServiceId) {
    try {
      const detail = await serviceManageService.getPublicDetail(normalizedServiceId)
      applyServiceInfo(detail)
      return
    } catch {
      // continue fallback
    }
  }

  if (!institutionId.value.trim() || !selectedPlan.serviceName.trim()) {
    return
  }

  try {
    const listResult = await serviceManageService.listByInstitution(institutionId.value.trim(), {
      keyword: selectedPlan.serviceName,
      page: 1,
      size: 20,
    })

    const records = listResult.records || []
    if (records.length === 0) {
      return
    }

    const target = normalizeTextForMatch(selectedPlan.serviceName)

    const matched = records.find((item) => {
      const name = toText(item.serviceName)
      if (!name) {
        return false
      }

      const current = normalizeTextForMatch(name)
      return current === target || current.includes(target) || target.includes(current)
    }) || records[0]

    applyServiceInfo(matched)

    if (!serviceId.value.trim() && matched.id) {
      serviceId.value = String(matched.id)
    }
  } catch {
    // ignore service prefetch errors
  }
}

async function prefillReceiverFromDefaultAddress() {
  try {
    const defaultAddress = await profileService.getDefaultSampleAddress()

    if (!defaultAddress) {
      return
    }

    const contactName = toText(defaultAddress.contact)
    if (!form.contactName.trim() && contactName) {
      form.contactName = contactName
    }

    const mobile = toText(defaultAddress.mobile)
    if (!form.contactPhone.trim() && mobile) {
      form.contactPhone = mobile
    }

    const address = [
      toText(defaultAddress.region),
      toText(defaultAddress.detailAddress || defaultAddress.address),
    ].filter(Boolean).join(' ')

    if (!form.receiveAddress.trim() && address) {
      form.receiveAddress = address
    }
  } catch {
    // ignore default address prefill errors
  }
}

function goBack() {
  uni.navigateBack()
}

function navigateToProfilePage(url: string) {
  setTimeout(() => {
    uni.navigateTo({ url })
  }, 300)
}

function resolveDirectServiceType(source: string): TradeOrderDirectServiceType {
  const text = source.trim().toLowerCase()

  if (/认证|certification/.test(text)) {
    return 'CERTIFICATION'
  }

  if (/标准|standard|编写|起草/.test(text)) {
    return 'STANDARD_WRITING'
  }

  return 'CALIBRATION'
}

async function ensureOfflineVoucherSubmitted(orderId: string) {
  let latestStatus = ''

  try {
    const latestOrder = await orderService.getDetail(orderId)
    latestStatus = latestOrder.status
  } catch {
    // ignore detail query failure
  }

  if (!latestStatus || latestStatus === 'pending_payment') {
    await orderService.submitOfflinePaymentVoucher(orderId, orderService.DEFAULT_OFFLINE_VOUCHER_URL)
    return 'pending_payment'
  }

  return latestStatus
}

function formatAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '待确认'
  }

  return `¥${value.toLocaleString('zh-CN')}`
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

function decodeQuery(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function toQueryText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return decodeQuery(value.trim())
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function toQueryNumber(value: unknown) {
  const text = toQueryText(value)

  if (!text) {
    return 0
  }

  const normalized = Number(text)
  if (!Number.isFinite(normalized)) {
    return 0
  }

  return normalized
}

async function submit() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (!agreeService.value || !agreeSecret.value) {
    showFailToast('请先勾选服务协议和保密协议')
    return
  }

  const useBidConfirmOrder = Boolean(bidId.value.trim())
  const dispatchType = form.dispatchType === '上门取样' ? 'door' : 'self'

  if (!useBidConfirmOrder) {
    if (!form.contactName.trim() || !form.receiveAddress.trim()) {
      showFailToast('请完善联系人与收样地址')
      return
    }

    if (dispatchType === 'door' && !form.contactPhone.trim()) {
      showFailToast('上门取样请填写联系电话')
      return
    }

    if (dispatchType === 'self' && (!form.expressCompany.trim() || !form.expressNo.trim())) {
      showFailToast('快递寄样请填写快递公司与运单号')
      return
    }
  }

  try {
    if (useBidConfirmOrder) {
      const defaultAddress = await profileService.getDefaultSampleAddress()
      const defaultAddressId = defaultAddress?.id

      if (!defaultAddressId) {
        showFailToast('请先在资料中心维护默认收样地址')
        navigateToProfilePage('/pages/profile/addresses')
        return
      }

      let defaultInvoiceId: string | number | undefined
      if (form.needInvoice) {
        const defaultInvoice = await profileService.getDefaultInvoice()
        defaultInvoiceId = defaultInvoice?.id

        if (!defaultInvoiceId) {
          showFailToast('已选择开票，请先维护默认开票资料')
          navigateToProfilePage('/pages/profile/invoices')
          return
        }
      }

      const confirmedOrderId = await orderService.confirmOrder({
        bidId: bidId.value.trim(),
        invoiceInfoId: defaultInvoiceId,
        ndaAgreed: agreeSecret.value,
        orderRemark: form.receiveAddress.trim() || undefined,
        serviceAgreementAgreed: agreeService.value,
        shippingAddressId: defaultAddressId,
        shippingMethod: dispatchType === 'door' ? 2 : 1,
      })

      const paymentStatus = await ensureOfflineVoucherSubmitted(confirmedOrderId)
      if (!paymentStatus || paymentStatus === 'pending_payment') {
        showSuccessToast('下单成功，凭证已提交，待机构确认收款')
      } else {
        showSuccessToast('下单成功')
      }
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/order/detail?id=${confirmedOrderId}` })
      }, 1000)
      return
    }

    let activeOrderId = orderId.value.trim()

    if (!activeOrderId) {
      const normalizedInstitutionId = institutionId.value.trim()

      if (!normalizedInstitutionId) {
        showFailToast('缺少机构信息，请从服务详情重新进入下单')
        return
      }

      activeOrderId = await orderService.createDirectOrder({
        amount: selectedPlan.price || undefined,
        estimatedDays: selectedPlan.cycleDays || undefined,
        institution: selectedPlan.institution,
        institutionId: normalizedInstitutionId,
        requirement: selectedPlan.standard,
        serviceType: resolveDirectServiceType(selectedPlan.serviceName),
        title: selectedPlan.serviceName,
      })
      orderId.value = activeOrderId
    }

    const paymentStatus = await ensureOfflineVoucherSubmitted(activeOrderId)
    if (!paymentStatus || paymentStatus === 'pending_payment') {
      showSuccessToast('下单成功，凭证已提交，待机构确认收款')
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/order/detail?id=${activeOrderId}` })
      }, 1000)
      return
    }

    await orderService.confirmEntrust(activeOrderId, {
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      dispatchType,
      expressCompany: dispatchType === 'self' ? form.expressCompany.trim() : undefined,
      expressNo: dispatchType === 'self' ? form.expressNo.trim() : undefined,
      needDoorService: form.needDoorService,
      needInvoice: form.needInvoice,
      receiveAddress: form.receiveAddress.trim(),
    })

    showSuccessToast('寄样信息已提交')
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/order/detail?id=${activeOrderId}` })
    }, 1000)
  } catch (error) {
    showFailToast(getErrorMessage(error, '下单提交失败，请稍后重试'))
  }
}
</script>

<style scoped lang="scss">
.page-order-create {
  --ink-900: #0f172a;
  --ink-700: #334155;
  --ink-500: #64748b;
  --surface-card: rgba(255, 255, 255, 0.92);
  --surface-soft: #f7f9fc;
  --brand-600: #1f5fe0;
  --brand-500: #3b82f6;
  --accent-500: #ea580c;

  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(circle at 92% 0%, rgba(30, 99, 255, 0.13) 0%, transparent 34%),
    radial-gradient(circle at 0% 20%, rgba(234, 88, 12, 0.08) 0%, transparent 38%),
    #eef3fa;
  font-family: 'Noto Serif SC', 'Songti SC', 'PingFang SC', sans-serif;
}

.page-order-create__scroll {
  flex: 1;
  min-height: 0;
}

.page-order-create__body {
  padding: 22rpx 24rpx calc(36rpx + env(safe-area-inset-bottom));
}

.page-order-create__hero {
  margin-bottom: 18rpx;
  padding: 26rpx;
  border-radius: 28rpx;
  background: linear-gradient(132deg, #1149b8 0%, #1f67ff 56%, #3695ff 100%);
  color: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(10, 53, 140, 0.26);
  animation: card-rise 360ms ease both;
}

.page-order-create__hero-tag {
  display: inline-flex;
  align-items: center;
  min-height: 40rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  letter-spacing: 1rpx;
  background: rgba(255, 255, 255, 0.2);
}

.page-order-create__hero-title {
  display: block;
  margin-top: 10rpx;
  font-size: 38rpx;
  line-height: 1.35;
  font-weight: 700;
}

.page-order-create__hero-meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
}

.page-order-create__hero-meta-item {
  font-size: 22rpx;
  opacity: 0.94;
}

.page-order-create__hero-meta-dot {
  font-size: 22rpx;
  opacity: 0.72;
}

.page-order-create__section {
  margin-bottom: 18rpx;
  padding: 26rpx;
  border-radius: 24rpx;
  border: 1rpx solid rgba(148, 163, 184, 0.2);
  background: var(--surface-card);
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
  animation: card-rise 360ms ease both;
}

.page-order-create__section--highlight {
  background:
    linear-gradient(180deg, rgba(31, 103, 255, 0.08) 0%, rgba(255, 255, 255, 0.95) 44%),
    var(--surface-card);
}

.page-order-create__section-title {
  display: block;
  margin-bottom: 20rpx;
  color: var(--ink-900);
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 0.4rpx;
}

.page-order-create__section-title--no-gap {
  margin-bottom: 0;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  padding: 13rpx 0;
  border-bottom: 1rpx dashed rgba(148, 163, 184, 0.36);
}

.summary-row--last {
  border-bottom: 0;
}

.summary-row__label {
  color: var(--ink-500);
  font-size: 23rpx;
  flex-shrink: 0;
}

.summary-row__value {
  color: var(--ink-900);
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.5;
  text-align: right;
  max-width: 68%;
}

.summary-row__value--price {
  color: var(--brand-600);
  font-size: 34rpx;
  font-weight: 800;
}

.page-order-create__quote-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.page-order-create__quote-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.page-order-create__quote-toggle {
  color: var(--brand-600);
  font-size: 24rpx;
}

.page-order-create__quote-detail {
  margin-top: 18rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: var(--surface-soft);
  border: 1rpx solid #e2e8f0;
}

.page-order-create__quote-row {
  display: flex;
  justify-content: space-between;
  gap: 10rpx;
  padding: 9rpx 0;
  font-size: 22rpx;
}

.page-order-create__quote-row--total {
  margin-top: 4rpx;
  border-top: 1rpx dashed #dbe5f3;
  padding-top: 12rpx;
}

.page-order-create__quote-label {
  color: var(--ink-700);
}

.page-order-create__quote-value {
  color: var(--ink-900);
  font-weight: 600;
}

.page-order-create__field {
  margin-bottom: 18rpx;
}

.page-order-create__label {
  display: block;
  margin-bottom: 10rpx;
  color: var(--ink-500);
  font-size: 23rpx;
}

.page-order-create__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.page-order-create__chip {
  min-height: 44px;
  padding: 0 26rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  color: #37517e;
  background: #ecf4ff;
  border: 1rpx solid #bfd6ff;
}

.page-order-create__chip--active {
  color: #ffffff;
  background: linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 100%);
  border-color: transparent;
}

.page-order-create__switches {
  margin-top: 12rpx;
  display: grid;
  gap: 12rpx;
}

.page-order-create__switch-item {
  min-height: 44px;
  border-radius: 16rpx;
  background: var(--surface-soft);
  padding: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-order-create__switch-label {
  font-size: 23rpx;
  color: var(--ink-700);
}

.page-order-create__section--confirm {
  margin-bottom: 0;
}

.agreement-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  border-radius: 14rpx;
  background: var(--surface-soft);
  padding: 14rpx 16rpx;
}

.agreement-row__text {
  color: var(--ink-700);
  font-size: 22rpx;
}

.page-order-create__actions {
  margin-top: 12rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 12rpx, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-order-create__hero,
  .page-order-create__section {
    animation: none;
  }
}
</style>
