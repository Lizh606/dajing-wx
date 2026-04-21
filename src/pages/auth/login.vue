<template>
  <view class="page-auth">
    <!-- 全屏渐变背景 -->
    <view class="auth-canvas">
      <view class="auth-canvas__orb auth-canvas__orb--1"></view>
      <view class="auth-canvas__orb auth-canvas__orb--2"></view>
      <view class="auth-canvas__orb auth-canvas__orb--3"></view>
    </view>

    <!-- 品牌区域 - 顶部居中 -->
    <view class="auth-header">
      <view class="auth-header__logo">
        <AppIcon color="#ffffff" name="ai" size="36" />
      </view>
      <text class="auth-header__title">AI质享</text>
      <text class="auth-header__sub">质量基础创新中心</text>
    </view>

    <!-- 表单卡片 - 居中悬浮 -->
    <view class="auth-card">
      <!-- Tab 切换移到卡片内部顶部 -->
      <AppTabs v-model="loginType" layout="fill">
        <AppTab name="phone" title="手机验证码">
          <AppForm class="auth-form">
            <view class="auth-form__stack">
              <AppField
                v-model="phone"
                :custom-style="fieldStyle"
                label="手机号"
                placeholder="请输入手机号"
                type="number"
              />
              <view class="auth-code">
                <AppField
                  v-model="code"
                  :custom-style="fieldStyle"
                  label="验证码"
                  placeholder="请输入验证码"
                  type="number"
                />
                <AppButton
                  custom-style="height: 76rpx; padding: 0 28rpx; border-radius: 22rpx; font-size: 24rpx; font-weight: 600;"
                  plain
                  text="获取验证码"
                  type="info"
                  @click="sendCode"
                />
              </view>
            </view>
          </AppForm>
        </AppTab>

        <AppTab name="password" title="账号密码">
          <AppForm class="auth-form">
            <view class="auth-form__stack">
              <AppField
                v-model="account"
                :custom-style="fieldStyle"
                label="账号"
                placeholder="请输入手机号或账号"
              />
              <AppField
                v-model="password"
                :custom-style="fieldStyle"
                label="密码"
                placeholder="请输入密码"
                type="password"
              />
            </view>
          </AppForm>
        </AppTab>
      </AppTabs>

      <!-- 登录按钮 -->
      <AppButton
        block
        custom-style="min-height: 96rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; margin-top: 40rpx;"
        text="登 录"
        type="info"
        @click="submitLogin"
      />
    </view>

    <!-- 注册链接 - 底部悬浮 -->
    <view class="auth-footer">
      <text class="auth-footer__text">还没有账号？</text>
      <text class="auth-footer__link" @tap="goRegister">立即注册</text>
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppToast, showSuccessToast } from '@/services/ui/toast'
import { useUserStore } from '@/stores/user'

const loginType = ref<'phone' | 'password'>('phone')
const phone = ref('')
const code = ref('')
const account = ref('')
const password = ref('')
const fieldStyle = 'border-radius: 24rpx; background: #f8fafc; border: 1rpx solid transparent;'
const userStore = useUserStore()

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register-role' })
}

function sendCode() {
  if (!phone.value) {
    showAppToast({ message: '请先输入手机号', icon: 'none' })
    return
  }

  showSuccessToast('验证码已发送')
}

function submitLogin() {
  userStore.login(userStore.userType)
  showSuccessToast('登录成功')
  setTimeout(() => {
    uni.switchTab({ url: '/pages/mine/index' })
  }, 300)
}
</script>

<style scoped lang="scss">
.page-auth {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(160deg, #0c1a3a 0%, #1e3a5f 15%, #1d4ed8 35%, #2563eb 55%, #0ea5e9 80%, #67e8f9 100%);
  overflow: hidden;
}

/* ========== 全屏装饰光球 ========== */
.auth-canvas {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.auth-canvas__orb {
  position: absolute;
  border-radius: 50%;
}

.auth-canvas__orb--1 {
  width: 500rpx;
  height: 500rpx;
  top: -120rpx;
  right: -100rpx;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
  filter: blur(40rpx);
}

.auth-canvas__orb--2 {
  width: 400rpx;
  height: 400rpx;
  bottom: 10%;
  left: -100rpx;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.18) 0%, transparent 70%);
  filter: blur(50rpx);
}

.auth-canvas__orb--3 {
  width: 300rpx;
  height: 300rpx;
  top: 45%;
  right: -60rpx;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%);
  filter: blur(40rpx);
}

/* ========== 品牌头部 ========== */
.auth-header {
  position: relative;
  z-index: 2;
  text-align: center;
  padding-top: 160rpx;
  margin-bottom: 64rpx;
}

.auth-header__logo {
  width: 128rpx;
  height: 128rpx;
  margin: 0 auto 28rpx;
  border-radius: 40rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.12);
}

.auth-header__title {
  display: block;
  color: #ffffff;
  font-size: 56rpx;
  font-weight: 800;
  letter-spacing: 8rpx;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.auth-header__sub {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  letter-spacing: 4rpx;
}

/* ========== 悬浮表单卡片 ========== */
.auth-card {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 40rpx 36rpx 48rpx;
  margin: 0 24rpx;
  max-width: 680rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40rpx);
  box-shadow:
    0 24rpx 64rpx rgba(0, 0, 0, 0.1),
    0 8rpx 24rpx rgba(0, 0, 0, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.auth-form {
  margin-top: 24rpx;
}

.auth-form__stack {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.auth-code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
  align-items: end;
}

/* ========== 底部注册引导 ========== */
.auth-footer {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: auto;
  padding: 48rpx 0 80rpx;
}

.auth-footer__text {
  color: rgba(255, 255, 255, 0.55);
  font-size: 26rpx;
}

.auth-footer__link {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.4);
  padding-bottom: 2rpx;
}
</style>
