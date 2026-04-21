<template>
  <view class="app-search-bar-with-button" :style="mergedStyle">
    <view class="app-search-bar-with-button__field">
      <AppIcon v-if="showIcon" class="app-search-bar-with-button__icon" color="#94a3b8" name="search" size="18" />
      <input
        class="app-search-bar-with-button__input"
        :disabled="disabled"
        confirm-type="search"
        :placeholder="placeholder"
        :value="normalizedValue"
        @confirm="handleConfirm"
        @input="handleInput"
      />
    </view>

    <view
      class="app-search-bar-with-button__button tap-feedback"
      :class="{ 'app-search-bar-with-button__button--disabled': disabled }"
      @tap="handleSearchClick"
    >
      {{ buttonText }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import { extractEventValue, stringifyStyle, type StyleValue } from '../shared'

const props = withDefaults(defineProps<{
  buttonText?: string
  customStyle?: StyleValue
  disabled?: boolean
  modelValue?: string | number
  placeholder?: string
  showIcon?: boolean
}>(), {
  buttonText: '搜索',
  customStyle: '',
  disabled: false,
  modelValue: '',
  placeholder: '',
  showIcon: true,
})

const emit = defineEmits<{
  (event: 'confirm', value: string): void
  (event: 'search', value: string): void
  (event: 'update:modelValue', value: string): void
}>()

const mergedStyle = computed(() => stringifyStyle(props.customStyle))
const normalizedValue = computed(() => `${props.modelValue ?? ''}`)

function emitSearch(keyword?: string) {
  if (props.disabled) {
    return
  }

  emit('search', (keyword ?? normalizedValue.value).trim())
}

function handleInput(event: unknown) {
  const value = `${extractEventValue<string>(event) ?? ''}`
  emit('update:modelValue', value)
}

function handleConfirm(event: unknown) {
  const value = `${extractEventValue<string>(event) ?? normalizedValue.value}`
  emit('confirm', value.trim())
  emitSearch(value)
}

function handleSearchClick() {
  emitSearch()
}
</script>

<style scoped lang="scss">
.app-search-bar-with-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.app-search-bar-with-button__field {
  min-width: 0;
  flex: 1;
  min-height: 72rpx;
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  padding: 0 18rpx;
}

.app-search-bar-with-button__icon {
  margin-right: 10rpx;
  flex-shrink: 0;
}

.app-search-bar-with-button__input {
  min-width: 0;
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0;
  border: none;
  outline: none;
  font-size: 24rpx;
  color: #0f172a;
  background: transparent;
}

.app-search-bar-with-button__button {
  width: 112rpx;
  min-width: 112rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  box-shadow: 0 6rpx 14rpx rgba(37, 99, 235, 0.2);
}

.app-search-bar-with-button__button--disabled {
  opacity: 0.5;
}
</style>
