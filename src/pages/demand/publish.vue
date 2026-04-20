<template>
  <view class="page-demand-publish">
    <scroll-view scroll-y class="page-demand-publish__scroll">
      <view class="page-demand-publish__section">
        <view class="page-demand-publish__section-header">
          <text class="page-demand-publish__section-title">基本信息</text>
          <AppButton
            custom-style="min-height: 64rpx; height: 64rpx; padding: 0 24rpx; border-radius: 18rpx; font-size: 24rpx; font-weight: 600;"
            plain
            text="暂存草稿"
            type="info"
            @click="saveDraft"
          />
        </view>

        <AppForm>
          <view class="page-demand-publish__field">
            <text class="page-demand-publish__label">需求标题 <text class="page-demand-publish__required">*</text></text>
            <AppField v-model="form.title" :border="false" :custom-style="fieldStyle" placeholder="请输入需求标题" />
          </view>

          <view class="page-demand-publish__field">
            <text class="page-demand-publish__label">检测类型 <text class="page-demand-publish__required">*</text></text>
            <view class="page-demand-publish__chips">
              <text
                v-for="type in types"
                :key="type"
                :class="['page-demand-publish__chip', form.type === type ? 'page-demand-publish__chip--active' : '']"
                @tap="form.type = type"
              >{{ type }}</text>
            </view>
          </view>

          <view class="page-demand-publish__field">
            <text class="page-demand-publish__label">产品/样品名称 <text class="page-demand-publish__required">*</text></text>
            <AppField v-model="form.productName" :border="false" :custom-style="fieldStyle" placeholder="如：锂电池正极材料" />
          </view>

          <view class="page-demand-publish__field page-demand-publish__field--last">
            <text class="page-demand-publish__label">检测项目/指标 <text class="page-demand-publish__required">*</text></text>
            <AppField
              v-model="form.items"
              :autosize="{ minHeight: 140 }"
              :border="false"
              :custom-style="textareaStyle"
              placeholder="请详细填写需要检测的项目或指标，如：电压、热扩散、过充保护..."
              type="textarea"
            />
          </view>
        </AppForm>
      </view>

      <view class="page-demand-publish__section">
        <text class="page-demand-publish__section-title">需求详情</text>

        <AppForm>
          <view class="page-demand-publish__field">
            <text class="page-demand-publish__label">样品数量</text>
            <AppField v-model="form.quantity" :border="false" :custom-style="fieldStyle" placeholder="请输入样品数量" type="number" />
          </view>

          <view class="page-demand-publish__field">
            <text class="page-demand-publish__label">期望完成时间</text>
            <AppField v-model="form.deadline" :border="false" :custom-style="fieldStyle" placeholder="如 2026-05-15" />
          </view>

          <view class="page-demand-publish__field">
            <text class="page-demand-publish__label">预算范围</text>
            <view class="page-demand-publish__budget-row">
              <AppField v-model="form.budgetMin" :border="false" :custom-style="fieldHalfStyle" placeholder="最低" type="number" />
              <text class="page-demand-publish__budget-divider">-</text>
              <AppField v-model="form.budgetMax" :border="false" :custom-style="fieldHalfStyle" placeholder="最高" type="number" />
            </view>
          </view>

          <view class="page-demand-publish__field page-demand-publish__field--last">
            <text class="page-demand-publish__label">附加要求</text>
            <AppField
              v-model="form.extra"
              :autosize="{ minHeight: 120 }"
              :border="false"
              :custom-style="textareaStyle"
              placeholder="如优先加急排期、报告需纸质版等"
              type="textarea"
            />
          </view>
        </AppForm>
      </view>

      <view class="page-demand-publish__section">
        <text class="page-demand-publish__section-title">附件与备注</text>
        <view class="page-demand-publish__upload">
          <AppIcon color="#2563eb" name="attachment" size="20" />
          <text class="page-demand-publish__upload-text">上传样品图片 / 图纸 / 技术文件</text>
        </view>
        <AppField
          v-model="form.remark"
          :autosize="{ minHeight: 100 }"
          :border="false"
          :custom-style="textareaStyle"
          class="page-demand-publish__remark"
          placeholder="备注信息"
          type="textarea"
        />
      </view>

      <view class="page-demand-publish__footer">
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          text="发布需求"
          type="info"
          @click="submit"
        />
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showSuccessToast } from '@/services/ui/toast'

