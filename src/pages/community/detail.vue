<template>
  <view class="page-community-detail">
    <view class="page-community-detail__texture page-community-detail__texture--grid" />
    <view class="page-community-detail__texture page-community-detail__texture--glow" />

    <scroll-view scroll-y class="page-community-detail__scroll">
      <view class="page-community-detail__content">
        <view class="community-hero">
          <view class="community-hero__chips">
            <text class="community-chip community-chip--solid">{{ detail.tag }}</text>
            <text class="community-chip community-chip--muted">{{ detailDateText }}</text>
          </view>
          <text class="community-hero__title">{{ detail.title }}</text>
          <text v-if="heroMetaDisplay" class="community-hero__meta">{{ heroMetaDisplay }}</text>
          <text v-if="detail.secondaryMeta" class="community-hero__sub-meta">{{ detail.secondaryMeta }}</text>

          <view class="community-hero__stats">
            <view class="community-stat">
              <text class="community-stat__value">{{ readingMinutesText }}</text>
              <text class="community-stat__label">预计阅读</text>
            </view>
            <view class="community-stat">
              <text class="community-stat__value">{{ contentLengthText }}</text>
              <text class="community-stat__label">正文长度</text>
            </view>
            <view class="community-stat">
              <text class="community-stat__value">{{ paragraphCountText }}</text>
              <text class="community-stat__label">段落结构</text>
            </view>
          </view>
        </view>

        <view v-if="loading" class="community-panel community-panel--loading">
          <view class="skeleton skeleton--line-lg" />
          <view class="skeleton skeleton--line" />
          <view class="skeleton skeleton--line" />
          <view class="skeleton skeleton--line-sm" />
        </view>

        <view v-else class="community-layout">
          <view class="community-panel community-article">
            <image v-if="detail.coverUrl" :src="detail.coverUrl" class="community-article__cover" mode="aspectFill" />

            <view v-if="detail.summary" class="community-lead">
              <text class="community-lead__label">导读</text>
              <text class="community-lead__text">{{ detail.summary }}</text>
            </view>

            <view class="community-article__body">
              <view class="community-section-head">
                <text class="community-section-head__title">正文内容</text>
              </view>

              <rich-text v-if="detail.contentIsHtml" class="community-section__richtext" :nodes="detail.content" />

              <view v-else class="community-section__paragraphs">
                <text v-for="(paragraph, index) in contentParagraphs" :key="`paragraph-${index}`" class="community-section__paragraph">
                  {{ paragraph }}
                </text>
                <text v-if="contentParagraphs.length === 0" class="community-section__empty">暂无详细内容</text>
              </view>
            </view>
          </view>

          <view class="community-panel community-side">
            <text class="community-side__title">文档信息</text>

            <view v-if="showSourceRow" class="community-side__rows">
              <view class="community-side__row">
                <text class="community-side__label">来源类型</text>
                <text class="community-side__value">{{ sourceLabel }}</text>
              </view>
            </view>

            <view v-if="detail.attachmentUrl" class="community-attachment">
              <text class="community-attachment__title">附件资料</text>
              <text class="community-attachment__url">{{ detail.attachmentUrl }}</text>
              <AppButton block size="small" tone="brand" variant="primary" text="复制附件链接" @click="copyAttachment" />
            </view>

            <view v-else class="community-side__empty">
              <text class="community-side__empty-text">当前内容暂未提供附件</text>
            </view>
          </view>
        </view>

        <view v-if="errorMessage && !loading" class="community-error">
          <text class="community-error__title">详情加载失败</text>
          <text class="community-error__desc">{{ errorMessage }}</text>
          <AppButton block size="small" tone="brand" variant="primary" text="重试加载" @click="reloadDetail" />
        </view>
      </view>
    </scroll-view>

    <AppUiProvider id="app-ui-provider" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppButton from '@/components/ui/AppButton/index.vue'
import AppUiProvider from '@/components/ui/AppUiProvider/index.vue'
import { getKnowledgeDetail } from '@/services/api/content'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast } from '@/services/ui/toast'

