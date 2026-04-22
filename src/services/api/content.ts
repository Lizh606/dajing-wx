import { authRequest } from '@/services/http'

export interface Knowledge {
  authorId?: number
  articleType?: number
  category?: string
  content?: string
  contentType?: number
  coverUrl?: string
  createTime?: string
  id?: number
  isDeleted?: number
  likeCount?: number
  publisherName?: string
  status?: number
  summary?: string
  tags?: string
  title?: string
  updateTime?: string
  viewCount?: number
}

export interface Policy {
  attachmentUrl?: string
  category?: string
  content?: string
  createTime?: string
  effectDate?: string
  id?: number
  isDeleted?: number
  issueDate?: string
  issueOrg?: string
  policyNo?: string
  region?: string
  status?: number
  title?: string
  updateTime?: string
  viewCount?: number
}

export interface Standard {
  attachmentUrl?: string
  category?: string
  createTime?: string
  expireDate?: string
  followCount?: number
  id?: number
  implementDate?: string
  isDeleted?: number
  issueDate?: string
  issueOrg?: string
  keyword?: string
  standardNo?: string
  standardType?: string
  status?: number
  summary?: string
  title?: string
  updateTime?: string
  viewCount?: number
}

export interface ContentPageResult<TItem> {
  current?: number
  pages?: number
  records?: TItem[]
  size?: number
  total?: number
}

export interface NewsItem {
  coverUrl?: string
  id?: number
  publishTime?: string
  publisherName?: string
  subtitle?: string
  tag?: string
  title?: string
  type?: string
  viewCount?: number
}

export interface NewsListQuery {
  eachSize?: number
}

export interface KnowledgeListQuery {
  articleType?: number
  category?: string
  contentType?: number
  keyword?: string
  page?: number
  size?: number
}

export interface PolicyListQuery {
  category?: string
  keyword?: string
  page?: number
  region?: string
  size?: number
}

export interface StandardListQuery {
  category?: string
  keyword?: string
  page?: number
  size?: number
  standardType?: string
}

export function getKnowledgeList(query: KnowledgeListQuery = {}) {
  return authRequest<ContentPageResult<Knowledge>>({
    method: 'GET',
    path: '/api/base/knowledge/list',
    query: {
      articleType: query.articleType,
      category: query.category,
      contentType: query.contentType,
      keyword: query.keyword,
      page: query.page,
      size: query.size,
    },
  })
}

export function getKnowledgeDetail(
  id: string | number,
  query: {
    articleType?: number
  } = {},
) {
  return authRequest<Knowledge>({
    method: 'GET',
    path: '/api/base/knowledge/{id}',
    pathParams: { id },
    query: {
      articleType: query.articleType,
    },
  })
}

export function getNewsList(query: NewsListQuery = {}) {
  return authRequest<Record<string, NewsItem[]>>({
    method: 'GET',
    path: '/api/base/news/list',
    query: {
      eachSize: query.eachSize,
    },
  })
}

export function getPolicyList(query: PolicyListQuery = {}) {
  return authRequest<ContentPageResult<Policy>>({
    method: 'GET',
    path: '/api/base/policy/list',
    query: {
      category: query.category,
      keyword: query.keyword,
      page: query.page,
      region: query.region,
      size: query.size,
    },
  })
}

export function getPolicyDetail(id: string | number) {
  return authRequest<Policy>({
    method: 'GET',
    path: '/api/base/policy/{id}',
    pathParams: { id },
  })
}

export function getStandardList(query: StandardListQuery = {}) {
  return authRequest<ContentPageResult<Standard>>({
    method: 'GET',
    path: '/api/base/standard/list',
    query: {
      category: query.category,
      keyword: query.keyword,
      page: query.page,
      size: query.size,
      standardType: query.standardType,
    },
  })
}

export function getStandardDetail(id: string | number) {
  return authRequest<Standard>({
    method: 'GET',
    path: '/api/base/standard/{id}',
    pathParams: { id },
  })
}
