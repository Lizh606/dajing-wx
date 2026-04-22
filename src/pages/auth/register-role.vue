<template>
  <view class="page-register-role">
    <AuthHeaderMinimal
      :logo-url="logoUrl"
      :title="AUTH_BRAND_TITLE"
    />

    <view class="register-role__card">
      <view class="register-role__item tap-feedback" @tap="goEnterpriseProfile">
        <view class="register-role__item-copy">
          <text class="register-role__item-title">完善企业资料</text>
          <text class="register-role__item-desc">用于企业采购、认证、开票与机构协作</text>
        </view>
        <text class="register-role__item-arrow">›</text>
      </view>

      <view class="register-role__item tap-feedback" @tap="goBackLogin">
        <view class="register-role__item-copy">
          <text class="register-role__item-title">先使用个人能力</text>
          <text class="register-role__item-desc">保持轻量使用，稍后可在“我的-企业认证”补全</text>
        </view>
        <text class="register-role__item-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'
import AuthHeaderMinimal from './components/AuthHeaderMinimal/index.vue'
import { AUTH_BRAND_TITLE } from './shared'

function goEnterpriseProfile() {
  uni.navigateTo({ url: '/pages/profile/enterprise' })
}

function goBackLogin() {
  uni.redirectTo({ url: '/pages/auth/login' })
}
</script>

<style scoped lang="scss">
.page-register-role {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background:
    radial-gradient(circle at 88% 6%, rgba(191, 219, 254, 0.8), transparent 28%),
    linear-gradient(180deg, #edf4ff 0%, #f8fbff 240rpx, #f9fafb 100%);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-role__card {
  margin-top: 4rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #dbeafe;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 6rpx 24rpx rgba(2, 6, 23, 0.04);
}

.register-role__item {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 8rpx;
}

.register-role__item + .register-role__item {
  border-top: 1rpx solid $slate-200;
}

.register-role__item-copy {
  flex: 1;
  min-width: 0;
}

.register-role__item-title {
  display: block;
  color: $slate-900;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.45;
}

.register-role__item-desc {
  display: block;
  margin-top: 6rpx;
  color: $slate-500;
  font-size: 23rpx;
  line-height: 1.5;
}

.register-role__item-arrow {
  color: $slate-400;
  font-size: 34rpx;
  line-height: 1;
}

@media (prefers-reduced-motion: reduce) {
  .page-register-role {
    background: #f8fafc;
  }
}
</style>
