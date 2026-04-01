<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-cell
    :arrow-direction="arrowDirection"
    :border="border"
    :center="center"
    :clickable="clickable || isLink"
    :custom-style="cellStyle"
    :icon="icon"
    :is-link="isLink"
    :label="label"
    :required="required"
    :title="title"
    :value="value"
    @click="handleClick"
  />
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view
    class="app-cell"
    :class="{
      'app-cell--center': center,
      'app-cell--clickable': clickable || isLink,
      'app-cell--no-border': !border,
    }"
    :style="cellStyle"
    @tap="handleClick"
  >
    <view class="app-cell__content">
      <view class="app-cell__title-wrap">
        <text class="app-cell__title">{{ title }}</text>
        <text v-if="label" class="app-cell__label">{{ label }}</text>
      </view>
      <text v-if="value !== undefined && value !== null && value !== ''" class="app-cell__value">{{ value }}</text>
    </view>
    <AppIcon v-if="isLink" class="app-cell__arrow" name="arrow" size="16" />
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import { stringifyStyle, type StyleValue } from '../shared'

const props = withDefaults(defineProps<{
  arrowDirection?: 'left' | 'up' | 'down' | 'right'
  border?: boolean
  center?: boolean
  clickable?: boolean
  customStyle?: StyleValue
  icon?: string
  isLink?: boolean
  label?: string
  required?: boolean
  title: string
  value?: string | number
}>(), {
  arrowDirection: 'right',
  border: true,
  center: false,
  clickable: false,
  customStyle: '',
  icon: '',
  isLink: false,
  label: '',
  required: false,
  value: '',
})

const emit = defineEmits<{
  (event: 'click', value: Event): void
}>()

const cellStyle = computed(() => stringifyStyle(props.customStyle))

function handleClick(event: Event) {
  emit('click', event)
}
</script>

<style scoped lang="scss">
.app-cell {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 0;
  position: relative;
}

.app-cell::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-bottom: 1rpx solid $slate-100;
}

.app-cell--no-border::after {
  display: none;
}

.app-cell__content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.app-cell__title-wrap {
  flex: 1;
  min-width: 0;
}

.app-cell__title {
  display: block;
  color: $text-primary;
  font-size: $font-md;
}

.app-cell__label {
  display: block;
  margin-top: 6rpx;
  color: $text-muted;
  font-size: $font-base;
}

.app-cell__value {
  color: $text-muted;
  font-size: $font-base;
}

.app-cell__arrow {
  color: $text-placeholder;
  flex-shrink: 0;
}
</style>
