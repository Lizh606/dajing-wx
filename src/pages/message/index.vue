<template>
  <view class="page-message">
    <view class="page-message__header">
      <view class="page-message__summary">
        未读 {{ unreadCount }} 条
      </view>

      <scroll-view class="page-message__tabs-scroll" scroll-x>
        <view class="page-message__tabs-row">
          <text
            v-for="tab in tabs"
            :key="tab"
            class="page-message__tab"
            :class="{ 'page-message__tab--active': activeTab === tab }"
            @tap="activeTab = tab"
          >{{ tab }}</text>
        </view>
      </scroll-view>
    </view>

    <scroll-view class="page-message__scroll" scroll-y>
      <view class="page-message__content">
        <view
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="page-message__card"
          :class="{ 'page-message__card--unread': msg.unread }"
          @tap="readMsg(msg)"
        >
          <view class="page-message__card-row">
            <view class="page-message__card-main">
              <view class="page-message__icon" :style="{ background: msg.iconBg }">{{ msg.icon }}</view>
              <view class="page-message__info">
                <view class="page-message__type-row">
                  <text class="page-message__type">{{ msg.type }}</text>
                  <text v-if="msg.unread" class="page-message__unread-tag">未读</text>
                </view>
                <text class="page-message__desc">{{ msg.text }}</text>
                <text class="page-message__time">{{ msg.time }}</text>
              </view>
            </view>
            <text v-if="msg.action" class="page-message__action">{{ msg.action }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type MessageTab = '全部消息' | '咨询' | '需求回复' | '订单通知' | '系统消息'

interface MessageItem {
  id: number
  type: string
  text: string
  time: string
  unread: boolean
  action: string
  category: Exclude<MessageTab, '全部消息'>
  icon: string
  iconBg: string
}

const activeTab = ref<MessageTab>('全部消息')
const tabs: MessageTab[] = ['全部消息', '咨询', '需求回复', '订单通知', '系统消息']

const messages = ref<MessageItem[]>([
  {
    id: 1,
    type: '咨询回复',
    text: '株洲市质检中心已回复你的咨询，可继续沟通检测周期与寄样要求。',
    time: '今天 09:28',
    unread: true,
    action: '查看',
    category: '咨询',
    icon: '💬',
    iconBg: '#eff6ff',
  },
  {
    id: 2,
    type: '需求回复',
    text: '“钢质棒力学性能检测”已有 2 家服务机构提交响应方案。',
    time: '今天 08:46',
    unread: true,
    action: '查看',
    category: '需求回复',
    icon: '📝',
    iconBg: '#ecfdf5',
  },
  {
    id: 3,
    type: '订单通知',
    text: '订单 ENT202603240006 已进入报告生成阶段，请及时关注结果。',
    time: '昨天 18:12',
    unread: false,
    action: '查看',
    category: '订单通知',
    icon: '⏰',
    iconBg: '#fffbeb',
  },
  {
    id: 4,
    type: '系统消息',
    text: '账号安全策略已升级，建议尽快完成登录设备校验。',
    time: '昨天 10:05',
    unread: false,
    action: '查看',
    category: '系统消息',
    icon: '🔔',
    iconBg: '#f5f3ff',
  },
])

const unreadCount = computed(() => messages.value.filter((item) => item.unread).length)

const filteredMessages = computed(() => {
  if (activeTab.value === '全部消息') {
    return messages.value
  }

  return messages.value.filter((item) => item.category === activeTab.value)
})

function readMsg(msg: MessageItem) {
  msg.unread = false
}
</script>

<style scoped lang="scss">
.page-message {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-message__header {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: rgba(255, 255, 255, 0.98);
}

.page-message__summary {
  color: #64748b;
  font-size: 22rpx;
  margin-bottom: 10rpx;
}

.page-message__tabs-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}

.page-message__tabs-row {
  display: flex;
  gap: 10rpx;
}

.page-message__tab {
  flex-shrink: 0;
  border-radius: 12rpx;
  background: #f1f5f9;
  padding: 10rpx 20rpx;
  color: #64748b;
  font-size: 22rpx;
}

.page-message__tab--active {
  background: #2563eb;
  color: #ffffff;
}

.page-message__scroll {
  flex: 1;
  min-height: 0;
}

.page-message__content {
  padding: 18rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.page-message__card {
  border-radius: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 6rpx 18rpx rgba(15, 23, 42, 0.05);
  padding: 22rpx;
}

.page-message__card + .page-message__card {
  margin-top: 14rpx;
}

.page-message__card--unread {
  border-color: #bfdbfe;
  background: #fafbff;
}

.page-message__card-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.page-message__card-main {
  min-width: 0;
  flex: 1;
  display: flex;
  gap: 14rpx;
}

.page-message__icon {
  width: 74rpx;
  height: 74rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.page-message__info {
  min-width: 0;
}

.page-message__type-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.page-message__type {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 600;
}

.page-message__unread-tag {
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  background: #fef2f2;
  color: #be123c;
  font-size: 18rpx;
}

.page-message__desc {
  display: block;
  margin-top: 6rpx;
  color: #475569;
  font-size: 23rpx;
  line-height: 1.5;
}

.page-message__time {
  display: block;
  margin-top: 8rpx;
  color: #94a3b8;
  font-size: 20rpx;
}

.page-message__action {
  flex-shrink: 0;
  color: #2563eb;
  font-size: 22rpx;
}
</style>
