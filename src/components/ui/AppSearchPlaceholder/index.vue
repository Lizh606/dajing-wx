<template>
  <view
    class="app-search-placeholder"
    :class="[
      `app-search-placeholder--${tone}`,
      `app-search-placeholder--${shape}`,
      `app-search-placeholder--${size}`,
    ]"
    :style="mergedStyle"
  >
    <AppIcon class="app-search-placeholder__icon" color="#94a3b8" name="search" size="18" />
    <text class="app-search-placeholder__text" :style="textStyle">{{ placeholder }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import { stringifyStyle, toUnit, type StyleValue } from '../shared'

const props = withDefaults(defineProps<{
  customStyle?: StyleValue
  placeholder: string
  shape?: 'card' | 'pill'
  size?: 'md' | 'lg'
  textSize?: string | number
  tone?: 'light' | 'muted' | 'surface'
}>(), {
  customStyle: '',
  shape: 'card',
  size: 'md',
  textSize: '',
  tone: 'surface',
})

const mergedStyle = computed(() => stringifyStyle(props.customStyle))
const textStyle = computed(() => stringifyStyle({ fontSize: toUnit(props.textSize) || undefined }))
</script>

<style scoped lang="scss">
.app-search-placeholder {
  display: flex;
  align-items: center;
  gap: 12rpx;
  border: 1rpx solid transparent;
}

.app-search-placeholder--card {
  border-radius: 16rpx;
}

.app-search-placeholder--pill {
  border-radius: 48rpx;
}

.app-search-placeholder--md {
  padding: 16rpx 24rpx;
}

.app-search-placeholder--lg {
  padding: 18rpx 24rpx;
}

.app-search-placeholder--surface {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.app-search-placeholder--muted {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.app-search-placeholder--light {
  background: #ffffff;
}

.app-search-placeholder__icon {
  flex-shrink: 0;
}

.app-search-placeholder__text {
  color: #94a3b8;
}

.app-search-placeholder--md .app-search-placeholder__text {
  font-size: 26rpx;
}

.app-search-placeholder--lg .app-search-placeholder__text {
  font-size: 28rpx;
}
</style>
