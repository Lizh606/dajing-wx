<template>
  <view class="page-legal">
    <scroll-view class="page-legal__scroll" scroll-y>
      <view class="page-legal__content">
        <view class="legal-card legal-card--summary">
          <text class="legal-title">用户服务协议</text>
          <text class="legal-meta">更新日期：{{ updatedAt }}</text>
          <text class="legal-meta">生效日期：{{ effectiveAt }}</text>
          <text class="legal-intro">
            本协议是你与 AI质检猿·质量基础设施创新平台之间关于使用小程序服务所订立的协议。
          </text>
        </view>

        <view
          v-for="(section, sectionIndex) in sections"
          :key="section.title"
          class="legal-card"
        >
          <text class="legal-section-title">{{ sectionIndex + 1 }}. {{ section.title }}</text>
          <text
            v-for="(paragraph, paragraphIndex) in section.paragraphs"
            :key="`${section.title}-${paragraphIndex}`"
            class="legal-paragraph"
          >
            {{ paragraph }}
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
interface LegalSection {
  title: string
  paragraphs: string[]
}

const updatedAt = '2026年04月24日'
const effectiveAt = '2026年04月24日'

const sections: LegalSection[] = [
  {
    title: '协议确认',
    paragraphs: [
      '你在登录/注册页面勾选并同意《用户服务协议》《隐私政策》后，表示你已阅读并同意受本协议约束。',
      '若你不同意本协议或《隐私政策》相关条款，请停止使用需要登录及个人信息处理的功能。'
    ],
  },
  {
    title: '服务内容',
    paragraphs: [
      '平台向用户提供检测服务相关的信息展示、需求发布、订单管理、报告管理、企业资料管理等功能。',
      '平台有权根据业务发展与监管要求调整服务内容，并通过页面公告或站内通知方式提示。'
    ],
  },
  {
    title: '账号与使用规范',
    paragraphs: [
      '你应确保提交信息真实、准确、完整，并及时更新。',
      '你应妥善保管账号及登录凭证，不得出借、出租、出售或以其他方式交由他人使用。',
      '你不得利用本平台从事违法违规、侵权、欺诈、恶意攻击等行为。'
    ],
  },
  {
    title: '个人信息处理与授权',
    paragraphs: [
      '平台按照《隐私政策》收集、使用和存储个人信息，并遵循“合法、正当、必要、诚信”原则。',
      '平台在取得你的授权同意后处理相应个人信息；你拒绝授权的，将无法使用对应功能。',
      '涉及微信隐私接口的场景，平台通过微信官方隐私授权按钮（agreePrivacyAuthorization）完成授权同步。'
    ],
  },
  {
    title: '责任限制与服务变更',
    paragraphs: [
      '因系统维护、网络故障、不可抗力或政策变化导致服务中断、延迟或变更的，平台将尽合理努力恢复，但不对由此产生的间接损失承担责任。',
      '若你违反法律法规或本协议，平台有权采取限制功能、暂停服务或终止服务等措施。'
    ],
  },
  {
    title: '争议解决',
    paragraphs: [
      '本协议的订立、履行与争议解决适用中华人民共和国法律。',
      '因本协议产生争议，双方应先友好协商；协商不成的，提交平台运营主体所在地有管辖权的人民法院解决。'
    ],
  },
]
</script>

<style scoped lang="scss">
.page-legal {
  height: 100vh;
  background: #f8fafc;
}

.page-legal__scroll {
  height: 100%;
}

.page-legal__content {
  padding: 24rpx;
  box-sizing: border-box;
}

.legal-card {
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 24rpx;
}

.legal-card + .legal-card {
  margin-top: 14rpx;
}

.legal-card--summary {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.legal-title {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
}

.legal-meta {
  display: block;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 23rpx;
}

.legal-intro {
  display: block;
  margin-top: 14rpx;
  color: #334155;
  font-size: 24rpx;
  line-height: 1.7;
}

.legal-section-title {
  display: block;
  color: #1e293b;
  font-size: 28rpx;
  font-weight: 700;
}

.legal-paragraph {
  display: block;
  margin-top: 12rpx;
  color: #334155;
  font-size: 24rpx;
  line-height: 1.75;
}
</style>
