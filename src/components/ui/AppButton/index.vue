<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-button
    :block="block"
    :color="resolvedColor"
    :custom-style="buttonStyle"
    :disabled="disabled"
    :hairline="hairline"
    :icon="icon"
    :loading="loading"
    :plain="resolvedPlain"
    :round="round"
    :size="size"
    :type="resolvedType"
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

type ButtonTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger'
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'tag'

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
  tone?: '' | ButtonTone
  type?: 'default' | 'primary' | 'info' | 'danger' | 'warning'
  variant?: '' | ButtonVariant
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
  tone: '',
  type: 'default',
  variant: '',
})

const emit = defineEmits<{
  (event: 'click', value: Event): void
}>()

const buttonStyle = computed(() => {
  const presetStyle = props.preset === 'action'
    ? stringifyStyle({
      minHeight: '88rpx',
      padding: props.block ? '0' : '0 24rpx',
      borderRadius: '18rpx',
      fontSize: '22rpx',
      whiteSpace: 'nowrap',
    })
    : ''

  const sizeStyle = props.size === 'mini'
    ? stringifyStyle({ minHeight: '72rpx', fontSize: '22rpx' })
    : props.size === 'small'
      ? stringifyStyle({ minHeight: '88rpx', fontSize: '24rpx' })
      : props.size === 'large'
        ? stringifyStyle({ minHeight: '96rpx', fontSize: '28rpx' })
        : stringifyStyle({ minHeight: '88rpx' })

  return [presetStyle, sizeStyle, stringifyStyle(props.customStyle)].filter(Boolean).join('; ')
})

const buttonClassNames = computed(() => [
  `app-button--tone-${resolvedTone.value}`,
  `app-button--variant-${resolvedVariant.value}`,
  `app-button--${props.size}`,
  {
    'app-button--block': props.block,
    'app-button--disabled': props.disabled || props.loading,
    'app-button--round': props.round,
  },
])

const resolvedTone = computed<ButtonTone>(() => {
  if (props.tone) {
    return props.tone
  }

  if (props.type === 'danger') {
    return 'danger'
  }

  if (props.type === 'warning') {
    return 'warning'
  }

  if (props.type === 'default') {
    return 'neutral'
  }

  return 'brand'
})

const resolvedVariant = computed<ButtonVariant>(() => {
  if (props.variant) {
    return props.variant
  }

  if (props.plain) {
    return 'secondary'
  }

  return props.type === 'default' ? 'secondary' : 'primary'
})

const resolvedType = computed(() => {
  if (resolvedTone.value === 'danger') {
    return 'danger'
  }

  if (resolvedTone.value === 'warning') {
    return 'warning'
  }

  return 'info'
})

const resolvedPlain = computed(() => resolvedVariant.value !== 'primary')

const toneHexMap: Record<ButtonTone, string> = {
  brand: '#1E61FF',
  danger: '#dc2626',
  neutral: '#374151',
  success: '#10B981',
  warning: '#FF8A00',
}

const resolvedColor = computed(() => props.color || toneHexMap[resolvedTone.value])

const fallbackColor = computed(() => {
  return resolvedColor.value
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

.app-button:active {
  opacity: 0.75;
  transform: scale(0.985);
}

.app-button--block {
  width: 100%;
}

.app-button--round {
  border-radius: $radius-pill;
}

.app-button--small {
  min-height: 88rpx;
  font-size: $font-base;
}

.app-button--mini {
  min-height: 72rpx;
  font-size: $font-sm;
}

.app-button--large {
  min-height: 96rpx;
  font-size: $font-lg;
}

.app-button--variant-primary {
  color: $text-inverse;
  background: $primary;
  box-shadow: $shadow-card;
}

.app-button--variant-secondary {
  color: $text-secondary;
  border-color: $border-base;
  background: $bg-card;
}

.app-button--variant-ghost {
  color: $text-secondary;
  border-color: transparent;
  background: transparent;
}

.app-button--variant-tag {
  color: $primary-dark;
  border-color: transparent;
  background: $primary-light;
  min-height: 68rpx;
  font-size: $font-sm;
}

.app-button--tone-brand.app-button--variant-primary {
  background: $primary;
  border-color: $primary;
}

.app-button--tone-success.app-button--variant-primary {
  background: $accent-green;
  border-color: $accent-green;
}

.app-button--tone-warning.app-button--variant-primary {
  background: $accent-orange;
  border-color: $accent-orange;
}

.app-button--tone-danger.app-button--variant-primary {
  background: $danger-strong;
  border-color: $danger-strong;
}

.app-button--tone-brand.app-button--variant-secondary {
  color: $primary;
  border-color: $primary-soft;
}

.app-button--tone-success.app-button--variant-secondary {
  color: $accent-green;
  border-color: #a7f3d0;
}

.app-button--tone-warning.app-button--variant-secondary {
  color: $accent-orange;
  border-color: #fed7aa;
}

.app-button--tone-danger.app-button--variant-secondary {
  color: $danger-strong;
  border-color: #fecaca;
}

.app-button--tone-brand.app-button--variant-tag {
  color: $primary-dark;
  background: $brand-50;
}

.app-button--tone-success.app-button--variant-tag {
  color: $accent-green;
  background: $accent-green-bg;
}

.app-button--tone-warning.app-button--variant-tag {
  color: $accent-orange;
  background: $accent-orange-bg;
}

.app-button--tone-danger.app-button--variant-tag {
  color: $danger-strong;
  background: $danger-bg;
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
