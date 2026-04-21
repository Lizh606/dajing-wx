<template>
  <view class="page-detection">
    <view class="page-detection__header">
      <AppSearchPlaceholder
        custom-style="padding: 16rpx 24rpx;"
        placeholder="搜索检测项目 / 机构 / 报告"
        shape="pill"
        size="lg"
        text-size="28rpx"
        tone="light"
      />

      <AppTabs v-model="activeTab">
        <AppTab name="service" title="服务">
          <scroll-view class="page-detection__scroll" scroll-y>
            <view class="page-detection__filter-panel">
              <scroll-view class="page-detection__filter-scroll" scroll-x>
                <view class="page-detection__filter-row">
                  <text
                    v-for="option in serviceTypeOptions"
                    :key="option"
                    class="page-detection__chip"
                    :class="{ 'page-detection__chip--active': activeServiceType === option }"
                    @tap="activeServiceType = option"
                  >{{ option }}</text>
                </view>
              </scroll-view>

              <scroll-view class="page-detection__filter-scroll" scroll-x>
                <view class="page-detection__filter-row">
                  <text
                    v-for="option in serviceSortOptions"
                    :key="option"
                    class="page-detection__chip page-detection__chip--muted"
                    :class="{ 'page-detection__chip--active': activeServiceSort === option }"
                    @tap="activeServiceSort = option"
                  >{{ option }}</text>
                </view>
              </scroll-view>
            </view>

            <AppList :finished="true" finished-text="没有更多检测服务了">
              <view class="card-grid">
                <view
                  v-for="item in filteredServices"
                  :key="item.name"
                  class="service-card"
                  @tap="goOrder(item)"
                >
                  <view class="service-card__media" :style="{ background: item.imgBg }">
                    <AppIcon :name="item.iconName" size="32" />
                  </view>
                  <view class="service-card__body">
                    <text class="service-card__title">{{ item.name }}</text>
                    <text class="service-card__org">{{ item.org }}</text>
                    <view class="service-card__price-row">
                      <text class="service-card__price">¥{{ item.price }}起</text>
                      <text class="service-card__sold">已售 {{ item.sold }}</text>
                    </view>
                    <view class="service-card__tags">
                      <text v-for="tag in item.tags" :key="tag" class="service-card__tag">{{ tag }}</text>
                    </view>
                    <view class="service-card__actions">
                      <AppButton
                        block
                        plain
                        preset="action"
                        size="small"
                        text="咨询"
                        type="default"
                        @click.stop="goConsult"
                      />
                      <AppButton
                        block
                        preset="action"
                        size="small"
                        text="立即下单"
                        type="info"
                        @click.stop="goOrder(item)"
                      />
                    </view>
                  </view>
                </view>
              </view>
            </AppList>
          </scroll-view>
        </AppTab>

        <AppTab name="institution" title="机构">
          <scroll-view class="page-detection__scroll" scroll-y>
            <view class="page-detection__filter-panel">
              <scroll-view class="page-detection__filter-scroll" scroll-x>
                <view class="page-detection__filter-row">
                  <text
                    v-for="option in institutionRegionOptions"
                    :key="option"
                    class="page-detection__chip"
                    :class="{ 'page-detection__chip--active': activeInstitutionRegion === option }"
                    @tap="activeInstitutionRegion = option"
                  >{{ option }}</text>
                </view>
              </scroll-view>

              <scroll-view class="page-detection__filter-scroll" scroll-x>
                <view class="page-detection__filter-row">
                  <text
                    v-for="option in institutionCertOptions"
                    :key="option"
                    class="page-detection__chip page-detection__chip--muted"
                    :class="{ 'page-detection__chip--active': activeInstitutionCert === option }"
                    @tap="activeInstitutionCert = option"
                  >{{ option }}</text>
                </view>
              </scroll-view>
            </view>

            <AppList :finished="true" finished-text="没有更多检测机构了">
              <view
                v-for="inst in filteredInstitutions"
                :key="inst.id"
                class="institution-card"
              >
                <view class="institution-card__head">
                  <view class="institution-card__avatar">
                    <AppIcon color="#2563eb" name="institution" size="22" />
                  </view>
                  <view class="institution-card__main">
                    <text class="institution-card__name">{{ inst.name }}</text>
                    <view class="institution-card__certs">
                      <text v-for="cert in inst.certs" :key="cert" class="institution-card__cert">{{ cert }}</text>
                    </view>
                    <view class="institution-card__meta">
                      <AppIcon color="#64748b" name="location" size="14" />
                      <text class="institution-card__location">{{ inst.location }}</text>
                    </view>
                  </view>
                  <view class="institution-card__score">
                    <text class="institution-card__score-value">{{ inst.score }}</text>
                    <text class="institution-card__score-label">评分</text>
                  </view>
                </view>

                <view class="institution-card__stats">
                  <view class="institution-card__stat">
                    <text class="institution-card__stat-value">{{ inst.serviceCount }}</text>
                    <text class="institution-card__stat-label">服务项目</text>
                  </view>
                  <view class="institution-card__stat">
                    <text class="institution-card__stat-value">{{ inst.orderCount }}</text>
                    <text class="institution-card__stat-label">累计订单</text>
                  </view>
                  <view class="institution-card__stat">
                    <text class="institution-card__stat-value">{{ inst.avgDays }}天</text>
                    <text class="institution-card__stat-label">平均周期</text>
                  </view>
                  <view class="institution-card__stat">
                    <text class="institution-card__stat-value">{{ inst.responseTime }}</text>
                    <text class="institution-card__stat-label">响应时长</text>
                  </view>
                </view>

                <view class="institution-card__actions">
                  <AppButton
                    block
                    plain
                    preset="action"
                    size="small"
                    text="立即咨询"
                    type="default"
                    @click="goConsult"
                  />
                  <AppButton
                    block
                    preset="action"
                    size="small"
                    text="查看详情"
                    type="info"
                    @click="goInstitutionDetail(inst.id)"
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
import AppSearchPlaceholder from '@/components/ui/AppSearchPlaceholder/index.vue'
import AppTab from '@/components/ui/AppTab/index.vue'
import AppTabs from '@/components/ui/AppTabs/index.vue'
import { ensureLoggedInForSubmitAction } from '@/services/auth/guard'

