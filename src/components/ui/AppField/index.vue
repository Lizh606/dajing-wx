<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-field
    :autosize="autosize"
    :border="border"
    :clearable="clearable"
    :custom-style="fieldStyle"
    :disabled="disabled"
    :input-align="inputAlign"
    :label="label"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :readonly="readonly"
    :required="required"
    :type="type"
    :value="normalizedValue"
    @blur="handleBlur"
    @change="handleChange"
    @confirm="handleConfirm"
    @focus="handleFocus"
    @input="handleInput"
  />
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view class="app-field" :style="fieldStyle">
    <text v-if="label" class="app-field__label">{{ label }}</text>
    <textarea
      v-if="type === 'textarea'"
      class="app-field__control app-field__control--textarea"
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :readonly="readonly"
      :value="normalizedValue"
      @blur="handleBlur"
      @confirm="handleConfirm"
      @focus="handleFocus"
      @input="handleInput"
    />
    <input
      v-else
      class="app-field__control"
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :readonly="readonly"
      :type="type"
      :value="normalizedValue"
      @blur="handleBlur"
      @confirm="handleConfirm"
      @focus="handleFocus"
      @input="handleInput"
    />
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { extractEventValue, stringifyStyle, type StyleValue } from '../shared'

const props = withDefaults(defineProps<{
  autosize?: boolean | Record<string, any>
  border?: boolean
  clearable?: boolean
  customStyle?: StyleValue
  disabled?: boolean
  inputAlign?: 'left' | 'center' | 'right'
  label?: string
  maxlength?: number
  modelValue?: string | number
  placeholder?: string
  readonly?: boolean
  required?: boolean
  type?: 'text' | 'number' | 'digit' | 'textarea' | 'password'
}>(), {
  autosize: false,
  border: true,
  clearable: false,
  customStyle: '',
  disabled: false,
  inputAlign: 'left',
  label: '',
  maxlength: -1,
  modelValue: '',
  placeholder: '',
  readonly: false,
  required: false,
  type: 'text',
})

const emit = defineEmits<{
  (event: 'blur', value: any): void
  (event: 'change', value: string): void
  (event: 'confirm', value: any): void
  (event: 'focus', value: any): void
  (event: 'input', value: string): void
  (event: 'update:modelValue', value: string): void
}>()

const normalizedValue = computed(() => `${props.modelValue ?? ''}`)
const fieldStyle = computed(() => stringifyStyle(props.customStyle))

function syncModelValue(event: any) {
  const value = `${extractEventValue<string>(event) ?? ''}`
  emit('update:modelValue', value)
  return value
}

function handleInput(event: any) {
  const value = syncModelValue(event)
  emit('input', value)
}

function handleChange(event: any) {
  const value = syncModelValue(event)
  emit('change', value)
}

function handleFocus(event: any) {
  emit('focus', event)
}

function handleBlur(event: any) {
  emit('blur', event)
}

function handleConfirm(event: any) {
  emit('confirm', event)
}
</script>

<style scoped lang="scss">
.app-field {
  width: 100%;
  border: 1rpx solid $border-base;
  border-radius: $radius;
  background: $bg-page;
  overflow: hidden;
}

.app-field__label {
  display: block;
  padding: 20rpx 24rpx 0;
  color: $text-secondary;
  font-size: $font-base;
}

.app-field__control {
  width: 100%;
  min-height: $input-height;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  color: $text-primary;
  font-size: $font-md;
  background: transparent;
}

.app-field__control--textarea {
  min-height: 160rpx;
}
</style>
