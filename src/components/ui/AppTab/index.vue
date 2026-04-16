<template>
  <view v-if="active" class="app-tab">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, watch } from 'vue'
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

watch(
  () => [props.disabled, resolvedName.value, props.title],
  () => {
    tabsContext?.upsertTab({
      disabled: props.disabled,
      name: resolvedName.value,
      title: props.title,
      uid,
    })
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  tabsContext?.removeTab(uid)
})
</script>

<style scoped lang="scss">
.app-tab {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
