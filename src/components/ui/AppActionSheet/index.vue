<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-action-sheet
    :actions="actions"
    :cancel-text="cancelText"
    :close-on-click-action="closeOnClickAction"
    :close-on-click-overlay="closeOnClickOverlay"
    :description="description"
    :overlay="overlay"
    :round="round"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    :show="show"
    :title="title"
    :z-index="zIndex"
    @cancel="emit('cancel')"
    @clickOverlay="emit('clickOverlay')"
    @close="handleClose"
    @select="handleSelect"
  />
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <AppPopup
    :close-on-click-overlay="closeOnClickOverlay"
    :overlay="overlay"
    position="bottom"
    :round="round"
    :show="show"
    :z-index="zIndex"
    @clickOverlay="emit('clickOverlay')"
    @close="handleClose"
    @update:show="emit('update:show', $event)"
  >
    <view class="app-action-sheet">
      <view v-if="title" class="app-action-sheet__title">{{ title }}</view>
      <view v-if="description" class="app-action-sheet__description">{{ description }}</view>
      <view
        v-for="action in actions"
        :key="action.name"
        class="app-action-sheet__item"
        @tap="handleSelect(action)"
      >
        {{ action.name }}
      </view>
      <view v-if="cancelText" class="app-action-sheet__cancel" @tap="emit('cancel')">{{ cancelText }}</view>
    </view>
  </AppPopup>
  <!-- #endif -->
</template>

<script setup lang="ts">
import AppPopup from '../AppPopup/index.vue'

export interface AppAction {
  name: string
  subname?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  actions?: AppAction[]
  cancelText?: string
  closeOnClickAction?: boolean
  closeOnClickOverlay?: boolean
  description?: string
  overlay?: boolean
  round?: boolean
  show?: boolean
  safeAreaInsetBottom?: boolean
  title?: string
  zIndex?: number
}>(), {
  actions: () => [],
  cancelText: '',
  closeOnClickAction: true,
  closeOnClickOverlay: true,
  description: '',
  overlay: true,
  round: true,
  safeAreaInsetBottom: false,
  show: false,
  title: '',
  zIndex: 100,
})

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'clickOverlay'): void
  (event: 'close'): void
  (event: 'select', value: AppAction): void
  (event: 'update:show', value: boolean): void
}>()

function handleClose() {
  emit('update:show', false)
  emit('close')
}

function handleSelect(action: AppAction) {
  if (action.disabled) {
    return
  }

  emit('select', action)

  if (props.closeOnClickAction) {
    handleClose()
  }
}
</script>

<style scoped lang="scss">
.app-action-sheet {
  padding: 8rpx 0 calc(env(safe-area-inset-bottom) + 4rpx);
}

.app-action-sheet__title,
.app-action-sheet__description,
.app-action-sheet__item,
.app-action-sheet__cancel {
  text-align: center;
  padding: 20rpx 28rpx;
}

.app-action-sheet__cancel {
  color: $text-muted;
  border-top: 1rpx solid #eef2f7;
}
</style>
