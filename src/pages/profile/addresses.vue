<template>
  <view class="page-profile-list">
    <scroll-view class="page-profile-list__scroll" scroll-y>
      <view class="editor-card">
        <text class="editor-card__title">新增收样地址</text>
        <AppField v-model="draft.contact" :custom-style="fieldStyle" label="联系人" placeholder="请输入联系人" />
        <AppField v-model="draft.mobile" :custom-style="fieldStyle" label="联系电话" placeholder="请输入联系电话" type="number" />
        <AppField v-model="draft.tag" :custom-style="fieldStyle" label="地址标签" placeholder="如：默认/实验室" />
        <AppField
          v-model="draft.address"
          :autosize="{ minHeight: 90 }"
          :custom-style="textareaStyle"
          label="详细地址"
          placeholder="请输入收样地址"
          type="textarea"
        />
        <AppButton block custom-style="margin-top: 12rpx; min-height: 80rpx;" text="保存地址" type="info" @click="save" />
      </view>

      <view class="list-card">
        <text class="list-card__title">收样地址列表</text>
        <view v-for="item in list" :key="item.id" class="row">
          <view class="row__main">
            <text class="row__title">{{ item.tag }} · {{ item.contact }}</text>
            <text class="row__meta">{{ item.mobile }}</text>
            <text class="row__meta">{{ item.address }}</text>
          </view>
          <AppButton plain size="small" text="删除" type="danger" @click="remove(item.id)" />
        </view>
      </view>
    </scroll-view>
    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { profileService } from '@/services/api'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { SampleAddress } from '@/types/business'

const fieldStyle = 'margin-bottom: 8rpx; border-radius: 14rpx;'
const textareaStyle = `${fieldStyle} min-height: 100rpx;`
const list = ref<SampleAddress[]>([])
const draft = reactive({ contact: '', mobile: '', tag: '默认', address: '' })

onLoad(() => {
  load()
})

async function load() {
  list.value = await profileService.getSampleAddresses()
}

async function save() {
  if (!draft.contact.trim() || !draft.mobile.trim() || !draft.address.trim()) {
    showFailToast('请填写完整地址信息')
    return
  }

  await profileService.saveSampleAddress({ ...draft })
  draft.contact = ''
  draft.mobile = ''
  draft.tag = '默认'
  draft.address = ''
  showSuccessToast('收样地址已保存')
  await load()
}

async function remove(id: string) {
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

.row__title {
  display: block;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 600;
}

.row__meta {
  display: block;
  color: #64748b;
  font-size: 22rpx;
  margin-top: 4rpx;
}
</style>
