<template>
  <view class="page-order-list">
    <view class="page-order-list__header">
      <view class="page-order-list__search-box">
        <text class="page-order-list__search-text">🔍 搜索委托编号、项目名称、机构名称</text>
      </view>
      <scroll-view class="page-order-list__tabs-scroll" scroll-x>
        <view class="page-order-list__tabs-wrap">
          <text
            v-for="t in tabs"
            :key="t.key"
            class="page-order-list__tab"
            :class="{ 'page-order-list__tab--active': activeTab===t.key }"
            @tap="activeTab=t.key"
          >{{ t.label }}</text>
        </view>
      </scroll-view>
    </view>
    <scroll-view class="page-order-list__content" scroll-y>
      <view
        v-for="order in filteredOrders"
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
          <text class="page-order-list__btn page-order-list__btn--secondary" @tap.stop="() => {}">查看详情</text>
          <text v-if="order.status==='unpaid'" class="page-order-list__btn page-order-list__btn--primary" @tap.stop="() => {}">立即支付</text>
          <text v-if="order.status==='pending_sample'" class="page-order-list__btn page-order-list__btn--primary" @tap.stop="() => {}">确认寄样</text>
        </view>
      </view>
    </scroll-view>
    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
const activeTab = ref('all')
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unpaid', label: '未支付' },
  { key: 'pending_sample', label: '待寄样' },
  { key: 'testing', label: '检测中' },
  { key: 'completed', label: '已完成' },
  { key: 'after_sale', label: '售后中' },
]
const orders = ref([
  { id:'1', title:'金属材料成分检测', status:'unpaid', statusText:'未支付', statusColor:'#e11d48', statusBg:'#fff1f2', progress:12, progressText:'机构已报价，待确认并支付', institution:'湖南质量检测研究院', amount:1000, orderNo:'DD20260418001', createdAt:'2026-04-18' },
  { id:'2', title:'电子产品安规认证', status:'testing', statusText:'检测中', statusColor:'#2563eb', statusBg:'#eff6ff', progress:60, progressText:'样品检测中，预计3天完成', institution:'广州检验检测认证集团', amount:3200, orderNo:'DD20260415003', createdAt:'2026-04-15' },
  { id:'3', title:'CE认证咨询服务', status:'completed', statusText:'已完成', statusColor:'#059669', statusBg:'#ecfdf5', progress:100, progressText:'已完成，报告已上传', institution:'深圳华检技术服务有限公司', amount:5800, orderNo:'DD20260410007', createdAt:'2026-04-10' },
  { id:'4', title:'塑料制品环保检测', status:'pending_sample', statusText:'待寄样', statusColor:'#d97706', statusBg:'#fffbeb', progress:25, progressText:'订单已确认，请寄送样品至机构', institution:'湖南质量检测研究院', amount:800, orderNo:'DD20260416002', createdAt:'2026-04-16' },
])
const filteredOrders = computed(() => activeTab.value==='all' ? orders.value : orders.value.filter(o=>o.status===activeTab.value))
const goDetail = (order: any) => uni.navigateTo({ url: '/pages/order/detail?id='+order.id })
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
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 20rpx 24rpx 0;
}

.page-order-list__search-box {
  margin-bottom: 20rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 20rpx 24rpx;
}

.page-order-list__search-text {
  font-size: 26rpx;
  color: #94a3b8;
}

.page-order-list__tabs-scroll {
  white-space: nowrap;
}

.page-order-list__tabs-wrap {
  display: flex;
  gap: 8rpx;
  padding-bottom: 20rpx;
}

.page-order-list__tab {
  white-space: nowrap;
  border-radius: 12rpx;
  background: #f1f5f9;
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  color: #475569;
}

.page-order-list__tab--active {
  background: #2563eb;
  color: #ffffff;
}

.page-order-list__content {
  flex: 1;
  min-height: 0;
  padding: 24rpx 24rpx 0;
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
  border-radius: 8rpx;
  padding: 4rpx 14rpx;
  font-size: 20rpx;
  font-weight: 500;
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

.page-order-list__btn {
  border-radius: 12rpx;
  padding: 14rpx 28rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.page-order-list__btn--secondary {
  background: #f1f5f9;
  color: #334155;
}

.page-order-list__btn--primary {
  background: #2563eb;
  color: #ffffff;
}
</style>
