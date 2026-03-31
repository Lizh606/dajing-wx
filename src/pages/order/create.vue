<template>
  <view class="page-order-create">
    <scroll-view class="page-order-create__scroll" scroll-y>
      <view class="page-order-create__service-card">
        <text class="page-order-create__section-title">确认服务项目</text>
        <view class="page-order-create__service-main">
          <view class="page-order-create__service-icon">
            <text class="page-order-create__service-emoji">🧪</text>
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

        <view class="page-order-create__field">
          <text class="page-order-create__label">样品名称 <text class="page-order-create__required">*</text></text>
          <input class="page-order-create__input" v-model="form.sampleName" placeholder="请输入样品名称" />
        </view>

        <view class="page-order-create__field">
          <text class="page-order-create__label">样品数量 <text class="page-order-create__required">*</text></text>
          <input class="page-order-create__input" v-model="form.sampleCount" placeholder="请输入数量" type="number" />
        </view>

        <view class="page-order-create__field">
          <text class="page-order-create__label">检测标准</text>
          <input class="page-order-create__input" v-model="form.standard" placeholder="如 GB/T 228.1-2021" />
        </view>

        <view class="page-order-create__field">
          <text class="page-order-create__label">检测要求</text>
          <textarea class="page-order-create__textarea" v-model="form.requirement" placeholder="请描述具体检测要求" />
        </view>

        <view class="page-order-create__field">
          <text class="page-order-create__label">期望完成时间</text>
          <input class="page-order-create__input" v-model="form.deadline" placeholder="如 2026-05-01" />
        </view>
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
          <text class="page-order-create__inst-score">⭐ {{ inst.score }}</text>
        </view>
      </view>

      <view class="page-order-create__section">
        <text class="page-order-create__section-title">附件与备注</text>
        <view class="page-order-create__upload">
          <text class="page-order-create__upload-text">上传样品图片 / 图纸 / 技术文件</text>
        </view>
        <textarea class="page-order-create__textarea page-order-create__textarea--remark" v-model="form.remark" placeholder="备注：如样品检测完成后需寄回等" />
      </view>

      <view class="page-order-create__footer">
        <text class="page-order-create__footer-btn page-order-create__footer-btn--secondary" @tap="() => {}">暂存草稿</text>
        <text class="page-order-create__footer-btn page-order-create__footer-btn--primary" @tap="submit">提交订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const form = ref({ sampleName: '', sampleCount: '', standard: '', requirement: '', deadline: '', remark: '' })
const selectedInst = ref('1')
const institutions = [
  { id: '1', name: '湖南质量检测研究院', certs: 'CMA / CNAS · 平均响应 8 分钟', price: '¥980 / 次', score: '4.9' },
  { id: '2', name: '广州检验检测认证集团', certs: 'CMA · 平均响应 15 分钟', price: '¥860 / 次', score: '4.7' },
  { id: '3', name: '深圳华检技术服务', certs: 'CNAS · 平均响应 12 分钟', price: '¥1,100 / 次', score: '4.8' },
]
const submit = () => {
  uni.showToast({ title: '订单已提交', icon: 'success' })
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

  &__service-emoji {
    font-size: 48rpx;
    line-height: 1;
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
    min-height: 120rpx;
  }

  &__textarea--remark {
    margin-top: 16rpx;
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
    font-size: 24rpx;
    color: #d97706;
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

  &__footer {
    display: flex;
    gap: 16rpx;
    margin-top: 8rpx;
    padding-bottom: 40rpx;
  }

  &__footer-btn {
    flex: 1;
    padding: 28rpx;
    border-radius: 16rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 500;
  }

  &__footer-btn--secondary {
    color: #475569;
    background: #e2e8f0;
  }

  &__footer-btn--primary {
    color: #ffffff;
    background: #2563eb;
  }
}
</style>
