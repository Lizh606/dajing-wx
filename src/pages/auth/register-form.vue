<template>
  <view class="page-register-form">
    <!-- 全屏渐变背景 -->
    <view class="form-canvas">
      <view class="form-canvas__orb form-canvas__orb--1"></view>
      <view class="form-canvas__orb form-canvas__orb--2"></view>
    </view>

    <!-- 头部品牌 -->
    <view class="form-header">
      <view class="form-header__icon" :style="{ background: roleMeta.heroBg }">
        <AppIcon :color="roleMeta.heroColor" :name="roleMeta.iconName" size="32" />
      </view>
      <text class="form-header__title">{{ roleMeta.title }}</text>
      <text class="form-header__desc">{{ roleMeta.desc }}</text>
    </view>

    <!-- 表单卡片 -->
    <scroll-view class="form-scroll" scroll-y>
      <view class="form-card">
        <AppForm class="register-form">
          <view class="register-form__stack">
            <AppField
              v-model="form.phone"
              :custom-style="fieldStyle"
              label="注册手机号"
              placeholder="请输入手机号"
              type="number"
            />

            <view class="register-form__code">
              <AppField
                v-model="form.code"
                :custom-style="fieldStyle"
                label="验证码"
                placeholder="请输入验证码"
                type="number"
              />
              <AppButton
                custom-style="height: 76rpx; padding: 0 28rpx; border-radius: 22rpx; font-size: 24rpx; font-weight: 600;"
                plain
                text="发送验证码"
                type="info"
                @click="sendCode"
              />
            </view>

            <view v-if="showLicense" class="upload-card" @tap="pickLicense">
              <view class="upload-card__icon">
                <AppIcon color="rgba(37, 99, 235, 0.8)" name="plus" size="18" />
              </view>
              <view class="upload-card__copy">
                <text class="upload-card__title">营业执照</text>
                <text class="upload-card__desc">点击上传营业执照扫描件</text>
              </view>
            </view>

            <AppField v-if="showCompany" v-model="form.companyName" :custom-style="fieldStyle" label="企业名称" placeholder="请输入企业名称" />
            <AppField v-if="showCompany" v-model="form.creditCode" :custom-style="fieldStyle" label="统一社会信用代码" placeholder="请输入统一社会信用代码" />
            <AppField v-if="role === 'individual'" v-model="form.organization" :custom-style="fieldStyle" label="所在单位" placeholder="请输入所在单位" />
            <AppField v-if="role === 'enterprise'" v-model="form.standardCount" :custom-style="fieldStyle" label="标准数量" placeholder="请输入企业标准数量" type="number" />
            <AppField v-if="showPrincipal" v-model="form.principalName" :custom-style="fieldStyle" label="负责人姓名" placeholder="请输入负责人姓名" />
            <AppField v-if="showPrincipal" v-model="form.principalPhone" :custom-style="fieldStyle" label="负责人手机" placeholder="请输入负责人手机" type="number" />
            <AppField v-if="showContact" v-model="form.contactName" :custom-style="fieldStyle" label="对接人姓名" placeholder="请输入业务对接人姓名" />
            <AppField v-if="showContact" v-model="form.contactJob" :custom-style="fieldStyle" label="对接人职位" placeholder="请输入业务对接人职位" />
            <AppField v-if="showContact" v-model="form.contactPhone" :custom-style="fieldStyle" label="对接人手机" placeholder="请输入业务对接人手机" type="number" />
            <AppField v-model="form.inviteCode" :custom-style="fieldStyle" label="推荐码" placeholder="请输入推荐码" />
            <AppField v-model="form.password" :custom-style="fieldStyle" label="密码" placeholder="请输入密码" type="password" />
            <AppField v-model="form.confirmPassword" :custom-style="fieldStyle" label="确认密码" placeholder="请再次输入密码" type="password" />
          </view>
        </AppForm>

        <view class="register-form__agreement" @tap="agreed = !agreed">
          <view class="register-form__checkbox" :class="{ 'register-form__checkbox--active': agreed }">
            <AppIcon v-if="agreed" color="#ffffff" name="success" size="12" />
          </view>
          <text class="register-form__agreement-text">我已阅读并同意<text class="register-form__agreement-link">《注册协议》</text></text>
        </view>

        <AppButton
          block
          custom-style="min-height: 96rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; margin-top: 32rpx;"
          text="立即注册"
          type="info"
          @click="submitRegister"
        />

        <view class="form-card__bottom">
          <text class="form-card__bottom-text" @tap="goLogin">已有账号？<text class="form-card__bottom-link">返回登录</text></text>
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showAppToast, showSuccessToast } from '@/services/ui/toast'

type RegisterRoleKey = 'individual' | 'enterprise' | 'agency'

const role = ref<RegisterRoleKey>('individual')
const agreed = ref(false)
const fieldStyle = 'border-radius: 24rpx; background: #f8fafc; border: 1rpx solid transparent;'

const form = reactive({
  phone: '',
  code: '',
  organization: '',
  companyName: '',
  creditCode: '',
  standardCount: '',
  principalName: '',
  principalPhone: '',
  contactName: '',
  contactJob: '',
  contactPhone: '',
  inviteCode: '',
  password: '',
  confirmPassword: '',
})

