<template>
  <view class="auth-agreement">
    <view class="auth-agreement__row" @tap="toggleChecked">
      <view class="auth-agreement__checkbox" :class="{ 'auth-agreement__checkbox--active': modelValue }">
        <text v-if="modelValue" class="auth-agreement__checkmark">✓</text>
      </view>

      <view class="auth-agreement__content">
        <text class="auth-agreement__text">我已阅读并同意</text>
        <text class="auth-agreement__link" @tap.stop="emit('open-service')">《用户服务协议》</text>
        <text class="auth-agreement__text">和</text>
        <text class="auth-agreement__link" @tap.stop="emit('open-privacy')">《隐私政策》</text>
      </view>
    </view>

    <text v-if="error" class="auth-agreement__error" role="alert">{{ error }}</text>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  error?: string
  modelValue?: boolean
}>(), {
  error: '',
  modelValue: false,
})

const emit = defineEmits<{
  (event: 'open-privacy'): void
  (event: 'open-service'): void
  (event: 'update:modelValue', value: boolean): void
}>()

function toggleChecked() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
.auth-agreement {
  margin-top: 14rpx;
}

.auth-agreement__row {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  min-height: 64rpx;
}

.auth-agreement__checkbox {
  flex-shrink: 0;
  width: 40rpx;
  height: 40rpx;
  margin-top: 2rpx;
  border: 1rpx solid $slate-300;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  transition: all 0.2s ease;
}

.auth-agreement__checkbox--active {
  border-color: $primary;
  background: $primary;
}

.auth-agreement__checkmark {
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
}

.auth-agreement__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  column-gap: 8rpx;
  row-gap: 4rpx;
  padding-top: 1rpx;
}

.auth-agreement__text {
  color: $slate-500;
  font-size: 24rpx;
  line-height: 1.6;
}

.auth-agreement__link {
  color: $primary;
  font-size: 24rpx;
  line-height: 1.6;
}

.auth-agreement__error {
  display: block;
  margin-top: 8rpx;
  padding-left: 54rpx;
  color: $danger-strong;
  font-size: 22rpx;
  line-height: 1.5;
}
</style>
