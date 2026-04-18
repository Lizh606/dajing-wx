<template>
  <view class="page-demand-publish">
    <view class="page-demand-publish__scroll">
      <view class="page-demand-publish__content">
        <view class="page-demand-publish__tools">
          <AppButton
            custom-style="min-height: 64rpx; height: 64rpx; padding: 0 24rpx; border-radius: 18rpx; font-size: 24rpx; font-weight: 600;"
            plain
            text="暂存草稿"
            type="info"
            @click="saveDraft"
          />
        </view>

        <view class="page-demand-publish__section">
          <text class="page-demand-publish__section-title">需求表单</text>
          <AppForm>
            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">项目名称 <text class="page-demand-publish__required">*</text></text>
              <AppField v-model="form.projectName" :border="false" :custom-style="fieldStyle" placeholder="请输入项目名称" />
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">需求说明 <text class="page-demand-publish__required">*</text></text>
              <AppField
                v-model="form.requirement"
                :autosize="{ minHeight: 150 }"
                :border="false"
                :custom-style="textareaStyle"
                placeholder="请描述检测目标、范围、关键要求"
                type="textarea"
              />
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">金额上限（元） <text class="page-demand-publish__required">*</text></text>
              <AppField v-model="form.budgetMax" :border="false" :custom-style="fieldStyle" placeholder="请输入金额上限" type="number" />
            </view>

            <view class="page-demand-publish__field page-demand-publish__field-grid">
              <view>
                <text class="page-demand-publish__label">联系人 <text class="page-demand-publish__required">*</text></text>
                <AppField v-model="form.contactName" :border="false" :custom-style="fieldStyle" placeholder="请输入联系人" />
              </view>
              <view>
                <text class="page-demand-publish__label">联系方式 <text class="page-demand-publish__required">*</text></text>
                <AppField v-model="form.contactPhone" :border="false" :custom-style="fieldStyle" placeholder="请输入联系方式" />
              </view>
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">联系地址 <text class="page-demand-publish__required">*</text></text>
              <AppField
                v-model="form.contactAddress"
                :autosize="{ minHeight: 96 }"
                :border="false"
                :custom-style="textareaStyleCompact"
                placeholder="请输入联系地址"
                type="textarea"
              />
            </view>

            <view class="page-demand-publish__field">
              <text class="page-demand-publish__label">资质要求 <text class="page-demand-publish__optional">（可选）</text></text>
              <AppField v-model="form.qualification" :border="false" :custom-style="fieldStyle" placeholder="如：CMA / CNAS" />
            </view>

            <view class="page-demand-publish__field page-demand-publish__field-grid page-demand-publish__field--last">
              <view>
                <text class="page-demand-publish__label">期望完成时间 <text class="page-demand-publish__optional">（可选）</text></text>
                <AppField v-model="form.expectedTime" :border="false" :custom-style="fieldStyle" placeholder="如：2026-04-30 前" />
              </view>
              <view>
                <text class="page-demand-publish__label">是否加急 <text class="page-demand-publish__optional">（可选）</text></text>
                <view class="page-demand-publish__chips">
                  <text
                    v-for="item in urgentOptions"
                    :key="item"
                    :class="['page-demand-publish__chip', form.urgent === item ? 'page-demand-publish__chip--active' : '']"
                    @tap="form.urgent = item"
                  >{{ item }}</text>
                </view>
              </view>
            </view>
          </AppForm>
        </view>

        <view class="page-demand-publish__section">
          <text class="page-demand-publish__section-title">附件与备注</text>
          <view class="page-demand-publish__upload" @tap="showComingSoon">
            <AppIcon color="#2563eb" name="attachment" size="20" />
            <text class="page-demand-publish__upload-text">上传样品图片 / 图纸 / 技术文件</text>
          </view>
          <view class="page-demand-publish__field page-demand-publish__field--last">
            <text class="page-demand-publish__label">备注 <text class="page-demand-publish__optional">（可选）</text></text>
            <AppField
              v-model="form.remark"
              :autosize="{ minHeight: 100 }"
              :border="false"
              :custom-style="textareaStyleCompact"
              placeholder="如：样品检测完成后需寄回，并优先安排本周检测"
              type="textarea"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="page-demand-publish__actions">
      <AppButton
        block
        custom-style="min-height: 84rpx; height: 84rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
        plain
        text="取消"
        type="default"
        @click="goBack"
      />
      <AppButton
        block
        custom-style="min-height: 84rpx; height: 84rpx; border-radius: 20rpx; font-size: 26rpx; font-weight: 600;"
        text="提交"
        type="info"
        @click="submit"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppForm from '@/components/ui/AppForm/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import * as tradeDemandService from '@/services/api/tradeDemand'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 170rpx;`
const textareaStyleCompact = `${fieldStyle} min-height: 120rpx;`
const urgentOptions = ['普通', '加急']
const editingDemandId = ref('')

const form = reactive({
  projectName: '',
  requirement: '',
  budgetMax: '',
  contactName: '',
  contactPhone: '',
  contactAddress: '',
  qualification: '',
  expectedTime: '',
  urgent: '普通',
  remark: '',
})

function goBack() {
  uni.navigateBack()
}

function showComingSoon() {
  showAppToast({ message: '附件上传能力建设中', icon: 'none' })
}

function normalizeDateInput(value: string) {
  const text = value.trim()

  if (!text) {
    return undefined
  }

  const exactMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (exactMatch) {
    return exactMatch[0]
  }

  const looseMatch = text.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (!looseMatch) {
    return undefined
  }

  const [, year, month, day] = looseMatch
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function toNumber(value: string) {
  if (!value.trim()) {
    return undefined
  }

  const next = Number(value)
  return Number.isFinite(next) ? next : undefined
}

function toText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function resolveDemandIdFromResponse(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    return ''
  }

  const source = raw as Record<string, any>
  return toText(source.id || source.demandId || source.data?.id || source.data?.demandId || source.result?.id || source.result?.demandId)
}

