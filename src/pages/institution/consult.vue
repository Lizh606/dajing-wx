<template>
  <view class="page-consult">
    <view class="page-consult__scroll">
      <view class="page-consult__org-banner">
        <text class="page-consult__org-caption">当前咨询机构</text>
        <text class="page-consult__org-name">湖南质量检测研究院</text>
        <text class="page-consult__org-meta">CMA / CNAS · 化学成分检测 · 平均响应 8 分钟</text>
      </view>

      <view class="page-consult__section">
        <view class="page-consult__section-header">
          <text class="page-consult__section-title">我的咨询</text>
          <text class="page-consult__section-action" @tap="loadMyConsultations">刷新</text>
        </view>
        <view v-if="consultationLoading" class="page-consult__empty">加载中...</view>
        <view v-else-if="myConsultations.length === 0" class="page-consult__empty">暂无咨询记录</view>
        <template v-else>
          <view
            v-for="item in myConsultations"
            :key="String(item.id)"
            class="page-consult__record"
            @tap="openConsultationDetail(item.id)"
          >
            <view class="page-consult__record-head">
              <text class="page-consult__record-type">{{ item.reqType || '其他' }}</text>
              <text class="page-consult__record-status">{{ getStatusText(item.status) }}</text>
            </view>
            <text class="page-consult__record-content">{{ item.content || '暂无描述' }}</text>
            <text class="page-consult__record-time">{{ item.createTime || '-' }}</text>
          </view>
        </template>
      </view>

      <view class="page-consult__section">
        <view class="page-consult__field">
          <text class="page-consult__label">咨询问题类型 <text class="page-consult__required">*</text></text>
          <view class="page-consult__chips">
            <text
              v-for="type in consultTypes"
              :key="type"
              :class="['page-consult__chip', form.questionType === type ? 'page-consult__chip--active' : '']"
              @tap="form.questionType = type"
            >{{ type }}</text>
          </view>
        </view>

        <view class="page-consult__field">
          <text class="page-consult__label">问题描述 <text class="page-consult__required">*</text></text>
          <AppField
            v-model="form.description"
            :autosize="{ minHeight: 120 }"
            :border="false"
            :custom-style="textareaStyle"
            placeholder="请输入当前咨询的问题、需求背景、期望周期及其他补充说明"
            type="textarea"
          />
        </view>

        <view class="page-consult__field">
          <text class="page-consult__label">联系人 <text class="page-consult__required">*</text></text>
          <AppField
            v-model="form.contactName"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入联系人姓名"
          />
        </view>

        <view class="page-consult__field page-consult__field--last">
          <text class="page-consult__label">联系电话 <text class="page-consult__required">*</text></text>
          <AppField
            v-model="form.contactPhone"
            :border="false"
            :custom-style="fieldStyle"
            placeholder="请输入联系电话"
            type="number"
          />
        </view>
      </view>

      <view class="page-consult__section">
        <text class="page-consult__section-title">上传附件</text>
        <view class="page-consult__upload" @tap="showComingSoon">
          <text class="page-consult__upload-text">上传样品照片 / 技术参数 / 认证资料</text>
        </view>
        <text class="page-consult__upload-tip">支持 JPG、PNG、PDF 等常见格式</text>
      </view>
    </view>

    <view class="page-consult__actions">
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        plain
        round
        text="取消"
        type="default"
        @click="cancel"
      />
      <AppButton
        block
        custom-style="min-height: 84rpx; border-radius: 16rpx;"
        round
        text="提交"
        type="info"
        @click="submit"
      />
    </view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppField from '@/components/ui/AppField/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import * as consultationService from '@/services/api/consultation'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { useUserStore } from '@/stores/user'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'

const consultTypes = ['检测标准咨询', '报价咨询', '样品寄送咨询', '报告查验咨询']
const reqTypeMapping: Record<string, string> = {
  检测标准咨询: '标准化服务',
  报价咨询: '检验检测',
  样品寄送咨询: '检验检测',
  报告查验咨询: '其他',
}
const form = reactive({
  contactEmail: '',
  contactName: '',
  contactPhone: '',
  questionType: '检测标准咨询',
  description: '',
})
const consultationLoading = ref(false)
const submitting = ref(false)
const myConsultations = ref<consultationService.ConsultationRecord[]>([])
const userStore = useUserStore()

const fieldStyle = 'padding: 20rpx 24rpx; border: 1rpx solid #e2e8f0; border-radius: 14rpx; background: #f8fafc;'
const textareaStyle = `${fieldStyle} min-height: 170rpx;`

onMounted(() => {
  loadMyConsultations()
})

function showComingSoon() {
  showAppToast({ message: '附件上传能力建设中', icon: 'none' })
}

function cancel() {
  uni.navigateBack()
}

