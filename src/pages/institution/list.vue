<template>
  <view class="page-institution-list">
    <view class="page-institution-list__header">
      <view class="page-institution-list__search-row">
        <view class="page-institution-list__search-box">
          <text class="page-institution-list__search-text">🔍 搜索检测项目 / 机构 / 认证服务</text>
        </view>
        <text class="page-institution-list__filter-toggle" @tap="showFilter=!showFilter">筛选</text>
      </view>

      <view v-if="showFilter" class="page-institution-list__filter-panel">
        <text class="page-institution-list__filter-hint">（展示筛选条件，正常情况这个面板是隐藏的）</text>
        <view class="page-institution-list__filter-group">
          <text class="page-institution-list__filter-title">服务类型</text>
          <view class="page-institution-list__chip-wrap">
            <text
              v-for="t in serviceTypes" :key="t"
              class="page-institution-list__filter-chip"
              :class="{ 'page-institution-list__filter-chip--active': activeTypes.includes(t) }"
              @tap="toggleType(t)">{{ t }}</text>
          </view>
        </view>
        <view class="page-institution-list__filter-group">
          <text class="page-institution-list__filter-title">所在省份</text>
          <view class="page-institution-list__chip-wrap">
            <text
              v-for="p in provinces" :key="p"
              class="page-institution-list__filter-chip"
              :class="{ 'page-institution-list__filter-chip--active': activeProvince===p }"
              @tap="activeProvince=p">{{ p }}</text>
          </view>
        </view>
        <view class="page-institution-list__filter-group">
          <text class="page-institution-list__filter-title">资质认证</text>
          <view class="page-institution-list__chip-wrap">
            <text
              v-for="c in certs" :key="c"
              class="page-institution-list__filter-chip"
              :class="{ 'page-institution-list__filter-chip--active': activeCerts.includes(c) }"
              @tap="toggleCert(c)">{{ c }}</text>
          </view>
        </view>
        <view class="page-institution-list__filter-actions">
          <text class="page-institution-list__action-btn page-institution-list__action-btn--secondary" @tap="resetFilter">重置</text>
          <text class="page-institution-list__action-btn page-institution-list__action-btn--primary" @tap="showFilter=false">确定</text>
        </view>
      </view>

      <scroll-view class="page-institution-list__sort-scroll" scroll-x>
        <view class="page-institution-list__sort-wrap">
          <text
            v-for="s in sortOptions" :key="s.key"
            class="page-institution-list__sort-chip"
            :class="{ 'page-institution-list__sort-chip--active': activeSort===s.key }"
            @tap="activeSort=s.key">{{ s.label }}</text>
        </view>
      </scroll-view>
    </view>

    <scroll-view class="page-institution-list__list-scroll" scroll-y>
      <view
        v-for="inst in institutions" :key="inst.id"
        class="page-institution-list__card">
        <view class="page-institution-list__card-head">
          <view class="page-institution-list__avatar">
            <text class="page-institution-list__avatar-icon">🏛️</text>
          </view>
          <view class="page-institution-list__card-main">
            <text class="page-institution-list__name">{{ inst.name }}</text>
            <view class="page-institution-list__cert-wrap">
              <text v-for="c in inst.certs" :key="c" class="page-institution-list__cert">{{ c }}</text>
            </view>
            <text class="page-institution-list__location">📍 {{ inst.location }}</text>
          </view>
          <view class="page-institution-list__score">
            <text class="page-institution-list__score-value">{{ inst.score }}</text>
            <text class="page-institution-list__score-label">评分</text>
          </view>
        </view>
        <view class="page-institution-list__stats">
          <view class="page-institution-list__stat-item">
            <text class="page-institution-list__stat-value">{{ inst.serviceCount }}</text>
            <text class="page-institution-list__stat-label">服务项目</text>
          </view>
          <view class="page-institution-list__stat-item">
            <text class="page-institution-list__stat-value">{{ inst.orderCount }}</text>
            <text class="page-institution-list__stat-label">累计订单</text>
          </view>
          <view class="page-institution-list__stat-item">
            <text class="page-institution-list__stat-value">{{ inst.avgDays }}天</text>
            <text class="page-institution-list__stat-label">平均周期</text>
          </view>
          <view class="page-institution-list__stat-item">
            <text class="page-institution-list__stat-value">{{ inst.responseTime }}</text>
            <text class="page-institution-list__stat-label">响应时间</text>
          </view>
        </view>
        <view class="page-institution-list__card-actions">
          <text class="page-institution-list__action-btn page-institution-list__action-btn--secondary" @tap="goConsult">立即咨询</text>
          <text class="page-institution-list__action-btn page-institution-list__action-btn--primary" @tap="goDetail(inst)">查看详情</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const showFilter = ref(false)
