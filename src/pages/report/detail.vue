<template>
  <view class="page-report-detail">
    <scroll-view class="page-report-detail__scroll" scroll-y>
      <view class="page-report-detail__hero">
        <text class="page-report-detail__hero-title">{{ report?.reportName || '报告详情' }}</text>
        <text class="page-report-detail__hero-sub">报告编号：{{ report?.reportNo || '-' }}</text>
        <text class="page-report-detail__hero-sub">防伪码：{{ report?.antiFakeCode || '-' }}</text>
      </view>

      <view class="page-report-detail__card">
        <text class="page-report-detail__card-title">报告信息</text>
        <view class="info-row"><text>委托编号</text><text>{{ report?.orderNo || '-' }}</text></view>
        <view class="info-row"><text>检测机构</text><text>{{ report?.institution || '-' }}</text></view>
        <view class="info-row"><text>当前版本</text><text>{{ report?.version || '-' }}</text></view>
        <view class="info-row info-row--last"><text>状态</text><text>{{ statusLabel }}</text></view>
      </view>

      <view class="page-report-detail__card">
        <text class="page-report-detail__card-title">防伪二维码</text>
        <view class="qr-shell">
          <image v-if="report?.antiFakeQr" class="qr-image" :src="report.antiFakeQr" mode="aspectFit" />
          <text v-else class="qr-fallback">二维码生成中</text>
        </view>
        <text class="qr-tip">客户可通过唯一报告编号与防伪二维码随时查验真伪。</text>
      </view>

      <view class="page-report-detail__card">
        <text class="page-report-detail__card-title">版本/作废/重发记录</text>
        <view v-for="item in report?.versionRecords || []" :key="`${item.version}-${item.time}`" class="version-row">
          <view class="version-row__left">
            <text class="version-row__title">{{ actionTextMap[item.action] }} · {{ item.version }}</text>
            <text class="version-row__note">{{ item.note }}</text>
          </view>
          <text class="version-row__time">{{ item.time }}</text>
        </view>
      </view>

      <view class="actions">
        <AppButton block text="下载报告" type="info" @click="showComingSoon" />
        <AppButton block plain text="去报告查验" type="default" @click="goVerify" />
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
import { reportService } from '@/services/api'
import { getReportStatusLabel } from '@/services/api/report'
import { showAppToast } from '@/services/ui/toast'
import type { ReportRecord } from '@/types/business'

const report = ref<ReportRecord | null>(null)

const actionTextMap = {
  create: '生成',
  reissue: '重发',
  void: '作废',
}

onLoad(async (query) => {
  const id = typeof query?.id === 'string' ? query.id : ''

  if (!id) {
    return
  }

  report.value = await reportService.getDetail(id)
})

const statusLabel = computed(() => {
  if (!report.value) {
    return '-'
  }

  return getReportStatusLabel(report.value.status)
})

function goVerify() {
  uni.navigateTo({ url: '/pages/report/verify' })
}

function showComingSoon() {
  showAppToast({ message: '下载能力建设中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-report-detail {
  min-height: 100vh;
  background: #f8fafc;
}

.page-report-detail__scroll {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.page-report-detail__hero {
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  margin-bottom: 16rpx;
}

.page-report-detail__hero-title {
  display: block;
  font-size: 32rpx;
  color: #1e3a8a;
  font-weight: 700;
}

.page-report-detail__hero-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  color: #1d4ed8;
}

.page-report-detail__card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-report-detail__card-title {
  display: block;
  margin-bottom: 14rpx;
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 700;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #334155;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.info-row--last {
  border-bottom: 0;
}

.qr-shell {
  width: 240rpx;
  height: 240rpx;
  margin: 8rpx auto;
  border-radius: 16rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 220rpx;
  height: 220rpx;
}

.qr-fallback {
  color: #94a3b8;
  font-size: 24rpx;
}

.qr-tip {
  display: block;
  text-align: center;
  color: #64748b;
  font-size: 22rpx;
  margin-top: 8rpx;
}

.version-row {
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  display: flex;
  gap: 10rpx;
  justify-content: space-between;
}

.version-row:last-child {
  border-bottom: 0;
}

.version-row__left {
  min-width: 0;
  flex: 1;
}

.version-row__title {
  display: block;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.version-row__note {
  display: block;
  color: #64748b;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.version-row__time {
  color: #94a3b8;
  font-size: 20rpx;
  white-space: nowrap;
}

.actions {
  display: grid;
  gap: 10rpx;
  padding-bottom: 24rpx;
}
</style>
