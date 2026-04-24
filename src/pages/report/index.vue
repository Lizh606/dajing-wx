<template>
  <view class="page-report">
    <view class="page-report__header">
      <view class="page-report__search-row">
        <AppSearchPlaceholder
          class="page-report__search-box"
          placeholder="搜索报告名称 / 委托编号"
        />
        <text class="page-report__filter" @tap="goVerify">筛选</text>
      </view>
    </view>

    <view class="page-report__body">
      <scroll-view scroll-y class="page-report__content">
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
                @click.stop="downloadReport(report.id)"
              />
            </view>
          </view>
        </AppList>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import { orderService, reportService } from '@/services/api'
import { getReportStatusLabel } from '@/services/api/report'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast } from '@/services/ui/toast'
import type { ReportRecord } from '@/types/business'

const loading = ref(false)
const reports = ref<ReportRecord[]>([])
const lastLoadAt = ref(0)
const LOAD_DEDUP_MS = 800

onShow(() => {
  const now = Date.now()
  if (loading.value || now - lastLoadAt.value < LOAD_DEDUP_MS) {
    return
  }

  lastLoadAt.value = now
  void loadReports()
})

async function loadReports() {
  loading.value = true

  try {
    const orders = await orderService.getList()
    const orderIds = orders.map((item) => item.id).filter(Boolean)
    reports.value = await reportService.getList(orderIds)
  } catch (error) {
    showFailToast(getErrorMessage(error, '报告列表加载失败'))
    reports.value = []
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

async function downloadReport(reportId: string) {
  try {
    const downloadUrl = await reportService.getDownloadUrl(reportId)

    if (!downloadUrl) {
      showFailToast('未获取到可用下载地址')
      return
    }

    uni.setClipboardData({
      data: downloadUrl,
      success: () => {
        showAppToast({ message: '下载链接已复制，请在浏览器打开', icon: 'none' })
      },
      fail: () => {
        showFailToast('下载链接复制失败，请稍后重试')
      },
    })
  } catch (error) {
    showFailToast(getErrorMessage(error, '下载地址获取失败'))
  }
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
  color: #1E61FF;
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
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
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
  margin-bottom: 14rpx;
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
  background: #1E61FF;
  color: #ffffff;
}
</style>
