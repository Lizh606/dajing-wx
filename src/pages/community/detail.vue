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
            <text class="community-side__title">信息卡片</text>

            <view v-if="showSourceRow" class="community-side__rows">
              <view class="community-side__row">
                <text class="community-side__label">来源类型</text>
                <text class="community-side__value">{{ sourceLabel }}</text>
              </view>
            </view>

            <view v-if="detail.attachmentUrl" class="community-attachment">
              <text class="community-attachment__title">附件资料</text>
              <text class="community-attachment__url">{{ detail.attachmentUrl }}</text>
              <AppButton
                custom-style="height: 70rpx; border-radius: 18rpx; background: #19526f; color: #ffffff; border: 0;"
                text="复制附件链接"
                @click="copyAttachment"
              />
            </view>

            <view v-else class="community-side__empty">
              <text class="community-side__empty-text">当前内容暂未提供附件</text>
            </view>
          </view>
        </view>

        <view v-if="errorMessage && !loading" class="community-error">
          <text class="community-error__title">详情加载失败</text>
          <text class="community-error__desc">{{ errorMessage }}</text>
          <AppButton
            custom-style="height: 72rpx; border-radius: 18rpx; background: #a8422a; color: #ffffff;"
            text="重试加载"
            @click="reloadDetail"
          />
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
import { getKnowledgeDetail, getPolicyDetail, getStandardDetail } from '@/services/api/content'
import { getErrorMessage } from '@/services/http'
import { showAppToast, showFailToast } from '@/services/ui/toast'