const activeSort = ref('quality')
const activeTypes = ref(['检测'])
const activeProvince = ref('湖南省')
const activeCerts = ref(['CMA'])
const serviceTypes = ['检测','认证','计量','标准','诊断','培训']
const provinces = ['全部','湖南省','广东省','北京市','江苏省']
const certs = ['CMA','CNAS','ILAC','CAL']
const sortOptions = [
  { key: 'quality', label: '服务质量' },
  { key: 'cycle', label: '服务周期' },
  { key: 'score', label: '综合评分' },
  { key: 'price', label: '价格最低' },
]
const institutions = ref([
  { id:'1', name:'湖南质量检测研究院', certs:['CMA','CNAS'], location:'湖南省长沙市', score:'4.9', serviceCount:128, orderCount:'2,341', avgDays:3, responseTime:'8分钟' },
  { id:'2', name:'广州检验检测认证集团', certs:['CMA'], location:'广东省广州市', score:'4.7', serviceCount:96, orderCount:'1,872', avgDays:5, responseTime:'15分钟' },
  { id:'3', name:'深圳华检技术服务有限公司', certs:['CNAS'], location:'广东省深圳市', score:'4.8', serviceCount:84, orderCount:'1,234', avgDays:4, responseTime:'12分钟' },
])
const toggleType = (t: string) => {
  const i = activeTypes.value.indexOf(t)
  if (i > -1) activeTypes.value.splice(i, 1)
  else activeTypes.value.push(t)
}
const toggleCert = (c: string) => {
  const i = activeCerts.value.indexOf(c)
  if (i > -1) activeCerts.value.splice(i, 1)
  else activeCerts.value.push(c)
}
const resetFilter = () => { activeTypes.value = []; activeProvince.value = '全部'; activeCerts.value = [] }
const goConsult = () => uni.navigateTo({ url: '/pages/institution/consult' })
const goDetail = (inst: any) => uni.navigateTo({ url: '/pages/institution/detail?id='+inst.id })
</script>

<style scoped lang="scss">
.page-institution-list {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.page-institution-list__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  padding: 24rpx 24rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.page-institution-list__search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.page-institution-list__search-box {
  flex: 1;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 18rpx 24rpx;
}

.page-institution-list__search-text {
  font-size: 24rpx;
  color: #94a3b8;
}

.page-institution-list__filter-toggle {
  flex-shrink: 0;
  font-size: 26rpx;
  font-weight: 500;
  color: #2563eb;
}

.page-institution-list__filter-panel {
  margin-bottom: 16rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  background: #ffffff;
  padding: 24rpx;
}

.page-institution-list__filter-hint {
  display: block;
  margin-bottom: 16rpx;
  font-size: 20rpx;
  color: #94a3b8;
}

.page-institution-list__filter-group {
  margin-bottom: 20rpx;
}

.page-institution-list__filter-title {
  display: block;
  margin-bottom: 12rpx;
  font-size: 22rpx;
  color: #64748b;
}

.page-institution-list__chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.page-institution-list__filter-chip {
  border-radius: 10rpx;
  background: #f1f5f9;
  padding: 10rpx 24rpx;
  font-size: 22rpx;
  color: #475569;
}

.page-institution-list__filter-chip--active {
  background: #eff6ff;
  color: #2563eb;
}

.page-institution-list__filter-actions {
  display: flex;
  gap: 16rpx;
}

.page-institution-list__action-btn {
  flex: 1;
  border-radius: 12rpx;
  padding: 20rpx 0;
  text-align: center;
  font-size: 26rpx;
  font-weight: 500;
}

.page-institution-list__action-btn--secondary {
  background: #f1f5f9;
  color: #475569;
}

.page-institution-list__action-btn--primary {
  background: #2563eb;
  color: #ffffff;
}

.page-institution-list__sort-scroll {
  white-space: nowrap;
}

.page-institution-list__sort-wrap {
  display: flex;
  gap: 8rpx;
  padding-bottom: 20rpx;
}

.page-institution-list__sort-chip {
  white-space: nowrap;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  background: #f1f5f9;
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  color: #475569;
}

.page-institution-list__sort-chip--active {
  border-color: #2563eb;
  background: #ffffff;
  color: #2563eb;
}

.page-institution-list__list-scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
}

.page-institution-list__card {
  margin-bottom: 16rpx;
  border: 1rpx solid #f1f5f9;
  border-radius: 20rpx;
  background: #ffffff;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.page-institution-list__card-head {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.page-institution-list__avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-institution-list__avatar-icon {
  font-size: 40rpx;
}

.page-institution-list__card-main {
  flex: 1;
}

.page-institution-list__name {
  display: block;
  margin-bottom: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.page-institution-list__cert-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.page-institution-list__cert {
  border-radius: 6rpx;
  background: #eff6ff;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  color: #2563eb;
}

.page-institution-list__location {
  display: block;
  font-size: 22rpx;
  color: #64748b;
}

.page-institution-list__score {
  flex-shrink: 0;
  text-align: center;
}

.page-institution-list__score-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #d97706;
}

.page-institution-list__score-label {
  display: block;
  font-size: 20rpx;
  color: #94a3b8;
}

.page-institution-list__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  padding: 16rpx;
}

.page-institution-list__stat-item {
  text-align: center;
}

.page-institution-list__stat-value {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}

.page-institution-list__stat-label {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #64748b;
}

.page-institution-list__card-actions {
  display: flex;
  gap: 16rpx;
}
</style>
