<template>
  <view class="page-provider-code">
    <scroll-view class="page-provider-code__scroll" scroll-y>
      <view class="code-card">
        <text class="code-card__title">服务商编号管理</text>
        <text class="code-card__desc">实现一编号对应一企业，编号唯一性由接口校验。</text>

        <view class="code-current">
          <text>当前编号：{{ info.code }}</text>
          <text>企业名称：{{ info.enterpriseName }}</text>
          <text>更新时间：{{ info.updatedAt }}</text>
        </view>

        <AppField
          v-model="draftCode"
          :border="false"
          custom-style="padding: 20rpx 24rpx; border: 1rpx solid #dbeafe; border-radius: 16rpx; background: #fff;"
          placeholder="请输入新服务商编号"
        />

        <view class="actions">
          <AppButton block plain text="校验唯一性" type="default" @click="checkUnique" />
          <AppButton block text="绑定编号" type="info" @click="bind" />
        </view>

        <text v-if="feedback" class="feedback">{{ feedback }}</text>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { providerService } from '@/services/api'
import { useUserStore } from '@/stores/user'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'

const userStore = useUserStore()
const draftCode = ref('')
const feedback = ref('')
const info = ref({
  code: '-',
  enterpriseId: '',
  enterpriseName: '',
  updatedAt: '-',
})

onLoad(async () => {
  info.value = await providerService.getProviderCodeInfo()
})

async function checkUnique() {
  if (!draftCode.value.trim()) {
    showFailToast('请输入服务商编号')
    return
  }

  const result = await providerService.checkProviderCodeUnique(draftCode.value)
  feedback.value = result.message
}

async function bind() {
  if (!draftCode.value.trim()) {
    showFailToast('请输入服务商编号')
    return
  }

  const check = await providerService.checkProviderCodeUnique(draftCode.value)

  if (!check.unique) {
    feedback.value = check.message
    return
  }

  info.value = await providerService.bindProviderCode({
    code: draftCode.value,
    enterpriseId: userStore.enterpriseId || 'ep-001',
    enterpriseName: userStore.company || '当前企业',
  })

  feedback.value = '绑定成功'
  showSuccessToast('服务商编号已绑定')
}
</script>

<style scoped lang="scss">
.page-provider-code {
  min-height: 100vh;
  background: #f8fafc;
}

.page-provider-code__scroll {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.code-card {
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
  padding: 24rpx;
}

.code-card__title {
  display: block;
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 700;
}

.code-card__desc {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 23rpx;
  line-height: 1.5;
}

.code-current {
  margin: 14rpx 0;
  padding: 14rpx;
  border-radius: 14rpx;
  background: #f8fafc;
  display: grid;
  gap: 6rpx;
  color: #334155;
  font-size: 23rpx;
}

.actions {
  margin-top: 12rpx;
  display: grid;
  gap: 10rpx;
}

.feedback {
  display: block;
  margin-top: 10rpx;
  color: #1E61FF;
  font-size: 23rpx;
}
</style>
