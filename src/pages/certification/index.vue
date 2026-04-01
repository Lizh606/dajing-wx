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
  uni.navigateTo({ url: `/pages/order/create?service=${encodeURIComponent(item.name)}` })
}

function goConsult() {
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
  background: #ffffff;
  padding: 16rpx 24rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.search-header :deep(.app-search-placeholder) {
  margin-bottom: 20rpx;
}

.page-certification__scroll {
  height: calc(100vh - 220rpx);
}

.card-grid {
  @include service-card-grid(20rpx 0 40rpx, 16rpx);
}

.service-card {
  @include service-card-shell(24rpx);
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
}

.service-card__tag--cert {
  background: #fef3c7;
  color: #92400e;
}

.service-card__actions {
  @include service-card-actions(8rpx, 12rpx);
}
</style>
