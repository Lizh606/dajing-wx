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
  gap: 10rpx;
  height: 72rpx;
  min-height: 72rpx;
  padding: 0 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  box-sizing: border-box;
}

.app-search-placeholder__icon {
  flex-shrink: 0;
}

.app-search-placeholder__text {
  color: #94a3b8;
  font-size: 24rpx;
  line-height: 1.2;
}
</style>