type ApiRecord = Record<string, any>
type DetailSource = 'knowledge' | 'news'
type DetailArticleType = 1 | 2

interface CommunityDetailView {
  attachmentUrl: string
  content: string
  contentIsHtml: boolean
  coverUrl: string
  metaLine: string
  secondaryMeta: string
  source: DetailSource
  summary: string
  tag: string
  title: string
}

const loading = ref(false)
const errorMessage = ref('')
const currentArticleType = ref<DetailArticleType>(1)
const currentId = ref('')
const detail = ref<CommunityDetailView>({
  attachmentUrl: '',
  content: '',
  contentIsHtml: false,
  coverUrl: '',
  metaLine: '质量社区',
  secondaryMeta: '',
  source: 'knowledge',
  summary: '',
  tag: '知识库',
  title: '质量社区详情',
})

const contentParagraphs = computed(() => {
  if (detail.value.contentIsHtml) {
    return []
  }

  return detail.value.content
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
})

const sourceLabel = computed(() => {
  if (detail.value.source === 'news') {
    return '资讯'
  }

  return '知识库'
})

const showSourceRow = computed(() => sourceLabel.value !== detail.value.tag)

const detailDateText = computed(() => {
  const matched = detail.value.metaLine.match(/\d{4}-\d{2}-\d{2}/)
  return matched ? matched[0] : '最新更新'
})

const heroMetaLine = computed(() => {
  const meta = detail.value.metaLine.trim()
  if (!meta) {
    return ''
  }

  const prefixes = [detail.value.tag, sourceLabel.value].filter(Boolean)
  for (const prefix of prefixes) {
    if (meta.startsWith(`${prefix} · `)) {
      return meta.slice(prefix.length + 3)
    }
  }

  return meta
})

const heroMetaDisplay = computed(() => {
  const meta = heroMetaLine.value
  const dateText = detailDateText.value

  if (!meta) {
    return ''
  }

  if (!dateText || dateText === '最新更新') {
    return meta
  }

  if (meta === dateText) {
    return ''
  }

  const withoutDate = meta.replace(dateText, '').trim()
  if (!withoutDate) {
    return ''
  }

  return withoutDate.replace(/^[·|｜/\-\s]+|[·|｜/\-\s]+$/g, '').trim()
})

const contentTextLength = computed(() => {
  if (!detail.value.content) {
    return 0
  }

  const plain = detail.value.contentIsHtml ? detail.value.content.replace(/<[^>]*>/g, '') : detail.value.content
  return plain.replace(/\s+/g, '').length
})

const contentLengthText = computed(() => {
  const length = contentTextLength.value
  return length > 0 ? `${length.toLocaleString()}字` : '--'
})

const paragraphCountText = computed(() => {
  if (detail.value.contentIsHtml) {
    const roughSegments = detail.value.content.match(/<(p|li|h[1-6]|blockquote)(\s|>)/gi)
    const count = roughSegments?.length ?? 0
    return count > 0 ? `${count}段` : '--'
  }

  return contentParagraphs.value.length > 0 ? `${contentParagraphs.value.length}段` : '--'
})

const readingMinutesText = computed(() => {
  if (!contentTextLength.value) {
    return '--'
  }

  const minutes = Math.max(1, Math.round(contentTextLength.value / 420))
  return `${minutes}分钟`
})

