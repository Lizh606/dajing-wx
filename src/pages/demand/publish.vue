<template>
  <view class="page-demand-publish">
    <scroll-view scroll-y class="page-demand-publish__scroll">
      <view class="page-demand-publish__top-actions">
        <text class="page-demand-publish__draft" @tap="saveDraft">暂存草稿</text>
      </view>

      <view class="page-demand-publish__section">
        <text class="page-demand-publish__section-title">基本信息</text>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">需求标题 <text class="page-demand-publish__required">*</text></text>
          <input class="page-demand-publish__input" v-model="form.title" placeholder="请输入需求标题" />
        </view>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">检测类型 <text class="page-demand-publish__required">*</text></text>
          <view class="page-demand-publish__chips">
            <text
              v-for="t in types"
              :key="t"
              :class="['page-demand-publish__chip', form.type === t ? 'page-demand-publish__chip--active' : '']"
              @tap="form.type = t"
            >{{ t }}</text>
          </view>
        </view>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">产品/样品名称 <text class="page-demand-publish__required">*</text></text>
          <input class="page-demand-publish__input" v-model="form.productName" placeholder="如：锂电池正极材料" />
        </view>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">检测项目/指标 <text class="page-demand-publish__required">*</text></text>
          <textarea class="page-demand-publish__textarea" v-model="form.items" placeholder="请详细填写需要检测的项目或指标，如：电压、热扩散、过充保护..." />
        </view>
      </view>

      <view class="page-demand-publish__section">
        <text class="page-demand-publish__section-title">需求详情</text>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">样品数量</text>
          <input class="page-demand-publish__input" v-model="form.quantity" placeholder="请输入样品数量" type="number" />
        </view>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">期望完成时间</text>
          <input class="page-demand-publish__input" v-model="form.deadline" placeholder="如 2026-05-15" />
        </view>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">预算范围</text>
          <view class="page-demand-publish__budget-row">
            <input class="page-demand-publish__input page-demand-publish__input--half" v-model="form.budgetMin" placeholder="最低" type="number" />
            <text class="page-demand-publish__budget-divider">—</text>
            <input class="page-demand-publish__input page-demand-publish__input--half" v-model="form.budgetMax" placeholder="最高" type="number" />
          </view>
        </view>

        <view class="page-demand-publish__field">
          <text class="page-demand-publish__label">附加要求</text>
          <textarea class="page-demand-publish__textarea" v-model="form.extra" placeholder="如优先加急排期、报告需纸质版等" />
        </view>
      </view>

      <view class="page-demand-publish__section">
        <text class="page-demand-publish__section-title">附件与备注</text>
        <view class="page-demand-publish__upload">
          <text class="page-demand-publish__upload-text">📎 上传样品图片 / 图纸 / 技术文件</text>
        </view>
        <textarea class="page-demand-publish__textarea page-demand-publish__remark" v-model="form.remark" placeholder="备注信息" />
      </view>

      <view class="page-demand-publish__footer">
        <text class="page-demand-publish__submit" @tap="submit">发布需求</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const types = ['检验检测','计量','认证认可','质量诊断']
const form = ref({ title:'', type:'检验检测', productName:'', items:'', quantity:'', deadline:'', budgetMin:'', budgetMax:'', extra:'', remark:'' })
const saveDraft = () => uni.showToast({ title: '草稿已保存', icon: 'success' })
const submit = () => {
  uni.showToast({ title: '需求已发布', icon: 'success' })
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

  &__draft {
    padding: 12rpx 24rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: #2563eb;
    background: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
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

    &:last-child {
      margin-bottom: 0;
    }
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

  &__input,
  &__textarea {
    width: 100%;
    padding: 20rpx 24rpx;
    box-sizing: border-box;
    border: 1rpx solid #e2e8f0;
    border-radius: 12rpx;
    background: #f8fafc;
    font-size: 26rpx;
    color: #0f172a;
  }

  &__textarea {
    min-height: 160rpx;
  }

  &__budget-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__input--half {
    flex: 1;
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

  &__submit {
    display: block;
    padding: 32rpx;
    border-radius: 24rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
    background: #2563eb;
  }
}
</style>
