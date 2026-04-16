<template>
  <view class="page-profile-list">
    <scroll-view class="page-profile-list__scroll" scroll-y>
      <view class="editor-card">
        <text class="editor-card__title">新增开票资料</text>
        <AppField v-model="draft.title" :custom-style="fieldStyle" label="抬头" placeholder="请输入发票抬头" />
        <AppField v-model="draft.taxNo" :custom-style="fieldStyle" label="税号" placeholder="请输入税号" />

        <view class="chips">
          <text
            v-for="item in typeOptions"
            :key="item"
            :class="['chip', draft.invoiceType === item ? 'chip--active' : '']"
            @tap="draft.invoiceType = item"
          >{{ item }}</text>
        </view>

        <AppButton block custom-style="margin-top: 12rpx; min-height: 80rpx;" text="保存开票资料" type="info" @click="save" />
      </view>

      <view class="list-card">
        <text class="list-card__title">开票资料列表</text>
        <view v-for="item in list" :key="item.id" class="row">
          <view class="row__main">
            <text class="row__title">{{ item.title }}</text>
            <text class="row__meta">{{ item.taxNo }} · {{ item.invoiceType }}</text>
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
import type { InvoiceInfo } from '@/types/business'

const fieldStyle = 'margin-bottom: 8rpx; border-radius: 14rpx;'
const typeOptions: Array<InvoiceInfo['invoiceType']> = ['增值税专票', '增值税普票']
const list = ref<InvoiceInfo[]>([])

const draft = reactive({
  title: '',
  taxNo: '',
  invoiceType: '增值税专票' as InvoiceInfo['invoiceType'],
})

onLoad(() => {
  load()
})

async function load() {
  list.value = await profileService.getInvoices()
}

async function save() {
  if (!draft.title.trim() || !draft.taxNo.trim()) {
    showFailToast('请填写完整开票资料')
    return
  }

  await profileService.saveInvoice({ ...draft })
  draft.title = ''
  draft.taxNo = ''
  draft.invoiceType = '增值税专票'
  showSuccessToast('开票资料已保存')
  await load()
}

async function remove(id: string) {
  await profileService.deleteInvoice(id)
  showSuccessToast('开票资料已删除')
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

.chips {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.chip {
  padding: 10rpx 18rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22rpx;
}

.chip--active {
  background: #2563eb;
  color: #fff;
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
