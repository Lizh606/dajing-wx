<template>
  <view class="page-message">
    <view class="page-message__header">
      <view class="page-message__summary">
        <text class="page-message__unread-count">未读 {{ unreadCount }} 条</text>
        <view class="page-message__summary-icon">
          <AppIcon color="#2563eb" name="message" size="20" />
          <view v-if="unreadCount > 0" class="page-message__summary-badge">{{ unreadCount }}</view>
        </view>
      </view>

      <AppTabs v-model="activeTab">
        <AppTab
          v-for="tab in tabs"
          :key="tab"
          :name="tab"
          :title="tab"
        >
          <scroll-view class="page-message__content" scroll-y>
            <AppList :finished="true">
              <view class="page-message__list">
                <view
                  v-for="msg in getMessagesByTab(tab)"
                  :key="msg.id"
                  class="page-message__card"
                  :class="{ 'page-message__card--unread': msg.unread }"
                  @tap="readMsg(msg)"
                >
                  <view class="page-message__icon" :style="{ background: msg.iconBg }">
                    <AppIcon :name="msg.iconName" size="20" />
                  </view>
                  <view class="page-message__body">
                    <view class="page-message__title-row">
                      <text class="page-message__type">{{ msg.type }}</text>
                      <view v-if="msg.unread" class="page-message__unread-tag">未读</view>
                    </view>
                    <text class="page-message__text">{{ msg.text }}</text>
                    <text class="page-message__time">{{ msg.time }}</text>
                  </view>
                  <AppButton
                    v-if="msg.action"
                    plain
                    preset="action"
                    size="small"
                    :text="msg.action"
                    type="info"
                    @click.stop="readMsg(msg)"
                  />
                </view>
              </view>
            </AppList>
          </scroll-view>
        </AppTab>
      </AppTabs>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'

type MessageTab = '全部消息' | '咨询' | '需求回复' | '订单通知' | '系统消息'

interface MessageItem {
  id: number
  type: string
  iconBg: string
  iconName: string
  text: string
  time: string
  unread: boolean
  action: string
  category: Exclude<MessageTab, '全部消息'>
}

const activeTab = ref<MessageTab>('全部消息')
const tabs: MessageTab[] = ['全部消息', '咨询', '需求回复', '订单通知', '系统消息']
const messages = ref<MessageItem[]>([
  { id: 1, type: '咨询回复', iconBg: '#eff6ff', iconName: 'message', text: '株洲市质检中心已回复你的咨询，可继续沟通检测周期与寄样要求。', time: '今天 09:28', unread: true, action: '查看', category: '咨询' },
  { id: 2, type: '需求响应', iconBg: '#ecfdf5', iconName: 'edit', text: '你的需求「新能源汽车电池包安全性能检测」已收到 3 家机构响应方案，请及时查看并选择合作机构。', time: '今天 08:15', unread: true, action: '查看', category: '需求回复' },
  { id: 3, type: '风险提醒', iconBg: '#fff7ed', iconName: 'warning', text: '你的 CMA 检测报告将于 30 天内到期，请及时安排复检或续期。', time: '昨天 16:42', unread: true, action: '处理', category: '系统消息' },
  { id: 4, type: '订单通知', iconBg: '#f5f3ff', iconName: 'package', text: '订单 ORD20260415003「金属材料成分检测」已进入检测阶段，预计 3 天内完成。', time: '昨天 11:20', unread: false, action: '', category: '订单通知' },
  { id: 5, type: '报告生成', iconBg: '#ecfdf5', iconName: 'report', text: '检测报告「电气安全检测报告-2026-04」已生成，可在「数据报告」中查看和下载。', time: '2026-04-16', unread: false, action: '查看', category: '系统消息' },
  { id: 6, type: '系统消息', iconBg: '#f8fafc', iconName: 'notice', text: '平台新增「计量校准」服务模块，现已上线株洲地区 12 家计量机构，欢迎体验。', time: '2026-04-14', unread: false, action: '', category: '系统消息' },
])

const unreadCount = computed(() => messages.value.filter((message) => message.unread).length)

function getMessagesByTab(tab: MessageTab) {
  if (tab === '全部消息') {
    return messages.value
  }

  return messages.value.filter((message) => message.category === tab)
}

function readMsg(msg: MessageItem) {
  msg.unread = false
}
</script>

<style scoped lang="scss">
@keyframes badge-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8rpx rgba(239, 68, 68, 0);
  }
}

.page-message {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}

.page-message__header {
  flex: 1;
  min-height: 0;
  background: linear-gradient(180deg, #e0ecff 0%, #ffffff 100%);
  padding: 24rpx 24rpx 16rpx;
  position: relative;
  overflow: hidden;
}

.page-message__header::before {
  content: '';
  position: absolute;
  top: -60rpx;
  left: -40rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.07);
  filter: blur(50rpx);
  pointer-events: none;
}

.page-message__header::after {
  content: '';
  position: absolute;
  top: 20rpx;
  right: -50rpx;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.06);
  filter: blur(45rpx);
  pointer-events: none;
}

.page-message__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.page-message__unread-count {
  font-size: 24rpx;
  color: #64748b;
}

.page-message__summary-icon {
  position: relative;
  display: flex;
  height: 76rpx;
  width: 76rpx;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transition: background 0.3s ease;
}

.page-message__summary-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  padding: 2rpx 8rpx;
  text-align: center;
  font-size: 18rpx;
  color: #ffffff;
  animation: badge-pulse 2s ease-in-out infinite;
}

.page-message__content {
  height: calc(100vh - 220rpx);
}

.page-message__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx 0 0;
}

.page-message__card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  border-radius: 24rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.page-message__card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);
}

.page-message__card--unread {
  border-color: rgba(191, 219, 254, 0.6);
  background: linear-gradient(135deg, #fafbff 0%, #f0f7ff 100%);
  box-shadow: 0 4rpx 24rpx rgba(37, 99, 235, 0.06);
}

.page-message__icon {
  display: flex;
  height: 80rpx;
  width: 80rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.page-message__body {
  flex: 1;
  min-width: 0;
}

.page-message__title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.page-message__type {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-message__unread-tag {
  border-radius: 999rpx;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  padding: 2rpx 14rpx;
  font-size: 20rpx;
  color: #f97316;
  font-weight: 500;
}

.page-message__text {
  display: block;
  font-size: 24rpx;
  line-height: 1.6;
  color: #475569;
}

.page-message__time {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #94a3b8;
}
</style>
