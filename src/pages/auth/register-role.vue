<template>
  <view class="page-register-role">
    <view class="register-role__top">
      <view class="register-role__hero">
        <text class="register-role__title">请选择业务身份</text>
      </view>

      <view class="register-role__trust"></view>
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
          <view class="role-card__title-row">
            <text class="role-card__title">{{ item.title }}</text>
            <text class="role-card__tag">{{ item.tag }}</text>
          </view>
          <text class="role-card__desc">{{ item.desc }}</text>
        </view>

        <view class="role-card__action">
          <AppIcon color="#2563eb" name="arrow" size="18" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon/index.vue'

type RegisterRoleKey = 'individual' | 'enterprise' | 'agency'

const roles: Array<{
  desc: string
  iconBg: string
  iconColor: string
  iconName: string
  key: RegisterRoleKey
  tag: string
  title: string
}> = [
  {
    desc: '适合个人发布需求与下单服务',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    iconName: 'user',
    key: 'individual',
    tag: '基础账号',
    title: '个人用户',
  },
  {
    desc: '适合企业采购、协同管理与认证开票',
    iconBg: '#eaf2ff',
    iconColor: '#1d4ed8',
    iconName: 'enterprise',
    key: 'enterprise',
    tag: '推荐',
    title: '企业用户',
  },
  {
    desc: '适合服务方入驻并承接企业与个人订单',
    iconBg: '#effcf7',
    iconColor: '#0f766e',
    iconName: 'institution',
    key: 'agency',
    tag: '入驻型',
    title: '服务机构',
  },
]

function selectRole(role: RegisterRoleKey) {
  uni.navigateTo({ url: `/pages/auth/register-form?role=${role}` })
}
</script>

<style scoped lang="scss">
.page-register-role {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: #f8fafc;
  box-sizing: border-box;
}

.register-role__top {
  margin: 0 -24rpx 24rpx;
  padding: 28rpx 24rpx 30rpx;
  background:
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.82), transparent 30%),
    linear-gradient(180deg, #1e40af 0%, #2563eb 100%);
}

.register-role__hero {
  margin-bottom: 24rpx;
}

.register-role__eyebrow {
  display: block;
  color: rgba(255, 255, 255, 0.76);
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

.register-role__title {
  display: block;
  margin-top: 12rpx;
  color: #ffffff;
  font-size: 42rpx;
  font-weight: 700;
}

.register-role__desc {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.84);
  font-size: 24rpx;
  line-height: 1.6;
}

.register-role__trust {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.register-role__trust-item {
  padding: 20rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.14);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.12);
}

.register-role__trust-value {
  display: block;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.register-role__trust-label {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 22rpx;
  line-height: 1.5;
}

.register-role__list {
  display: flex;
  flex-direction: column;
}

.role-card + .role-card {
  margin-top: 16rpx;
}

.role-card {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 26rpx 24rpx;
  border: 1rpx solid rgba(191, 219, 254, 0.82);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.08);
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

.role-card__title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.role-card__title {
  color: $slate-900;
  font-size: 30rpx;
  font-weight: 700;
}

.role-card__tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  color: $primary-dark;
  font-size: 20rpx;
  font-weight: 600;
  background: #eff6ff;
}

.role-card__desc {
  display: block;
  margin-top: 10rpx;
  color: $slate-600;
  font-size: 24rpx;
  line-height: 1.6;
}

.role-card__foot {
  display: block;
  margin-top: 10rpx;
  color: $slate-400;
  font-size: 22rpx;
  line-height: 1.5;
}

.role-card__action {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
