<template>
  <view class="page-coming-soon">
    <view class="page-coming-soon__card">
      <view class="page-coming-soon__icon-wrap">
        <AppIcon class="page-coming-soon__icon" color="#1E61FF" name="service" size="28" />
      </view>
      <text class="page-coming-soon__title">{{ pageTitle }}</text>
      <text class="page-coming-soon__desc">
        {{ description }}
      </text>
      <view class="page-coming-soon__actions">
        <view class="page-coming-soon__btn page-coming-soon__btn--secondary tap-feedback" @tap="goBack">
          返回上一页
        </view>
        <view class="page-coming-soon__btn tap-feedback" @tap="goMine">
          回到我的
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'

const pageTitle = ref('功能详情')
const description = ref('该功能暂未开放，请先使用已上线能力。')

onLoad((query) => {
  const titleText = decodeURIComponentSafe(query?.title)
  if (titleText) {
    pageTitle.value = titleText
    description.value = `${titleText}暂未开放，后续可在这里直接使用。`
  }
})

function decodeURIComponentSafe(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  try {
    return decodeURIComponent(value).trim()
  } catch {
    return value.trim()
  }
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  goMine()
}

function goMine() {
  uni.switchTab({ url: '/pages/mine/index' })
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-coming-soon {
  min-height: 100vh;
  padding: 36rpx 24rpx;
  background: linear-gradient(180deg, #f1f6ff 0%, #f9fafb 58%, #f9fafb 100%);
}

.page-coming-soon__card {
  border-radius: 24rpx;
  border: 1rpx solid #dfe8f7;
  background: #ffffff;
  padding: 44rpx 28rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.page-coming-soon__icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: #eef4ff;
  border: 1rpx solid #d4e3fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-coming-soon__icon {
  display: inline-flex;
}

.page-coming-soon__title {
  margin-top: 20rpx;
  color: $text-primary;
  font-size: 34rpx;
  font-weight: 700;
}

.page-coming-soon__desc {
  margin-top: 12rpx;
  color: $text-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.page-coming-soon__actions {
  margin-top: 28rpx;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.page-coming-soon__btn {
  min-height: 76rpx;
  border-radius: 16rpx;
  border: 1rpx solid #1e61ff;
  background: #1e61ff;
  color: #ffffff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-coming-soon__btn--secondary {
  border-color: #d7e3f8;
  background: #ffffff;
  color: $text-secondary;
}
</style>
