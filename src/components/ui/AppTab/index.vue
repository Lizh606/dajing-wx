<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-tab :disabled="disabled" :name="resolvedName" :title="title">
    <slot />
  </van-tab>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view v-show="active" class="app-tab">
    <slot />
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, watchEffect } from 'vue'
import { APP_TABS_CONTEXT } from '../shared'

const props = withDefaults(defineProps<{
  disabled?: boolean
  name?: string | number
  title: string
}>(), {
  disabled: false,
  name: undefined,
})

const uid = getCurrentInstance()?.uid ?? Date.now()
const tabsContext = inject(APP_TABS_CONTEXT, null)
const resolvedName = computed(() => props.name ?? uid)
const active = computed(() => tabsContext?.isActive(resolvedName.value) ?? true)

watchEffect(() => {
  tabsContext?.upsertTab({
    disabled: props.disabled,
    name: resolvedName.value,
    title: props.title,
    uid,
  })
})

onBeforeUnmount(() => {
  tabsContext?.removeTab(uid)
})
</script>
