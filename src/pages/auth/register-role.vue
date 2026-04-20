<template>
  <view class="page-register-role">
    <!-- 全屏渐变背景 -->
    <view class="role-canvas">
      <view class="role-canvas__orb role-canvas__orb--1"></view>
      <view class="role-canvas__orb role-canvas__orb--2"></view>
      <view class="role-canvas__orb role-canvas__orb--3"></view>
    </view>

    <!-- 头部文字 -->
    <view class="role-header">
      <text class="role-header__eyebrow">账号注册</text>
      <text class="role-header__title">请选择要注册的身份</text>
      <text class="role-header__desc">选择适合您的身份类型，开启质量服务之旅</text>
    </view>

    <!-- 身份选择卡片 -->
    <view class="role-list">
      <view
        v-for="item in roles"
        :key="item.key"
        class="role-card"
        :class="`role-card--${item.key}`"
        @tap="selectRole(item.key)"
      >
        <view class="role-card__icon" :style="{ background: item.iconBg }">
          <AppIcon :color="item.iconColor" :name="item.iconName" size="28" />
        </view>
        <view class="role-card__copy">
          <text class="role-card__title">{{ item.title }}</text>
          <text class="role-card__desc">{{ item.desc }}</text>
        </view>
        <view class="role-card__arrow">
          <AppIcon color="#94a3b8" name="arrow" size="16" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon/index.vue'

type RegisterRoleKey = 'individual' | 'enterprise' | 'agency'

const roles: Array<{
  key: RegisterRoleKey
  title: string
  desc: string
  iconName: string
  iconColor: string
  iconBg: string
}> = [
  {
    key: 'individual',
    title: '个人用户',
    desc: '适合个人咨询、委托下单与报告查阅。',
    iconName: 'user',
    iconColor: '#2563eb',
    iconBg: 'rgba(37, 99, 235, 0.15)',
  },
  {
    key: 'enterprise',
    title: '企业用户',
    desc: '适合企业认证、批量委托、会员权益与档案管理。',
    iconName: 'enterprise',
    iconColor: '#4f46e5',
    iconBg: 'rgba(79, 70, 229, 0.15)',
  },
  {
    key: 'agency',
    title: '服务机构',
    desc: '适合服务供给方入驻、资质提交与业务承接。',
    iconName: 'institution',
    iconColor: '#d97706',
    iconBg: 'rgba(217, 119, 6, 0.15)',
  },
]

function selectRole(role: RegisterRoleKey) {
  uni.navigateTo({ url: `/pages/auth/register-form?role=${role}` })
}
</script>

<style scoped lang="scss">
.page-register-role {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 24rpx 48rpx;
  box-sizing: border-box;
  background: linear-gradient(160deg, #0c1a3a 0%, #1e3a5f 15%, #1d4ed8 35%, #2563eb 55%, #0ea5e9 80%, #67e8f9 100%);
  overflow: hidden;
}

/* ========== 全屏装饰 ========== */
.role-canvas {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.role-canvas__orb {
  position: absolute;
  border-radius: 50%;
}

.role-canvas__orb--1 {
  width: 480rpx;
  height: 480rpx;
  top: -80rpx;
  right: -80rpx;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%);
  filter: blur(40rpx);
}

.role-canvas__orb--2 {
  width: 360rpx;
  height: 360rpx;
  bottom: 15%;
  left: -80rpx;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.16) 0%, transparent 70%);
  filter: blur(50rpx);
}

.role-canvas__orb--3 {
  width: 260rpx;
  height: 260rpx;
  top: 50%;
  right: -40rpx;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.14) 0%, transparent 70%);
  filter: blur(40rpx);
}

/* ========== 头部文字 ========== */
.role-header {
  position: relative;
  z-index: 2;
  padding-top: 140rpx;
  margin-bottom: 56rpx;
}

.role-header__eyebrow {
  display: block;
  color: rgba(255, 255, 255, 0.55);
  font-size: 24rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.role-header__title {
  display: block;
  margin-top: 16rpx;
  color: #ffffff;
  font-size: 48rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.role-header__desc {
  display: block;
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.65);
  font-size: 26rpx;
  line-height: 1.6;
}

/* ========== 身份卡片 ========== */
.role-list {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding: 36rpx 32rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40rpx);
  border: none;
  box-shadow:
    0 16rpx 48rpx rgba(0, 0, 0, 0.1),
    0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  }
}

.role-card__icon {
  width: 108rpx;
  height: 108rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-card__copy {
  flex: 1;
  min-width: 0;
}

.role-card__title {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.role-card__desc {
  display: block;
  margin-top: 10rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.55;
}

.role-card__arrow {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