const types = ['检验检测', '计量', '认证认可', '质量诊断']
const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const fieldHalfStyle = `${fieldStyle} flex: 1;`
const textareaStyle = `${fieldStyle} min-height: 160rpx;`
const form = ref({
  title: '',
  type: '检验检测',
  productName: '',
  items: '',
  quantity: '',
  deadline: '',
  budgetMin: '',
  budgetMax: '',
  extra: '',
  remark: '',
})

function saveDraft() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  showSuccessToast('草稿已保存')
}

function submit() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  showSuccessToast('需求已发布')
  setTimeout(() => uni.navigateBack(), 1500)
}
</script>

<style scoped lang="scss">
.page-demand-publish {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 320rpx, #f8fafc 100%);
  position: relative;
  overflow: hidden;

  // Decorative background orbs
  &::before {
    content: '';
    position: absolute;
    top: -120rpx;
    right: -100rpx;
    width: 360rpx;
    height: 360rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 200rpx;
    left: -80rpx;
    width: 280rpx;
    height: 280rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.10) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  &__scroll {
    flex: 1;
    min-height: 0;
    padding: 24rpx;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
  }

  &__section {
    margin-bottom: 20rpx;
    padding: 32rpx;
    border-radius: 24rpx;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
    border: 1rpx solid rgba(241, 245, 249, 0.8);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  &__section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.5rpx;
  }

  &__field {
    margin-bottom: 24rpx;
  }

  &__field--last {
    margin-bottom: 0;
  }

  &__label {
    display: block;
    margin-bottom: 12rpx;
    font-size: 26rpx;
    font-weight: 500;
    color: #334155;
  }

  &__required {
    color: #e11d48;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  &__chip {
    padding: 14rpx 28rpx;
    border-radius: 16rpx;
    font-size: 24rpx;
    font-weight: 500;
    color: #475569;
    background: #f1f5f9;
    transition: all 0.25s ease;
    border: 1rpx solid transparent;

    &:active {
      transform: scale(0.96);
    }
  }

  &__chip--active {
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    border-color: transparent;
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.25);
  }

  &__budget-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__budget-divider {
    flex-shrink: 0;
    font-size: 30rpx;
    color: #94a3b8;
  }

  &__upload {
    padding: 52rpx;
    border: 2rpx dashed rgba(147, 197, 253, 0.7);
    border-radius: 20rpx;
    text-align: center;
    background: linear-gradient(135deg, rgba(239, 246, 255, 0.6) 0%, rgba(219, 234, 254, 0.3) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    transition: border-color 0.3s ease, background 0.3s ease;
    animation: dash-rotate 12s linear infinite;

    &:active {
      border-color: #2563eb;
      background: linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.6) 100%);
    }
  }

  &__upload-text {
    font-size: 26rpx;
    font-weight: 500;
    color: #2563eb;
  }

  &__remark {
    margin-top: 16rpx;
  }

  &__footer {
    padding-top: 8rpx;
    padding-bottom: 48rpx;

    :deep(.app-button) {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 6rpx 24rpx rgba(37, 99, 235, 0.2);

      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 12rpx rgba(37, 99, 235, 0.15);
      }
    }
  }
}

@keyframes dash-rotate {
  0% {
    border-color: rgba(147, 197, 253, 0.7);
  }
  50% {
    border-color: rgba(37, 99, 235, 0.35);
  }
  100% {
    border-color: rgba(147, 197, 253, 0.7);
  }
}
</style>
