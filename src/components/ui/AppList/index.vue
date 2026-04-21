<template>
  <view class="app-list">
    <slot />
    <view v-if="loading" class="app-list__status app-list__status--loading">
      <slot name="skeleton">
        <view class="app-list__skeleton-row">
          <view class="app-skeleton app-skeleton--title app-list__skeleton-title" />
          <view class="app-skeleton app-skeleton--line app-list__skeleton-line" />
          <view class="app-skeleton app-skeleton--line app-list__skeleton-line app-list__skeleton-line--short" />
        </view>
      </slot>
    </view>
    <view v-else-if="finished" class="app-list__status">{{ finishedText }}</view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  finished?: boolean
  finishedText?: string
  immediateCheck?: boolean
  loading?: boolean
}>(), {
  finished: false,
  finishedText: '没有更多了',
  immediateCheck: false,
  loading: false,
})

const emit = defineEmits<{
  (event: 'load'): void
}>()

function maybeLoad() {
  if (props.immediateCheck && !props.loading && !props.finished) {
    emit('load')
  }
}

onMounted(maybeLoad)
watch(() => [props.finished, props.loading], maybeLoad)
</script>

<style scoped lang="scss">
.app-list__status {
  padding: 24rpx 0;
  text-align: center;
  color: $text-muted;
  font-size: $font-base;
}

.app-list__status--loading {
  text-align: left;
}

.app-list__skeleton-row {
  padding: 12rpx 6rpx 2rpx;
  display: grid;
  gap: 12rpx;
}

.app-list__skeleton-title {
  width: 58%;
}

.app-list__skeleton-line {
  width: 100%;
}

.app-list__skeleton-line--short {
  width: 42%;
}
</style>