function submit() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (!form.contactName.trim() || !form.contactPhone.trim() || !form.description.trim()) {
    showFailToast('请填写完整必填项')
    return
  }

  if (submitting.value) {
    return
  }

  submitting.value = true

  consultationService.submit({
    attachmentUrl: undefined,
    contactEmail: form.contactEmail.trim() || undefined,
    contactName: form.contactName.trim(),
    contactPhone: form.contactPhone.trim(),
    content: form.description.trim(),
    reqType: reqTypeMapping[form.questionType] || '其他',
  }).then(() => {
    showSuccessToast('咨询已提交，机构将尽快回复')
    loadMyConsultations()
    setTimeout(() => uni.navigateBack(), 1200)
  }).catch((error) => {
    showFailToast(getErrorMessage(error, '咨询提交失败，请稍后重试'))
  }).finally(() => {
    submitting.value = false
  })
}

function getStatusText(status: unknown) {
  return consultationService.normalizeConsultationStatus(status)
}

async function loadMyConsultations() {
  if (!userStore.isLoggedIn) {
    myConsultations.value = []
    return
  }

  consultationLoading.value = true

  try {
    const response = await consultationService.getMyList()
    myConsultations.value = consultationService.ensureConsultationList(response).slice(0, 5)
  } catch (error) {
    myConsultations.value = []
    showFailToast(getErrorMessage(error, '咨询记录加载失败'))
  } finally {
    consultationLoading.value = false
  }
}

async function openConsultationDetail(id?: number) {
  if (!id) {
    return
  }

  try {
    const detail = await consultationService.getDetail(id)
    const status = getStatusText(detail.status)
    const replyContent = detail.replyContent?.trim() || '暂无回复内容'

    uni.showModal({
      cancelText: '关闭',
      confirmText: '知道了',
      content: `状态：${status}\\n回复：${replyContent}`,
      showCancel: false,
      title: `咨询 #${detail.id ?? id}`,
    })
  } catch (error) {
    showFailToast(getErrorMessage(error, '咨询详情加载失败'))
  }
}
</script>

<style scoped lang="scss">
.page-consult {
  min-height: 100vh;
  background: #f8fafc;
}

.page-consult__scroll {
  padding: 24rpx 24rpx 0;
  box-sizing: border-box;
}

.page-consult__org-banner {
  margin-bottom: 16rpx;
  padding: 28rpx;
  border: 1rpx solid #bfdbfe;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eff6ff, #ecfeff);
}

.page-consult__org-caption {
  display: block;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  color: #1E61FF;
  font-weight: 600;
}

.page-consult__org-name {
  display: block;
  margin-bottom: 8rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-consult__org-meta {
  display: block;
  font-size: 23rpx;
  color: #64748b;
}

.page-consult__section {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  border: 1rpx solid #e8edf5;
  background: #ffffff;
  box-shadow: 0 4rpx 14rpx rgba(2, 6, 23, 0.03);
}

.page-consult__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.page-consult__section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 700;
}

.page-consult__section-action {
  color: #1E61FF;
  font-size: 22rpx;
  font-weight: 600;
}

.page-consult__empty {
  color: #64748b;
  font-size: 23rpx;
}

.page-consult__record {
  border: 1rpx solid #e2e8f0;
  border-radius: 14rpx;
  background: #f8fafc;
  padding: 16rpx 18rpx;
  margin-bottom: 10rpx;
}

.page-consult__record:last-child {
  margin-bottom: 0;
}

.page-consult__record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.page-consult__record-type {
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
}

.page-consult__record-status {
  color: #1E61FF;
  font-size: 22rpx;
}

.page-consult__record-content {
  display: block;
  margin-top: 8rpx;
  color: #475569;
  font-size: 22rpx;
  line-height: 1.5;
}

.page-consult__record-time {
  display: block;
  margin-top: 6rpx;
  color: #94a3b8;
  font-size: 20rpx;
}

.page-consult__field {
  margin-bottom: 18rpx;
}

.page-consult__field--last {
  margin-bottom: 0;
}

.page-consult__label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #475569;
}

.page-consult__required {
  color: #e11d48;
}

.page-consult__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.page-consult__chip {
  padding: 10rpx 18rpx;
  border-radius: 10rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 22rpx;
}

.page-consult__chip--active {
  border-color: #1E61FF;
  background: #1E61FF;
  color: #ffffff;
}

.page-consult__upload {
  padding: 46rpx;
  border: 2rpx dashed #93c5fd;
  border-radius: 16rpx;
  text-align: center;
  background: #eff6ff;
}

.page-consult__upload-text {
  font-size: 24rpx;
  color: #1E61FF;
}

.page-consult__upload-tip {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 20rpx;
}

.page-consult__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  padding: 18rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
}
</style>
