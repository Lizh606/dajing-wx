<template>
  <view class="page-consult">
    <scroll-view class="page-consult__scroll" scroll-y>
      <view class="page-consult__org-banner">
        <text class="page-consult__org-caption">当前咨询机构</text>
        <text class="page-consult__org-name">湖南质量检测研究院</text>
        <text class="page-consult__org-meta">CMA / CNAS · 化学成分检测 · 平均响应 8 分钟</text>
      </view>

      <view class="page-consult__section">
        <text class="page-consult__section-title">填写需求</text>

        <AppForm>
          <view class="page-consult__field">
            <text class="page-consult__label">咨询类型 <text class="page-consult__required">*</text></text>
            <view class="page-consult__chips">
              <text
                v-for="type in consultTypes"
                :key="type"
                :class="['page-consult__chip', consultType === type ? 'page-consult__chip--active' : '']"
                @tap="consultType = type"
              >{{ type }}</text>
            </view>
          </view>

          <view class="page-consult__field">
            <text class="page-consult__label">产品/样品名称 <text class="page-consult__required">*</text></text>
            <AppField
              v-model="form.productName"
              :border="false"
              :custom-style="fieldStyle"
              placeholder="请输入产品或样品名称"
            />
          </view>

          <view class="page-consult__field">
            <text class="page-consult__label">需求描述 <text class="page-consult__required">*</text></text>
            <AppField
              v-model="form.description"
              :autosize="{ minHeight: 120 }"
              :border="false"
              :custom-style="textareaStyle"
              placeholder="请详细描述您的检测需求、检测指标等"
              type="textarea"
            />
          </view>

          <view class="page-consult__field">
            <text class="page-consult__label">期望完成时间</text>
            <AppField
              v-model="form.deadline"
              :border="false"
              :custom-style="fieldStyle"
              placeholder="如 2026-05-01"
            />
          </view>

          <view class="page-consult__field page-consult__field--last">
            <text class="page-consult__label">联系电话</text>
            <AppField
              v-model="form.phone"
              :border="false"
              :custom-style="fieldStyle"
              placeholder="请输入联系电话"
              type="number"
            />
          </view>
        </AppForm>
      </view>

      <view class="page-consult__section">
        <text class="page-consult__section-title">材料上传</text>
        <view class="page-consult__upload">
          <text class="page-consult__upload-text">📎 上传相关材料（图纸、技术文件等）</text>
        </view>
      </view>

      <view class="page-consult__ai-tip">
        <view class="page-consult__ai-icon">
          <AppIcon color="#7c3aed" name="ai" size="20" />
        </view>
        <view class="page-consult__ai-content">
          <text class="page-consult__ai-title">AI 智能匹配</text>
          <text class="page-consult__ai-desc">根据您的需求描述，将智能推荐最匹配的检测项目与机构</text>
        </view>
      </view>

      <view class="page-consult__footer">
        <AppButton
          block
          custom-style="min-height: 96rpx; border-radius: 24rpx; font-size: 30rpx;"
          round
          text="提交咨询"
          type="info"
          @click="submit"
        />
      </view>
    </scroll-view>

    <AppUiProvider />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { showSuccessToast } from '@/services/ui/toast'

const consultType = ref('检验检测')
const consultTypes = ['检验检测', '认证认可', '计量校准', '质量诊断', '标准服务']
const form = ref({ productName: '', description: '', deadline: '', phone: '' })
const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 160rpx;`

const submit = () => {
  showSuccessToast('咨询已提交')
  setTimeout(() => uni.navigateBack(), 1500)
}
</script>

<style scoped lang="scss">
.page-consult {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;

  &__scroll {
    flex: 1;
    min-height: 0;
    padding: 24rpx;
    box-sizing: border-box;
  }

  &__org-banner {
    margin-bottom: 16rpx;
    padding: 28rpx;
    border: 1rpx solid #bfdbfe;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
  }

  &__org-caption {
    display: block;
    margin-bottom: 8rpx;
    font-size: 24rpx;
    color: #2563eb;
  }

  &__org-name {
    display: block;
    margin-bottom: 8rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #0f172a;
  }

  &__org-meta {
    display: block;
    font-size: 24rpx;
    color: #64748b;
  }

  &__section {
    margin-bottom: 16rpx;
    padding: 28rpx;
    border-radius: 24rpx;
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
  }

  &__section-title {
    display: block;
    margin-bottom: 20rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #0f172a;
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

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  &__chip {
    padding: 12rpx 24rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: #475569;
    background: #f1f5f9;
  }

  &__chip--active {
    color: #ffffff;
    background: #2563eb;
  }

  &__upload {
    padding: 48rpx;
    border: 2rpx dashed #93c5fd;
    border-radius: 16rpx;
    text-align: center;
    background: #eff6ff;
  }

  &__upload-text {
    font-size: 26rpx;
    color: #2563eb;
  }

  &__ai-tip {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin-bottom: 16rpx;
    padding: 28rpx;
    border: 1rpx solid #ddd6fe;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
  }

  &__ai-icon {
    flex-shrink: 0;
    width: 64rpx;
    height: 64rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__ai-content {
    min-width: 0;
  }

  &__ai-title {
    display: block;
    margin-bottom: 6rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: #7c3aed;
  }

  &__ai-desc {
    display: block;
    font-size: 24rpx;
    color: #6d28d9;
  }

  &__footer {
    padding-top: 8rpx;
    padding-bottom: 40rpx;
  }
}
</style>
