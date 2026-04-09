<template>
  <view class="page-register-role">
    <view class="register-role__hero">
      <text class="register-role__eyebrow">账号注册</text>
      <text class="register-role__title">请选择要注册的身份</text>
      <text class="register-role__desc">延续原系统的信息架构，但统一到当前项目的样式与组件体系。</text>
    </view>

    <view class="register-role__list">
      <view
        v-for="item in roles"
        :key="item.key"
        class="role-card"
        @tap="selectRole(item.key)"
      >
        <view class="role-card__icon" :style="{ background: item.iconBg }">
          <AppIcon :color="item.iconColor" :name="item.iconName" size="26" />
        </view>
        <view class="role-card__copy">
          <text class="role-card__title">{{ item.title }}</text>
          <text class="role-card__desc">{{ item.desc }}</text>
        </view>
        <AppIcon color="#94a3b8" name="arrow" size="18" />
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
    iconBg: '#eff6ff',
  },
  {
    key: 'enterprise',
    title: '企业用户',
    desc: '适合企业认证、批量委托、会员权益与档案管理。',
    iconName: 'enterprise',
    iconColor: '#4f46e5',
    iconBg: '#eef2ff',
  },
  {
    key: 'agency',
    title: '服务机构',
    desc: '适合服务供给方入驻、资质提交与业务承接。',
    iconName: 'institution',
    iconColor: '#b45309',
    iconBg: '#fef3c7',
  },
]

function selectRole(role: RegisterRoleKey) {
  uni.navigateTo({ url: `/pages/auth/register-form?role=${role}` })
}
</script>

<style scoped lang="scss">
.page-register-role {
  min-height: 100vh;
  padding: 28rpx 24rpx;
  background: linear-gradient(180deg, #2563eb 0%, #3b82f6 280rpx, #f8fafc 280rpx, #f8fafc 100%);
  box-sizing: border-box;
}

.register-role__hero {
  margin-bottom: 28rpx;
}

.register-role__eyebrow {
  display: block;
  color: rgba(255, 255, 255, 0.76);
  font-size: 24rpx;
}

.register-role__title {
  display: block;
  margin-top: 12rpx;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
}

.register-role__desc {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  line-height: 1.5;
}

.register-role__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.role-card__icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-card__copy {
  flex: 1;
  min-width: 0;
}

.role-card__title {
  display: block;
  color: $slate-900;
  font-size: 30rpx;
  font-weight: 600;
}

.role-card__desc {
  display: block;
  margin-top: 8rpx;
  color: $slate-400;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
