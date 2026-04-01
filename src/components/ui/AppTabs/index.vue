<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-tabs
    :active="modelValue"
    :border="border"
    :color="color"
    :sticky="sticky"
    :swipe-threshold="swipeThreshold"
    :title-active-color="titleActiveColor"
    :title-inactive-color="titleInactiveColor"
    :type="type"
    @change="handleVanChange"
    @click="handleVanClick"
  >
    <slot />
  </van-tabs>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view class="app-tabs">
    <view class="app-tabs__nav">
      <view
        v-for="tab in tabs"
        :key="tab.uid"
        class="app-tabs__nav-item"
        :class="{
          'app-tabs__nav-item--active': isActive(tab.name),
          'app-tabs__nav-item--disabled': tab.disabled,
        }"
        @tap="handleFallbackClick(tab)"
      >
        <text class="app-tabs__nav-text">{{ tab.title }}</text>
      </view>
    </view>
    <view class="app-tabs__content">
      <slot />
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { APP_TABS_CONTEXT, extractEventDetail, type AppTabMeta } from '../shared'

const props = withDefaults(defineProps<{
  border?: boolean
  color?: string
  modelValue?: string | number
  sticky?: boolean
  swipeThreshold?: number
  titleActiveColor?: string
  titleInactiveColor?: string
  type?: 'line' | 'card'
}>(), {
  border: true,
  color: '',
  modelValue: undefined,
  sticky: false,
  swipeThreshold: 5,
  titleActiveColor: '',
  titleInactiveColor: '',
  type: 'line',
})

const emit = defineEmits<{
  (event: 'change', value: { index: number; name: string | number; title: string }): void
  (event: 'click', value: { index: number; name: string | number; title: string }): void
  (event: 'update:modelValue', value: string | number): void
}>()

const tabs = ref<AppTabMeta[]>([])

const activeName = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '') {
    return props.modelValue
  }

  return tabs.value[0]?.name ?? 0
})

function upsertTab(tab: AppTabMeta) {
  const nextTabs = tabs.value.filter((item) => item.uid !== tab.uid)
  nextTabs.push(tab)
  tabs.value = nextTabs.sort((left, right) => left.uid - right.uid)
}

function removeTab(uid: number) {
  tabs.value = tabs.value.filter((item) => item.uid !== uid)
}

function isActive(name: string | number) {
  return activeName.value === name
}

provide(APP_TABS_CONTEXT, {
  isActive,
  removeTab,
  upsertTab,
})

function handleVanChange(event: any) {
  const detail = extractEventDetail<{ index: number; name: string | number; title: string }>(event)
  emit('update:modelValue', detail.name ?? detail.index)
  emit('change', detail)
}

function handleVanClick(event: any) {
  const detail = extractEventDetail<{ index: number; name: string | number; title: string }>(event)
  emit('click', detail)
}

function handleFallbackClick(tab: AppTabMeta) {
  if (tab.disabled) {
    return
  }

  const detail = {
    index: tabs.value.findIndex((item) => item.uid === tab.uid),
    name: tab.name,
    title: tab.title,
  }

  emit('update:modelValue', tab.name)
  emit('change', detail)
  emit('click', detail)
}
</script>

<style scoped lang="scss">
.app-tabs__nav {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-bottom: 20rpx;
}

.app-tabs__nav-item {
  padding: 12rpx 28rpx;
  border-radius: 12rpx;
  color: $text-secondary;
  background: $slate-100;
  white-space: nowrap;
}

.app-tabs__nav-item--active {
  color: $text-inverse;
  background: $primary;
}

.app-tabs__nav-item--disabled {
  opacity: 0.5;
}
</style>
