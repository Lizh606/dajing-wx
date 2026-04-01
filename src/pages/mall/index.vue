<template>
  <view class="page-mall">
    <view class="page-mall__header">
      <AppSearchPlaceholder
        custom-style="padding: 20rpx 24rpx;"
        placeholder="搜索认证 / 计量 / 标准 / 咨询 / 培训"
        text-size="26rpx"
        tone="surface"
      />

      <AppTabs v-model="activeCategory">
        <AppTab
          v-for="category in categories"
          :key="category.key"
          :name="category.key"
          :title="category.label"
        >
          <scroll-view class="page-mall__scroll" scroll-y>
            <AppList :finished="true" finished-text="没有更多服务了">
              <view class="card-grid">
                <view v-for="item in getMallItemsByCategory(category.key)" :key="item.id" class="service-card" @tap="noop">
                  <view class="service-card__media" :style="{ background: item.imgBg }">
                    <AppIcon :name="item.iconName" size="32" />
                  </view>
                  <view class="service-card__body">
                    <text class="service-card__title">{{ item.name }}</text>
                    <text class="service-card__org">{{ item.sub }}</text>
                    <view class="service-card__price-row">
                      <text class="service-card__price">¥{{ item.price }}</text>
                      <text class="service-card__sold">已售 {{ item.sold }}</text>
                    </view>
                    <view class="service-card__tags">
                      <text v-for="tag in item.tags" :key="tag" class="service-card__tag service-card__tag--muted">{{ tag }}</text>
                    </view>
                    <AppButton
                      block
                      preset="action"
                      text="查看详情"
                      type="info"
                      @click.stop="noop"
                    />
                  </view>
                </view>
              </view>
            </AppList>
          </scroll-view>
        </AppTab>
      </AppTabs>
    </view>

    <!-- #ifdef H5 -->
    <CustomTabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'

type MallCategory = 'all' | 'certification' | 'measure' | 'standard' | 'consult' | 'training'

interface MallItem {
  id: string
  category: Exclude<MallCategory, 'all'>
  name: string
  sub: string
  price: string
  sold: string
  iconName: string
  imgBg: string
  tags: string[]
}

const activeCategory = ref<MallCategory>('all')
const categories = [
  { key: 'all', label: '全部' },
  { key: 'certification', label: '认证认可' },
  { key: 'measure', label: '计量校准' },
  { key: 'standard', label: '标准服务' },
  { key: 'consult', label: '质量咨询' },
  { key: 'training', label: '质量培训' },
] as const

const mallItems = ref<MallItem[]>([
  { id: '1', category: 'certification', name: 'CE认证咨询', sub: '出口欧盟合规辅导', price: '3,800', sold: '654', iconName: 'certification', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['认证认可', '欧盟'] },
  { id: '2', category: 'certification', name: 'ISO 9001认证', sub: '质量管理体系认证', price: '5,600', sold: '432', iconName: 'quality', imgBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', tags: ['ISO', '体系认证'] },
  { id: '3', category: 'measure', name: '力学仪器计量校准', sub: '万能试验机年度校准', price: '1,280', sold: '298', iconName: 'standard', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['计量校准', '设备'] },
  { id: '4', category: 'measure', name: '电学仪表校准', sub: '万用表与示波器校准', price: '860', sold: '376', iconName: 'electric', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', tags: ['计量校准', '电学'] },
  { id: '5', category: 'standard', name: 'GB/T 228 金属拉伸标准', sub: '2022版电子版', price: '680', sold: '891', iconName: 'book', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['标准服务', '电子版'] },
  { id: '6', category: 'standard', name: 'CE认证申请指南', sub: '2025最新版', price: '199', sold: '1,102', iconName: 'document', imgBg: 'linear-gradient(135deg,#ecfdf5,#6ee7b7)', tags: ['标准服务', '指南'] },
  { id: '7', category: 'consult', name: '质量体系诊断', sub: '企业现场差距分析', price: '2,400', sold: '187', iconName: 'analysis', imgBg: 'linear-gradient(135deg,#f3e8ff,#c084fc)', tags: ['质量咨询', '诊断'] },
  { id: '8', category: 'consult', name: '出口合规咨询', sub: '法规梳理与认证路径', price: '3,200', sold: '143', iconName: 'service', imgBg: 'linear-gradient(135deg,#eff6ff,#bfdbfe)', tags: ['质量咨询', '合规'] },
  { id: '9', category: 'training', name: '实验室内审员培训', sub: 'CMA/CNAS专题课程', price: '599', sold: '526', iconName: 'training', imgBg: 'linear-gradient(135deg,#fde68a,#fbbf24)', tags: ['质量培训', '线上课'] },
  { id: '10', category: 'training', name: '质量工程师进阶营', sub: '标准解读与案例实战', price: '1,299', sold: '208', iconName: 'book', imgBg: 'linear-gradient(135deg,#e0f2fe,#7dd3fc)', tags: ['质量培训', '进阶'] },
])

function getMallItemsByCategory(category: MallCategory) {
  if (category === 'all') {
    return mallItems.value
  }

  return mallItems.value.filter((item) => item.category === category)
}

function noop() {}
</script>

<style scoped lang="scss">
.page-mall {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
  background: #f8fafc;
}

.page-mall__header {
  flex: 1;
  min-height: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
  padding: 20rpx 24rpx 0;
}

.page-mall__header :deep(.app-search-placeholder) {
  margin-bottom: 20rpx;
}

.page-mall__scroll {
  height: calc(100vh - 220rpx);
  padding: 24rpx 0;
  box-sizing: border-box;
}

.card-grid {
  @include service-card-grid(null, 16rpx);
}

.service-card {
  @include service-card-shell(20rpx);
}

.service-card__media {
  @include service-card-media(160rpx);
}

.service-card__body {
  @include service-card-body(20rpx);
}

.service-card__title {
  @include service-card-title(26rpx, 1.4);
}

.service-card__org {
  @include service-card-org(20rpx, #64748b, 4rpx);
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
  @include service-card-tags(10rpx, 16rpx, 6rpx);
}

.service-card__tag {
  @include service-card-tag(18rpx, 6rpx, 4rpx 12rpx);
}

.service-card__tag--muted {
  background: #f1f5f9;
  color: #475569;
}
</style>
