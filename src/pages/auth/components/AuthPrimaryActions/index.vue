<template>
  <view class="auth-primary-actions">
    <AppButton
      block
      :disabled="primaryDisabled"
      :loading="primaryLoading"
      custom-style="min-height: 88rpx; border-radius: 18rpx; font-size: 28rpx;"
      :text="primaryText"
      type="info"
      @click="emit('primary')"
    />

    <AppButton
      v-if="secondaryText"
      block
      :disabled="secondaryDisabled"
      :loading="secondaryLoading"
      custom-style="min-height: 88rpx; border-radius: 18rpx; font-size: 28rpx; margin-top: 14rpx;"
      plain
      :text="secondaryText"
      type="info"
      @click="emit('secondary')"
    />

    <view v-if="tertiaryText" class="auth-primary-actions__tertiary-wrap">
      <text class="auth-primary-actions__tertiary" @tap="emit('tertiary')">{{ tertiaryText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/AppButton/index.vue'

withDefaults(defineProps<{
  primaryDisabled?: boolean
  primaryLoading?: boolean
  primaryText: string
  secondaryDisabled?: boolean
  secondaryLoading?: boolean
  secondaryText?: string
  tertiaryText?: string
}>(), {
  primaryDisabled: false,
  primaryLoading: false,
  secondaryDisabled: false,
  secondaryLoading: false,
  secondaryText: '',
  tertiaryText: '',
})

const emit = defineEmits<{
  (event: 'primary'): void
  (event: 'secondary'): void
  (event: 'tertiary'): void
}>()
</script>

<style scoped lang="scss">
.auth-primary-actions {
  margin-top: 28rpx;
}

.auth-primary-actions__tertiary-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
}

.auth-primary-actions__tertiary {
  color: $primary;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
