<template>
  <view class="app-field-group">
    <text v-if="label" class="app-field__label">{{ label }}</text>

    <!-- #ifdef MP-WEIXIN -->
    <van-field
      :autosize="autosize"
      :border="border"
      :clearable="clearable"
      :custom-style="fieldStyle"
      :error-message="''"
      :disabled="disabled"
      :input-align="inputAlign"
      :label="''"
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
    <view class="app-field" :class="fieldClassNames" :style="fieldStyle">
      <textarea
        v-if="type === 'textarea'"
        class="app-field__control app-field__control--textarea"
        :disabled="disabled"
        :inputmode="inputMode"
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
        :inputmode="inputMode"
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

    <view v-if="error || hint" class="app-field__meta">
      <text v-if="error" class="app-field__error">{{ error }}</text>
      <text v-else class="app-field__hint">{{ hint }}</text>
    </view>
  </view>
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
  error?: string
  hint?: string
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email'
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
  error: '',
  hint: '',
  inputMode: 'text',
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
const fieldClassNames = computed(() => ({
  'app-field--disabled': props.disabled,
  'app-field--error': Boolean(props.error),
}))

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
.app-field-group {
  width: 100%;
}

.app-field {
  width: 100%;
  border: 1rpx solid $border-base;
  border-radius: $radius;
  background: $bg-card;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.app-field:focus-within {
  border-color: #93c5fd;
  box-shadow: 0 0 0 6rpx rgba(37, 99, 235, 0.06);
}

.app-field--disabled {
  opacity: 0.72;
}

.app-field--error {
  border-color: $auth-error;
  background: $bg-card;
  box-shadow: 0 0 0 6rpx rgba(220, 38, 38, 0.05);
}

.app-field--error:focus-within {
  border-color: $auth-error;
  box-shadow: 0 0 0 6rpx rgba(220, 38, 38, 0.08);
}

.app-field__label {
  display: block;
  margin-bottom: 8rpx;
  color: $slate-500;
  font-size: $font-sm;
  line-height: 1.35;
}

.app-field__control {
  width: 100%;
  min-height: 76rpx;
  padding: 12rpx 20rpx 14rpx;
  box-sizing: border-box;
  color: $text-primary;
  font-size: $font-md;
  background: transparent;
}

.app-field__control--textarea {
  min-height: 136rpx;
  padding-top: 14rpx;
}

.app-field__meta {
  padding: 0 20rpx 12rpx;
}

.app-field__hint,
.app-field__error {
  display: block;
  font-size: $font-xs;
  line-height: 1.45;
}

.app-field__hint {
  color: $text-muted;
}

.app-field__error {
  color: $auth-error;
}
</style>
