<template>
  <view class="page-legal">
    <scroll-view class="page-legal__scroll" scroll-y>
      <view class="page-legal__content">
        <view class="legal-card legal-card--summary">
          <text class="legal-title">隐私政策</text>
          <text class="legal-meta">更新日期：{{ updatedAt }}</text>
          <text class="legal-meta">生效日期：{{ effectiveAt }}</text>
          <text class="legal-intro">
            本指引依据适用的个人信息保护相关法律法规制定，用于说明开发者处理你的个人信息的目的、方式、范围和保存规则。
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
    title: '引导语',
    paragraphs: [
      '本指引是 AI质检猿·质量基础设施创新平台开发者为处理你的个人信息而制定。',
      '根据法律规定，开发者仅处理实现小程序功能所必要的信息。'
    ],
  },
  {
    title: '开发者处理的信息及目的',
    paragraphs: [
      '1）收集你的手机号（短信登录/注册），用于账号创建、身份校验与安全登录。',
      '2）收集微信登录凭证（code）及服务端换取的账号标识信息，用于微信登录鉴权与会话管理。',
      '3）收集你主动填写的资料（昵称、头像、企业信息、联系人、收样地址、发票信息等），用于业务履约、订单协同和客户服务。',
      '4）收集你主动上传的文件或图片（资质、报告、订单附件），用于提交审核、履约存档与售后处理。',
      '5）收集设备与日志信息（设备型号、系统版本、网络状态、操作日志），用于系统安全保障、故障排查与性能优化。'
    ],
  },
  {
    title: '用户授权与权益',
    paragraphs: [
      '你可在登录/注册页阅读《用户服务协议》《隐私政策》并勾选同意后继续使用相关功能。',
      '对于微信侧隐私接口，开发者通过微信官方隐私授权能力（agreePrivacyAuthorization）同步你的同意状态后再继续调用。',
      '你可通过小程序“我的-设置-意见反馈”联系我们，行使查阅、复制、更正、删除、撤回授权、注销账号等法定权利。'
    ],
  },
  {
    title: '开发者对信息的存储',
    paragraphs: [
      '开发者在中华人民共和国境内存储你的个人信息，并采取访问控制、传输加密、日志审计等安全措施。',
      '开发者仅在实现处理目的所必需的最短期限内保存信息；超出期限后将依法删除或匿名化处理。'
    ],
  },
  {
    title: '信息的使用规则',
    paragraphs: [
      '开发者将在本指引明示的用途范围内使用收集的信息。',
      '如需将信息用于超出本指引目的或合理范围的场景，开发者将再次告知并征得你的明示同意。'
    ],
  },
  {
    title: '信息对外提供',
    paragraphs: [
      '开发者承诺不会主动共享、转让你的信息至任何第三方；如确需共享或转让，将依法取得你的单独同意或满足法律法规要求。',
      '开发者承诺不会对外公开披露你的信息；如必须公开披露，将事先告知目的、类型及影响并依法取得同意。'
    ],
  },
  {
    title: '联系方式与投诉建议',
    paragraphs: [
      '如你认为开发者未遵守上述约定，或有未成年人个人信息保护相关问题，可通过小程序“我的-设置-意见反馈”提交。',
      '你也可通过微信官方投诉渠道进行反馈。'
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
  font-size: 32rpx;
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
