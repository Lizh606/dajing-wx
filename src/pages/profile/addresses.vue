<template>
  <view class="page-profile-list">
    <scroll-view class="page-profile-list__scroll" scroll-y>
      <view class="editor-card">
        <text class="editor-card__title">{{ draft.id ? '编辑收样地址' : '新增收样地址' }}</text>
        <AppField v-model="draft.contact" :custom-style="fieldStyle" label="联系人" placeholder="请输入联系人" />
        <AppField v-model="draft.mobile" :custom-style="fieldStyle" label="联系电话" placeholder="请输入联系电话" type="number" />
        <AppField v-model="draft.region" :custom-style="fieldStyle" label="省市区" placeholder="如：湖南省株洲市天元区" />
        <AppField
          v-model="draft.detailAddress"
          :autosize="{ minHeight: 90 }"
          :custom-style="textareaStyle"
          label="详细地址"
          placeholder="请输入收样地址"
          type="textarea"
        />
        <view class="default-switch" @tap="draft.isDefault = !draft.isDefault">
          <text class="default-switch__label">设为默认收样地址</text>
          <AppSwitch :model-value="draft.isDefault" />
        </view>

        <view class="editor-actions">
          <AppButton
            block
            custom-style="min-height: 80rpx;"
            :text="draft.id ? '保存修改' : '保存地址'"
            type="info"
            @click="save"
          />
          <AppButton
            v-if="draft.id"
            block
            plain
            custom-style="min-height: 80rpx;"
            text="取消编辑"
            type="default"
            @click="resetDraft"
          />
        </view>
      </view>

      <view class="list-card">
        <text class="list-card__title">收样地址列表</text>
        <view v-for="item in list" :key="item.id" class="row">
          <view class="row__main">
            <view class="row__title-line">
              <text class="row__title">{{ item.contact }}</text>
              <text v-if="item.isDefault" class="row__default">默认</text>
            </view>
            <text class="row__meta">{{ item.mobile }}</text>
            <text class="row__meta">{{ item.region || '-' }}</text>
            <text class="row__meta">{{ item.detailAddress || item.address }}</text>
          </view>
          <view class="row__actions">
            <AppButton v-if="!item.isDefault" plain size="small" text="设默认" type="info" @click="setDefault(item.id)" />
            <AppButton plain size="small" text="编辑" type="default" @click="startEdit(item)" />
            <AppButton plain size="small" text="删除" type="danger" @click="remove(item.id)" />
          </view>
        </view>
      </view>
    </scroll-view>
    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { profileService } from '@/services/api'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { SampleAddress } from '@/types/business'

const fieldStyle = 'margin-bottom: 8rpx; border-radius: 14rpx;'
const textareaStyle = `${fieldStyle} min-height: 100rpx;`
const list = ref<SampleAddress[]>([])
const draft = reactive({
  contact: '',
  detailAddress: '',
  id: '' as string | number,
  isDefault: false,
  mobile: '',
  region: '',
})

onShow(() => {
  void load()
})

function resetDraft() {
  draft.contact = ''
  draft.detailAddress = ''
  draft.id = ''
  draft.isDefault = false
  draft.mobile = ''
  draft.region = ''
}

async function load() {
  list.value = await profileService.getSampleAddresses()
}

function validateDraft() {
  if (!draft.contact.trim() || !draft.mobile.trim() || !draft.detailAddress.trim()) {
    showFailToast('请填写完整地址信息')
    return false
  }

  return true
}

async function save() {
  if (!validateDraft()) {
    return
  }

  await profileService.saveSampleAddress({
    address: draft.detailAddress.trim(),
    contact: draft.contact.trim(),
    detailAddress: draft.detailAddress.trim(),
    id: draft.id || undefined,
    isDefault: draft.isDefault,
    mobile: draft.mobile.trim(),
    region: draft.region.trim() || undefined,
    tag: draft.isDefault ? '默认' : '常用',
  })

  showSuccessToast(draft.id ? '收样地址已更新' : '收样地址已保存')
  resetDraft()
  await load()
}

function startEdit(item: SampleAddress) {
  draft.contact = item.contact || ''
  draft.detailAddress = item.detailAddress || item.address || ''
  draft.id = item.id
  draft.isDefault = item.isDefault === true
  draft.mobile = item.mobile || ''
  draft.region = item.region || ''
}

async function setDefault(id: string | number) {
  await profileService.setDefaultSampleAddress(id)
  showSuccessToast('已设为默认收样地址')
  await load()
}

async function remove(id: string | number) {
  await profileService.deleteSampleAddress(id)
  showSuccessToast('收样地址已删除')
  await load()
}
</script>

<style scoped lang="scss">
.page-profile-list {
  min-height: 100vh;
  background: #f8fafc;
}

.page-profile-list__scroll {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.editor-card,
.list-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
  margin-bottom: 16rpx;
}

.editor-card__title,
.list-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 14rpx;
}

.default-switch {
  margin-top: 8rpx;
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.default-switch__label {
  color: #334155;
  font-size: 24rpx;
}

.editor-actions {
  display: grid;
  gap: 8rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: center;
  border-bottom: 1rpx solid #f1f5f9;
  padding: 12rpx 0;
}

.row:last-child {
  border-bottom: 0;
}

.row__main {
  min-width: 0;
  flex: 1;
}

.row__title-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.row__title {
  display: block;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 600;
}

.row__default {
  border-radius: 999rpx;
  background: #e0f2fe;
  color: #0369a1;
  padding: 2rpx 10rpx;
  font-size: 20rpx;
}

.row__meta {
  display: block;
  color: #64748b;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.row__actions {
  display: grid;
  gap: 8rpx;
}
</style>