function buildPublishPayload() {
  const title = form.projectName.trim()
  const requirement = form.requirement.trim()
  const qualification = form.qualification.trim()
  const contactAddress = form.contactAddress.trim()
  const contactName = form.contactName.trim()
  const contactPhone = form.contactPhone.trim()
  const expectedFinishDate = normalizeDateInput(form.expectedTime)
  const remark = form.remark.trim()
  const budgetAmount = toNumber(form.budgetMax)
  const additionalReqParts: string[] = []

  if (qualification) {
    additionalReqParts.push(`资质要求：${qualification}`)
  }

  if (form.urgent === '加急') {
    additionalReqParts.push('加急需求')
  }

  return {
    additionalReq: additionalReqParts.join('；') || undefined,
    budgetAmount,
    contactName: contactName || undefined,
    contactPhone: contactPhone || undefined,
    expectedFinishDate,
    region: contactAddress || undefined,
    remark: remark || undefined,
    sampleCount: 1,
    sampleDesc: requirement || undefined,
    sampleName: title || '未命名样品',
    testProject: requirement || undefined,
    title: title || '未命名需求',
  }
}

function fillFormFromDemand(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    return
  }

  const source = raw as Record<string, any>
  form.projectName = toText(source.title || source.projectName || source.demandTitle || source.sampleName)
  form.requirement = toText(source.sampleDesc || source.requirement || source.description || source.testProject)
  form.budgetMax = toText(source.budgetAmount || source.budget || source.budgetMax)
  form.contactName = toText(source.contactName || source.name)
  form.contactPhone = toText(source.contactPhone || source.phone || source.mobile)
  form.contactAddress = toText(source.contactAddress || source.address || source.region)
  form.expectedTime = toText(source.expectedFinishDate || source.expectedDate || source.deadline)
  form.remark = toText(source.remark || source.memo)
  const additionalReq = toText(source.additionalReq)
  form.qualification = additionalReq.replace(/加急需求/g, '').replace(/[；;]+/g, '').replace(/^资质要求[:：]?/, '').trim()
  form.urgent = additionalReq.includes('加急') ? '加急' : '普通'
}

onLoad(async (query) => {
  const id = typeof query?.id === 'string' ? query.id.trim() : ''
  if (!id) {
    return
  }

  editingDemandId.value = id

  try {
    const demandDetail = await tradeDemandService.getDemand(id)
    fillFormFromDemand(demandDetail)
  } catch {
    // 编辑草稿场景读取失败时保留空表单
  }
})

async function saveDraft() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  try {
    const payload = buildPublishPayload()
    const result = editingDemandId.value
      ? await tradeDemandService.updateDraft(editingDemandId.value, payload)
      : await tradeDemandService.saveDraft(payload)

    if (!editingDemandId.value) {
      const nextId = resolveDemandIdFromResponse(result)
      if (nextId) {
        editingDemandId.value = nextId
      }
    }

    showSuccessToast('草稿已保存')
  } catch (error) {
    showFailToast(getErrorMessage(error, '草稿保存失败'))
  }
}

async function submit() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (
    !form.projectName.trim() ||
    !form.requirement.trim() ||
    !form.budgetMax.trim() ||
    !form.contactName.trim() ||
    !form.contactPhone.trim() ||
    !form.contactAddress.trim()
  ) {
    showFailToast('请先填写核心必填项')
    return
  }

  try {
    const payload = buildPublishPayload()

    if (editingDemandId.value) {
      await tradeDemandService.updateDraft(editingDemandId.value, payload)
      await tradeDemandService.publishDraft(editingDemandId.value)
    } else {
      await tradeDemandService.publishDemand(payload)
    }

    showSuccessToast('需求已提交，等待机构响应')
    setTimeout(() => uni.navigateBack(), 1200)
  } catch (error) {
    showFailToast(getErrorMessage(error, '需求提交失败'))
  }
}
</script>

<style scoped lang="scss">
.page-demand-publish {
  min-height: 100vh;
  background: #f8fafc;
}

.page-demand-publish__scroll {
  box-sizing: border-box;
}

.page-demand-publish__content {
  padding: 24rpx;
  padding-bottom: 24rpx;
  box-sizing: border-box;
}

.page-demand-publish__tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16rpx;
}

.page-demand-publish__section {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  border: 1rpx solid #f1f5f9;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-demand-publish__section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-demand-publish__field {
  margin-bottom: 20rpx;
}

.page-demand-publish__field--last {
  margin-bottom: 0;
}

.page-demand-publish__field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.page-demand-publish__label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 26rpx;
  color: #334155;
}

.page-demand-publish__required {
  color: #e11d48;
}

.page-demand-publish__optional {
  color: #94a3b8;
  font-size: 22rpx;
}

.page-demand-publish__chips {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-height: 84rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 10rpx;
  box-sizing: border-box;
  background: #f8fafc;
}

.page-demand-publish__chip {
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #475569;
  background: #e2e8f0;
}

.page-demand-publish__chip--active {
  color: #ffffff;
  background: #2563eb;
}

.page-demand-publish__upload {
  margin-bottom: 20rpx;
  padding: 44rpx 30rpx;
  border: 2rpx dashed #bfdbfe;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  text-align: center;
  background: #eff6ff;
}

.page-demand-publish__upload-text {
  font-size: 24rpx;
  line-height: 1.5;
  color: #1d4ed8;
}

.page-demand-publish__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  padding: 0 24rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

@media (max-width: 360px) {
  .page-demand-publish__field-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
