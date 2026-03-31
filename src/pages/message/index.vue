<template>
  <view class="page-message">
    <view class="page-message__header">
      <view class="page-message__summary">
        <text class="page-message__unread-count">未读 {{ unreadCount }} 条</text>
        <view class="page-message__summary-icon">
          <text>💬</text>
          <view v-if="unreadCount > 0" class="page-message__summary-badge">{{ unreadCount }}</view>
        </view>
      </view>

      <scroll-view scroll-x class="page-message__tabs-scroll">
        <view class="page-message__tabs-wrap">
          <text
            v-for="tab in tabs"
            :key="tab"
            class="page-message__tab"
            :class="{ 'page-message__tab--active': activeTab===tab }"
            @tap="activeTab=tab"
          >{{ tab }}</text>
        </view>
      </scroll-view>
    </view>

    <scroll-view class="page-message__content" scroll-y>
      <view class="page-message__list">
        <view
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="page-message__card"
          :class="{ 'page-message__card--unread': msg.unread }"
          @tap="readMsg(msg)"
        >
          <view class="page-message__icon" :style="{ background: msg.iconBg }">{{ msg.icon }}</view>
          <view class="page-message__body">
            <view class="page-message__title-row">
              <text class="page-message__type">{{ msg.type }}</text>
              <view v-if="msg.unread" class="page-message__unread-tag">未读</view>
            </view>
            <text class="page-message__text">{{ msg.text }}</text>
            <text class="page-message__time">{{ msg.time }}</text>
          </view>
          <text v-if="msg.action" class="page-message__action">{{ msg.action }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const activeTab = ref('全部消息')
const tabs = ['全部消息', '咨询', '需求回复', '订单通知', '系统消息']
const messages = ref([
  { id: 1, type: '咨询回复', icon: '💬', iconBg: '#eff6ff', text: '株洲市质检中心已回复你的咨询，可继续沟通检测周期与寄样要求。', time: '今天 09:28', unread: true, action: '查看', category: '咨询' },
  { id: 2, type: '需求响应', icon: '📝', iconBg: '#ecfdf5', text: '你的需求「新能源汽车电池包安全性能检测」已收到 3 家机构响应方案，请及时查看并选择合作机构。', time: '今天 08:15', unread: true, action: '查看', category: '需求回复' },
  { id: 3, type: '风险提醒', icon: '⚠️', iconBg: '#fff7ed', text: '你的 CMA 检测报告将于 30 天内到期，请及时安排复检或续期。', time: '昨天 16:42', unread: true, action: '处理', category: '系统消息' },
  { id: 4, type: '订单通知', icon: '📦', iconBg: '#f5f3ff', text: '订单 ORD20260415003「金属材料成分检测」已进入检测阶段，预计 3 天内完成。', time: '昨天 11:20', unread: false, action: '', category: '订单通知' },
  { id: 5, type: '报告生成', icon: '📄', iconBg: '#ecfdf5', text: '检测报告「电气安全检测报告-2026-04」已生成，可在「数据报告」中查看和下载。', time: '2026-04-16', unread: false, action: '查看', category: '系统消息' },
  { id: 6, type: '系统消息', icon: '🔔', iconBg: '#f8fafc', text: '平台新增「计量校准」服务模块，现已上线株洲地区 12 家计量机构，欢迎体验。', time: '2026-04-14', unread: false, action: '', category: '系统消息' },
])
const unreadCount = computed(() => messages.value.filter(m => m.unread).length)
const filteredMessages = computed(() => {
  if (activeTab.value === '全部消息') return messages.value
  return messages.value.filter(m => m.category === activeTab.value)
})
const readMsg = (msg: any) => {
  msg.unread = false
}
</script>

<style scoped lang="scss">
.page-message {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-message__header {
  background: #ffffff;
  padding: 24rpx 24rpx 16rpx;
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
  height: 72rpx;
  width: 72rpx;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #f1f5f9;
  font-size: 36rpx;
}

.page-message__summary-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 28rpx;
  border-radius: 999rpx;
  background: #ef4444;
  padding: 2rpx 8rpx;
  text-align: center;
  font-size: 18rpx;
  color: #ffffff;
}

.page-message__tabs-scroll {
  white-space: nowrap;
}

.page-message__tabs-wrap {
  display: flex;
  gap: 12rpx;
}

.page-message__tab {
  display: inline-block;
  white-space: nowrap;
  border-radius: 12rpx;
  background: #f1f5f9;
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  color: #64748b;
}

.page-message__tab--active {
  background: #2563eb;
  color: #ffffff;
}

.page-message__content {
  flex: 1;
  min-height: 0;
}

.page-message__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx 24rpx;
}

.page-message__card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.05);
}

.page-message__card--unread {
  border-color: #bfdbfe;
  background: #fafbff;
}

.page-message__icon {
  display: flex;
  height: 80rpx;
  width: 80rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 36rpx;
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
  background: #fef2f2;
  padding: 2rpx 12rpx;
  font-size: 20rpx;
  color: #dc2626;
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

.page-message__action {
  flex-shrink: 0;
  padding-top: 4rpx;
  font-size: 24rpx;
  color: #2563eb;
}
</style>
