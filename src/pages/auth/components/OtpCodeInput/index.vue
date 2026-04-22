<template>
  <view class="otp-code-input" @tap="focusInput">
    <input
      class="otp-code-input__native"
      :focus="focus"
      inputmode="numeric"
      maxlength="6"
      :value="modelValue"
      :disabled="disabled"
      type="number"
      @blur="focus = false"
      @focus="focus = true"
      @input="handleInput"
    />

    <view class="otp-code-input__slots">
      <view
        v-for="(digit, index) in digitsList"
        :key="index"
        class="otp-code-input__slot"
        :class="{
          'otp-code-input__slot--active': index === activeIndex,
          'otp-code-input__slot--filled': Boolean(digit),
        }"
      >
        <text class="otp-code-input__digit">{{ digit }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  disabled?: boolean
  modelValue?: string
}>(), {
  disabled: false,
  modelValue: '',
})

const emit = defineEmits<{
  (event: 'complete', value: string): void
  (event: 'update:modelValue', value: string): void
}>()

const focus = ref(true)

const normalizedValue = computed(() => `${props.modelValue ?? ''}`.replace(/\D+/g, '').slice(0, 6))

const digitsList = computed(() => {
  const source = normalizedValue.value
  return Array.from({ length: 6 }, (_, index) => source[index] ?? '')
})

const activeIndex = computed(() => {
  const length = normalizedValue.value.length
  return length >= 6 ? 5 : length
})

function focusInput() {
  if (!props.disabled) {
    focus.value = true
  }
}

function handleInput(event: any) {
  const value = `${event?.detail?.value ?? ''}`.replace(/\D+/g, '').slice(0, 6)
  emit('update:modelValue', value)

  if (value.length === 6) {
    emit('complete', value)
  }
}
</script>

<style scoped lang="scss">
.otp-code-input {
  position: relative;
}

.otp-code-input__native {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.otp-code-input__slots {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14rpx;
}

.otp-code-input__slot {
  height: 76rpx;
  border-bottom: 2rpx solid $slate-300;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.18s ease;
}

.otp-code-input__slot--active {
  border-bottom-color: $primary;
}

.otp-code-input__slot--filled {
  border-bottom-color: #93c5fd;
}

.otp-code-input__digit {
  color: $slate-900;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

@media (prefers-reduced-motion: reduce) {
  .otp-code-input__slot {
    transition: none;
  }
}
</style>
