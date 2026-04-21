<template>
  <view class="app-tabs">
    <view :class="navClassNames">
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
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { APP_TABS_CONTEXT, type AppTabMeta } from '../shared'

const props = withDefaults(defineProps<{
  border?: boolean
  color?: string
  layout?: 'auto' | 'fill' | 'scroll' | 'wrap'
  modelValue?: string | number
  sticky?: boolean
  swipeThreshold?: number
  tone?: '' | 'brand' | 'neutral' | 'success' | 'warning' | 'danger'
  titleActiveColor?: string
  titleInactiveColor?: string
  type?: 'line' | 'card'
  variant?: '' | 'line' | 'chip'
}>(), {
  border: true,
  color: '',
  layout: 'auto',
  modelValue: undefined,
  sticky: false,
  swipeThreshold: 5,
  tone: '',
  titleActiveColor: '',
  titleInactiveColor: '',
  type: 'line',
  variant: '',
})

const emit = defineEmits<{
  (event: 'change', value: { index: number; name: string | number; title: string }): void
  (event: 'click', value: { index: number; name: string | number; title: string }): void
  (event: 'update:modelValue', value: string | number): void
}>()

const tabs = ref<AppTabMeta[]>([])

const navClassNames = computed(() => [
  'app-tabs__nav',
  `app-tabs__nav--variant-${resolvedVariant.value}`,
  `app-tabs__nav--tone-${resolvedTone.value}`,
  `app-tabs__nav--${resolvedLayout.value}`,
])

const resolvedTone = computed(() => props.tone || 'brand')
const resolvedVariant = computed(() => props.variant || (props.type === 'card' ? 'chip' : 'line'))

const activeName = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '') {
    return props.modelValue
  }

  return tabs.value[0]?.name ?? 0
})

const resolvedLayout = computed(() => {
  if (props.layout !== 'auto') {
    return props.layout
  }

  return tabs.value.length <= 4 ? 'fill' : 'wrap'
})

function upsertTab(tab: AppTabMeta) {
  const currentIndex = tabs.value.findIndex((item) => item.uid === tab.uid)

  if (currentIndex === -1) {
    tabs.value = [...tabs.value, tab].sort((left, right) => left.uid - right.uid)
    return
  }

  const currentTab = tabs.value[currentIndex]

  if (
    currentTab.disabled === tab.disabled
    && currentTab.name === tab.name
    && currentTab.title === tab.title
  ) {
    return
  }

  const nextTabs = [...tabs.value]
  nextTabs[currentIndex] = tab
  tabs.value = nextTabs.sort((left, right) => left.uid - right.uid)
}

function removeTab(uid: number) {
  const nextTabs = tabs.value.filter((item) => item.uid !== uid)

  if (nextTabs.length === tabs.value.length) {
    return
  }

  tabs.value = nextTabs
}

function isActive(name: string | number) {
  return activeName.value === name
}

provide(APP_TABS_CONTEXT, {
  isActive,
  removeTab,
  upsertTab,
})

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
.app-tabs {
  min-width: 0;
}

.app-tabs__nav {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-bottom: 14rpx;
  border-bottom: 1rpx solid $slate-200;
}

.app-tabs__nav--scroll {
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.app-tabs__nav--fill {
  overflow: visible;
}

.app-tabs__nav--wrap {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  overflow: visible;
  white-space: normal;
  column-gap: 12rpx;
  row-gap: 12rpx;
}

.app-tabs__nav-item {
  flex-shrink: 0;
  position: relative;
  padding: 8rpx 0 14rpx;
  border-radius: 0;
  color: $slate-500;
  font-size: $font-md;
  background: transparent;
  white-space: nowrap;
  text-align: center;
}

.app-tabs__nav--fill .app-tabs__nav-item {
  flex: 1 1 0;
  min-width: 0;
}

.app-tabs__nav--wrap .app-tabs__nav-item {
  min-width: 0;
  width: 100%;
  padding-left: 8rpx;
  padding-right: 8rpx;
  white-space: normal;
}

.app-tabs__nav-item--active {
  color: $slate-900;
  font-weight: 600;
}

.app-tabs__nav--variant-line .app-tabs__nav-item--active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -15rpx;
  width: 34rpx;
  height: 6rpx;
  border-radius: 999rpx;
  transform: translateX(-50%);
  background: $primary;
}

.app-tabs__nav--tone-success.app-tabs__nav--variant-line .app-tabs__nav-item--active::after {
  background: $accent-green;
}

.app-tabs__nav--tone-warning.app-tabs__nav--variant-line .app-tabs__nav-item--active::after {
  background: $accent-orange;
}

.app-tabs__nav--tone-danger.app-tabs__nav--variant-line .app-tabs__nav-item--active::after {
  background: $danger-strong;
}

.app-tabs__nav--variant-chip {
  gap: 12rpx;
  border-bottom: none;
  padding-bottom: 0;
}

.app-tabs__nav--variant-chip .app-tabs__nav-item {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  color: $slate-700;
  font-size: $font-base;
  background: $slate-100;
}

.app-tabs__nav--variant-chip .app-tabs__nav-item--active {
  color: $primary-dark;
  background: $brand-50;
}

.app-tabs__nav-item--disabled {
  opacity: 0.5;
}

.app-tabs__nav-text {
  @include text-ellipsis(1);
}
</style>
