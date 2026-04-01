<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-popup
    :close-on-click-overlay="closeOnClickOverlay"
    :closeable="closeable"
    :custom-style="popupStyle"
    :overlay="overlay"
    :position="position"
    :round="round"
    :show="show"
    :z-index="zIndex"
    @clickOverlay="handleOverlayClick"
    @close="handleClose"
  >
    <slot />
  </van-popup>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view v-if="show" class="app-popup">
    <view v-if="overlay" class="app-popup__overlay" @tap="handleOverlayClick"></view>
    <view
      class="app-popup__content"
      :class="[`app-popup__content--${position}`, { 'app-popup__content--round': round }]"
      :style="popupStyle"
    >
      <view v-if="closeable" class="app-popup__close" @tap="handleClose">×</view>
      <slot />
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { stringifyStyle, type StyleValue } from '../shared'

const props = withDefaults(defineProps<{
  closeOnClickOverlay?: boolean
  closeable?: boolean
  customStyle?: StyleValue
  overlay?: boolean
  position?: 'center' | 'bottom' | 'top' | 'left' | 'right'
  round?: boolean
  show?: boolean
  zIndex?: number
}>(), {
  closeOnClickOverlay: true,
  closeable: false,
  customStyle: '',
  overlay: true,
  position: 'center',
  round: false,
  show: false,
  zIndex: 100,
})

const emit = defineEmits<{
  (event: 'clickOverlay', value: Event): void
  (event: 'close', value?: Event): void
  (event: 'update:show', value: boolean): void
}>()

const popupStyle = computed(() => stringifyStyle(props.customStyle))

function handleClose(event?: Event) {
  emit('update:show', false)
  emit('close', event)
}

function handleOverlayClick(event: Event) {
  emit('clickOverlay', event)

  if (props.closeOnClickOverlay) {
    handleClose(event)
  }
}
</script>

<style scoped lang="scss">
.app-popup {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.app-popup__overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
}

.app-popup__content {
  position: absolute;
  background: $bg-card;
  min-width: 240rpx;
}

.app-popup__content--round {
  border-radius: $radius-2xl;
}

.app-popup__content--center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.app-popup__content--bottom {
  left: 0;
  right: 0;
  bottom: 0;
}

.app-popup__content--top {
  left: 0;
  right: 0;
  top: 0;
}

.app-popup__content--left {
  left: 0;
  top: 0;
  bottom: 0;
}

.app-popup__content--right {
  right: 0;
  top: 0;
  bottom: 0;
}

.app-popup__close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  color: $text-muted;
  font-size: 32rpx;
  line-height: 1;
}
</style>
