<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-switch :checked="modelValue" :disabled="disabled" @change="handleChange" />
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view
    class="app-switch"
    :class="{
      'app-switch--checked': !!modelValue,
      'app-switch--disabled': disabled,
    }"
    @tap="toggle"
  >
    <view class="app-switch__node"></view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { extractEventValue } from '../shared'

const props = withDefaults(defineProps<{
  disabled?: boolean
  modelValue?: boolean
}>(), {
  disabled: false,
  modelValue: false,
})

const emit = defineEmits<{
  (event: 'change', value: boolean): void
  (event: 'update:modelValue', value: boolean): void
}>()

function syncValue(value: boolean) {
  emit('update:modelValue', value)
  emit('change', value)
}

function handleChange(event: any) {
  syncValue(!!extractEventValue(event))
}

function toggle() {
  if (props.disabled) {
    return
  }

  syncValue(!props.modelValue)
}
</script>

<style scoped lang="scss">
.app-switch {
  width: 88rpx;
  height: 48rpx;
  padding: 4rpx;
  border-radius: 999rpx;
  background: $slate-300;
  display: flex;
  align-items: center;
  transition: background 0.2s ease;
}

.app-switch--checked {
  background: $primary;
}

.app-switch--disabled {
  opacity: 0.5;
}

.app-switch__node {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.app-switch--checked .app-switch__node {
  transform: translateX(40rpx);
}
</style>
