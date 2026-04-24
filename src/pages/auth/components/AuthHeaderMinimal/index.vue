<template>
  <view class="auth-header-minimal">
    <image v-if="logoUrl" :src="logoUrl" class="auth-header-minimal__logo" mode="aspectFit" />
    <text class="auth-header-minimal__title">{{ title }}</text>
    <text v-if="subtitle" class="auth-header-minimal__subtitle">{{ subtitle }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  logoUrl?: string
  subtitle?: string
  title: string
}>()
</script>

<style scoped lang="scss">
.auth-header-minimal {
  padding: 28rpx 0 32rpx;
  text-align: center;
}

.auth-header-minimal__logo {
  display: block;
  width: 144rpx;
  height: 144rpx;
  border-radius: 32rpx;
  margin: 0 auto;
}

.auth-header-minimal__title {
  display: block;
  margin-top: 20rpx;
  color: $slate-900;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.35;
}

.auth-header-minimal__subtitle {
  display: block;
  margin-top: 12rpx;
  color: $slate-500;
  font-size: 22rpx;
  line-height: 1.55;
  text-align: center;
}
</style>
