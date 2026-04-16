<template>
  <view class="page-profile-enterprise">
    <scroll-view class="page-profile-enterprise__scroll" scroll-y>
      <view class="page-profile-enterprise__content">
        <view class="enterprise-hero">
          <view class="enterprise-hero__head">
            <view>
              <text class="enterprise-hero__name">{{ enterpriseName }}</text>
              <text class="enterprise-hero__code">统一社会信用代码：{{ creditCodeText }}</text>
            </view>
            <text class="enterprise-hero__status">{{ enterpriseStatus }}</text>
          </view>

          <view class="enterprise-hero__stats">
            <view class="enterprise-hero__stat">
              <text class="enterprise-hero__stat-value">{{ contacts.length }}</text>
              <text class="enterprise-hero__stat-label">常用联系人</text>
            </view>
            <view class="enterprise-hero__stat">
              <text class="enterprise-hero__stat-value">{{ invoices.length }}</text>
              <text class="enterprise-hero__stat-label">开票资料</text>
            </view>
            <view class="enterprise-hero__stat">
              <text class="enterprise-hero__stat-value">{{ addresses.length }}</text>
              <text class="enterprise-hero__stat-label">收样地址</text>
            </view>
          </view>
        </view>

        <view class="enterprise-card">
          <view class="enterprise-row" @tap="goEnterpriseAuth">
            <view>
              <text class="enterprise-row__title">企业认证</text>
              <text class="enterprise-row__desc">营业执照、资质证书、认证状态查看</text>
            </view>
            <text class="enterprise-row__value enterprise-row__value--primary">{{ enterpriseStatus }} ></text>
          </view>

          <view class="enterprise-row" @tap="goContacts">
            <view>
              <text class="enterprise-row__title">联系人管理</text>
              <text class="enterprise-row__desc">维护委托联系人、报告接收人、电话信息</text>
            </view>
            <text class="enterprise-row__value">{{ contacts.length }} 个 ></text>
          </view>

          <view class="enterprise-row" @tap="goInvoices">
            <view>
              <text class="enterprise-row__title">开票资料</text>
              <text class="enterprise-row__desc">发票抬头、税号、开户地址、银行账号</text>
            </view>
            <text class="enterprise-row__value">{{ invoices.length > 0 ? '已配置' : '未配置' }} ></text>
          </view>

          <view class="enterprise-row" @tap="goAddresses">
            <view>
              <text class="enterprise-row__title">收样地址管理</text>
              <text class="enterprise-row__desc">维护默认收样地址、寄回地址、现场收样地点</text>
            </view>
            <text class="enterprise-row__value">{{ addresses.length }} 个 ></text>
          </view>
        </view>

        <view class="enterprise-card">
          <text class="enterprise-card__title">最近使用</text>
          <view class="enterprise-row enterprise-row--plain" @tap="goContacts">
            <view>
              <text class="enterprise-row__title">默认联系人</text>
              <text class="enterprise-row__desc">{{ recentContactText }}</text>
            </view>
            <text class="enterprise-row__value">></text>
          </view>
          <view class="enterprise-row enterprise-row--plain" @tap="goAddresses">
            <view>
              <text class="enterprise-row__title">默认收样地址</text>
              <text class="enterprise-row__desc">{{ recentAddressText }}</text>
            </view>
            <text class="enterprise-row__value">></text>
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
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { profileService } from '@/services/api'
import { showAppToast } from '@/services/ui/toast'
import type { ContactInfo, InvoiceInfo, SampleAddress } from '@/types/business'

interface EnterpriseProfile {
  enterpriseName?: string
  creditCode?: string
}

const profile = ref<EnterpriseProfile>({})
const contacts = ref<ContactInfo[]>([])
const invoices = ref<InvoiceInfo[]>([])
const addresses = ref<SampleAddress[]>([])

const enterpriseName = computed(() => profile.value.enterpriseName?.trim() || '株洲某制造有限公司')

const creditCodeText = computed(() => {
  const code = profile.value.creditCode?.trim()

  if (!code) {
    return '9143**********28'
  }

  if (code.length <= 8) {
    return code
  }

  return `${code.slice(0, 4)}**********${code.slice(-2)}`
})

const enterpriseStatus = computed(() => (profile.value.enterpriseName ? '已认证' : '待完善'))

const recentContactText = computed(() => {
  const first = contacts.value[0]

  if (!first) {
    return '暂无联系人信息'
  }

  return `${first.name} / ${maskMobile(first.mobile)}`
})

const recentAddressText = computed(() => {
  const first = addresses.value[0]

  if (!first) {
    return '暂无收样地址'
  }

  return first.address
})

onLoad(() => {
  loadAll()
})

onShow(() => {
  loadAll()
})

async function loadAll() {
  try {
    const [enterpriseInfo, contactList, invoiceList, addressList] = await Promise.all([
      profileService.getEnterpriseProfile(),
      profileService.getContacts(),
      profileService.getInvoices(),
      profileService.getSampleAddresses(),
    ])

    profile.value = enterpriseInfo || {}
    contacts.value = contactList || []
    invoices.value = invoiceList || []
    addresses.value = addressList || []
  } catch (error) {
    console.error('load enterprise profile failed', error)
    showAppToast({ message: '企业信息加载失败', icon: 'none' })
  }
}

function goEnterpriseAuth() {
  showAppToast({ message: '企业认证信息已在本页展示', icon: 'none' })
}

function goContacts() {
  uni.navigateTo({ url: '/pages/profile/contacts' })
}

function goInvoices() {
  uni.navigateTo({ url: '/pages/profile/invoices' })
}

function goAddresses() {
  uni.navigateTo({ url: '/pages/profile/addresses' })
}

function maskMobile(mobile: string) {
  const value = mobile?.trim() || ''

  if (value.length < 7) {
    return value || '暂无'
  }

  return `${value.slice(0, 3)}****${value.slice(-4)}`
}
</script>

<style scoped lang="scss">
.page-profile-enterprise {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-profile-enterprise__scroll {
  flex: 1;
  min-height: 0;
}

.page-profile-enterprise__content {
  padding: 20rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.enterprise-hero {
  border-radius: 22rpx;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #ecfeff 100%);
  border: 1rpx solid #bfdbfe;
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.08);
  padding: 24rpx;
}

.enterprise-hero__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.enterprise-hero__name {
  display: block;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.enterprise-hero__code {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
}

.enterprise-hero__status {
  flex-shrink: 0;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.8);
  color: #1d4ed8;
  font-size: 20rpx;
  font-weight: 600;
}

.enterprise-hero__stats {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.enterprise-hero__stat {
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.68);
  text-align: center;
  padding: 14rpx 8rpx;
}

.enterprise-hero__stat-value {
  display: block;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.enterprise-hero__stat-label {
  display: block;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 20rpx;
}

.enterprise-card {
  margin-top: 14rpx;
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.06);
  padding: 22rpx;
}

.enterprise-card__title {
  display: block;
  color: #0f172a;
  font-size: 30rpx;
  font-weight: 700;
}

.enterprise-row {
  margin-top: 12rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.enterprise-row--plain {
  margin-top: 10rpx;
}

.enterprise-row__title {
  display: block;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 600;
}

.enterprise-row__desc {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 21rpx;
  line-height: 1.4;
}

.enterprise-row__value {
  flex-shrink: 0;
  color: #64748b;
  font-size: 22rpx;
}

.enterprise-row__value--primary {
  color: #2563eb;
}
</style>