type ApiRecord = Record<string, any>
type DetailSource = 'knowledge' | 'policy' | 'standard'

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
const currentSource = ref<DetailSource>('knowledge')
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
  if (detail.value.source === 'policy') {
    return '政策速递'
  }

  if (detail.value.source === 'standard') {
    return '标准动态'
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

function mapKnowledgeDetail(raw: ApiRecord) {
  const title = toText(raw.title) || '质量知识文章'
  const summary = toText(raw.summary)
  const content = toText(raw.content) || summary
  const viewCount = toNumber(raw.viewCount)

  return {
    attachmentUrl: '',
    content,
    contentIsHtml: hasHtmlContent(content),
    coverUrl: toText(raw.coverUrl),
    metaLine: `知识库 · ${pickDateText(raw.updateTime || raw.createTime)}`,
    secondaryMeta: viewCount > 0 ? `阅读 ${viewCount.toLocaleString()}` : '',
    source: 'knowledge' as const,
    summary,
    tag: '知识库',
    title,
  }
}

function mapPolicyDetail(raw: ApiRecord) {
  const title = toText(raw.title) || '政策解读'
  const issueOrg = toText(raw.issueOrg) || '政策发布'
  const content = toText(raw.content)
  const policyNo = toText(raw.policyNo)

  return {
    attachmentUrl: toText(raw.attachmentUrl),
    content,
    contentIsHtml: hasHtmlContent(content),
    coverUrl: '',
    metaLine: `${issueOrg} · ${pickDateText(raw.issueDate || raw.updateTime || raw.createTime)}`,
    secondaryMeta: policyNo ? `文号：${policyNo}` : '',
    source: 'policy' as const,
    summary: '',
    tag: '政策速递',
    title,
  }
}

function mapStandardDetail(raw: ApiRecord) {
  const title = toText(raw.title) || '标准更新'
  const standardNo = toText(raw.standardNo)
  const issueOrg = toText(raw.issueOrg)
  const content = toText(raw.content) || toText(raw.summary)
  const secondaryParts = [standardNo, issueOrg].filter(Boolean)

  return {
    attachmentUrl: toText(raw.attachmentUrl),
    content,
    contentIsHtml: hasHtmlContent(content),
    coverUrl: '',
    metaLine: `${toText(raw.standardType) || '标准动态'} · ${pickDateText(raw.issueDate || raw.implementDate || raw.updateTime || raw.createTime)}`,
    secondaryMeta: secondaryParts.join(' · '),
    source: 'standard' as const,
    summary: toText(raw.summary),
    tag: '标准动态',
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

function parseSource(value: unknown): DetailSource | '' {
  const source = decodeText(value)
  if (source === 'knowledge' || source === 'policy' || source === 'standard') {
    return source
  }

  return ''
}

async function loadDetail() {
  if (!currentId.value || !currentSource.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''
  const seed = { ...detail.value }

  try {
    if (currentSource.value === 'knowledge') {
      const raw = await getKnowledgeDetail(currentId.value)
      if (isObject(raw)) {
        const mapped = mapKnowledgeDetail(raw)
        detail.value = {
          ...seed,
          ...mapped,
          metaLine: mapped.metaLine || seed.metaLine,
          tag: mapped.tag || seed.tag,
          title: mapped.title || seed.title,
        }
      }
      return
    }

    if (currentSource.value === 'policy') {
      const raw = await getPolicyDetail(currentId.value)
      if (isObject(raw)) {
        const mapped = mapPolicyDetail(raw)
        detail.value = {
          ...seed,
          ...mapped,
          metaLine: mapped.metaLine || seed.metaLine,
          tag: mapped.tag || seed.tag,
          title: mapped.title || seed.title,
        }
      }
      return
    }

    const raw = await getStandardDetail(currentId.value)
    if (isObject(raw)) {
      const mapped = mapStandardDetail(raw)
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
  const source = parseSource(query?.source)
  const id = decodeText(query?.id)

  if (!source || !id) {
    errorMessage.value = '参数不完整，无法加载内容'
    showFailToast('页面参数异常')
    return
  }

  currentSource.value = source
  currentId.value = id
  detail.value.source = source
  applyQuerySeed((query ?? {}) as Record<string, unknown>)
  void loadDetail()
})
</script>

<style scoped lang="scss">
.page-community-detail {
  --ink-900: #1c2736;
  --ink-700: #31465f;
  --ink-500: #607086;
  --brand-700: #234f6f;
  --brand-600: #2e6488;
  --accent-600: #a14e2f;

  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: var(--ink-900);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background:
    radial-gradient(220rpx 220rpx at 86% 8%, rgba(189, 99, 62, 0.13), transparent 74%),
    radial-gradient(220rpx 220rpx at 8% 18%, rgba(63, 122, 159, 0.18), transparent 76%),
    linear-gradient(180deg, #f8f3e8 0%, #f9f4ea 45%, #f3ece0 100%);
}

.page-community-detail__texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.page-community-detail__texture--grid {
  opacity: 0.24;
  background-image:
    linear-gradient(to right, rgba(36, 79, 111, 0.1) 1rpx, transparent 1rpx),
    linear-gradient(to bottom, rgba(36, 79, 111, 0.1) 1rpx, transparent 1rpx);
  background-size: 44rpx 44rpx;
}

.page-community-detail__texture--glow {
  background:
    radial-gradient(240rpx 240rpx at 102% -4%, rgba(189, 99, 62, 0.16), transparent 72%),
    radial-gradient(300rpx 300rpx at -6% 36%, rgba(63, 122, 159, 0.2), transparent 74%);
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
  gap: 22rpx;
}

.community-hero {
  position: relative;
  overflow: hidden;
  border-radius: 30rpx;
  padding: 30rpx 28rpx 26rpx;
  background: linear-gradient(138deg, var(--brand-700) 0%, var(--brand-600) 56%, #447ea1 100%);
  box-shadow: 0 20rpx 42rpx rgba(35, 79, 111, 0.34);
  animation: rise-in 360ms ease-out both;
}

.community-hero::after {
  content: '';
  position: absolute;
  right: -30rpx;
  top: -36rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 76%);
}

.community-hero__chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
}

.community-chip {
  min-height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  color: rgba(227, 242, 255, 0.92);
  font-size: 22rpx;
  line-height: 48rpx;
  border: 1rpx solid rgba(223, 239, 255, 0.34);
  background: rgba(12, 28, 48, 0.24);
}

.community-chip--solid {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.16);
  background: linear-gradient(135deg, #bc633d 0%, #d67a50 100%);
}

.community-chip--muted {
  color: rgba(226, 241, 255, 0.8);
  border-style: dashed;
}

.community-hero__title {
  display: block;
  margin-top: 16rpx;
  color: #f7fcff;
  font-size: 40rpx;
  line-height: 1.38;
  font-weight: 700;
  letter-spacing: 0.6rpx;
  white-space: normal;
  font-family: 'STSong', 'Songti SC', 'Noto Serif SC', serif;
}

.community-hero__meta {
  display: block;
  margin-top: 12rpx;
  color: rgba(223, 241, 255, 0.92);
  font-size: 24rpx;
  line-height: 1.56;
  white-space: normal;
}

.community-hero__sub-meta {
  display: block;
  margin-top: 8rpx;
  color: rgba(223, 241, 255, 0.74);
  font-size: 23rpx;
  line-height: 1.52;
  white-space: normal;
}

.community-hero__stats {
  margin-top: 20rpx;
  display: flex;
  gap: 10rpx;
}

.community-stat {
  flex: 1;
  border-radius: 18rpx;
  padding: 14rpx 10rpx 12rpx;
  background: rgba(12, 25, 43, 0.3);
  border: 1rpx solid rgba(223, 239, 255, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.community-stat__value {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.community-stat__label {
  color: rgba(224, 242, 254, 0.74);
  font-size: 21rpx;
}

.community-layout {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  animation: rise-in 420ms ease-out 70ms both;
}

.community-panel {
  border-radius: 24rpx;
  border: 1rpx solid rgba(49, 70, 95, 0.12);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14rpx 34rpx rgba(35, 79, 111, 0.09);
}

.community-article {
  padding: 22rpx;
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
  background: linear-gradient(90deg, #e6dcca 20%, #f6eee1 40%, #e6dcca 60%);
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
  width: 100%;
  height: 336rpx;
  border-radius: 20rpx;
  margin-bottom: 22rpx;
  background: #e4d8c5;
}

.community-lead {
  margin-bottom: 20rpx;
  border-radius: 18rpx;
  padding: 18rpx;
  border-left: 8rpx solid var(--accent-600);
  background: linear-gradient(140deg, #fffaf3 0%, #f7efe2 100%);
  box-shadow: inset 0 0 0 1rpx rgba(161, 78, 47, 0.14);
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
  margin-top: 10rpx;
  color: var(--ink-700);
  font-size: 27rpx;
  line-height: 1.66;
}

.community-article__body {
  border-radius: 18rpx;
  background: #fffdf8;
  box-shadow: inset 0 0 0 1rpx rgba(48, 71, 96, 0.12);
  padding: 20rpx;
}

.community-section-head {
  margin-bottom: 16rpx;
  display: flex;
  align-items: baseline;
}

.community-section-head__title {
  color: var(--ink-900);
  font-size: 32rpx;
  font-weight: 700;
  font-family: 'STSong', 'Songti SC', 'Noto Serif SC', serif;
}

.community-section__richtext {
  color: var(--ink-700);
  font-size: 27rpx;
  line-height: 1.82;
}

.community-section__richtext :deep(img) {
  max-width: 100%;
  border-radius: 14rpx;
  margin: 12rpx 0;
}

.community-section__richtext :deep(p),
.community-section__richtext :deep(div),
.community-section__richtext :deep(span),
.community-section__richtext :deep(li) {
  color: var(--ink-700);
  font-size: 27rpx;
  line-height: 1.82;
}

.community-section__paragraphs {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.community-section__paragraph {
  color: var(--ink-700);
  font-size: 27rpx;
  line-height: 1.86;
  text-indent: 2em;
  text-align: justify;
}

.community-section__empty {
  color: var(--ink-500);
  font-size: 24rpx;
}

.community-side__title {
  color: var(--ink-900);
  font-size: 30rpx;
  font-weight: 700;
  font-family: 'STSong', 'Songti SC', 'Noto Serif SC', serif;
}

.community-side__rows {
  margin-top: 14rpx;
  border-radius: 16rpx;
  background: #fff9f0;
  border: 1rpx solid rgba(36, 79, 111, 0.12);
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
  font-size: 23rpx;
}

.community-side__value {
  color: var(--ink-900);
  font-size: 24rpx;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.community-attachment {
  margin-top: 16rpx;
  border-radius: 18rpx;
  padding: 18rpx;
  background: linear-gradient(145deg, #f2f8fc 0%, #ecf4fa 100%);
  border: 1rpx dashed rgba(35, 79, 111, 0.26);
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
  color: var(--brand-600);
  font-size: 23rpx;
  line-height: 1.58;
  word-break: break-all;
}

.community-side__empty {
  margin-top: 16rpx;
  border-radius: 16rpx;
  border: 1rpx dashed rgba(96, 112, 134, 0.36);
  background: rgba(255, 255, 255, 0.66);
  padding: 18rpx;
}

.community-side__empty-text {
  color: var(--ink-500);
  font-size: 24rpx;
}

.community-error {
  border-radius: 20rpx;
  padding: 22rpx;
  border: 1rpx solid rgba(161, 78, 47, 0.32);
  background: linear-gradient(140deg, #fff6f2 0%, #ffede7 100%);
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
  color: #a14e2f;
  font-size: 24rpx;
  line-height: 1.56;
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
    font-size: 36rpx;
  }

  .community-stat__value {
    font-size: 28rpx;
  }
}
</style>
