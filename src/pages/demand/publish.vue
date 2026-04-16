<template>
  <view class="page-demand-publish">
    <view class="page-demand-publish__scroll">
      <view class="page-demand-publish__content">
        <view class="page-demand-publish__tools">
          <AppButton
            custom-style="min-height: 64rpx; height: 64rpx; padding: 0 24rpx; border-radius: 18rpx; font-size: 24rpx; font-weight: 600;"
            plain
            text="暂存草稿"
            type="info"
            @click="saveDraft"
          />
        </view>

        <view class="page-demand-publish__section">
          <text class="page-demand-publish__section-title">需求表单</text>
          <AppForm>
            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">项目名称 <text class="page-demand-publish__required">*</text></text>
              <AppField v-model="form.projectName" :border="false" :custom-style="fieldStyle" placeholder="请输入项目名称" />
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">需求说明 <text class="page-demand-publish__required">*</text></text>
              <AppField
                v-model="form.requirement"
                :autosize="{ minHeight: 150 }"
                :border="false"
                :custom-style="textareaStyle"
                placeholder="请描述检测目标、范围、关键要求"
                type="textarea"
              />
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">金额上限（元） <text class="page-demand-publish__required">*</text></text>
              <AppField v-model="form.budgetMax" :border="false" :custom-style="fieldStyle" placeholder="请输入金额上限" type="number" />
            </view>

            <view class="page-demand-publish__field page-demand-publish__field-grid">
              <view>
                <text class="page-demand-publish__label">联系人 <text class="page-demand-publish__required">*</text></text>
                <AppField v-model="form.contactName" :border="false" :custom-style="fieldStyle" placeholder="请输入联系人" />
              </view>
              <view>
                <text class="page-demand-publish__label">联系方式 <text class="page-demand-publish__required">*</text></text>
                <AppField v-model="form.contactPhone" :border="false" :custom-style="fieldStyle" placeholder="请输入联系方式" />
              </view>
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">联系地址 <text class="page-demand-publish__required">*</text></text>
              <AppField
                v-model="form.contactAddress"
                :autosize="{ minHeight: 96 }"
                :border="false"
                :custom-style="textareaStyleCompact"
                placeholder="请输入联系地址"
                type="textarea"
              />
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">资质要求 <text class="page-demand-publish__optional">（可选）</text></text>
              <AppField v-model="form.qualification" :border="false" :custom-style="fieldStyle" placeholder="如：CMA / CNAS" />
            </view>

            <view class="page-demand-publish__field page-demand-publish__field-grid page-demand-publish__field--last">
              <view>
                <text class="page-demand-publish__label">期望完成时间 <text class="page-demand-publish__optional">（可选）</text></text>
                <AppField v-model="form.expectedTime" :border="false" :custom-style="fieldStyle" placeholder="如：2026-04-30 前" />
              </view>
              <view>
                <text class="page-demand-publish__label">是否加急 <text class="page-demand-publish__optional">（可选）</text></text>
                <view class="page-demand-publish__chips">
                  <text
                    v-for="item in urgentOptions"
                    :key="item"
                    :class="['page-demand-publish__chip', form.urgent === item ? 'page-demand-publish__chip--active' : '']"
                    @tap="form.urgent = item"
                  >{{ item }}</text>
                </view>
              </view>
            </view>
          </AppForm>
        </view>

        <view class="page-demand-publish__section">
          <text class="page-demand-publish__section-title">附件与备注</text>
          <view class="page-demand-publish__upload" @tap="showComingSoon">
            <AppIcon color="#2563eb" name="attachment" size="20" />
            <text class="page-demand-publish__upload-text">上传样品图片 / 图纸 / 技术文件</text>
          </view>
          <view class="page-demand-publish__field page-demand-publish__field--last">
            <text class="page-demand-publish__label">备注 <text class="page-demand-publish__optional">（可选）</text></text>
            <AppField
              v-model="form.remark"
              :autosize="{ minHeight: 100 }"
              :border="false"
              :custom-style="textareaStyleCompact"
              placeholder="如：样品检测完成后需寄回，并优先安排本周检测"
              type="textarea"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="page-demand-publish__actions">
      <AppButton
        block
        custom-style="min-height: 84rpx; height: 84rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
        plain
        text="取消"
        type="default"
        @click="goBack"
      />
      <AppButton
        block
        custom-style="min-height: 84rpx; height: 84rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
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
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 170rpx;`
const textareaStyleCompact = `${fieldStyle} min-height: 120rpx;`
const urgentOptions = ['普通', '加急']

const form = reactive({
  projectName: '',
  requirement: '',
  budgetMax: '',
  contactName: '',
  contactPhone: '',
  contactAddress: '',
  qualification: '',
  expectedTime: '',
  urgent: '普通',
  remark: '',
})

function goBack() {
  uni.navigateBack()
}

function showComingSoon() {
  showAppToast({ message: '附件上传能力建设中', icon: 'none' })
}

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

  if (
    !form.projectName.trim() ||
    !form.requirement.trim() ||
    !form.budgetMax.trim() ||
    !form.contactName.trim() ||
    !form.contactPhone.trim() ||
    !form.contactAddress.trim()
  ) {
    showFailToast('请先填写核心必填项')
    return
  }

  showSuccessToast('需求已提交，等待机构响应')
  setTimeout(() => uni.navigateBack(), 1200)
}
</script>

<style scoped lang="scss">
.page-demand-publish {
  min-height: 100vh;
  background: #f8fafc;
}

.page-demand-publish__scroll {
  box-sizing: border-box;
}

.page-demand-publish__content {
  padding: 24rpx;
  padding-bottom: 24rpx;
  box-sizing: border-box;
}

.page-demand-publish__tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16rpx;
}

.page-demand-publish__section {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  border: 1rpx solid #f1f5f9;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-demand-publish__section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-publish__field {
  margin-bottom: 20rpx;
}

.page-demand-publish__field--last {
  margin-bottom: 0;
}

.page-demand-publish__field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.page-demand-publish__label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 26rpx;
  color: #334155;
}

.page-demand-publish__required {
  color: #e11d48;
}

.page-demand-publish__optional {
  color: #94a3b8;
  font-size: 22rpx;
}

.page-demand-publish__chips {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-height: 84rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 10rpx;
  box-sizing: border-box;
  background: #f8fafc;
}

.page-demand-publish__chip {
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #475569;
  background: #e2e8f0;
}

.page-demand-publish__chip--active {
  color: #ffffff;
  background: #2563eb;
}

.page-demand-publish__upload {
  margin-bottom: 20rpx;
  padding: 44rpx 30rpx;
  border: 2rpx dashed #bfdbfe;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  text-align: center;
  background: #eff6ff;
}

.page-demand-publish__upload-text {
  font-size: 24rpx;
  line-height: 1.5;
  color: #1d4ed8;
}

.page-demand-publish__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  padding: 0 24rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

@media (max-width: 360px) {
  .page-demand-publish__field-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
