<template>
  <view class="page-mall">
    <view class="page-mall__header">
      <view class="page-mall__search">
        <text class="page-mall__search-icon">🔍</text>
        <text class="page-mall__search-text">搜索商品名称、品牌、软件名称、耗材关键词</text>
      </view>

      <scroll-view class="page-mall__category-scroll" scroll-x>
        <view class="page-mall__category-row">
          <text
            v-for="category in categories"
            :key="category.key"
            class="page-mall__category-chip"
            :class="{ 'page-mall__category-chip--active': activeCategory === category.key }"
            @tap="setCategory(category.key)"
          >{{ category.label }}</text>
        </view>
      </scroll-view>

      <view class="page-mall__filter-grid">
        <view class="page-mall__filter-item">
          <text>分类：全部商品</text>
          <text>⌄</text>
        </view>
        <view class="page-mall__filter-item">
          <text>排序：综合推荐</text>
          <text>⌄</text>
        </view>
        <view class="page-mall__filter-item">
          <text>价格区间</text>
          <text>⌄</text>
        </view>
        <view class="page-mall__filter-item">
          <text>品牌/软件类型</text>
          <text>⌄</text>
        </view>
      </view>
    </view>

    <scroll-view class="page-mall__scroll" scroll-y>
      <view class="page-mall__content">
        <view class="mall-grid">
          <view v-for="item in filteredItems" :key="item.id" class="mall-card">
            <view class="mall-card__media" :style="{ background: item.bg }">
              <text class="mall-card__emoji">{{ item.emoji }}</text>
            </view>
            <view class="mall-card__body">
              <text class="mall-card__title">{{ item.name }}</text>
              <text class="mall-card__shop">{{ item.shop }}</text>
              <view class="mall-card__price-row">
                <text class="mall-card__price">¥{{ item.price }}</text>
                <text class="mall-card__sold">已售 {{ item.sold }}</text>
              </view>
              <view class="mall-card__tags">
                <text v-for="tag in item.tags" :key="tag" class="mall-card__tag">{{ tag }}</text>
              </view>
              <view class="mall-card__actions">
                <view class="mall-card__btn mall-card__btn--ghost" @tap="noop">{{ item.leftAction }}</view>
                <view class="mall-card__btn mall-card__btn--primary" @tap="noop">{{ item.rightAction }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { showAppToast } from '@/services/ui/toast'

type MallCategory = 'all' | 'consumables' | 'equipment' | 'software' | 'standard' | 'office'

interface MallItem {
  id: string
  key: Exclude<MallCategory, 'all'>
  name: string
  shop: string
  price: string
  sold: string
  tags: string[]
  emoji: string
  bg: string
  leftAction: string
  rightAction: string
}

const activeCategory = ref<MallCategory>('all')

const categories: Array<{ key: MallCategory; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'consumables', label: '检测耗材' },
  { key: 'equipment', label: '仪器设备' },
  { key: 'software', label: '小工具软件' },
  { key: 'standard', label: '标准资料' },
  { key: 'office', label: '办公周边' },
]

