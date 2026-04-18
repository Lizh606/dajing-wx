import { authRequest } from '@/services/http'

export interface InspectionItem {
  category?: string
  createTime?: string
  cycleDays?: number
  defaultStd?: string
  description?: string
  id?: number
  isDeleted?: number
  itemName?: string
  sampleType?: string
  status?: number
  unitPrice?: number
  updateTime?: string
}

export interface InspectionItemListQuery {
  category?: string
  keyword?: string
  page?: number
  size?: number
}

export interface InspectionItemPageResult {
  current?: number
  pages?: number
  records?: InspectionItem[]
  size?: number
  total?: number
}

export function getInspectionItemList(query: InspectionItemListQuery = {}) {
  return authRequest<InspectionItemPageResult>({
    method: 'GET',
    path: '/api/base/inspection-item/list',
    query: {
      category: query.category,
      keyword: query.keyword,
      page: query.page,
      size: query.size,
    },
  })
}

export function getInspectionItemByCategory(category?: string) {
  return authRequest<InspectionItem[]>({
    method: 'GET',
    path: '/api/base/inspection-item/by-category',
    query: { category },
  })
}

export function getInspectionItemDetail(id: string | number) {
  return authRequest<InspectionItem>({
    method: 'GET',
    path: '/api/base/inspection-item/{id}',
    pathParams: { id },
  })
}
