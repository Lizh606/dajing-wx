<template>
  <view class="app-service-card" @tap="emit('click')">
    <view class="app-service-card__media">
      <image
        v-if="showImage"
        class="app-service-card__media-image"
        :lazy-load="lazyLoad"
        :mode="imageMode"
        :src="coverUrl"
        @error="emit('image-error')"
      />
      <view v-else class="app-service-card__media-fallback">
        <AppIcon color="#94a3b8" name="service" size="24" />
        <text class="app-service-card__media-fallback-text">{{ fallbackText }}</text>
      </view>
      <slot v-if="hasMediaExtraSlot" name="media-extra" />
    </view>

    <view class="app-service-card__body">
      <view v-if="hasTitleExtraSlot" class="app-service-card__title-row">
        <text class="app-service-card__title">{{ title }}</text>
        <slot name="title-extra" />
      </view>
      <text v-else class="app-service-card__title">{{ title }}</text>

      <text v-if="typeText && !hasTypeSlot" class="app-service-card__type-head">{{ typeText }}</text>
      <slot v-else-if="hasTypeSlot" name="type" />

      <view class="app-service-card__price-row">
        <text class="app-service-card__price">{{ priceText }}</text>
        <slot v-if="hasPriceRightSlot" name="price-right" />
        <text v-else-if="rightText" class="app-service-card__sold">{{ rightText }}</text>
      </view>

      <text v-if="descText && !hasDescSlot" class="app-service-card__desc">{{ descText }}</text>
      <slot v-else-if="hasDescSlot" name="desc" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'

interface Props {
  coverUrl?: string
  descText?: string
  fallbackText?: string
  forceFallback?: boolean
  imageMode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
  lazyLoad?: boolean
  priceText: string
  rightText?: string
  title: string
  typeText?: string
}

const props = withDefaults(defineProps<Props>(), {
  coverUrl: '',
  descText: '',
  fallbackText: '服务封面',
  forceFallback: false,
  imageMode: 'aspectFill',
  lazyLoad: false,
  rightText: '',
  typeText: '',
})

const emit = defineEmits<{
  (event: 'click'): void
  (event: 'image-error'): void
}>()

const slots = useSlots()

const hasTitleExtraSlot = computed(() => Boolean(slots['title-extra']))
const hasMediaExtraSlot = computed(() => Boolean(slots['media-extra']))
const hasTypeSlot = computed(() => Boolean(slots.type))
const hasPriceRightSlot = computed(() => Boolean(slots['price-right']))
const hasDescSlot = computed(() => Boolean(slots.desc))

const showImage = computed(() => !props.forceFallback && Boolean(props.coverUrl.trim()))
</script>

<style scoped lang="scss">
.app-service-card {
  overflow: hidden;
  border-radius: 22rpx;
  border: 1rpx solid #e6edf7;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.app-service-card:active {
  transform: scale(0.992);
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.1);
}

.app-service-card__media {
  position: relative;
  height: 188rpx;
  background: #f1f5f9;
}

.app-service-card__media-image {
  width: 100%;
  height: 100%;
  display: block;
}

.app-service-card__media-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
}

.app-service-card__media-fallback-text {
  color: #94a3b8;
  font-size: 20rpx;
}

.app-service-card__body {
  padding: 18rpx 18rpx 20rpx;
}

.app-service-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8rpx;
}

.app-service-card__title {
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  margin-bottom: 2rpx;
  overflow: hidden;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.app-service-card__type-head {
  display: inline-flex;
  margin-bottom: 6rpx;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  font-weight: 600;
  color: #1a56e5;
  background: #f0f5ff;
}

.app-service-card__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.app-service-card__price {
  color: #f97316;
  font-size: 26rpx;
  font-weight: 700;
}

.app-service-card__sold {
  color: #64748b;
  font-size: 20rpx;
}

.app-service-card__desc {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 20rpx;
  line-height: 1.45;
}
</style>