type DetectionTabKey = 'service' | 'institution'
type DetectionType = '全部' | '材料检测' | '电气安全' | '汽车零部件' | '环境可靠性' | '食品检测' | '化工检测'
type ServiceSort = '综合推荐' | '出报告快' | '价格优先'
type InstitutionRegion = '全国' | '湖南' | '广东' | '北京'
type InstitutionCert = '全部资质' | 'CMA' | 'CNAS'

interface DetectionService {
  type: Exclude<DetectionType, '全部'>
  name: string
  org: string
  price: number
  cycleDays: number
  sold: string
  iconName: string
  imgBg: string
  tags: string[]
}

interface DetectionInstitution {
  id: string
  name: string
  certs: string[]
  location: string
  region: Exclude<InstitutionRegion, '全国'>
  score: string
  serviceCount: number
  orderCount: string
  avgDays: number
  responseTime: string
}

const activeTab = ref<DetectionTabKey>('service')
const activeServiceType = ref<DetectionType>('全部')
const activeServiceSort = ref<ServiceSort>('综合推荐')
const activeInstitutionRegion = ref<InstitutionRegion>('全国')
const activeInstitutionCert = ref<InstitutionCert>('全部资质')

const serviceTypeOptions: DetectionType[] = ['全部', '材料检测', '电气安全', '汽车零部件', '环境可靠性', '食品检测', '化工检测']
const serviceSortOptions: ServiceSort[] = ['综合推荐', '出报告快', '价格优先']
const institutionRegionOptions: InstitutionRegion[] = ['全国', '湖南', '广东', '北京']
const institutionCertOptions: InstitutionCert[] = ['全部资质', 'CMA', 'CNAS']

