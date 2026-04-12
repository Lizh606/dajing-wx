<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-button
    :block="block"
    :color="color"
    :custom-style="buttonStyle"
    :disabled="disabled"
    :hairline="hairline"
    :icon="icon"
    :loading="loading"
    :plain="plain"
    :round="round"
    :size="size"
    :type="type"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </van-button>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <button
    class="app-button"
    :class="buttonClassNames"
    :disabled="disabled || loading"
    :style="buttonStyle"
    :type="nativeType"
    @click="handleClick"
  >
    <view v-if="loading" class="app-button__spinner" />
    <AppIcon v-else-if="icon" :color="plain ? fallbackColor : '#ffffff'" :name="icon" :size="16" class="app-button__icon" />
    <view class="app-button__content">
      <slot>{{ text }}</slot>
    </view>
  </button>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import { stringifyStyle, type StyleValue } from '../shared'

const props = withDefaults(defineProps<{
  block?: boolean
  color?: string
  customStyle?: StyleValue
  disabled?: boolean
  hairline?: boolean
  icon?: string
  loading?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  plain?: boolean
  preset?: '' | 'action'
  round?: boolean
  size?: 'large' | 'normal' | 'small' | 'mini'
  text?: string
  type?: 'default' | 'primary' | 'info' | 'danger' | 'warning'
}>(), {
  block: false,
  color: '',
  customStyle: '',
  disabled: false,
  hairline: false,
  icon: '',
  loading: false,
  nativeType: 'button',
  plain: false,
  preset: '',
  round: false,
  size: 'normal',
  text: '',
  type: 'default',
})

const emit = defineEmits<{
  (event: 'click', value: Event): void
}>()

const buttonStyle = computed(() => {
  const presetStyle = props.preset === 'action'
    ? stringifyStyle({
      minHeight: '60rpx',
      padding: props.block ? '0' : '0 24rpx',
      borderRadius: '18rpx',
      fontSize: '22rpx',
      whiteSpace: 'nowrap',
    })
    : ''

  return [presetStyle, stringifyStyle(props.customStyle)].filter(Boolean).join('; ')
})

const buttonClassNames = computed(() => [
  `app-button--${props.type}`,
  `app-button--${props.size}`,
  {
    'app-button--block': props.block,
    'app-button--disabled': props.disabled || props.loading,
    'app-button--plain': props.plain,
    'app-button--round': props.round,
  },
])

const fallbackColor = computed(() => {
  if (props.color) {
    return props.color
  }

  if (props.type === 'danger') {
    return '#dc2626'
  }

  if (props.type === 'default') {
    return '#334155'
  }

  return '#2563eb'
})

function handleClick(event: Event) {
  if (props.disabled || props.loading) {
    return
  }

  emit('click', event)
}
</script>

<style scoped lang="scss">
.app-button {
  width: auto;
  min-height: $input-height;
  padding: 0 32rpx;
  border: 1rpx solid transparent;
  border-radius: $radius;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: $font-md;
  font-weight: 600;
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.app-button--block {
  width: 100%;
}

.app-button--round {
  border-radius: $radius-pill;
}

.app-button--small {
  min-height: 64rpx;
  font-size: $font-sm;
}

.app-button--large {
  min-height: 96rpx;
  font-size: $font-lg;
}

.app-button--default {
  color: $text-secondary;
  border-color: $border-base;
  background: $bg-card;
}

.app-button--primary,
.app-button--info {
  color: $text-inverse;
  background: $primary;
  box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.18);
}

.app-button--danger {
  color: $text-inverse;
  background: $danger-strong;
}

.app-button--warning {
  color: $text-inverse;
  background: $warning;
}

.app-button--plain {
  background: $bg-card;
}

.app-button--plain.app-button--primary,
.app-button--plain.app-button--info {
  color: $primary;
  border-color: $primary;
}

.app-button--plain.app-button--danger {
  color: $danger-strong;
  border-color: $danger-strong;
}

.app-button--disabled {
  opacity: 0.5;
}

.app-button__icon {
  flex-shrink: 0;
}

.app-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.app-button__spinner {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
  border: 3rpx solid rgba(148, 163, 184, 0.22);
  border-top-color: currentColor;
  border-radius: 999rpx;
  animation: app-button-spin 0.8s linear infinite;
}

@keyframes app-button-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