function isObject(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function decodeText(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  const source = value.trim()
  if (!source) {
    return ''
  }

  try {
    return decodeURIComponent(source)
  } catch {
    return source
  }
}

function toText(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return 0
}

function pickDateText(value: unknown) {
  const text = toText(value)
  if (!text) {
    return '最新更新'
  }

  const matched = text.match(/\d{4}-\d{2}-\d{2}/)
  if (matched) {
    return matched[0]
  }

  return text
}

function hasHtmlContent(value: string) {
  return /<[^>]+>/.test(value)
}

function parseArticleType(value: unknown): DetailArticleType | 0 {
  const text = (typeof value === 'string' ? decodeText(value) : toText(value)).toLowerCase()
  if (text === '1' || text === 'knowledge' || text === '知识库') {
    return 1
  }

  if (
    text === '2'
    || text === 'news'
    || text === '资讯'
    || text === 'policy'
    || text === 'standard'
    || text === '政策速递'
    || text === '标准动态'
  ) {
    return 2
  }

  return 0
}

function resolveDetailSourceByType(articleType: DetailArticleType): DetailSource {
  return articleType === 1 ? 'knowledge' : 'news'
}

function mapKnowledgeDetail(raw: ApiRecord, fallbackArticleType: DetailArticleType) {
  const title = toText(raw.title) || '质量知识文章'
  const summary = toText(raw.summary)
  const content = toText(raw.content) || summary
  const viewCount = toNumber(raw.viewCount)
  const articleType = parseArticleType(raw.articleType) || fallbackArticleType
  const tag = articleType === 1 ? '知识库' : '资讯'
  const publisherName = toText(raw.publisherName)
  const dateText = pickDateText(raw.updateTime || raw.createTime)
  const metaLine = [publisherName || tag, dateText].filter(Boolean).join(' · ') || dateText

  return {
    attachmentUrl: '',
    content,
    contentIsHtml: hasHtmlContent(content),
    coverUrl: toText(raw.coverUrl),
    metaLine,
    secondaryMeta: viewCount > 0 ? `阅读 ${viewCount.toLocaleString()}` : '',
    source: resolveDetailSourceByType(articleType),
    summary,
    tag,
    title,
  }
}

function applyQuerySeed(query: Record<string, unknown>) {
  const title = decodeText(query.title)
  const tag = decodeText(query.tag)
  const meta = decodeText(query.meta)

  if (title) {
    detail.value.title = title
  }

  if (tag) {
    detail.value.tag = tag
  }

  if (meta) {
    detail.value.metaLine = meta
  }
}
async function loadDetail() {
  if (!currentId.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''
  const seed = { ...detail.value }

  try {
    const raw = await getKnowledgeDetail(currentId.value, {
      articleType: currentArticleType.value,
    })
    if (isObject(raw)) {
      const mapped = mapKnowledgeDetail(raw, currentArticleType.value)
      currentArticleType.value = mapped.source === 'knowledge' ? 1 : 2
      detail.value = {
        ...seed,
        ...mapped,
        metaLine: mapped.metaLine || seed.metaLine,
        tag: mapped.tag || seed.tag,
        title: mapped.title || seed.title,
      }
    }
  } catch (error) {
    const message = getErrorMessage(error, '网络波动，请稍后重试')
    errorMessage.value = message
    showFailToast(message)
  } finally {
    loading.value = false
  }
}

async function reloadDetail() {
  await loadDetail()
}

function copyAttachment() {
  if (!detail.value.attachmentUrl) {
    return
  }

  uni.setClipboardData({
    data: detail.value.attachmentUrl,
    fail: () => showFailToast('复制失败，请稍后重试'),
    success: () => showAppToast({ icon: 'none', message: '附件链接已复制' }),
  })
}

onLoad((query) => {
  const id = decodeText(query?.id)
  const articleType = parseArticleType(query?.articleType)
    || parseArticleType(query?.type)
    || parseArticleType(query?.source)
    || 1

  if (!id) {
    errorMessage.value = '参数不完整，无法加载内容'
    showFailToast('页面参数异常')
    return
  }

  currentArticleType.value = articleType
  currentId.value = id
  detail.value.source = resolveDetailSourceByType(articleType)
  applyQuerySeed((query ?? {}) as Record<string, unknown>)
  void loadDetail()
})
</script>

<style scoped lang="scss">
.page-community-detail {
  --ink-900: #1f2f43;
  --ink-700: #465a73;
  --ink-500: #70829a;
  --brand-700: #1e61ff;
  --brand-600: #3f7dff;
  --accent-600: #ff8a00;

  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: var(--ink-900);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background:
    radial-gradient(220rpx 220rpx at 96% 8%, rgba(255, 138, 0, 0.08), transparent 75%),
    radial-gradient(280rpx 280rpx at 4% 22%, rgba(30, 97, 255, 0.09), transparent 76%),
    linear-gradient(180deg, #f4f8ff 0%, #f8fbff 52%, #f5f7fb 100%);
}

.page-community-detail__texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.page-community-detail__texture--grid {
  opacity: 0.06;
  background-image:
    linear-gradient(to right, rgba(30, 97, 255, 0.18) 1rpx, transparent 1rpx),
    linear-gradient(to bottom, rgba(30, 97, 255, 0.18) 1rpx, transparent 1rpx);
  background-size: 48rpx 48rpx;
}

.page-community-detail__texture--glow {
  background:
    radial-gradient(300rpx 300rpx at 108% -8%, rgba(255, 138, 0, 0.06), transparent 72%),
    radial-gradient(320rpx 320rpx at -8% 34%, rgba(30, 97, 255, 0.08), transparent 74%);
}

.page-community-detail__scroll {
  height: 100vh;
  position: relative;
  z-index: 2;
}

.page-community-detail__content {
  padding: 24rpx 24rpx calc(56rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.community-hero {
  position: relative;
  overflow: hidden;
  border-radius: 26rpx;
  padding: 28rpx 26rpx 24rpx;
  border: 1rpx solid rgba(30, 97, 255, 0.18);
  background: linear-gradient(132deg, #eaf2ff 0%, #f7fbff 52%, #edf5ff 100%);
  box-shadow: 0 10rpx 24rpx rgba(30, 97, 255, 0.1);
  animation: rise-in 360ms ease-out both;
}

.community-hero::after {
  content: '';
  position: absolute;
  right: -40rpx;
  top: -46rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(30, 97, 255, 0.12) 0%, rgba(30, 97, 255, 0) 72%);
}

.community-hero__chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
}

.community-chip {
  min-height: 46rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  color: #4e6582;
  font-size: 22rpx;
  line-height: 46rpx;
  border: 1rpx solid rgba(30, 97, 255, 0.2);
  background: rgba(255, 255, 255, 0.88);
}

.community-chip--solid {
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(135deg, #1e61ff 0%, #4e89ff 100%);
}

.community-chip--muted {
  color: #5f7390;
}

.community-hero__title {
  display: block;
  margin-top: 14rpx;
  color: #1b304b;
  font-size: 38rpx;
  line-height: 1.44;
  font-weight: 700;
  letter-spacing: 0.2rpx;
  white-space: normal;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.community-hero__meta {
  display: block;
  margin-top: 10rpx;
  color: #4f6581;
  font-size: 24rpx;
  line-height: 1.62;
  white-space: normal;
}

.community-hero__sub-meta {
  display: block;
  margin-top: 8rpx;
  color: #6f8198;
  font-size: 23rpx;
  line-height: 1.58;
  white-space: normal;
}

.community-hero__stats {
  margin-top: 18rpx;
  display: flex;
  gap: 12rpx;
}

.community-stat {
  flex: 1;
  border-radius: 16rpx;
  padding: 14rpx 10rpx 12rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(30, 97, 255, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.community-stat__value {
  color: #1e61ff;
  font-size: 29rpx;
  font-weight: 700;
}

.community-stat__label {
  color: #6d819b;
  font-size: 22rpx;
}

.community-layout {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  animation: rise-in 420ms ease-out 70ms both;
}

.community-panel {
  border-radius: 22rpx;
  border: 1rpx solid #e1e9f5;
  background: #ffffff;
  box-shadow: 0 8rpx 18rpx rgba(38, 76, 138, 0.06);
}

.community-article {
  padding: 22rpx 22rpx 24rpx;
}

.community-side {
  padding: 22rpx;
}

.community-panel--loading {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.skeleton {
  border-radius: 14rpx;
  background: linear-gradient(90deg, #edf2fa 20%, #f7f9fd 40%, #edf2fa 60%);
  background-size: 320rpx 100%;
  animation: skeleton-flow 1.1s ease-in-out infinite;
}

.skeleton--line-lg {
  height: 54rpx;
}

.skeleton--line {
  height: 30rpx;
}

.skeleton--line-sm {
  width: 62%;
  height: 30rpx;
}

@keyframes skeleton-flow {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

.community-article__cover {
  display: block;
  width: 100%;
  height: 440rpx;
  border-radius: 18rpx;
  margin-bottom: 18rpx;
  background: #dce8f8;
}

.community-lead {
  margin-bottom: 18rpx;
  border-radius: 16rpx;
  padding: 16rpx 18rpx;
  border-left: 8rpx solid var(--accent-600);
  background: #fff9f0;
  box-shadow: inset 0 0 0 1rpx rgba(255, 138, 0, 0.16);
}

.community-lead__label {
  display: block;
  color: var(--accent-600);
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1.2rpx;
}

.community-lead__text {
  display: block;
  margin-top: 8rpx;
  color: var(--ink-700);
  font-size: 26rpx;
  line-height: 1.74;
}

.community-article__body {
  border-top: 1rpx solid #e8eef7;
  padding-top: 18rpx;
}

.community-section-head {
  margin-bottom: 14rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.community-section-head::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #1e61ff 0%, #5e90ff 100%);
}

.community-section-head__title {
  color: var(--ink-900);
  font-size: 30rpx;
  font-weight: 700;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.community-section__richtext {
  color: var(--ink-700);
  font-size: 28rpx;
  line-height: 1.88;
}

.community-section__richtext :deep(img) {
  display: block;
  max-width: 100%;
  border-radius: 14rpx;
  margin: 14rpx auto;
}

.community-section__richtext :deep(p),
.community-section__richtext :deep(div),
.community-section__richtext :deep(span),
.community-section__richtext :deep(li) {
  color: var(--ink-700);
  font-size: 28rpx;
  line-height: 1.88;
}

.community-section__richtext :deep(p),
.community-section__richtext :deep(li) {
  margin-bottom: 16rpx;
}

.community-section__paragraphs {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.community-section__paragraph {
  color: var(--ink-700);
  font-size: 28rpx;
  line-height: 1.9;
  text-indent: 0;
  text-align: justify;
}

.community-section__empty {
  color: var(--ink-500);
  font-size: 24rpx;
}

.community-side__title {
  color: var(--ink-900);
  font-size: 28rpx;
  font-weight: 700;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.community-side__rows {
  margin-top: 14rpx;
  border-radius: 14rpx;
  background: #f7faff;
  border: 1rpx solid rgba(30, 97, 255, 0.12);
}

.community-side__row {
  min-height: 72rpx;
  padding: 14rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.community-side__label {
  color: var(--ink-500);
  font-size: 24rpx;
}

.community-side__value {
  color: var(--ink-900);
  font-size: 25rpx;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.community-attachment {
  margin-top: 16rpx;
  border-radius: 16rpx;
  padding: 18rpx;
  background: #f7faff;
  border: 1rpx solid rgba(30, 97, 255, 0.16);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.community-attachment__title {
  color: var(--brand-700);
  font-size: 24rpx;
  font-weight: 700;
}

.community-attachment__url {
  color: #3f5f87;
  font-size: 24rpx;
  line-height: 1.62;
  word-break: break-all;
}

.community-side__empty {
  margin-top: 16rpx;
  border-radius: 14rpx;
  border: 1rpx dashed rgba(112, 130, 154, 0.45);
  background: #f9fbff;
  padding: 18rpx;
}

.community-side__empty-text {
  color: var(--ink-500);
  font-size: 24rpx;
}

.community-error {
  border-radius: 18rpx;
  padding: 22rpx;
  border: 1rpx solid rgba(255, 138, 0, 0.24);
  background: #fff8ef;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.community-error__title {
  color: #8f3520;
  font-size: 28rpx;
  font-weight: 700;
}

.community-error__desc {
  color: #975426;
  font-size: 24rpx;
  line-height: 1.62;
}

.community-attachment :deep(.van-button),
.community-error :deep(.van-button) {
  font-weight: 600;
  letter-spacing: 0.3rpx;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(14rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 360px) {
  .community-hero__title {
    font-size: 34rpx;
  }

  .community-stat__value {
    font-size: 28rpx;
  }
}
</style>
