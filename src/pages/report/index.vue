<template>
  <view class="page-report">
    <view class="page-report__header">
      <view class="page-report__search-row">
        <AppSearchPlaceholder
          class="page-report__search-box"
          custom-style="padding: 18rpx 24rpx; border-radius: 16rpx;"
          placeholder="搜索报告名称 / 委托编号"
          text-size="24rpx"
          tone="surface"
        />
        <text class="page-report__filter" @tap="goVerify">筛选</text>
      </view>
    </view>

    <view class="page-report__body">
      <scroll-view scroll-y class="page-report__content">
        <AppList :finished="!loading" :loading="loading">
          <view v-for="report in reports" :key="report.id" class="page-report__card" @tap="goDetail(report.id)">
            <view class="page-report__card-head">
              <view class="page-report__title-wrap">
                <text class="page-report__title">{{ report.reportName }}</text>
                <text class="page-report__sub">{{ report.orderNo }} · {{ report.institution }}</text>
              </view>
              <text class="page-report__type">PDF</text>
            </view>

            <view class="page-report__meta-line">生成时间：{{ report.createdAt }}</view>
            <view class="page-report__meta-line">防伪码：{{ report.antiFakeCode }} / 版本：{{ report.version }}</view>

            <view class="page-report__status-wrap">
              <text class="page-report__status" :class="report.status === 'valid' ? 'status-valid' : 'status-void'">
                {{ getReportStatusLabel(report.status) }}
              </text>
            </view>

            <view class="page-report__actions">
              <AppButton
                block
                plain
                preset="action"
                text="在线查看"
                type="info"
                @click.stop="goDetail(report.id)"
              />
              <AppButton
                block
                preset="action"
                text="下载报告"
                type="info"
                @click.stop="showComingSoon"
              />
            </view>
          </view>

          <view class="page-report__archive-card">
            <text class="page-report__archive-title">归档筛选</text>
            <view class="page-report__archive-tags">
              <text class="page-report__archive-tag page-report__archive-tag--active">全部</text>
              <text class="page-report__archive-tag">检测</text>
              <text class="page-report__archive-tag">计量</text>
              <text class="page-report__archive-tag">认证</text>
              <text class="page-report__archive-tag">本月</text>
            </view>
          </view>
        </AppList>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import { reportService } from '@/services/api'
import { getReportStatusLabel } from '@/services/api/report'
import { showAppToast } from '@/services/ui/toast'
import type { ReportRecord } from '@/types/business'

const loading = ref(false)
const reports = ref<ReportRecord[]>([])

onMounted(() => {
  loadReports()
})

async function loadReports() {
  loading.value = true

  try {
    reports.value = await reportService.getList()
  } finally {
    loading.value = false
  }
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/report/detail?id=${id}` })
}

function goVerify() {
  uni.navigateTo({ url: '/pages/report/verify' })
}

function showComingSoon() {
  showAppToast({ message: '下载能力建设中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-report {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-report__header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.page-report__search-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.page-report__search-box {
  flex: 1;
}

.page-report__filter {
  color: #2563eb;
  font-size: 26rpx;
  font-weight: 500;
}

.page-report__body {
  flex: 1;
  min-height: 0;
}

.page-report__content {
  height: 100%;
  padding: 16rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.page-report__card {
  margin-bottom: 14rpx;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 24rpx;
  border: 1rpx solid #f1f5f9;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.06);
}

.page-report__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 12rpx;
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
  line-height: 1.45;
}

.page-report__sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-report__type {
  flex-shrink: 0;
  border: 1rpx solid #bfdbfe;
  border-radius: 10rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 20rpx;
  line-height: 1;
  padding: 10rpx 12rpx;
}

.page-report__meta-line {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #475569;
}

.page-report__status-wrap {
  margin-top: 10rpx;
}

.page-report__status {
  display: inline-flex;
  align-items: center;
  border-radius: 999rpx;
  font-size: 20rpx;
  padding: 6rpx 16rpx;
}

.status-valid {
  background: #ecfeff;
  color: #0f766e;
}

.status-void {
  background: #fff1f2;
  color: #e11d48;
}

.page-report__actions {
  margin-top: 14rpx;
  @include service-card-actions(null, 12rpx);
}

.page-report__archive-card {
  margin-top: 10rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #f1f5f9;
  padding: 24rpx;
}

.page-report__archive-title {
  display: block;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
}

.page-report__archive-tags {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.page-report__archive-tag {
  padding: 9rpx 18rpx;
  border-radius: 10rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 20rpx;
}

.page-report__archive-tag--active {
  background: #2563eb;
  color: #ffffff;
}
</style>
