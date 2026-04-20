<template>
  <view class="page-institution-services">
    <view class="search-header">
      <AppSearchPlaceholder
        custom-style="padding: 18rpx 24rpx;"
        placeholder="搜索服务项目"
        text-size="24rpx"
        tone="surface"
      />
    </view>

    <scroll-view class="page-institution-services__content" scroll-y>
      <AppList :finished="true">
        <view class="card-grid">
          <view v-for="service in services" :key="service.name" class="service-card">
            <view class="service-card__media" :style="{ background: service.imgBg }">
              <AppIcon :name="service.iconName" size="36" />
            </view>
            <view class="service-card__body">
              <text class="service-card__title">{{ service.name }}</text>
              <text class="service-card__org">湖南质量检测研究院</text>
              <view class="service-card__price-row">
                <text class="service-card__price">¥{{ service.price }}起</text>
                <text class="service-card__sold">已售 {{ service.sold }}</text>
              </view>
              <view class="service-card__tags">
                <text v-for="tag in service.tags" :key="tag" class="service-card__tag">{{ tag }}</text>
              </view>
              <view class="service-card__actions">
                <AppButton
                  block
                  custom-style="min-height: 60rpx; padding: 0; border-radius: 18rpx; font-size: 22rpx; white-space: nowrap;"
                  plain
                  size="small"
                  text="咨询"
                  type="default"
                  @click="goConsult"
                />
                <AppButton
                  block
                  custom-style="min-height: 60rpx; padding: 0; border-radius: 18rpx; font-size: 22rpx; white-space: nowrap;"
                  size="small"
                  text="立即下单"
                  type="info"
                  @click="goOrder"
                />
              </view>
            </view>
          </view>
        </view>
      </AppList>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'

const services = [
  { name: '金属材料成分检测', iconName: 'lab', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', price: 980, sold: '1,286', tags: ['CMA', '3天出报告'] },
  { name: '机械性能测试', iconName: 'automation', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', price: 1200, sold: '987', tags: ['CMA', 'CNAS', '5天出报告'] },
  { name: '化学成分分析', iconName: 'chemistry', imgBg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', price: 850, sold: '2,134', tags: ['CNAS', '4天出报告'] },
  { name: '硬度检测', iconName: 'equipment', imgBg: 'linear-gradient(135deg,#f5f3ff,#ddd6fe)', price: 560, sold: '3,421', tags: ['CMA', '2天出报告'] },
  { name: '无损检测', iconName: 'analysis', imgBg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', price: 1800, sold: '654', tags: ['CNAS', '7天出报告'] },
  { name: '腐蚀性测试', iconName: 'warning', imgBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', price: 1500, sold: '432', tags: ['CMA', '6天出报告'] },
]

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}

function goOrder() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/order/create' })
}
</script>

<style scoped lang="scss">
.page-institution-services {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.search-header {
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  padding: 16rpx 24rpx 20rpx;
  border-bottom: 1rpx solid rgba(37, 99, 235, 0.08);
}


.page-institution-services__content {
  flex: 1;
  min-height: 0;
  padding: 16rpx 24rpx 40rpx;
}

.card-grid {
  @include service-card-grid(null, 20rpx);
}

.service-card {
  @include service-card-shell(24rpx);
  border: 1rpx solid rgba(15, 23, 42, 0.04);
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card__media {
  @include service-card-media(160rpx);
  position: relative;
  overflow: hidden;
}

.service-card__media::after {
  content: '';
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  filter: blur(20rpx);
  pointer-events: none;
}

.service-card__body {
  @include service-card-body(24rpx);
}

.service-card__title {
  @include service-card-title(26rpx, 1.4, null, 6rpx);
}

.service-card__org {
  @include service-card-org(20rpx, #94a3b8, null, 12rpx);
}

.service-card__price-row {
  @include service-card-price-row(null, 10rpx);
}

.service-card__price {
  @include service-card-price(26rpx);
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.service-card__sold {
  @include service-card-sold(20rpx);
}

.service-card__tags {
  @include service-card-tags(null, 12rpx, 6rpx);
}

.service-card__tag {
  @include service-card-tag(18rpx, 10rpx, 4rpx 12rpx);
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  transition: all 0.2s ease;
}

.service-card__actions {
  @include service-card-actions(null, 8rpx);
}
</style>
