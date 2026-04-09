<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-picker
    :columns="columns"
    :default-index="defaultIndex"
    :loading="loading"
    :show-toolbar="showToolbar"
    :title="title"
    :value-key="valueKey"
    @cancel="emit('cancel')"
    @change="emit('change', $event)"
    @confirm="emit('confirm', $event)"
  />
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view class="app-picker">
    <view v-if="showToolbar" class="app-picker__toolbar">
      <text class="app-picker__action" @tap="emit('cancel')">{{ cancelButtonText }}</text>
      <text class="app-picker__title">{{ title }}</text>
      <text class="app-picker__action app-picker__action--confirm" @tap="handleConfirm">{{ confirmButtonText }}</text>
    </view>
    <view class="app-picker__options">
      <view
        v-for="(option, index) in normalizedOptions"
        :key="`${resolveOptionText(option)}-${index}`"
        class="app-picker__option"
        :class="{ 'app-picker__option--active': index === selectedIndex }"
        @tap="handleSelect(index)"
      >
        {{ resolveOptionText(option) }}
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  cancelButtonText?: string
  columns?: any[]
  confirmButtonText?: string
  defaultIndex?: number
  loading?: boolean
  showToolbar?: boolean
  title?: string
  valueKey?: string
}>(), {
  cancelButtonText: '取消',
  columns: () => [],
  confirmButtonText: '确认',
  defaultIndex: 0,
  loading: false,
  showToolbar: true,
  title: '',
  valueKey: 'text',
})

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'change', value: { index: number; value: any }): void
  (event: 'confirm', value: { index: number; value: any }): void
}>()

const selectedIndex = ref(props.defaultIndex)

const normalizedOptions = computed(() => {
  if (!props.columns.length) {
    return []
  }

  const firstColumn = props.columns[0]
  return Array.isArray(firstColumn?.values) ? firstColumn.values : props.columns
})

watch(() => props.defaultIndex, (value) => {
  selectedIndex.value = value
})

function resolveOptionText(option: any) {
  if (option && typeof option === 'object') {
    return option[props.valueKey] ?? option.text ?? ''
  }

  return option ?? ''
}

function handleSelect(index: number) {
  selectedIndex.value = index
  emit('change', { index, value: normalizedOptions.value[index] })
}

function handleConfirm() {
  emit('confirm', { index: selectedIndex.value, value: normalizedOptions.value[selectedIndex.value] })
}
</script>

<style scoped lang="scss">
.app-picker {
  background: $bg-card;
}

.app-picker__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
}

.app-picker__title {
  color: $text-primary;
  font-size: $font-md;
  font-weight: 600;
}

.app-picker__action {
  color: $text-muted;
  font-size: $font-base;
}

.app-picker__action--confirm {
  color: $primary;
}

.app-picker__option {
  padding: 24rpx 32rpx;
  text-align: center;
}

.app-picker__option--active {
  color: $primary;
  font-weight: 600;
}
</style>
