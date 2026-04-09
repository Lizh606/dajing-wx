<template>
  <view class="app-list">
    <slot />
    <view v-if="loading" class="app-list__status">加载中...</view>
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
</style>
