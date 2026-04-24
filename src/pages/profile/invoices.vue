<template>
  <view class="page-profile-list">
    <scroll-view class="page-profile-list__scroll" scroll-y>
      <view class="editor-card">
        <text class="editor-card__title">{{ draft.id ? '编辑开票资料' : '新增开票资料' }}</text>
        <AppField v-model="draft.title" :custom-style="fieldStyle" label="抬头" placeholder="请输入发票抬头" />

        <view class="chips">
          <text
            v-for="item in typeOptions"
            :key="item"
            :class="['chip', draft.invoiceType === item ? 'chip--active' : '']"
            @tap="draft.invoiceType = item"
          >{{ item }}</text>
        </view>

        <AppField
          v-if="isSpecialInvoice"
          v-model="draft.taxNo"
          :custom-style="fieldStyle"
          label="税号"
          placeholder="请输入税号"
        />
        <AppField
          v-if="isSpecialInvoice"
          v-model="draft.bankName"
          :custom-style="fieldStyle"
          label="开户行"
          placeholder="请输入开户行"
        />
        <AppField
          v-if="isSpecialInvoice"
          v-model="draft.bankAccount"
          :custom-style="fieldStyle"
          label="开户账号"
          placeholder="请输入开户账号"
        />
        <AppField
          v-if="isSpecialInvoice"
          v-model="draft.registerAddress"
          :autosize="{ minHeight: 84 }"
          :custom-style="textareaStyle"
          label="注册地址"
          placeholder="请输入注册地址"
          type="textarea"
        />
        <AppField
          v-if="isSpecialInvoice"
          v-model="draft.registerPhone"
          :custom-style="fieldStyle"
          label="注册电话"
          placeholder="请输入注册电话"
        />

        <view class="default-switch" @tap="draft.isDefault = !draft.isDefault">
          <text class="default-switch__label">设为默认开票资料</text>
          <AppSwitch :model-value="draft.isDefault" />
        </view>

        <view class="editor-actions">
          <AppButton
            block
            custom-style="min-height: 80rpx;"
            :text="draft.id ? '保存修改' : '保存开票资料'"
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
        <text class="list-card__title">开票资料列表</text>
        <view v-for="item in list" :key="item.id" class="row">
          <view class="row__main">
            <view class="row__title-line">
              <text class="row__title">{{ item.title }}</text>
              <text v-if="item.isDefault" class="row__default">默认</text>
            </view>
            <text class="row__meta">{{ item.invoiceType }} {{ item.taxNo ? `· ${item.taxNo}` : '' }}</text>
            <text v-if="item.invoiceType === '增值税专票'" class="row__meta">{{ item.bankName || '-' }} · {{ item.bankAccount || '-' }}</text>
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
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppSwitch from '@/components/ui/AppSwitch/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { profileService } from '@/services/api'
import { showFailToast, showSuccessToast } from '@/services/ui/toast'
import type { InvoiceInfo } from '@/types/business'

const fieldStyle = 'margin-bottom: 8rpx; border-radius: 14rpx;'
const textareaStyle = `${fieldStyle} min-height: 100rpx;`
const typeOptions: Array<InvoiceInfo['invoiceType']> = ['增值税普票', '增值税专票']
const list = ref<InvoiceInfo[]>([])

const draft = reactive({
  bankAccount: '',
  bankName: '',
  id: '' as string | number,
  invoiceType: '增值税普票' as InvoiceInfo['invoiceType'],
  isDefault: false,
  registerAddress: '',
  registerPhone: '',
  taxNo: '',
  title: '',
})

const isSpecialInvoice = computed(() => draft.invoiceType === '增值税专票')

onShow(() => {
  void load()
})

function resetDraft() {
  draft.bankAccount = ''
  draft.bankName = ''
  draft.id = ''
  draft.invoiceType = '增值税普票'
  draft.isDefault = false
  draft.registerAddress = ''
  draft.registerPhone = ''
  draft.taxNo = ''
  draft.title = ''
}

async function load() {
  list.value = await profileService.getInvoices()
}

function validateDraft() {
  if (!draft.title.trim()) {
    showFailToast('请填写发票抬头')
    return false
  }

  if (isSpecialInvoice.value) {
    if (!draft.taxNo.trim()) {
      showFailToast('增值税专票请填写税号')
      return false
    }

    if (!draft.bankName.trim() || !draft.bankAccount.trim()) {
      showFailToast('增值税专票请填写开户行与账号')
      return false
    }

    if (!draft.registerAddress.trim() || !draft.registerPhone.trim()) {
      showFailToast('增值税专票请填写注册地址与注册电话')
      return false
    }
  }

  return true
}

async function save() {
  if (!validateDraft()) {
    return
  }

  await profileService.saveInvoice({
    bankAccount: draft.bankAccount.trim() || undefined,
    bankName: draft.bankName.trim() || undefined,
    id: draft.id || undefined,
    invoiceType: draft.invoiceType,
    isDefault: draft.isDefault,
    registerAddress: draft.registerAddress.trim() || undefined,
    registerPhone: draft.registerPhone.trim() || undefined,
    taxNo: draft.taxNo.trim() || undefined,
    title: draft.title.trim(),
  })

  showSuccessToast(draft.id ? '开票资料已更新' : '开票资料已保存')
  resetDraft()
  await load()
}

function startEdit(item: InvoiceInfo) {
  draft.bankAccount = item.bankAccount || ''
  draft.bankName = item.bankName || ''
  draft.id = item.id
  draft.invoiceType = item.invoiceType
  draft.isDefault = item.isDefault === true
  draft.registerAddress = item.registerAddress || ''
  draft.registerPhone = item.registerPhone || ''
  draft.taxNo = item.taxNo || ''
  draft.title = item.title || ''
}

async function setDefault(id: string | number) {
  await profileService.setDefaultInvoice(id)
  showSuccessToast('已设为默认开票资料')
  await load()
}

async function remove(id: string | number) {
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
  margin-bottom: 8rpx;
}

.chip {
  padding: 10rpx 18rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22rpx;
}

.chip--active {
  background: #1E61FF;
  color: #fff;
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
