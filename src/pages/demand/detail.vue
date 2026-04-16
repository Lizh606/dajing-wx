<template>
  <view class="page-demand-detail">
    <view class="page-demand-detail__scroll">
      <view class="page-demand-detail__content">
        <view class="page-demand-detail__hero page-demand-detail__card">
          <view class="page-demand-detail__hero-top">
            <view class="page-demand-detail__hero-main">
              <view class="page-demand-detail__hero-title-row">
                <text class="page-demand-detail__hero-title">新能源汽车电池包安全性能检测需求</text>
                <view class="page-demand-detail__tag page-demand-detail__tag--primary">长期合作</view>
              </view>
              <text class="page-demand-detail__hero-meta">需求编号：REQ20260418008 · 发布时间：2026-04-18</text>
            </view>
            <view class="page-demand-detail__status">待机构响应</view>
          </view>
          <view class="page-demand-detail__stats">
            <view class="page-demand-detail__stats-item">
              <text class="page-demand-detail__stats-value">3家</text>
              <text class="page-demand-detail__stats-label">已响应机构</text>
            </view>
            <view class="page-demand-detail__stats-item">
              <text class="page-demand-detail__stats-value">¥80,000</text>
              <text class="page-demand-detail__stats-label">金额上限</text>
            </view>
            <view class="page-demand-detail__stats-item">
              <text class="page-demand-detail__stats-value">2026-04-30前</text>
              <text class="page-demand-detail__stats-label">期望完成</text>
            </view>
          </view>
        </view>

        <view class="page-demand-detail__card">
          <text class="page-demand-detail__card-title">需求详情</text>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">项目名称</text>
            <text class="page-demand-detail__detail-value">新能源汽车电池包安全性能检测需求</text>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">需求说明</text>
            <text class="page-demand-detail__detail-value">
              拟开展新能源汽车电池包安全性能检测，重点关注挤压、热扩散、过充保护、短路保护等关键指标，期望机构提供检测方案、排期建议与报价明细。
            </text>
          </view>

          <view class="page-demand-detail__detail-grid">
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">金额上限</text>
              <text class="page-demand-detail__detail-value">¥80,000</text>
            </view>
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">是否加急</text>
              <text class="page-demand-detail__detail-value">是</text>
            </view>
          </view>

          <view class="page-demand-detail__detail-grid">
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">联系人</text>
              <text class="page-demand-detail__detail-value">张先生</text>
            </view>
            <view class="page-demand-detail__detail-item page-demand-detail__detail-item--compact">
              <text class="page-demand-detail__detail-label">联系方式</text>
              <text class="page-demand-detail__detail-value">138****5620</text>
            </view>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">联系地址</text>
            <text class="page-demand-detail__detail-value">湖南省株洲市天元区栗雨工业园某制造基地</text>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">资质要求</text>
            <text class="page-demand-detail__detail-value">优先具备 CMA / CNAS 资质，支持新能源电池相关项目检测。</text>
          </view>

          <view class="page-demand-detail__detail-item">
            <text class="page-demand-detail__detail-label">期望完成时间</text>
            <text class="page-demand-detail__detail-value">2026-04-30 前</text>
          </view>

          <view class="page-demand-detail__attachment">
            <text class="page-demand-detail__attachment-title">附件与备注</text>
            <text class="page-demand-detail__attachment-sub">上传样品图片 / 图纸 / 技术文件</text>
            <text class="page-demand-detail__attachment-note">备注：样品检测完成后需寄回，并优先安排本周检测。</text>
          </view>
        </view>

        <view class="page-demand-detail__card">
          <view class="page-demand-detail__card-header">
            <text class="page-demand-detail__card-title page-demand-detail__card-title--no-margin">机构响应建议</text>
            <text class="page-demand-detail__card-link">查看全部</text>
          </view>
          <view class="page-demand-detail__suggestion-list">
            <view v-for="item in suggestions" :key="item.title" class="page-demand-detail__suggestion-item">
              <text class="page-demand-detail__suggestion-title">{{ item.title }}</text>
              <text class="page-demand-detail__suggestion-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="page-demand-detail__actions">
      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 16rpx; font-size: 28rpx;"
        plain
        text="联系"
        type="info"
        @click="contactDemand"
      />
      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 16rpx; font-size: 28rpx;"
        text="提交方案"
        type="info"
        @click="submitPlan"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppToast, showSuccessToast } from '@/services/ui/toast'

const suggestions = [
  { title: '建议上传历史样品参数', desc: '便于机构更快判断测试路径与实验资源排期。' },
  { title: '建议说明是否接受分批检测', desc: '可帮助机构提供更准确的报价与交付时间。' },
]

function contactDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  showAppToast({ message: '已发起联系，请前往消息中心查看', icon: 'none' })
}

function submitPlan() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  showSuccessToast('提交成功，已通知需求方查看')
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/message/index' })
  }, 800)
}
</script>

<style scoped lang="scss">
.page-demand-detail {
  min-height: 100vh;
  background: #f8fafc;
}

.page-demand-detail__scroll {
  box-sizing: border-box;
}

.page-demand-detail__content {
  padding: 24rpx;
  padding-bottom: 24rpx;
  box-sizing: border-box;
}

.page-demand-detail__card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  border: 1rpx solid #f1f5f9;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-demand-detail__hero {
  padding: 28rpx;
}

.page-demand-detail__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.page-demand-detail__hero-main {
  flex: 1;
  min-width: 0;
}

.page-demand-detail__hero-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12rpx;
}

.page-demand-detail__hero-title {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.5;
  color: #0f172a;
}

.page-demand-detail__hero-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.page-demand-detail__status {
  flex-shrink: 0;
  white-space: nowrap;
  border-radius: 10rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #92400e;
  background: #fffbeb;
}

.page-demand-detail__stats {
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.page-demand-detail__stats-item {
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  background: #f8fafc;
}

.page-demand-detail__stats-value {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-demand-detail__stats-label {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-demand-detail__card-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-detail__card-title--no-margin {
  margin-bottom: 0;
}

.page-demand-detail__detail-item {
  margin-bottom: 12rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
}

.page-demand-detail__detail-item--last {
  margin-bottom: 0;
}

.page-demand-detail__detail-item--compact {
  margin-bottom: 0;
}

.page-demand-detail__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.page-demand-detail__detail-label {
  display: block;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-demand-detail__detail-value {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.6;
  color: #0f172a;
}

.page-demand-detail__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.page-demand-detail__tag--primary {
  color: #2563eb;
  background: #eff6ff;
}

.page-demand-detail__attachment {
  border: 1rpx dashed #bfdbfe;
  border-radius: 12rpx;
  background: #eff6ff;
  padding: 20rpx;
}

.page-demand-detail__attachment-title {
  display: block;
  font-size: 25rpx;
  font-weight: 600;
  color: #1d4ed8;
}

.page-demand-detail__attachment-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #2563eb;
}

.page-demand-detail__attachment-note {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #475569;
  line-height: 1.5;
}

.page-demand-detail__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.page-demand-detail__card-link {
  font-size: 22rpx;
  font-weight: 500;
  background: #2563eb;
  color: #ffffff;
  border-radius: 999rpx;
  padding: 4rpx 16rpx;
}

.page-demand-detail__suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.page-demand-detail__suggestion-item {
  border-radius: 12rpx;
  background: #f8fafc;
  padding: 20rpx;
}

.page-demand-detail__suggestion-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-detail__suggestion-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #64748b;
}

.page-demand-detail__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  padding: 0 24rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

@media (max-width: 360px) {
  .page-demand-detail__detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
