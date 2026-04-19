<template>
  <view class="page-order-create">
    <scroll-view class="page-order-create__scroll" scroll-y>
      <view class="page-order-create__body">
        <view class="page-order-create__section">
          <text class="page-order-create__section-title">委托信息</text>
          <view class="summary-row">
            <text class="summary-row__label">机构名称</text>
            <text class="summary-row__value">{{ selectedPlan.institution }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-row__label">服务项目</text>
            <text class="summary-row__value">{{ selectedPlan.serviceName }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-row__label">预计完成时间</text>
            <text class="summary-row__value">{{ selectedPlan.finishTime }}</text>
          </view>
          <view class="summary-row summary-row--last">
            <text class="summary-row__label">检测方法/检测标准</text>
            <text class="summary-row__value">{{ selectedPlan.standard }}</text>
          </view>
        </view>

        <view class="page-order-create__section">
          <view class="page-order-create__quote-head" @tap="quoteExpanded = !quoteExpanded">
            <text class="page-order-create__section-title page-order-create__section-title--no-gap">报价金额</text>
            <view class="page-order-create__quote-right">
              <text class="summary-row__value--price">¥{{ selectedPlan.price }}</text>
              <text class="page-order-create__quote-toggle">{{ quoteExpanded ? '⌃' : '⌄' }}</text>
            </view>
          </view>

          <view v-if="quoteExpanded" class="page-order-create__quote-detail">
            <view class="page-order-create__quote-row">
              <text class="page-order-create__quote-label">基础检测费</text>
              <text class="page-order-create__quote-value">¥3,000</text>
            </view>
            <view class="page-order-create__quote-row">
              <text class="page-order-create__quote-label">加急服务费</text>
              <text class="page-order-create__quote-value">¥500</text>
            </view>
            <view class="page-order-create__quote-row">
              <text class="page-order-create__quote-label">平台服务费</text>
              <text class="page-order-create__quote-value">¥180</text>
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
                :autosize="{ minHeight: 80 }"
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
              custom-style="min-height: 84rpx; border-radius: 20rpx;"
              text="取消"
              type="default"
              @click="goBack"
            />
            <AppButton
              block
              custom-style="min-height: 84rpx; border-radius: 20rpx; font-weight: 600;"
              text="确认委托"
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
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { orderService, profileService } from '@/services/api'
import type { TradeOrderDirectServiceType } from '@/services/api/tradeOrder'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 120rpx;`
const dispatchOptions = ['快递寄样', '上门取样']

const orderId = ref('')
const bidId = ref('')
const institutionId = ref('')
const agreeService = ref(false)
const agreeSecret = ref(false)
const quoteExpanded = ref(false)

const selectedPlan = reactive({
  institution: '湖南质量检测研究院',
  serviceName: '金属材料成分检测',
  price: '1,780',
  finishTime: '预计 3 个工作日',
  standard: 'GB/T 4336-2016',
})

const form = reactive({
  contactName: '李明',
  contactPhone: '',
  dispatchType: '快递寄样',
  expressCompany: '',
  expressNo: '',
  receiveAddress: '湖南省株洲市天元区天台路 123 号创新中心 2 栋 501',
  needInvoice: false,
  needDoorService: false,
})

onLoad((query) => {
  if (typeof query?.bidId === 'string' && query.bidId.trim()) {
    bidId.value = query.bidId
  }

  if (typeof query?.orderId === 'string' && query.orderId.trim()) {
    orderId.value = query.orderId
  }

  if (typeof query?.institutionId === 'string' && query.institutionId.trim()) {
    institutionId.value = decodeURIComponent(query.institutionId)
  }

  if (typeof query?.institutionName === 'string' && query.institutionName.trim()) {
    selectedPlan.institution = decodeURIComponent(query.institutionName)
  }

  if (typeof query?.service === 'string' && query.service.trim()) {
    selectedPlan.serviceName = decodeURIComponent(query.service)
  }
})

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

      showSuccessToast('下单成功')
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/order/detail?id=${confirmedOrderId}` })
      }, 1000)
      return
    }

    let activeOrderId = orderId.value.trim()

    if (!activeOrderId) {
      activeOrderId = await orderService.createDirectOrder({
        institution: selectedPlan.institution,
        institutionId: institutionId.value.trim() || undefined,
        requirement: selectedPlan.serviceName,
        serviceType: resolveDirectServiceType(selectedPlan.serviceName),
        title: selectedPlan.serviceName,
      })
      orderId.value = activeOrderId
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
    showFailToast(getErrorMessage(error, '委托提交失败，请稍后重试'))
  }
}
</script>

<style scoped lang="scss">
.page-order-create {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-order-create__scroll {
  flex: 1;
  min-height: 0;
}

.page-order-create__body {
  padding: 24rpx 24rpx calc(36rpx + env(safe-area-inset-bottom));
}

.page-order-create__section {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.page-order-create__section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-order-create__section-title--no-gap {
  margin-bottom: 0;
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
  color: #1d4ed8;
  font-size: 24rpx;
}

.page-order-create__quote-detail {
  margin-top: 18rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
}

.page-order-create__quote-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  font-size: 22rpx;
}

.page-order-create__quote-label {
  color: #475569;
}

.page-order-create__quote-value {
  color: #1e293b;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.summary-row--last {
  border-bottom: 0;
}

.summary-row__label {
  color: #475569;
  font-size: 24rpx;
  flex-shrink: 0;
}

.summary-row__value {
  color: #1e293b;
  font-size: 24rpx;
  font-weight: 500;
  text-align: right;
  max-width: 68%;
  line-height: 1.5;
}

.summary-row__value--price {
  color: #2563eb;
  font-size: 32rpx;
  font-weight: 700;
}

.page-order-create__field {
  margin-bottom: 18rpx;
}

.page-order-create__label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 23rpx;
  color: #64748b;
}

.page-order-create__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.page-order-create__chip {
  padding: 12rpx 26rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
  color: #475569;
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
}

.page-order-create__chip--active {
  color: #ffffff;
  background: #2563eb;
  border-color: #2563eb;
}

.page-order-create__switches {
  margin-top: 12rpx;
  display: grid;
  gap: 12rpx;
}

.page-order-create__switch-item {
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-order-create__switch-label {
  font-size: 23rpx;
  color: #334155;
}

.page-order-create__section--confirm {
  margin-bottom: 0;
}

.agreement-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  border-radius: 14rpx;
  background: #f8fafc;
  padding: 14rpx 16rpx;
}

.agreement-row__text {
  color: #334155;
  font-size: 22rpx;
}

.page-order-create__actions {
  margin-top: 12rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}
</style>
