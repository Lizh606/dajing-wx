<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-icon
    v-if="showVanIcon"
    :color="color"
    :custom-style="mergedStyle"
    :name="resolvedVanIcon"
    :size="iconSize"
  />
  <!-- #endif -->

  <image
    v-if="!showVanIcon && src"
    class="app-icon__image"
    :mode="mode"
    :src="src"
    :style="mergedStyle"
  />
  <text v-if="!showVanIcon && !src" class="app-icon__text" :style="mergedStyle">{{ fallbackText }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { APP_ICON_FALLBACK_TEXT_MAP, APP_ICON_MAP } from './iconMap'
import { stringifyStyle, toUnit, type StyleValue } from '@/components/ui/shared'

const props = withDefaults(defineProps<{
  color?: string
  customStyle?: StyleValue
  legacyText?: string
  mode?: 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'scaleToFill'
  name: string
  size?: string | number
  src?: string
}>(), {
  color: '',
  customStyle: '',
  legacyText: '',
  mode: 'aspectFit',
  size: 16,
  src: '',
})

const resolvedVanIcon = computed(() => {
  if (props.src) {
    return ''
  }

  return APP_ICON_MAP[props.name] ?? ''
})

const showVanIcon = computed(() => !!resolvedVanIcon.value)
const fallbackText = computed(() => props.legacyText || APP_ICON_FALLBACK_TEXT_MAP[props.name] || props.name)
const iconSize = computed(() => toUnit(props.size) ?? '16px')

const mergedStyle = computed(() => {
  const baseStyle = stringifyStyle({
    color: props.color || undefined,
    fontSize: toUnit(props.size),
    height: toUnit(props.size),
    width: toUnit(props.size),
  })

  return [baseStyle, typeof props.customStyle === 'string' ? props.customStyle : stringifyStyle(props.customStyle)]
    .filter(Boolean)
    .join('; ')
})
</script>

<style scoped lang="scss">
.app-icon__image,
.app-icon__text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  line-height: 1;
}

.app-icon__image {
  flex-shrink: 0;
}
</style>
