<template>
  <view class="page-institution-services">
    <scroll-view class="page-institution-services__scroll" scroll-y>
      <view class="page-institution-services__search-wrap">
        <AppSearchPlaceholder
          placeholder="在本机构内搜索服务项目，如：金属材料检测、RoHS、盐雾试验"
        />
      </view>

      <view class="page-institution-services__banner">
        <view>
          <text class="page-institution-services__banner-tag">机构在售服务</text>
          <text class="page-institution-services__banner-title">按项目下单，支持咨询、比价、快速购买</text>
        </view>
        <view class="page-institution-services__banner-side">
          <text class="page-institution-services__banner-num">126</text>
          <text class="page-institution-services__banner-text">在售项目</text>
          <AppButton
            custom-style="margin-top: 10rpx; min-height: 54rpx; padding: 0 16rpx; border-radius: 12rpx; font-size: 20rpx;"
            plain
            size="small"
            text="保存服务信息"
            type="info"
            @click="saveServiceProfile"
          />
        </view>
      </view>

      <view class="page-institution-services__badge-row">
        <text v-for="item in badgeList" :key="item" class="page-institution-services__badge">{{ item }}</text>
      </view>

      <AppList :finished="true">
        <view class="page-institution-services__grid">
          <view v-for="service in services" :key="service.name" class="service-card">
            <view class="service-card__media" :style="{ background: service.imgBg }">
              <AppIcon :name="service.iconName" size="34" />
            </view>

            <view class="service-card__body">
              <text class="service-card__title">{{ service.name }}</text>

              <view class="service-card__price-row">
                <text class="service-card__price">¥{{ service.price }}起</text>
                <text class="service-card__tag">平台保障</text>
              </view>

              <text class="service-card__meta">已购 {{ service.sold }}件</text>
              <text class="service-card__meta">{{ service.duration }}</text>
              <text class="service-card__desc">{{ service.desc }}</text>

              <view class="service-card__actions">
                <AppButton
                  block
                  custom-style="min-height: 62rpx; padding: 0; border-radius: 14rpx; font-size: 22rpx;"
                  plain
                  size="small"
                  text="咨询"
                  type="default"
                  @click="goConsult"
                />
                <AppButton
                  block
                  custom-style="min-height: 62rpx; padding: 0; border-radius: 14rpx; font-size: 22rpx;"
                  size="small"
                  text="立即下单"
                  type="info"
                  @click="goOrder"
                />
              </view>
            </view>
          </view>
        </view>
      </AppList>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon/index.vue'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppList from '@/components/ui/AppList/index.vue'
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import * as institutionService from '@/services/api/institution'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast, showSuccessToast } from '@/services/ui/toast'

const badgeList = ['CMA', 'CNAS', '支持开票', '加急服务']
const currentInstitutionId = ref('')

const services = [
  { name: '金属材料力学性能检测', iconName: 'lab', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', price: 980, sold: '862', duration: '3-5个工作日', desc: '含拉伸/弯曲/冲击' },
  { name: 'RoHS有害物质检测', iconName: 'chemistry', imgBg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', price: 1280, sold: '1,236', duration: '2-4个工作日', desc: '电子电器常用项目' },
  { name: '尺寸计量校准服务', iconName: 'standard', imgBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', price: 680, sold: '533', duration: '1-3个工作日', desc: '支持上门/送检' },
  { name: '产品标准符合性诊断', iconName: 'book', imgBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', price: 1680, sold: '328', duration: '专家1对1分析', desc: '含整改建议清单' },
  { name: '环境可靠性测试', iconName: 'analysis', imgBg: 'linear-gradient(135deg,#fee2e2,#fecaca)', price: 2400, sold: '417', duration: '5-7个工作日', desc: '高低温/湿热/振动' },
  { name: '体系认证辅导咨询', iconName: 'certification', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', price: 3200, sold: '194', duration: '按阶段交付', desc: 'ISO9001/ISO14001' },
]

onLoad((query) => {
  if (typeof query?.id === 'string' && query.id.trim()) {
    currentInstitutionId.value = query.id.trim()
  }
})

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}

function goOrder() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  const params: string[] = []
  const primaryServiceName = services[0]?.name

  if (primaryServiceName) {
    params.push(`service=${encodeURIComponent(primaryServiceName)}`)
  }

  if (currentInstitutionId.value) {
    params.push(`institutionId=${encodeURIComponent(currentInstitutionId.value)}`)
  }

  uni.navigateTo({ url: `/pages/order/create${params.length > 0 ? `?${params.join('&')}` : ''}` })
}

async function saveServiceProfile() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  if (!currentInstitutionId.value) {
    showAppToast({ icon: 'none', message: '未获取到机构ID，无法保存' })
    return
  }

  const serviceRange = badgeList.join('、')
  const introduction = services
    .slice(0, 3)
    .map((item) => item.name)
    .join('；')

  try {
    await institutionService.updateService(currentInstitutionId.value, {
      introduction,
      serviceRange,
    })
    showSuccessToast('机构服务信息已保存')
  } catch (error) {
    showFailToast(getErrorMessage(error, '保存失败，请稍后再试'))
  }
}
</script>

<style scoped lang="scss">
.page-institution-services {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-institution-services__scroll {
  flex: 1;
  min-height: 0;
  padding: 18rpx 24rpx 30rpx;
  box-sizing: border-box;
}

.page-institution-services__search-wrap {
  margin-bottom: 14rpx;
}

.page-institution-services__banner {
  margin-bottom: 12rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  border: 1rpx solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
}

.page-institution-services__banner-tag {
  display: block;
  color: #1d4ed8;
  font-size: 22rpx;
  font-weight: 600;
}

.page-institution-services__banner-title {
  display: block;
  margin-top: 6rpx;
  color: #0f172a;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 1.45;
}

.page-institution-services__banner-side {
  flex-shrink: 0;
  text-align: right;
}

.page-institution-services__banner-num {
  display: block;
  color: #0f172a;
  font-size: 34rpx;
  font-weight: 700;
}

.page-institution-services__banner-text {
  display: block;
  color: #64748b;
  font-size: 20rpx;
}

.page-institution-services__badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 14rpx;
}

.page-institution-services__badge {
  border-radius: 8rpx;
  border: 1rpx solid #bfdbfe;
  background: #ffffff;
  color: #1d4ed8;
  font-size: 20rpx;
  padding: 6rpx 12rpx;
}

.page-institution-services__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.service-card {
  border-radius: 20rpx;
  border: 1rpx solid #e8edf5;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
}

.service-card__media {
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-card__body {
  padding: 16rpx;
}

.service-card__title {
  display: block;
  min-height: 68rpx;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.4;
}

.service-card__price-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.service-card__price {
  color: #2563eb;
  font-size: 24rpx;
  font-weight: 700;
}

.service-card__tag {
  flex-shrink: 0;
  border-radius: 8rpx;
  padding: 4rpx 10rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 18rpx;
}

.service-card__meta,
.service-card__desc {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 20rpx;
}

.service-card__desc {
  color: #475569;
}

.service-card__actions {
  margin-top: 12rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8rpx;
}
</style>
