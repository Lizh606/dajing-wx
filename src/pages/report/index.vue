<template>
  <view class="page-report">
    <view class="page-report__header">
      <view class="page-report__search-row">
        <view class="page-report__search-box">
          <text class="page-report__search-text">🔍 搜索报告名称 / 委托编号</text>
        </view>
        <text class="page-report__filter-text">筛选</text>
      </view>
      <scroll-view scroll-x class="page-report__tabs-scroll">
        <view class="page-report__tabs-wrap">
          <text
            v-for="t in tabs"
            :key="t"
            class="page-report__tab"
            :class="{ 'page-report__tab--active': activeTab===t }"
            @tap="activeTab=t"
          >{{ t }}</text>
        </view>
      </scroll-view>
    </view>
    <scroll-view scroll-y class="page-report__content">
      <view v-for="r in reports" :key="r.id" class="page-report__card">
        <view class="page-report__card-head">
          <view class="page-report__icon-wrap">
            <text class="page-report__icon">📄</text>
          </view>
          <view class="page-report__title-wrap">
            <text class="page-report__title">{{ r.name }}</text>
            <text class="page-report__sub">委托编号：{{ r.no }}</text>
          </view>
          <text
            class="page-report__status"
            :class="{
              'page-report__status--done': r.statusClass==='status-done',
              'page-report__status--archived': r.statusClass==='status-archived',
              'page-report__status--pending': r.statusClass==='status-pending'
            }"
          >{{ r.status }}</text>
        </view>
        <view class="page-report__meta">
          <text class="page-report__org">{{ r.org }}</text>
          <text class="page-report__date">{{ r.date }}</text>
        </view>
        <view class="page-report__actions">
          <text class="page-report__btn page-report__btn--secondary">预览</text>
          <text class="page-report__btn page-report__btn--primary">下载报告</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const activeTab = ref('全部')
const tabs = ['全部','检验报告','认证证书','质量文件']
const reports = [
  { id:1, name:'金属材料成分检测报告', no:'DD20260418001', org:'湖南质量检测研究院', date:'2026-04-18', status:'已完成', statusClass:'status-done' },
  { id:2, name:'ISO 9001认证证书', no:'DD20260410007', org:'湖南质量认证中心', date:'2026-04-10', status:'已归档', statusClass:'status-archived' },
  { id:3, name:'电磁兼容EMC测试报告', no:'DD20260405003', org:'深圳华检技术服务', date:'2026-04-05', status:'待确认', statusClass:'status-pending' },
]
</script>

<style scoped lang="scss">
.page-report {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-report__header {
  background: #ffffff;
  padding: 16rpx 24rpx 0;
}

.page-report__search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.page-report__search-box {
  flex: 1;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 18rpx 24rpx;
}

.page-report__search-text {
  font-size: 24rpx;
  color: #94a3b8;
}

.page-report__filter-text {
  flex-shrink: 0;
  font-size: 26rpx;
  font-weight: 500;
  color: #2563eb;
}

.page-report__tabs-scroll {
  white-space: nowrap;
}

.page-report__tabs-wrap {
  display: flex;
  gap: 8rpx;
  padding-bottom: 16rpx;
}

.page-report__tab {
  white-space: nowrap;
  border-radius: 12rpx;
  background: #f1f5f9;
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-report__tab--active {
  background: #2563eb;
  color: #ffffff;
}

.page-report__content {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx;
}

.page-report__card {
  margin-bottom: 16rpx;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-report__card-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.page-report__icon-wrap {
  display: flex;
  height: 72rpx;
  width: 72rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #eff6ff;
}

.page-report__icon {
  font-size: 36rpx;
}

.page-report__title-wrap {
  flex: 1;
  min-width: 0;
}

.page-report__title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-report__sub {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.page-report__status {
  flex-shrink: 0;
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
  font-size: 24rpx;
}

.page-report__status--done {
  background: #dcfce7;
  color: #16a34a;
}

.page-report__status--archived {
  background: #f1f5f9;
  color: #64748b;
}

.page-report__status--pending {
  background: #fef9c3;
  color: #ca8a04;
}

.page-report__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.page-report__org {
  font-size: 24rpx;
  color: #475569;
}

.page-report__date {
  font-size: 24rpx;
  color: #94a3b8;
}

.page-report__actions {
  display: flex;
  gap: 16rpx;
}

.page-report__btn {
  flex: 1;
  border-radius: 12rpx;
  padding: 14rpx 0;
  text-align: center;
  font-size: 26rpx;
}

.page-report__btn--secondary {
  border: 1rpx solid #bfdbfe;
  color: #2563eb;
}

.page-report__btn--primary {
  background: #2563eb;
  color: #ffffff;
}
</style>
