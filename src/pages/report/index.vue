<template>
  <view class="page-report">
    <view class="page-report__header">
      <view class="page-report__search-row">
        <AppSearchPlaceholder
          class="page-report__search-box"
          custom-style="padding: 18rpx 24rpx;"
          placeholder="搜索报告名称 / 委托编号"
          text-size="24rpx"
          tone="surface"
        />
        <AppButton
          custom-style="min-height: 64rpx; padding: 0 24rpx; border-color: #bfdbfe;"
          plain
          round
          size="small"
          text="筛选"
          type="info"
          @click="noop"
        />
      </view>

      <AppTabs v-model="activeTab">
        <AppTab
          v-for="tab in tabs"
          :key="tab"
          :name="tab"
          :title="tab"
        >
          <scroll-view scroll-y class="page-report__content">
            <AppList :finished="true">
              <view v-for="report in getReportsByTab(tab)" :key="report.id" class="page-report__card">
                <view class="page-report__card-head">
                  <view class="page-report__icon-wrap">
                    <AppIcon color="#2563eb" name="report" size="22" />
                  </view>
                  <view class="page-report__title-wrap">
                    <text class="page-report__title">{{ report.name }}</text>
                    <text class="page-report__sub">委托编号：{{ report.no }}</text>
                  </view>
                  <text
                    class="page-report__status"
                    :class="{
                      'page-report__status--done': report.statusClass === 'status-done',
                      'page-report__status--archived': report.statusClass === 'status-archived',
                      'page-report__status--pending': report.statusClass === 'status-pending'
                    }"
                  >{{ report.status }}</text>
                </view>

                <view class="page-report__meta">
                  <text class="page-report__org">{{ report.org }}</text>
                  <text class="page-report__date">{{ report.date }}</text>
                </view>

                <view class="page-report__actions">
                  <AppButton
                    block
                    plain
                    preset="action"
                    text="预览"
                    type="info"
                    @click="noop"
                  />
                  <AppButton
                    block
                    preset="action"
                    text="下载报告"
                    type="info"
                    @click="noop"
                  />
                </view>
              </view>
            </AppList>
          </scroll-view>
        </AppTab>
      </AppTabs>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'

type ReportTab = '全部' | '检验报告' | '认证证书' | '质量文件'

interface ReportItem {
  id: number
  name: string
  no: string
  org: string
  date: string
  status: string
  statusClass: 'status-done' | 'status-archived' | 'status-pending'
  category: Exclude<ReportTab, '全部'>
}

const activeTab = ref<ReportTab>('全部')
const tabs: ReportTab[] = ['全部', '检验报告', '认证证书', '质量文件']
const reports: ReportItem[] = [
  { id: 1, name: '金属材料成分检测报告', no: 'DD20260418001', org: '湖南质量检测研究院', date: '2026-04-18', status: '已完成', statusClass: 'status-done', category: '检验报告' },
  { id: 2, name: 'ISO 9001认证证书', no: 'DD20260410007', org: '湖南质量认证中心', date: '2026-04-10', status: '已归档', statusClass: 'status-archived', category: '认证证书' },
  { id: 3, name: '电磁兼容EMC测试报告', no: 'DD20260405003', org: '深圳华检技术服务', date: '2026-04-05', status: '待确认', statusClass: 'status-pending', category: '质量文件' },
]

function getReportsByTab(tab: ReportTab) {
  if (tab === '全部') {
    return reports
  }

  return reports.filter((report) => report.category === tab)
}

function noop() {}
</script>

<style scoped lang="scss">
.page-report {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}

.page-report__header {
  flex: 1;
  min-height: 0;
  background: linear-gradient(180deg, #e0ecff 0%, #f1f5f9 100%);
  padding: 16rpx 24rpx 0;
  position: relative;
  overflow: hidden;
}

.page-report__header::before {
  content: '';
  position: absolute;
  top: -80rpx;
  right: -60rpx;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.08);
  filter: blur(60rpx);
  pointer-events: none;
}

.page-report__header::after {
  content: '';
  position: absolute;
  top: 40rpx;
  left: -40rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.06);
  filter: blur(50rpx);
  pointer-events: none;
}

.page-report__search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.page-report__search-box {
  flex: 1;
}

.page-report__content {
  height: calc(100vh - 220rpx);
  padding: 20rpx 0;
}

.page-report__card {
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.page-report__card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);
}

.page-report__card-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.page-report__icon-wrap {
  display: flex;
  height: 76rpx;
  width: 76rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transition: background 0.3s ease;
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
  line-height: 1.4;
}

.page-report__sub {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.page-report__status {
  flex-shrink: 0;
  @include status-chip(24rpx, 999rpx, 6rpx 16rpx);
  transition: background 0.3s ease, color 0.3s ease;
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
  margin-bottom: 20rpx;
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
  @include service-card-actions(null, 12rpx);
}
</style>
