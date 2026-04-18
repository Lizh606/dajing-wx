import { authRequest } from '@/services/http'

type ApiRecord = Record<string, any>

export interface TradeDemandPublishReqDTO {
  additionalReq?: string
  attachments?: string
  budgetAmount?: number
  category?: string
  contactName?: string
  contactPhone?: string
  enterpriseName?: string
  expectedFinishDate?: string
  region?: string
  remark?: string
  sampleCount: number
  sampleDesc?: string
  sampleName: string
  sampleSize?: string
  sampleType?: string
  testItemIds?: number[]
  testProject?: string
  testStandard?: string
  title: string
}

export interface TradeDemandBidReqDTO {
  demandId: number
  estimatedDays: number
  institutionId?: number
  quoteAmount: number
  remark?: string
  testPlan?: string
}

export interface TradeDemandMyQuery {
  page?: number
  size?: number
  status?: number
}

export interface TradeDemandHallQuery {
  category?: string
  page?: number
  region?: string
  size?: number
}

export function publishDemand(body: TradeDemandPublishReqDTO) {
  return authRequest<ApiRecord>({
    body,
    method: 'POST',
    path: '/api/trade/demand/publish',
  })
}

export function saveDraft(body: TradeDemandPublishReqDTO) {
  return authRequest<ApiRecord>({
    body,
    method: 'POST',
    path: '/api/trade/demand/draft',
  })
}

export function updateDraft(demandId: string | number, body: TradeDemandPublishReqDTO) {
  return authRequest<ApiRecord>({
    body,
    method: 'PUT',
    path: '/api/trade/demand/{demandId}/draft',
    pathParams: { demandId },
  })
}

export function publishDraft(demandId: string | number) {
  return authRequest<ApiRecord>({
    method: 'PUT',
    path: '/api/trade/demand/{demandId}/publish',
    pathParams: { demandId },
  })
}

export function closeDemand(demandId: string | number) {
  return authRequest<ApiRecord>({
    method: 'PUT',
    path: '/api/trade/demand/{demandId}/close',
    pathParams: { demandId },
  })
}

export function submitBid(body: TradeDemandBidReqDTO) {
  return authRequest<ApiRecord>({
    body,
    method: 'POST',
    path: '/api/trade/demand/bid',
  })
}

export function getDemand(demandId: string | number) {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/demand/{demandId}',
    pathParams: { demandId },
  })
}

export function getDemandBids(demandId: string | number) {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/demand/{demandId}/bids',
    pathParams: { demandId },
  })
}

export function getMyDemands(query: TradeDemandMyQuery = {}) {
  return authRequest<ApiRecord>({
    authExpiredBehavior: 'toast',
    method: 'GET',
    path: '/api/trade/demand/my',
    query: {
      page: query.page,
      size: query.size,
      status: query.status,
    },
  })
}

export function getDemandHall(query: TradeDemandHallQuery = {}) {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/demand/hall',
    query: {
      category: query.category,
      page: query.page,
      region: query.region,
      size: query.size,
    },
  })
}
