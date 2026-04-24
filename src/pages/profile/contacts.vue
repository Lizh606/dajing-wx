<template>
  <view class="page-profile-list">
    <scroll-view class="page-profile-list__scroll" scroll-y>
      <view class="editor-card">
        <text class="editor-card__title">新增联系人</text>
        <text v-if="!contactsApiReady" class="editor-card__tip">联系人接口暂未接入，当前默认空态展示</text>
        <AppField v-model="draft.name" :custom-style="fieldStyle" :disabled="!contactsApiReady" label="姓名" placeholder="请输入姓名" />
        <AppField
          v-model="draft.mobile"
          :custom-style="fieldStyle"
          :disabled="!contactsApiReady"
          label="手机号"
          placeholder="请输入手机号"
          type="number"
        />
        <AppField v-model="draft.role" :custom-style="fieldStyle" :disabled="!contactsApiReady" label="角色" placeholder="如：项目负责人" />
        <AppButton
          block
          custom-style="margin-top: 12rpx; min-height: 80rpx;"
          :disabled="!contactsApiReady"
          text="保存联系人"
          type="info"
          @click="save"
        />
      </view>

      <view class="list-card">
        <text class="list-card__title">联系人列表</text>
        <view v-if="list.length === 0" class="empty">
          <text class="empty__title">暂无联系人</text>
          <text class="empty__desc">联系人接口未接入时将默认展示空态</text>
        </view>
        <view v-for="item in list" :key="item.id" class="row">
          <view class="row__main">
            <text class="row__title">{{ item.name }} · {{ item.role }}</text>
            <text class="row__meta">{{ item.mobile }}</text>
          </view>
          <AppButton plain size="small" :disabled="!contactsApiReady" text="删除" type="danger" @click="remove(item.id)" />
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
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { profileService } from '@/services/api'
import { getErrorMessage } from '@/services/http'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { ContactInfo } from '@/types/business'

const fieldStyle = 'margin-bottom: 8rpx; border-radius: 14rpx;'
const contactsApiReady = profileService.CONTACTS_API_READY
const list = ref<ContactInfo[]>([])
const draft = reactive({ name: '', mobile: '', role: '' })

onShow(() => {
  load()
})

async function load() {
  try {
    list.value = await profileService.getContacts()
  } catch {
    list.value = []
  }
}

async function save() {
  if (!contactsApiReady) {
    showFailToast('联系人接口暂未接入，当前仅支持空态展示')
    return
  }

  if (!draft.name.trim() || !draft.mobile.trim() || !draft.role.trim()) {
    showFailToast('请填写完整联系人信息')
    return
  }

  try {
    await profileService.saveContact({ ...draft })
    draft.name = ''
    draft.mobile = ''
    draft.role = ''
    showSuccessToast('联系人已保存')
    await load()
  } catch (error) {
    showFailToast(getErrorMessage(error, '联系人保存失败，请稍后再试'))
  }
}

async function remove(id: string) {
  if (!contactsApiReady) {
    showFailToast('联系人接口暂未接入，当前仅支持空态展示')
    return
  }

  try {
    await profileService.deleteContact(id)
    showSuccessToast('联系人已删除')
    await load()
  } catch (error) {
    showFailToast(getErrorMessage(error, '联系人删除失败，请稍后再试'))
  }
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

.editor-card__tip {
  display: block;
  margin: 4rpx 0 14rpx;
  color: #64748b;
  font-size: 22rpx;
}

.empty {
  padding: 12rpx 0;
}

.empty__title {
  display: block;
  color: #0f172a;
  font-size: 26rpx;
  font-weight: 600;
}

.empty__desc {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
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
