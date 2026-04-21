<template>
  <view class="page-certification">
    <view class="search-header">
      <AppSearchPlaceholder
        custom-style="padding: 16rpx 24rpx;"
        placeholder="搜索认证类型 / 机构 / 行业"
        text-size="26rpx"
        tone="muted"
      />

      <AppTabs v-model="activeCategory">
        <AppTab
          v-for="category in categories"
          :key="category"
          :name="category"
          :title="category"
        >
          <scroll-view class="page-certification__scroll" scroll-y>
            <AppList :finished="true">
              <view class="card-grid">
                <view
                  v-for="item in getServicesByCategory(category)"
                  :key="item.name"
                  class="service-card"
                  @tap="goOrder(item)"
                >
                  <view class="service-card__media" :style="{ background: item.imgBg }">
                    <AppIcon :name="item.iconName" size="36" />
                  </view>
                  <view class="service-card__body">
                    <text class="service-card__title">{{ item.name }}</text>
                    <text class="service-card__org">{{ item.org }}</text>
                    <view class="service-card__price-row">
                      <text class="service-card__price">¥{{ item.price }}起</text>
                      <text class="service-card__sold">已售 {{ item.sold }}</text>
                    </view>
                    <view class="service-card__tags">
                      <text
                        v-for="tag in item.tags"
                        :key="tag"
                        class="service-card__tag service-card__tag--cert"
                      >{{ tag }}</text>
                    </view>
                    <view class="service-card__actions">
                      <AppButton
                        block
                        custom-style="min-height: 60rpx; padding: 0; border-radius: 18rpx; font-size: 22rpx; white-space: nowrap;"
                        plain
                        size="small"
                        text="咨询"
                        type="default"
                        @click.stop="goConsult"
                      />
                      <AppButton
                        block
                        custom-style="min-height: 60rpx; padding: 0; border-radius: 18rpx; font-size: 22rpx; white-space: nowrap;"
                        size="small"
                        text="立即下单"
                        type="info"
                        @click.stop="goOrder(item)"
                      />
                    </view>
                  </view>
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
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'

type CertificationCategory = '全部' | 'CE认证' | 'ISO认证' | 'CCC认证' | '有机认证' | '质量管理' | '环境管理'

interface CertificationService {
  category: CertificationCategory
  name: string
  org: string
  price: number
  sold: string
  iconName: string
  imgBg: string
  tags: string[]
}

const activeCategory = ref<CertificationCategory>('全部')
const categories: CertificationCategory[] = ['全部', 'CE认证', 'ISO认证', 'CCC认证', '有机认证', '质量管理', '环境管理']
const services = ref<CertificationService[]>([
  { category: 'CE认证', name: 'CE认证咨询', org: '深圳华检技术服务', price: 3800, sold: '654', iconName: 'certification', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CE', '欧盟认证'] },
  { category: 'ISO认证', name: 'ISO 9001认证', org: '北京华质检测技术', price: 5600, sold: '432', iconName: 'quality', imgBg: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)', tags: ['ISO', '质量管理'] },
  { category: 'CCC认证', name: 'CCC强制认证', org: '中国质量认证中心', price: 4200, sold: '867', iconName: 'success', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CCC', '国内强制'] },
  { category: '环境管理', name: 'ISO 14001认证', org: '湖南质量认证服务中心', price: 6800, sold: '298', iconName: 'environment', imgBg: 'linear-gradient(135deg,#ecfdf5,#bbf7d0)', tags: ['ISO', '环境管理'] },
  { category: '有机认证', name: '有机产品认证', org: '中绿华夏有机食品认证', price: 9800, sold: '134', iconName: 'food', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['有机', '食品农业'] },
  { category: '质量管理', name: 'IATF 16949认证', org: '广州赛宝认证中心', price: 12000, sold: '89', iconName: 'vehicle', imgBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', tags: ['汽车行业', 'IATF'] },
])

function getServicesByCategory(category: CertificationCategory) {
  if (category === '全部') {
    return services.value
  }

  return services.value.filter((service) => service.category === category)
}

function goOrder(item: CertificationService) {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: `/pages/order/create?service=${encodeURIComponent(item.name)}` })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}
</script>

<style scoped lang="scss">
.page-certification {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.search-header {
  flex: 1;
  min-height: 0;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 200rpx, #ffffff 100%);
  padding: 16rpx 24rpx 0;
  border-bottom: 1rpx solid rgba(226, 232, 240, 0.6);
  position: relative;
  overflow: hidden;

  // Decorative orb
  &::before {
    content: '';
    position: absolute;
    top: -60rpx;
    left: -40rpx;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
    filter: blur(20rpx);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: -20rpx;
    right: -60rpx;
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
    filter: blur(18rpx);
    pointer-events: none;
  }
}

.search-header :deep(.app-search-placeholder) {
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.page-certification__scroll {
  height: calc(100vh - 220rpx);
}

.card-grid {
  @include service-card-grid(20rpx 0 40rpx, 16rpx);
}

.service-card {
  @include service-card-shell(24rpx);
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card__media {
  @include service-card-media(180rpx);
}

.service-card__body {
  @include service-card-body(20rpx);
}

.service-card__title {
  @include service-card-title(26rpx, 1.4);
}

.service-card__org {
  @include service-card-org(22rpx, #64748b, 6rpx);
}

.service-card__price-row {
  @include service-card-price-row(12rpx);
}

.service-card__price {
  @include service-card-price(28rpx);
}

.service-card__sold {
  @include service-card-sold(20rpx);
}

.service-card__tags {
  @include service-card-tags(12rpx, null, 8rpx);
}

.service-card__tag {
  @include service-card-tag(20rpx, 8rpx, 4rpx 12rpx);
  transition: all 0.2s ease;
}

.service-card__tag--cert {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.service-card__actions {
  @include service-card-actions(8rpx, 12rpx);

  :deep(.app-button) {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
}
</style>
