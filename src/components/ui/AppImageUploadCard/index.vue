<template>
  <view
    class="app-image-upload-card"
    :class="{
      'app-image-upload-card--busy': loading,
      'app-image-upload-card--disabled': disabled,
    }"
    @tap="handleTap"
  >
    <text v-if="label" class="app-image-upload-card__label">{{ label }}</text>

    <view class="app-image-upload-card__preview">
      <image
        v-if="imageSrc && !imageLoadError"
        :src="imageSrc"
        class="app-image-upload-card__image"
        mode="aspectFill"
        @error="emit('image-error')"
      />
      <view v-else class="app-image-upload-card__placeholder">{{ placeholderText }}</view>
      <view class="app-image-upload-card__action">{{ loading ? loadingText : actionText }}</view>
    </view>

    <text v-if="errorText" class="app-image-upload-card__error">{{ errorText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  actionText?: string
  disabled?: boolean
  errorText?: string
  imageLoadError?: boolean
  imageSrc?: string
  label?: string
  loading?: boolean
  loadingText?: string
  placeholder?: string
  placeholderOnError?: string
}>(), {
  actionText: '点击上传',
  disabled: false,
  errorText: '',
  imageLoadError: false,
  imageSrc: '',
  label: '',
  loading: false,
  loadingText: '上传中...',
  placeholder: '点击上传',
  placeholderOnError: '图片加载失败',
})

const emit = defineEmits<{
  (event: 'tap'): void
  (event: 'image-error'): void
}>()

const placeholderText = computed(() => {
  if (props.imageSrc && props.imageLoadError) {
    return props.placeholderOnError
  }

  return props.placeholder
})

function handleTap() {
  if (props.disabled) {
    return
  }

  emit('tap')
}
</script>

<style scoped lang="scss">
.app-image-upload-card {
  border-radius: 20rpx;
  border: 1rpx solid #dbe7ff;
  background: #f8fbff;
  padding: 18rpx;
  min-height: 248rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  transition: transform 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
}

.app-image-upload-card:active {
  transform: scale(0.985);
}

.app-image-upload-card--busy {
  opacity: 0.82;
  border-color: #60a5fa;
}

.app-image-upload-card--disabled {
  opacity: 0.52;
}

.app-image-upload-card__label {
  color: #1f2937;
  font-size: 24rpx;
  font-weight: 600;
}

.app-image-upload-card__preview {
  width: 100%;
  height: 172rpx;
  border-radius: 16rpx;
  border: 1rpx dashed #bfdbfe;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.app-image-upload-card__image {
  width: 100%;
  height: 100%;
}

.app-image-upload-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 22rpx;
}

.app-image-upload-card__action {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 44rpx;
  padding: 4rpx 12rpx;
  background: rgba(17, 24, 39, 0.55);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 1.5;
  text-align: center;
  font-weight: 600;
}

.app-image-upload-card__error {
  color: #dc2626;
  font-size: 22rpx;
}

@media (prefers-reduced-motion: reduce) {
  .app-image-upload-card {
    transition: none;
  }
}
</style>
