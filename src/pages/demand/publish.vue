<template>
  <view class="page-demand-publish">
    <scroll-view scroll-y class="page-demand-publish__scroll">
      <view class="page-demand-publish__top-actions">
        <AppButton
          custom-style="min-height: 64rpx; padding: 0 24rpx;"
          plain
          round
          size="small"
          text="暂存草稿"
          type="info"
          @click="saveDraft"
        />
      </view>

      <view class="page-demand-publish__section">
        <text class="page-demand-publish__section-title">基本信息</text>

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
              <text class="page-demand-publish__budget-divider">—</text>
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
          custom-style="min-height: 96rpx; border-radius: 24rpx; font-size: 30rpx;"
          round
          text="发布需求"
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

const types = ['检验检测', '计量', '认证认可', '质量诊断']
const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const fieldHalfStyle = `${fieldStyle} flex: 1;`
const textareaStyle = `${fieldStyle} min-height: 160rpx;`
const form = ref({ title: '', type: '检验检测', productName: '', items: '', quantity: '', deadline: '', budgetMin: '', budgetMax: '', extra: '', remark: '' })

function saveDraft() {
  showSuccessToast('草稿已保存')
}

function submit() {
  showSuccessToast('需求已发布')
  setTimeout(() => uni.navigateBack(), 1500)
}
</script>

<style scoped lang="scss">
.page-demand-publish {
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

  &__top-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16rpx;
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
    padding: 48rpx;
    border: 2rpx dashed #93c5fd;
    border-radius: 16rpx;
    text-align: center;
    background: #eff6ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
  }

  &__upload-text {
    font-size: 26rpx;
    color: #2563eb;
  }

  &__remark {
    margin-top: 16rpx;
  }

  &__footer {
    padding-top: 8rpx;
    padding-bottom: 40rpx;
  }
}
</style>