const services = ref<DetectionService[]>([
  { type: '材料检测', name: '金属材料成分检测', org: '湖南质量检测研究院', price: 980, cycleDays: 3, sold: '1,286', iconName: 'lab', imgBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', tags: ['CMA', '3天出报告'] },
  { type: '电气安全', name: '电气安全检测', org: '广州检验检测认证集团', price: 1200, cycleDays: 5, sold: '876', iconName: 'electric', imgBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', tags: ['CNAS', '5天出报告'] },
  { type: '汽车零部件', name: '新能源电池包安全检测', org: '中汽研汽车检验中心', price: 8500, cycleDays: 7, sold: '312', iconName: 'battery', imgBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', tags: ['CMA', 'CNAS', '7天出报告'] },
  { type: '环境可靠性', name: '盐雾试验检测', org: '湖南工业检测技术有限公司', price: 1560, cycleDays: 4, sold: '732', iconName: 'automation', imgBg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', tags: ['环境可靠性', '4天出结果'] },
  { type: '食品检测', name: '食品安全快速检测', org: '长沙市食品药品检验所', price: 560, cycleDays: 1, sold: '2,104', iconName: 'food', imgBg: 'linear-gradient(135deg,#fef9c3,#fef08a)', tags: ['食品', '1天出报告'] },
  { type: '化工检测', name: '土壤污染物检测', org: '湖南省环境监测中心', price: 2400, cycleDays: 5, sold: '489', iconName: 'environment', imgBg: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)', tags: ['环境', '5天出报告'] },
])

const institutions = ref<DetectionInstitution[]>([
  { id: '1', name: '湖南质量检测研究院', certs: ['CMA', 'CNAS'], location: '湖南省长沙市', region: '湖南', score: '4.9', serviceCount: 128, orderCount: '2,341', avgDays: 3, responseTime: '8分钟' },
  { id: '2', name: '广州检验检测认证集团', certs: ['CMA'], location: '广东省广州市', region: '广东', score: '4.7', serviceCount: 96, orderCount: '1,872', avgDays: 5, responseTime: '15分钟' },
  { id: '3', name: '深圳华检技术服务有限公司', certs: ['CNAS'], location: '广东省深圳市', region: '广东', score: '4.8', serviceCount: 84, orderCount: '1,234', avgDays: 4, responseTime: '12分钟' },
  { id: '4', name: '中汽研汽车检验中心', certs: ['CNAS'], location: '北京市朝阳区', region: '北京', score: '4.8', serviceCount: 72, orderCount: '956', avgDays: 6, responseTime: '20分钟' },
])

const filteredServices = computed(() => {
  let result = [...services.value]

  if (activeServiceType.value !== '全部') {
    result = result.filter((item) => item.type === activeServiceType.value)
  }

  if (activeServiceSort.value === '出报告快') {
    result.sort((left, right) => left.cycleDays - right.cycleDays)
  } else if (activeServiceSort.value === '价格优先') {
    result.sort((left, right) => left.price - right.price)
  }

  return result
})

const filteredInstitutions = computed(() => institutions.value.filter((item) => {
  const matchRegion = activeInstitutionRegion.value === '全国' || item.region === activeInstitutionRegion.value
  const matchCert = activeInstitutionCert.value === '全部资质' || item.certs.includes(activeInstitutionCert.value)
  return matchRegion && matchCert
}))

function goOrder(item: DetectionService) {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: `/pages/order/create?service=${encodeURIComponent(item.name)}` })
}

function goConsult() {
  if (!ensureLoggedInForSubmitAction()) {
    return
  }

  uni.navigateTo({ url: '/pages/institution/consult' })
}

function goInstitutionDetail(id: string) {
  uni.navigateTo({ url: `/pages/institution/detail?id=${id}` })
}
</script>

<style scoped lang="scss">
.page-detection {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
}

.page-detection__header {
  flex: 1;
  min-height: 0;
  padding: 20rpx 32rpx 0;
  background: linear-gradient(180deg, #1e40af 0%, #2563eb 180rpx, #3b82f6 220rpx, #f0f4f8 220rpx, #f0f4f8 100%);
  position: relative;
  overflow: hidden;

  // Decorative amber orb
  &::before {
    content: '';
    position: absolute;
    top: -40rpx;
    right: -60rpx;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%);
    filter: blur(20rpx);
    pointer-events: none;
  }

  // Decorative emerald orb
  &::after {
    content: '';
    position: absolute;
    top: 80rpx;
    left: -40rpx;
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
    filter: blur(18rpx);
    pointer-events: none;
  }
}

.page-detection__header :deep(.app-search-placeholder) {
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.page-detection__header :deep(.app-tabs) {
  min-height: 0;
  position: relative;
  z-index: 1;
}

.page-detection__header :deep(.app-tabs__nav) {
  padding-bottom: 0;
}

.page-detection__header :deep(.app-tabs__nav-item) {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s ease;
}

.page-detection__header :deep(.app-tabs__nav-item--active) {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.1);
}

.page-detection__header :deep(.app-tabs__content) {
  margin: 24rpx -32rpx 0;
  padding: 24rpx 32rpx 0;
  background: #f0f4f8;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  position: relative;
  z-index: 1;
}

.page-detection__scroll {
  height: calc(100vh - 240rpx);
  padding: 8rpx 0 24rpx;
  box-sizing: border-box;
}

.page-detection__filter-panel {
  margin-bottom: 20rpx;
}

.page-detection__filter-scroll {
  white-space: nowrap;
}

.page-detection__filter-row {
  display: flex;
  gap: 12rpx;
  padding-bottom: 12rpx;
}

.page-detection__chip {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(219, 234, 254, 0.6);
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 500;
  transition: all 0.25s ease;
}

.page-detection__chip--muted {
  background: rgba(226, 232, 240, 0.6);
  color: #475569;
}

.page-detection__chip--active {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.2);
}

.card-grid {
  @include service-card-grid(null, 16rpx);
}

.service-card {
  @include service-card-shell(20rpx);
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card__media {
  @include service-card-media(160rpx);
}

.service-card__body {
  @include service-card-body(20rpx);
}

.service-card__title {
  @include service-card-title(26rpx, 1.375);
}

.service-card__org {
  @include service-card-org(20rpx, #64748b, 4rpx);
}

.service-card__price-row {
  @include service-card-price-row(12rpx);
}

.service-card__price {
  @include service-card-price(26rpx);
}

.service-card__sold {
  @include service-card-sold(20rpx);
}

.service-card__tags {
  @include service-card-tags(10rpx, null, 6rpx);
}

.service-card__tag {
  @include service-card-tag(18rpx, 6rpx, 4rpx 12rpx);
  color: #2563eb;
  background: #eff6ff;
  transition: all 0.2s ease;
}

.service-card__actions {
  @include service-card-actions(16rpx, 10rpx);
}

.institution-card {
  margin-bottom: 16rpx;
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  padding: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.institution-card__head {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.institution-card__avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(37, 99, 235, 0.08);
}

.institution-card__main {
  flex: 1;
}

.institution-card__name {
  display: block;
  margin-bottom: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.institution-card__certs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.institution-card__cert {
  @include pill-tag(20rpx, 6rpx, 4rpx 12rpx);
  @include pill-tag-tone(#2563eb, #eff6ff);
  transition: all 0.2s ease;
}

.institution-card__meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.institution-card__location {
  display: block;
  font-size: 22rpx;
  color: #64748b;
}

.institution-card__score {
  flex-shrink: 0;
  text-align: center;
}

.institution-card__score-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #d97706;
}

.institution-card__score-label {
  display: block;
  font-size: 20rpx;
  color: #94a3b8;
}

.institution-card__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 18rpx;
}

.institution-card__stat {
  text-align: center;
}

.institution-card__stat-value {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}

.institution-card__stat-label {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #64748b;
}

.institution-card__actions {
  @include service-card-actions(null, 12rpx);
}
</style>
