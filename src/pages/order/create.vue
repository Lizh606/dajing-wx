<template>
  <view class="page-order-create">
    <scroll-view class="page-order-create__scroll" scroll-y>
      <view class="page-order-create__service-card">
        <text class="page-order-create__section-title">确认服务项目</text>
        <view class="page-order-create__service-main">
          <view class="page-order-create__service-icon">
            <AppIcon color="#2563eb" name="lab" size="24" />
          </view>
          <view class="page-order-create__service-content">
            <text class="page-order-create__service-name">金属材料成分检测</text>
            <text class="page-order-create__service-meta">湖南质量检测研究院 · CMA / CNAS</text>
            <text class="page-order-create__service-price">¥980 起</text>
          </view>
        </view>
      </view>

      <view class="page-order-create__section">
        <text class="page-order-create__section-title">填写委托信息</text>

        <AppForm>
          <view class="page-order-create__field">
            <text class="page-order-create__label">样品名称 <text class="page-order-create__required">*</text></text>
            <AppField v-model="form.sampleName" :border="false" :custom-style="fieldStyle" placeholder="请输入样品名称" />
          </view>

          <view class="page-order-create__field">
            <text class="page-order-create__label">样品数量 <text class="page-order-create__required">*</text></text>
            <AppField v-model="form.sampleCount" :border="false" :custom-style="fieldStyle" placeholder="请输入数量" type="number" />
          </view>

          <view class="page-order-create__field">
            <text class="page-order-create__label">检测标准</text>
            <AppField v-model="form.standard" :border="false" :custom-style="fieldStyle" placeholder="如 GB/T 228.1-2021" />
          </view>

          <view class="page-order-create__field">
            <text class="page-order-create__label">检测要求</text>
            <AppField
              v-model="form.requirement"
              :autosize="{ minHeight: 100 }"
              :border="false"
              :custom-style="textareaStyle"
              placeholder="请描述具体检测要求"
              type="textarea"
            />
          </view>

          <view class="page-order-create__field page-order-create__field--last">
            <text class="page-order-create__label">期望完成时间</text>
            <AppField v-model="form.deadline" :border="false" :custom-style="fieldStyle" placeholder="如 2026-05-01" />
          </view>
        </AppForm>
      </view>

      <view class="page-order-create__section">
        <text class="page-order-create__section-title">选择服务机构</text>
        <view
          v-for="inst in institutions"
          :key="inst.id"
          :class="[
            'page-order-create__inst-option',
            selectedInst === inst.id ? 'page-order-create__inst-option--selected' : ''
          ]"
          @tap="selectedInst = inst.id"
        >
          <view :class="['page-order-create__radio', selectedInst === inst.id ? 'page-order-create__radio--selected' : '']">
            <view v-if="selectedInst === inst.id" class="page-order-create__radio-dot"></view>
          </view>
          <view class="page-order-create__inst-content">
            <text class="page-order-create__inst-name">{{ inst.name }}</text>
            <text class="page-order-create__inst-certs">{{ inst.certs }}</text>
            <text class="page-order-create__inst-price">{{ inst.price }}</text>
          </view>
          <view class="page-order-create__inst-score">
            <AppIcon color="#d97706" name="star" size="14" />
            <text>{{ inst.score }}</text>
          </view>
        </view>
      </view>

      <view class="page-order-create__section">
        <text class="page-order-create__section-title">附件与备注</text>
        <view class="page-order-create__upload">
          <AppIcon color="#2563eb" name="attachment" size="20" />
          <text class="page-order-create__upload-text">上传样品图片 / 图纸 / 技术文件</text>
        </view>
        <AppField
          v-model="form.remark"
          :autosize="{ minHeight: 100 }"
          :border="false"
          :custom-style="textareaStyle"
          class="page-order-create__remark-field"
          placeholder="备注：如样品检测完成后需寄回等"
          type="textarea"
        />
      </view>

      <view class="page-order-create__footer">
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          plain
          text="暂存草稿"
          type="default"
          @click="saveDraft"
        />
        <AppButton
          block
          custom-style="min-height: 80rpx; height: 80rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
          text="提交订单"
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

const form = ref({ sampleName: '', sampleCount: '', standard: '', requirement: '', deadline: '', remark: '' })
const selectedInst = ref('1')
const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 120rpx;`
const institutions = [
  { id: '1', name: '湖南质量检测研究院', certs: 'CMA / CNAS · 平均响应 8 分钟', price: '¥980 / 次', score: '4.9' },
  { id: '2', name: '广州检验检测认证集团', certs: 'CMA · 平均响应 15 分钟', price: '¥860 / 次', score: '4.7' },
  { id: '3', name: '深圳华检技术服务', certs: 'CNAS · 平均响应 12 分钟', price: '¥1,100 / 次', score: '4.8' },
]

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

  showSuccessToast('订单已提交')
}
</script>

<style scoped lang="scss">
.page-order-create {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f1f5f9;

  &__scroll {
    flex: 1;
    min-height: 0;
    padding: 24rpx;
    box-sizing: border-box;
  }

  &__section,
  &__service-card {
    margin-bottom: 24rpx;
    padding: 32rpx;
    border-radius: 20rpx;
    background: #ffffff;
  }

  &__section-title {
    display: block;
    margin-bottom: 20rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #0f172a;
  }

  &__service-main {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  &__service-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    background: #eff6ff;
  }

  &__service-content {
    flex: 1;
    min-width: 0;
  }

  &__service-name {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
    color: #0f172a;
  }

  &__service-meta {
    display: block;
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #64748b;
  }

  &__service-price {
    display: block;
    margin-top: 8rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #2563eb;
  }

  &__field {
    margin-bottom: 20rpx;
  }

  &__field--last {
    margin-bottom: 0;
  }

  &__label {
    display: block;
    margin-bottom: 10rpx;
    font-size: 26rpx;
    color: #334155;
  }

  &__required {
    color: #e11d48;
  }

  &__inst-option {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 12rpx;
    padding: 20rpx;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__inst-option--selected {
    border-color: #2563eb;
    background: #eff6ff;
  }

  &__radio {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36rpx;
    height: 36rpx;
    flex-shrink: 0;
    border: 2rpx solid #cbd5e1;
    border-radius: 50%;
  }

  &__radio--selected {
    border-color: #2563eb;
  }

  &__radio-dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: #2563eb;
  }

  &__inst-content {
    flex: 1;
    min-width: 0;
  }

  &__inst-name {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #0f172a;
  }

  &__inst-certs {
    display: block;
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #64748b;
  }

  &__inst-price {
    display: block;
    margin-top: 6rpx;
    font-size: 24rpx;
    font-weight: 500;
    color: #2563eb;
  }

  &__inst-score {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    color: #d97706;
  }

  &__upload {
    padding: 48rpx;
    border: 2rpx dashed #93c5fd;
    border-radius: 16rpx;
    text-align: center;
    background: #eff6ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
  }

  &__upload-text {
    font-size: 26rpx;
    color: #2563eb;
  }

  &__remark-field {
    margin-top: 16rpx;
  }

  &__footer {
    display: flex;
    gap: 16rpx;
    margin-top: 8rpx;
    padding-bottom: 40rpx;

    :deep(.van-button),
    :deep(.app-button) {
      flex: 1 1 0;
      width: auto;
    }
  }
}
</style>
