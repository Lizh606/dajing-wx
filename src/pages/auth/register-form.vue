<template>
  <view class="page-register-form">
    <view class="register-card">
      <view class="register-card__hero">
        <view class="register-card__hero-icon" :style="{ background: roleMeta.heroBg }">
          <AppIcon :color="roleMeta.heroColor" :name="roleMeta.iconName" size="30" />
        </view>
        <text class="register-card__hero-title">{{ roleMeta.title }}</text>
        <text class="register-card__hero-desc">{{ roleMeta.desc }}</text>
      </view>

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
              custom-style="min-height: 76rpx; padding: 0 24rpx; border-radius: 18rpx;"
              plain
              text="发送验证码"
              type="info"
              @click="sendCode"
            />
          </view>

          <view
            v-if="showLicense"
            class="upload-card"
            @tap="pickLicense"
          >
            <view class="upload-card__icon">
              <AppIcon color="#2563eb" name="plus" size="18" />
            </view>
            <view class="upload-card__copy">
              <text class="upload-card__title">营业执照</text>
              <text class="upload-card__desc">演示阶段先保留上传占位，后续可接真实上传接口。</text>
            </view>
          </view>

          <AppField
            v-if="showCompany"
            v-model="form.companyName"
            :custom-style="fieldStyle"
            label="企业名称"
            placeholder="请输入企业名称"
          />
          <AppField
            v-if="showCompany"
            v-model="form.creditCode"
            :custom-style="fieldStyle"
            label="统一社会信用代码"
            placeholder="请输入统一社会信用代码"
          />

          <AppField
            v-if="role === 'individual'"
            v-model="form.organization"
            :custom-style="fieldStyle"
            label="所在单位"
            placeholder="请输入所在单位"
          />

          <AppField
            v-if="role === 'enterprise'"
            v-model="form.standardCount"
            :custom-style="fieldStyle"
            label="标准数量"
            placeholder="请输入企业标准数量"
            type="number"
          />

          <AppField
            v-if="showPrincipal"
            v-model="form.principalName"
            :custom-style="fieldStyle"
            label="负责人姓名"
            placeholder="请输入负责人姓名"
          />
          <AppField
            v-if="showPrincipal"
            v-model="form.principalPhone"
            :custom-style="fieldStyle"
            label="负责人手机"
            placeholder="请输入负责人手机"
            type="number"
          />

          <AppField
            v-if="showContact"
            v-model="form.contactName"
            :custom-style="fieldStyle"
            label="对接人姓名"
            placeholder="请输入业务对接人姓名"
          />
          <AppField
            v-if="showContact"
            v-model="form.contactJob"
            :custom-style="fieldStyle"
            label="对接人职位"
            placeholder="请输入业务对接人职位"
          />
          <AppField
            v-if="showContact"
            v-model="form.contactPhone"
            :custom-style="fieldStyle"
            label="对接人手机"
            placeholder="请输入业务对接人手机"
            type="number"
          />

          <AppField
            v-model="form.inviteCode"
            :custom-style="fieldStyle"
            label="推荐码"
            placeholder="请输入推荐码"
          />
          <AppField
            v-model="form.password"
            :custom-style="fieldStyle"
            label="密码"
            placeholder="请输入密码"
            type="password"
          />
          <AppField
            v-model="form.confirmPassword"
            :custom-style="fieldStyle"
            label="确认密码"
            placeholder="请再次输入密码"
            type="password"
          />
        </view>
      </AppForm>

      <view class="register-form__agreement" @tap="agreed = !agreed">
        <view class="register-form__checkbox" :class="{ 'register-form__checkbox--active': agreed }">
          <AppIcon v-if="agreed" color="#ffffff" name="success" size="12" />
        </view>
        <text class="register-form__agreement-text">我已阅读并同意《注册协议》</text>
      </view>

      <AppButton
        block
        custom-style="min-height: 88rpx; border-radius: 24rpx; font-size: 28rpx; margin-top: 24rpx;"
        text="立即注册"
        type="info"
        @click="submitRegister"
      />
    </view>

    <AppUiProvider />
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
const fieldStyle = 'border-radius: 20rpx; background: #f8fafc;'

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
      heroBg: '#eff6ff',
      heroColor: '#2563eb',
    },
    enterprise: {
      title: '企业用户注册',
      desc: '用于企业认证、会员权益与委托管理。',
      iconName: 'enterprise',
      heroBg: '#eef2ff',
      heroColor: '#4f46e5',
    },
    agency: {
      title: '服务机构注册',
      desc: '用于机构入驻、提交资质与承接业务。',
      iconName: 'institution',
      heroBg: '#fef3c7',
      heroColor: '#b45309',
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
  padding: 24rpx;
  background: $bg-page;
  box-sizing: border-box;
}

.register-card {
  padding: 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 28rpx rgba(15, 23, 42, 0.08);
}

.register-card__hero {
  margin-bottom: 24rpx;
  text-align: center;
}

.register-card__hero-icon {
  width: 108rpx;
  height: 108rpx;
  margin: 0 auto 18rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-card__hero-title {
  display: block;
  color: $slate-900;
  font-size: 34rpx;
  font-weight: 700;
}

.register-card__hero-desc {
  display: block;
  margin-top: 8rpx;
  color: $slate-400;
  font-size: 24rpx;
  line-height: 1.5;
}

.register-form__stack {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.register-form__code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
  align-items: end;
}

.upload-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border: 1rpx dashed #bfdbfe;
  border-radius: 20rpx;
  background: #f8fbff;
}

.upload-card__icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-card__copy {
  flex: 1;
  min-width: 0;
}

.upload-card__title {
  display: block;
  color: $slate-900;
  font-size: 28rpx;
  font-weight: 600;
}

.upload-card__desc {
  display: block;
  margin-top: 6rpx;
  color: $slate-400;
  font-size: 22rpx;
  line-height: 1.5;
}

.register-form__agreement {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
}

.register-form__checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 1rpx solid #cbd5e1;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-form__checkbox--active {
  background: #2563eb;
  border-color: #2563eb;
}

.register-form__agreement-text {
  color: $slate-500;
  font-size: 24rpx;
}
</style>
