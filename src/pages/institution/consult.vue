<template>
  <view class="page-consult">
    <view class="page-consult__scroll">
      <view class="page-consult__org-banner">
        <text class="page-consult__org-caption">当前咨询机构</text>
        <text class="page-consult__org-name">湖南质量检测研究院</text>
        <text class="page-consult__org-meta">CMA / CNAS · 化学成分检测 · 平均响应 8 分钟</text>
      </view>

      <view class="page-consult__section">
        <view class="page-consult__field">
          <text class="page-consult__label">咨询问题类型 <text class="page-consult__required">*</text></text>
          <view class="page-consult__chips">
            <text
              v-for="type in consultTypes"
              :key="type"
              :class="['page-consult__chip', form.questionType === type ? 'page-consult__chip--active' : '']"
              @tap="form.questionType = type"
            >{{ type }}</text>
          </view>
        </view>

        <view class="page-consult__field">
          <text class="page-consult__label">问题描述 <text class="page-consult__required">*</text></text>
          <AppField
            v-model="form.description"
            :autosize="{ minHeight: 120 }"
            :border="false"
            :custom-style="textareaStyle"
            placeholder="请输入当前咨询的问题、需求背景、期望周期及其他补充说明"
            type="textarea"
          />
        </view>

        <view class="page-consult__field">
          <text class="page-consult__label">联系人 <text class="page-consult__required">*</text></text>
          <AppField
            v-model="form.contactName"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入联系人姓名"
          />
        </view>

        <view class="page-consult__field page-consult__field--last">
          <text class="page-consult__label">联系电话 <text class="page-consult__required">*</text></text>
          <AppField
            v-model="form.phone"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入联系电话"
            type="number"
          />
        </view>
      </view>

      <view class="page-consult__section">
        <text class="page-consult__section-title">上传附件</text>
        <view class="page-consult__upload" @tap="showComingSoon">
          <text class="page-consult__upload-text">上传样品照片 / 技术参数 / 认证资料</text>
        </view>
        <text class="page-consult__upload-tip">支持 JPG、PNG、PDF 等常见格式</text>
      </view>
    </view>

    <view class="page-consult__actions">
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        plain
        round
        text="取消"
        type="default"
        @click="cancel"
      />
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        round
        text="提交"
        type="info"
        @click="submit"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'

const consultTypes = ['检测标准咨询', '报价咨询', '样品寄送咨询', '报告查验咨询']
const form = reactive({
  contactName: '',
  phone: '',
  questionType: '检测标准咨询',
  description: '',
})

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 14rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 170rpx;`

function showComingSoon() {
  showAppToast({ message: '附件上传能力建设中', icon: 'none' })
}

function cancel() {
  uni.navigateBack()
}

function submit() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (!form.contactName.trim() || !form.phone.trim() || !form.description.trim()) {
    showFailToast('请填写完整必填项')
    return
  }

  showSuccessToast('咨询已提交，机构将尽快回复')
  setTimeout(() => uni.navigateBack(), 1200)
}
</script>

<style scoped lang="scss">
.page-consult {
  min-height: 100vh;
  background: #f8fafc;
}

.page-consult__scroll {
  padding: 24rpx 24rpx 0;
  box-sizing: border-box;
}

.page-consult__org-banner {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border: 1rpx solid #bfdbfe;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eff6ff, #ecfeff);
}

.page-consult__org-caption {
  display: block;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  color: #2563eb;
  font-weight: 600;
}

.page-consult__org-name {
  display: block;
  margin-bottom: 8rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-consult__org-meta {
  display: block;
  font-size: 23rpx;
  color: #64748b;
}

.page-consult__section {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  border: 1rpx solid #e8edf5;
  background: #ffffff;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.05);
}

.page-consult__section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.page-consult__field {
  margin-bottom: 18rpx;
}

.page-consult__field--last {
  margin-bottom: 0;
}

.page-consult__label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #475569;
}

.page-consult__required {
  color: #e11d48;
}

.page-consult__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.page-consult__chip {
  padding: 10rpx 18rpx;
  border-radius: 10rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 22rpx;
}

.page-consult__chip--active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.page-consult__upload {
  padding: 46rpx;
  border: 2rpx dashed #93c5fd;
  border-radius: 16rpx;
  text-align: center;
  background: #eff6ff;
}

.page-consult__upload-text {
  font-size: 24rpx;
  color: #2563eb;
}

.page-consult__upload-tip {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 20rpx;
}

.page-consult__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  padding: 18rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
}
</style>
