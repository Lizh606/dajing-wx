<template>
  <view class="page-demand-detail">
    <scroll-view class="page-demand-detail__scroll" scroll-y>
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
            <text class="page-demand-detail__stats-value">¥8,000</text>
            <text class="page-demand-detail__stats-label">预算参考</text>
          </view>
          <view class="page-demand-detail__stats-item">
            <text class="page-demand-detail__stats-value">7天</text>
            <text class="page-demand-detail__stats-label">期望周期</text>
          </view>
        </view>
      </view>

      <view class="page-demand-detail__card">
        <text class="page-demand-detail__card-title">需求详情</text>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">项目需求</text>
          <text class="page-demand-detail__detail-value">
            新能源汽车电池包安全性能检测项目委托，面向具备相关能力的检测机构征集方案与报价。
          </text>
        </view>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">项目名称</text>
          <text class="page-demand-detail__detail-value">新能源汽车电池包安全性能检测</text>
        </view>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">详细描述</text>
          <text class="page-demand-detail__detail-value">
            拟开展新能源汽车电池包安全性能检测，重点关注挤压、热扩散、过充保护、短路保护等项目，
            需符合 GB 38031-2020 及 UN38.3 标准要求，具备 CNAS 或 CMA 资质机构优先。
          </text>
        </view>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">检测标准</text>
          <view class="page-demand-detail__tag-list">
            <view class="page-demand-detail__tag page-demand-detail__tag--primary">GB 38031-2020</view>
            <view class="page-demand-detail__tag page-demand-detail__tag--primary">UN38.3</view>
          </view>
        </view>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">资质要求</text>
          <view class="page-demand-detail__tag-list">
            <view class="page-demand-detail__tag page-demand-detail__tag--primary">CNAS认可</view>
            <view class="page-demand-detail__tag page-demand-detail__tag--primary">CMA资质</view>
          </view>
        </view>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">样品数量</text>
          <text class="page-demand-detail__detail-value">5套完整电池包</text>
        </view>
        <view class="page-demand-detail__detail-item">
          <text class="page-demand-detail__detail-label">期望完成</text>
          <text class="page-demand-detail__detail-value">2026-05-15 前</text>
        </view>
        <view class="page-demand-detail__detail-item page-demand-detail__detail-item--last">
          <text class="page-demand-detail__detail-label">预算范围</text>
          <text class="page-demand-detail__detail-value page-demand-detail__detail-value--price">¥6,000 - ¥10,000</text>
        </view>
      </view>

      <view class="page-demand-detail__card">
        <view class="page-demand-detail__card-header">
          <text class="page-demand-detail__card-title">已响应机构</text>
          <text class="page-demand-detail__badge">3</text>
        </view>
        <view class="page-demand-detail__timeline">
          <view
            v-for="institution in institutions"
            :key="institution.name"
            class="page-demand-detail__timeline-item"
            @tap="goInstitution"
          >
            <view class="page-demand-detail__institution-icon">
              <AppIcon :name="institution.iconName" size="28" />
            </view>
            <view class="page-demand-detail__institution-main">
              <text class="page-demand-detail__institution-name">{{ institution.name }}</text>
              <view class="page-demand-detail__tag-list">
                <text
                  v-for="tag in institution.tags"
                  :key="tag"
                  class="page-demand-detail__tag page-demand-detail__tag--success"
                >
                  {{ tag }}
                </text>
              </view>
              <text class="page-demand-detail__institution-quote">报价：{{ institution.quote }}</text>
            </view>
            <AppIcon color="#94a3b8" name="arrow" size="16" />
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="page-demand-detail__actions">
      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 16rpx;"
        plain
        round
        text="编辑需求"
        type="default"
        @click="editDemand"
      />
      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 16rpx;"
        round
        text="关闭需求"
        type="danger"
        @click="closeDemand"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppConfirm } from '@/services/ui/dialog'
import { showSuccessToast } from '@/services/ui/toast'

const institutions = ref([
  { name: '株洲市质量检测中心', iconName: 'lab', tags: ['CMA', 'CNAS'], quote: '¥7,200' },
  { name: '湖南质量检测研究院', iconName: 'institution', tags: ['CMA', 'CNAS', '国家级'], quote: '¥8,800' },
  { name: '中汽研汽车检验中心', iconName: 'vehicle', tags: ['CNAS', '专业汽车'], quote: '¥9,500' },
])

function goInstitution() {
  uni.navigateTo({ url: '/pages/institution/detail' })
}

function editDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/demand/publish' })
}

function closeDemand() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  showAppConfirm({
    title: '确认关闭',
    message: '关闭后需求将不再接受响应，是否确认？',
  })
    .then(() => {
      showSuccessToast('需求已关闭')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    })
    .catch(() => undefined)
}
</script>

<style scoped lang="scss">
.page-demand-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-demand-detail__scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
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
  font-size: 30rpx;
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

.page-demand-detail__detail-item {
  margin-bottom: 12rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
}

.page-demand-detail__detail-item--last {
  margin-bottom: 0;
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
  font-weight: 500;
  line-height: 1.6;
  color: #0f172a;
}

.page-demand-detail__detail-value--price {
  font-weight: 700;
  color: #2563eb;
}

.page-demand-detail__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.page-demand-detail__tag {
  @include pill-tag(22rpx, 8rpx, 6rpx 16rpx);
}

.page-demand-detail__tag--primary {
  @include pill-tag-tone(#2563eb, #dbeafe);
}

.page-demand-detail__tag--success {
  @include pill-tag-tone(#065f46, #ecfdf5);
}

.page-demand-detail__card-header {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.page-demand-detail__badge {
  @include count-badge(36rpx, 4rpx 14rpx, 999rpx, 22rpx);
  color: #ffffff;
  background: #2563eb;
}

.page-demand-detail__timeline {
  display: flex;
  flex-direction: column;
}

.page-demand-detail__timeline-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.page-demand-detail__timeline-item:last-child {
  border-bottom: 0;
}

.page-demand-detail__institution-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.page-demand-detail__institution-main {
  flex: 1;
  min-width: 0;
}

.page-demand-detail__institution-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-detail__institution-main .page-demand-detail__tag-list {
  margin: 8rpx 0;
  gap: 8rpx;
}

.page-demand-detail__institution-main .page-demand-detail__tag {
  padding: 4rpx 12rpx;
}

.page-demand-detail__institution-quote {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #2563eb;
}

.page-demand-detail__actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 20rpx 32rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
</style>