const items = ref<MallItem[]>([
  { id: '1', key: 'consumables', name: '样品瓶 / 采样袋套装', shop: '质检实验耗材旗舰店', price: '69起', sold: '2,486', tags: ['实验耗材', '次日达'], emoji: '🧴', bg: 'linear-gradient(135deg,#eff6ff 0%,#ecfeff 100%)', leftAction: '加入购物车', rightAction: '立即购买' },
  { id: '2', key: 'equipment', name: '标签打印机（实验室专用）', shop: '质量数智设备商城', price: '399起', sold: '684', tags: ['蓝牙连接', '支持模板'], emoji: '🖨️', bg: 'linear-gradient(135deg,#fffbeb 0%,#fff1f2 100%)', leftAction: '加入购物车', rightAction: '立即购买' },
  { id: '3', key: 'software', name: '检测报告模板管理软件', shop: '质享数字工具中心', price: '1,280/年', sold: '236', tags: ['SaaS工具', '多人协同'], emoji: '💻', bg: 'linear-gradient(135deg,#f5f3ff 0%,#e0e7ff 100%)', leftAction: '试用', rightAction: '立即开通' },
  { id: '4', key: 'consumables', name: '快速检测试纸组合包', shop: '检测耗材供应中心', price: '128起', sold: '1,126', tags: ['现货', '适配多场景'], emoji: '📦', bg: 'linear-gradient(135deg,#ecfdf5 0%,#ecfeff 100%)', leftAction: '加入购物车', rightAction: '立即购买' },
  { id: '5', key: 'standard', name: '标准资料电子包（含更新）', shop: '标准资料下载中心', price: '299起', sold: '512', tags: ['电子交付', '持续更新'], emoji: '📚', bg: 'linear-gradient(135deg,#eff6ff 0%,#e0e7ff 100%)', leftAction: '收藏', rightAction: '立即购买' },
  { id: '6', key: 'software', name: '实验记录与巡检小程序', shop: '质量应用软件商城', price: '980/年', sold: '147', tags: ['小软件', '移动端'], emoji: '🧰', bg: 'linear-gradient(135deg,#fffbeb 0%,#ecfeff 100%)', leftAction: '试用', rightAction: '立即开通' },
  { id: '7', key: 'equipment', name: '便携电源与备用电池套装', shop: '质量检测外业装备店', price: '1,980起', sold: '547', tags: ['外业装备', '多规格可选'], emoji: '🔋', bg: 'linear-gradient(135deg,#eef2ff 0%,#ecfeff 100%)', leftAction: '加入购物车', rightAction: '立即购买' },
  { id: '8', key: 'standard', name: '质量手册模板包（可编辑）', shop: '标准资料下载中心', price: '188起', sold: '856', tags: ['模板资料', '可编辑'], emoji: '📜', bg: 'linear-gradient(135deg,#eff6ff 0%,#ecfeff 100%)', leftAction: '收藏', rightAction: '立即购买' },
  { id: '9', key: 'software', name: '现场取样登记 App 授权', shop: '质量应用软件商城', price: '520/年', sold: '632', tags: ['移动软件', '拍照留档'], emoji: '📱', bg: 'linear-gradient(135deg,#fffbeb 0%,#fff1f2 100%)', leftAction: '试用', rightAction: '立即开通' },
  { id: '10', key: 'office', name: '设备点检标签与台账贴纸', shop: '办公与标识用品店', price: '56起', sold: '318', tags: ['标识用品', '防水耐磨'], emoji: '🪪', bg: 'linear-gradient(135deg,#ecfdf5 0%,#ecfeff 100%)', leftAction: '加入购物车', rightAction: '立即购买' },
])

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') {
    return items.value
  }

  return items.value.filter((item) => item.key === activeCategory.value)
})

function setCategory(category: MallCategory) {
  activeCategory.value = category
}

function noop() {
  showAppToast({ message: '功能开发中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.page-mall {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.page-mall__header {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: rgba(255, 255, 255, 0.98);
}

.page-mall__search {
  border-radius: 18rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  padding: 14rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.page-mall__search-icon {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 24rpx;
}

.page-mall__search-text {
  color: #94a3b8;
  font-size: 22rpx;
}

.page-mall__category-scroll {
  margin-top: 14rpx;
  white-space: nowrap;
}

.page-mall__category-row {
  display: flex;
  gap: 10rpx;
}

.page-mall__category-chip {
  flex-shrink: 0;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 22rpx;
}

.page-mall__category-chip--active {
  background: #2563eb;
  color: #ffffff;
}

.page-mall__filter-grid {
  margin-top: 14rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.page-mall__filter-item {
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding: 12rpx 14rpx;
  color: #64748b;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-mall__scroll {
  flex: 1;
  min-height: 0;
}

.page-mall__content {
  padding: 18rpx 24rpx 28rpx;
  box-sizing: border-box;
}

.mall-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.mall-card {
  border-radius: 20rpx;
  overflow: hidden;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.06);
}

.mall-card__media {
  height: 168rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mall-card__emoji {
  font-size: 58rpx;
}

.mall-card__body {
  padding: 16rpx;
}

.mall-card__title {
  display: block;
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.45;
}

.mall-card__shop {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 20rpx;
}

.mall-card__price-row {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.mall-card__price {
  color: #2563eb;
  font-size: 25rpx;
  font-weight: 700;
}

.mall-card__sold {
  color: #94a3b8;
  font-size: 18rpx;
}

.mall-card__tags {
  margin-top: 8rpx;
  display: flex;
  gap: 6rpx;
  flex-wrap: wrap;
}

.mall-card__tag {
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  background: #eff6ff;
  color: #2563eb;
  font-size: 17rpx;
}

.mall-card__actions {
  margin-top: 12rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8rpx;
}

.mall-card__btn {
  border-radius: 12rpx;
  text-align: center;
  font-size: 20rpx;
  padding: 10rpx 0;
  font-weight: 600;
}

.mall-card__btn--ghost {
  background: #f1f5f9;
  color: #334155;
}

.mall-card__btn--primary {
  background: #2563eb;
  color: #ffffff;
}
</style>
