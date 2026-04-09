<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-cell-group :border="border">
    <slot />
  </van-cell-group>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view class="app-cell-group">
    <slot />
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  border?: boolean
}>(), {
  border: true,
})
</script>

<style scoped lang="scss">
.app-cell-group {
  display: flex;
  flex-direction: column;
}
</style>
