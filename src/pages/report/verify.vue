<template>
  <view class="page-report-verify">
    <scroll-view class="page-report-verify__scroll" scroll-y>
      <view class="verify-card">
        <text class="verify-card__title">报告查验</text>
        <text class="verify-card__desc">仅支持查验本人/本企业参与检测的报告，保障数据安全。</text>

        <AppSearchBarWithButton
          v-model="reportNo"
          class="verify-card__search"
          button-text="查验"
          placeholder="请输入报告编号（例如 BG-HN-2026-0001）"
          @confirm="handleSearch"
          @search="handleSearch"
        />
      </view>

      <view v-if="result" class="result-card">
        <text class="result-card__title">查验结果</text>
        <text class="result-card__status" :class="result.canView ? 'ok' : 'fail'">{{ result.message }}</text>
        <text class="result-card__meta">查验时间：{{ result.verifiedAt }}</text>

        <view v-if="result.report" class="result-card__summary">
          <text>报告名称：{{ result.report.reportName }}</text>
          <text>报告编号：{{ result.report.reportNo }}</text>
          <text>版本：{{ result.report.version }}</text>
          <text>状态：{{ result.report.status === 'valid' ? '有效' : '已作废' }}</text>
        </view>

        <AppButton
          v-if="result.report && result.canView"
          block
          custom-style="margin-top: 12rpx;"
          plain
          text="查看报告详情"
          type="default"
          @click="goReportDetail"
        />
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppSearchBarWithButton from '@/components/ui/AppSearchBarWithButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { reportService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast } from '@/services/ui/toast'
import type { ReportVerifyResult } from '@/types/business'

const reportNo = ref('')
const result = ref<ReportVerifyResult | null>(null)

onLoad((query) => {
  if (typeof query?.reportNo === 'string' && query.reportNo.trim()) {
    reportNo.value = query.reportNo.trim()
    void verify()
  }
})

function handleSearch(keyword?: string) {
  if (typeof keyword === 'string') {
    reportNo.value = keyword.trim()
  }

  void verify()
}

async function verify() {
  if (!reportNo.value.trim()) {
    showFailToast('请输入报告编号')
    return
  }

  try {
    result.value = await reportService.verifyByReportNo(reportNo.value)
  } catch (error) {
    showFailToast(getErrorMessage(error, '报告查验失败，请稍后重试'))
  }
}

function goReportDetail() {
  const reportId = result.value?.report?.id

  if (!reportId) {
    return
  }

  uni.navigateTo({ url: `/pages/report/detail?id=${encodeURIComponent(reportId)}` })
}
</script>

<style scoped lang="scss">
.page-report-verify {
  min-height: 100vh;
  background: #f8fafc;
}

.page-report-verify__scroll {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.verify-card,
.result-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.verify-card__title,
.result-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10rpx;
}

.verify-card__desc {
  display: block;
  font-size: 23rpx;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 14rpx;
}

.verify-card__search {
  margin-top: 6rpx;
}

.result-card__status {
  display: block;
  margin-bottom: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.result-card__status.ok {
  color: #16a34a;
}

.result-card__status.fail {
  color: #e11d48;
}

.result-card__meta {
  display: block;
  color: #64748b;
  font-size: 22rpx;
  margin-bottom: 12rpx;
}

.result-card__summary {
  display: grid;
  gap: 6rpx;
  color: #334155;
  font-size: 23rpx;
}
</style>
