<template>
  <view class="page-order-list">
    <view class="page-order-list__header">
      <AppSearchPlaceholder
        class="page-order-list__search-box"
        custom-style="padding: 20rpx 24rpx;"
        placeholder="搜索委托编号、项目名称、机构名称"
        text-size="26rpx"
        tone="surface"
      />

      <AppTabs v-model="activeTab">
        <AppTab
          v-for="tab in tabs"
          :key="tab.key"
          :name="tab.key"
          :title="tab.label"
        >
          <scroll-view class="page-order-list__content" scroll-y>
            <AppList :finished="true">
              <view
                v-for="order in getOrdersByStatus(tab.key)"
                :key="order.id"
                class="page-order-list__card"
                @tap="goDetail(order)"
              >
                <view class="page-order-list__card-top">
                  <view class="page-order-list__info">
                    <view class="page-order-list__title-row">
                      <text class="page-order-list__title">{{ order.title }}</text>
                      <text
                        class="page-order-list__status"
                        :class="`page-order-list__status--${order.status}`"
                      >{{ order.statusText }}</text>
                    </view>
                    <text class="page-order-list__meta">委托编号：{{ order.orderNo }} · {{ order.institution }}</text>
                  </view>
                  <view class="page-order-list__amount-wrap">
                    <text class="page-order-list__amount">¥{{ order.amount.toLocaleString() }}</text>
                    <text class="page-order-list__date">{{ order.createdAt }}</text>
                  </view>
                </view>

                <view class="page-order-list__progress-track">
                  <view
                    class="page-order-list__progress-bar"
                    :class="`page-order-list__progress-bar--${order.status}`"
                    :style="{ width: `${order.progress}%` }"
                  ></view>
                </view>

                <text class="page-order-list__progress-text">当前进度：{{ order.progressText }}</text>

                <view class="page-order-list__actions">
                  <AppButton
                    plain
                    preset="action"
                    size="small"
                    text="查看详情"
                    type="default"
                    @click.stop="goDetail(order)"
                  />
                  <AppButton
                    v-if="order.status === 'unpaid'"
                    preset="action"
                    size="small"
                    text="立即支付"
                    type="info"
                    @click.stop="noop"
                  />
                  <AppButton
                    v-if="order.status === 'pending_sample'"
                    preset="action"
                    size="small"
                    text="确认寄样"
                    type="info"
                    @click.stop="noop"
                  />
                </view>
              </view>
            </AppList>
          </scroll-view>
        </AppTab>
      </AppTabs>
    </view>

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'

type OrderStatus = 'all' | 'unpaid' | 'pending_sample' | 'testing' | 'completed' | 'after_sale'

interface OrderItem {
  id: string
  title: string
  status: Exclude<OrderStatus, 'all'>
  statusText: string
  progress: number
  progressText: string
  institution: string
  amount: number
  orderNo: string
  createdAt: string
}

const activeTab = ref<OrderStatus>('all')
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unpaid', label: '未支付' },
  { key: 'pending_sample', label: '待寄样' },
  { key: 'testing', label: '检测中' },
  { key: 'completed', label: '已完成' },
  { key: 'after_sale', label: '售后中' },
] as const

const orders = ref<OrderItem[]>([
  { id: '1', title: '金属材料成分检测', status: 'unpaid', statusText: '未支付', progress: 12, progressText: '机构已报价，待确认并支付', institution: '湖南质量检测研究院', amount: 1000, orderNo: 'DD20260418001', createdAt: '2026-04-18' },
  { id: '2', title: '电子产品安规认证', status: 'testing', statusText: '检测中', progress: 60, progressText: '样品检测中，预计3天完成', institution: '广州检验检测认证集团', amount: 3200, orderNo: 'DD20260415003', createdAt: '2026-04-15' },
  { id: '3', title: 'CE认证咨询服务', status: 'completed', statusText: '已完成', progress: 100, progressText: '已完成，报告已上传', institution: '深圳华检技术服务有限公司', amount: 5800, orderNo: 'DD20260410007', createdAt: '2026-04-10' },
  { id: '4', title: '塑料制品环保检测', status: 'pending_sample', statusText: '待寄样', progress: 25, progressText: '订单已确认，请寄送样品至机构', institution: '湖南质量检测研究院', amount: 800, orderNo: 'DD20260416002', createdAt: '2026-04-16' },
])

function getOrdersByStatus(status: OrderStatus) {
  if (status === 'all') {
    return orders.value
  }

  return orders.value.filter((order) => order.status === status)
}

function goDetail(order: OrderItem) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

function noop() {}
</script>

<style scoped lang="scss">
.page-order-list {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  padding-bottom: 120rpx;
}

.page-order-list__header {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 20rpx 24rpx 0;
}

.page-order-list__search-box {
  margin-bottom: 20rpx;
}

.page-order-list__content {
  height: calc(100vh - 220rpx);
  padding: 4rpx 0 0;
  box-sizing: border-box;
}

.page-order-list__card {
  margin-bottom: 16rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-order-list__card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.page-order-list__info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.page-order-list__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.page-order-list__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-order-list__status {
  @include status-chip(20rpx, 8rpx, 4rpx 14rpx);
}

.page-order-list__status--unpaid {
  background: #fff1f2;
  color: #e11d48;
}

.page-order-list__status--testing {
  background: #eff6ff;
  color: #2563eb;
}

.page-order-list__status--completed {
  background: #ecfdf5;
  color: #059669;
}

.page-order-list__status--pending_sample {
  background: #fffbeb;
  color: #d97706;
}

.page-order-list__status--after_sale {
  background: #f5f3ff;
  color: #7c3aed;
}

.page-order-list__meta {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

.page-order-list__amount-wrap {
  flex-shrink: 0;
  text-align: right;
}

.page-order-list__amount {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #2563eb;
}

.page-order-list__date {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #94a3b8;
}

.page-order-list__progress-track {
  margin-bottom: 10rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #f1f5f9;
  height: 8rpx;
}

.page-order-list__progress-bar {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s;
}

.page-order-list__progress-bar--unpaid {
  background: #e11d48;
}

.page-order-list__progress-bar--testing {
  background: #2563eb;
}

.page-order-list__progress-bar--completed {
  background: #059669;
}

.page-order-list__progress-bar--pending_sample {
  background: #d97706;
}

.page-order-list__progress-bar--after_sale {
  background: #7c3aed;
}

.page-order-list__progress-text {
  display: block;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-order-list__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
}
</style>