const roleMeta = computed(() => {
  const map: Record<RegisterRoleKey, { title: string; desc: string; iconName: string; heroBg: string; heroColor: string }> = {
    individual: {
      title: '个人用户注册',
      desc: '用于个人下单、查看报告与咨询服务。',
      iconName: 'user',
      heroBg: 'rgba(37, 99, 235, 0.15)',
      heroColor: '#ffffff',
    },
    enterprise: {
      title: '企业用户注册',
      desc: '用于企业认证、会员权益与委托管理。',
      iconName: 'enterprise',
      heroBg: 'rgba(79, 70, 229, 0.15)',
      heroColor: '#ffffff',
    },
    agency: {
      title: '服务机构注册',
      desc: '用于机构入驻、提交资质与承接业务。',
      iconName: 'institution',
      heroBg: 'rgba(217, 119, 6, 0.15)',
      heroColor: '#ffffff',
    },
  }

  return map[role.value]
})

const showCompany = computed(() => role.value === 'enterprise' || role.value === 'agency')
const showLicense = computed(() => showCompany.value)
const showPrincipal = computed(() => role.value === 'enterprise' || role.value === 'agency')
const showContact = computed(() => role.value === 'enterprise' || role.value === 'agency')

onLoad((query) => {
  const nextRole = query?.role as RegisterRoleKey | undefined
  if (nextRole === 'individual' || nextRole === 'enterprise' || nextRole === 'agency') {
    role.value = nextRole
  }
})

function sendCode() {
  if (!form.phone) {
    showAppToast({ message: '请先输入手机号', icon: 'none' })
    return
  }

  showSuccessToast('验证码已发送')
}

function pickLicense() {
  showAppToast({ message: '上传能力建设中', icon: 'none' })
}

function goLogin() {
  uni.navigateBack()
}

function submitRegister() {
  if (!agreed.value) {
    showAppToast({ message: '请先同意注册协议', icon: 'none' })
    return
  }

  if (form.password !== form.confirmPassword) {
    showAppToast({ message: '两次密码输入不一致', icon: 'none' })
    return
  }

  showSuccessToast('注册成功')
  setTimeout(() => {
    uni.redirectTo({ url: '/pages/auth/login' })
  }, 300)
}
</script>

<style scoped lang="scss">
.page-register-form {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #0c1a3a 0%, #1e3a5f 15%, #1d4ed8 35%, #2563eb 55%, #0ea5e9 80%, #67e8f9 100%);
  overflow: hidden;
}

/* ========== 装饰光球 ========== */
.form-canvas {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.form-canvas__orb {
  position: absolute;
  border-radius: 50%;
}

.form-canvas__orb--1 {
  width: 440rpx;
  height: 440rpx;
  top: -60rpx;
  right: -60rpx;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%);
  filter: blur(40rpx);
}

.form-canvas__orb--2 {
  width: 340rpx;
  height: 340rpx;
  bottom: 20%;
  left: -60rpx;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.14) 0%, transparent 70%);
  filter: blur(50rpx);
}

/* ========== 头部品牌 ========== */
.form-header {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 120rpx 32rpx 36rpx;
}

.form-header__icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-header__title {
  display: block;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.form-header__desc {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

/* ========== 表单滚动区 ========== */
.form-scroll {
  flex: 1;
  min-height: 0;
  padding: 0 24rpx 48rpx;
  box-sizing: border-box;
}

.form-card {
  position: relative;
  z-index: 3;
  padding: 40rpx 32rpx 32rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40rpx);
  box-shadow:
    0 24rpx 64rpx rgba(0, 0, 0, 0.1),
    0 8rpx 24rpx rgba(0, 0, 0, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  margin-bottom: 24rpx;
}

.register-form__stack {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.register-form__code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
  align-items: end;
}

/* ========== 上传卡片 ========== */
.upload-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border: 2rpx dashed rgba(37, 99, 235, 0.25);
  border-radius: 24rpx;
  background: rgba(238, 246, 255, 0.6);
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:active {
    transform: scale(0.98);
    border-color: rgba(37, 99, 235, 0.5);
  }
}

.upload-card__icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 20rpx;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.upload-card__copy {
  flex: 1;
  min-width: 0;
}

.upload-card__title {
  display: block;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
}

.upload-card__desc {
  display: block;
  margin-top: 6rpx;
  color: #94a3b8;
  font-size: 22rpx;
}

/* ========== 协议勾选 ========== */
.register-form__agreement {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 32rpx;
}

.register-form__checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.register-form__checkbox--active {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-color: transparent;
  box-shadow: 0 2rpx 10rpx rgba(37, 99, 235, 0.25);
  transform: scale(1.08);
}

.register-form__agreement-text {
  color: #94a3b8;
  font-size: 24rpx;
  line-height: 1.5;
}

.register-form__agreement-link {
  color: #2563eb;
  font-weight: 600;
}

/* ========== 底部返回登录 ========== */
.form-card__bottom {
  margin-top: 32rpx;
  text-align: center;
}

.form-card__bottom-text {
  color: #94a3b8;
  font-size: 24rpx;
}

.form-card__bottom-link {
  color: #2563eb;
  font-weight: 600;
}
</style>
