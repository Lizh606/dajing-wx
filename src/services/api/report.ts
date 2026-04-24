import { authRequest, getErrorMessage } from '@/services/http'
import type { ReportRecord, ReportVerifyResult, ReportVersionRecord } from '@/types/business'

type ApiRecord = Record<string, any>

function isObject(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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

  return undefined
}

function normalizeDateTime(value: unknown) {
  const text = toText(value)
  if (!text) {
    return '-'
  }

  return text.replace('T', ' ').slice(0, 19)
}

function normalizeReportStage(value: unknown, hint = ''): NonNullable<ReportRecord['reportStage']> {
  const numericStatus = toNumber(value)
  const text = `${toText(value)} ${hint}`.toLowerCase()

  if (numericStatus !== undefined) {
    if (numericStatus === 0) {
      return 'draft'
    }

    if (numericStatus === 1) {
      return 'submitted'
    }

    if (numericStatus === 3) {
      return 'void'
    }

    if (numericStatus === 2) {
      if (text.includes('void') || text.includes('作废')) {
        return 'void'
      }

      return 'confirmed'
    }
  }

  if (text.includes('draft') || text.includes('草稿')) {
    return 'draft'
  }

  if (text.includes('submit') || text.includes('已提交')) {
    return 'submitted'
  }

  if (text.includes('confirm') || text.includes('确认')) {
    return 'confirmed'
  }

  if (text.includes('void') || text.includes('作废')) {
    return 'void'
  }

  return 'submitted'
}

function normalizeStatus(value: unknown, hint = ''): ReportRecord['status'] {
  return normalizeReportStage(value, hint) === 'void' ? 'void' : 'valid'
}

function normalizeVersionRecords(source: unknown, fallbackVersion: string, fallbackTime: string): ReportVersionRecord[] {
  if (Array.isArray(source) && source.length > 0) {
    const rows = source
      .map((item) => {
        if (!isObject(item)) {
          return null
        }

        const actionText = toText(item.action || item.type || item.status).toLowerCase()
        const action: ReportVersionRecord['action'] = actionText.includes('void') || actionText.includes('作废')
          ? 'void'
          : actionText.includes('reissue') || actionText.includes('重发')
            ? 'reissue'
            : 'create'

        return {
          action,
          actor: toText(item.actor || item.operatorName || item.operator) || '系统',
          note: toText(item.note || item.remark || item.comment) || '报告更新',
          time: normalizeDateTime(item.time || item.updateTime || item.createTime),
          version: toText(item.version) || fallbackVersion,
        } satisfies ReportVersionRecord
      })
      .filter((item): item is ReportVersionRecord => Boolean(item))

    if (rows.length > 0) {
      return rows
    }
  }

  return [{
    action: 'create',
    actor: '系统',
    note: '报告生成',
    time: fallbackTime,
    version: fallbackVersion,
  }]
}

function normalizeReport(raw: unknown, fallback: Partial<ReportRecord> = {}): ReportRecord | null {
  if (!isObject(raw)) {
    return null
  }

  const id = toText(raw.id || raw.reportId || fallback.id)
  const reportNo = toText(raw.reportNo || fallback.reportNo)

  if (!id && !reportNo) {
    return null
  }

  const orderId = toText(raw.orderId || fallback.orderId)
  const reportHint = `${toText(raw.statusDesc)} ${toText(raw.statusText)} ${toText(raw.remark)}`
  const reportStageCode = toNumber(raw.status)
  const reportStage = normalizeReportStage(raw.status ?? fallback.reportStageCode, reportHint)
  const createTime = normalizeDateTime(raw.createTime || fallback.createdAt)
  const updateTime = normalizeDateTime(raw.updateTime || fallback.updatedAt || raw.createTime)
  const version = toText(raw.version) || toText(raw.fileHash).slice(0, 8) || fallback.version || 'v1'

  const normalized: ReportRecord = {
    antiFakeCode: toText(raw.fileHash || raw.antiFakeCode || reportNo) || '-',
    antiFakeQr: toText(raw.qrCodeContent || raw.antiFakeQr),
    conclusion: toText(raw.conclusion || fallback.conclusion) || undefined,
    createdAt: createTime,
    demandId: toText(raw.demandId || fallback.demandId) || undefined,
    fileUrl: toText(raw.fileUrl || fallback.fileUrl) || undefined,
    id: id || reportNo,
    institution: toText(raw.institutionName || raw.institution || fallback.institution) || '机构信息待同步',
    institutionId: toText(raw.institutionId || fallback.institutionId) || undefined,
    orderId: orderId || '-',
    orderNo: toText(raw.orderNo || orderId) || '-',
    reportName: toText(raw.title || raw.reportName || fallback.reportName) || '检测报告',
    reportNo: reportNo || toText(raw.id),
    reportStage,
    reportStageCode,
    sampleName: toText(raw.sampleName || fallback.sampleName) || undefined,
    status: normalizeStatus(raw.status ?? fallback.status, reportHint),
    testResult: toText(raw.testResult || fallback.testResult) || undefined,
    updatedAt: updateTime,
    version,
    versionRecords: normalizeVersionRecords(raw.versionRecords, version, createTime),
  }

  return normalized
}

export async function getByOrderId(orderId: string | number) {
  const orderKey = toText(orderId)
  const raw = await authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/report/order/{orderId}',
    pathParams: { orderId },
  })

  const normalized = normalizeReport(raw, { orderId: orderKey })
  if (!normalized) {
    return null
  }

  return normalized
}

export interface ReportUploadDraftSnapshot {
  conclusion: string
  fileUrl: string
  id: string
  orderId: string
  reportNo: string
  sampleName: string
  status?: number
  testResult: string
  title: string
}

function normalizeUploadDraftSnapshot(raw: unknown, fallbackOrderId = ''): ReportUploadDraftSnapshot | null {
  if (!isObject(raw)) {
    return null
  }

  const id = toText(raw.id || raw.reportId)
  const reportNo = toText(raw.reportNo)
  const orderId = toText(raw.orderId || fallbackOrderId)

  if (!id && !reportNo && !orderId) {
    return null
  }

  return {
    conclusion: toText(raw.conclusion),
    fileUrl: toText(raw.fileUrl),
    id: id || reportNo,
    orderId: orderId || fallbackOrderId,
    reportNo,
    sampleName: toText(raw.sampleName),
    status: toNumber(raw.status),
    testResult: toText(raw.testResult),
    title: toText(raw.title || raw.reportName),
  }
}

export async function getUploadDraftByOrder(orderId: string | number) {
  const orderKey = toText(orderId)
  const raw = await authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/report/order/{orderId}',
    pathParams: { orderId },
  })

  return normalizeUploadDraftSnapshot(raw, orderKey)
}

export async function getList(orderIds: Array<string | number> = []) {
  const normalizedOrderIds = Array.from(new Set(orderIds.map((item) => toText(item)).filter(Boolean)))

  if (normalizedOrderIds.length > 0) {
    const reports = await Promise.all(normalizedOrderIds.map((orderId) => getByOrderId(orderId)))
    const resolved = reports.filter((item): item is ReportRecord => Boolean(item))

    if (resolved.length > 0) {
      return resolved
    }
  }

  return []
}

export async function getDetail(id: string | number) {
  const reportId = toText(id)
  const raw = await authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/trade/report/{reportId}',
    pathParams: { reportId: id },
  })

  const normalized = normalizeReport(raw, { id: reportId })
  if (!normalized) {
    return null
  }

  return normalized
}

export async function getDownloadUrl(reportId: string | number) {
  const payload = await authRequest<ApiRecord | string>({
    method: 'GET',
    path: '/api/trade/report/{reportId}/download',
    pathParams: { reportId },
  })

  if (typeof payload === 'string') {
    return payload.trim()
  }

  if (isObject(payload)) {
    return toText(payload.downloadUrl || payload.url)
  }

  return ''
}

function createVerifyResult(report: ReportRecord | undefined, message: string, canView = false): ReportVerifyResult {
  return {
    canView,
    message,
    report,
    verifiedAt: normalizeDateTime(new Date().toISOString()),
  }
}

export interface UploadReportPayload {
  conclusion: string
  fileUrl?: string
  id?: string | number
  orderId: string | number
  reportNo: string
  sampleName: string
  status?: 0 | 1 | 2 | 3 | number
  testResult: string
  title?: string
}

function resolveUploadReportId(raw: unknown) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(raw)
  }

  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim()
  }

  if (!isObject(raw)) {
    return ''
  }

  return toText(raw.id || raw.reportId || raw.data?.id || raw.data?.reportId || raw.result?.id || raw.result?.reportId)
}

export async function uploadReport(payload: UploadReportPayload) {
  const result = await authRequest<ApiRecord | string | number>({
    body: {
      conclusion: payload.conclusion?.trim(),
      fileUrl: payload.fileUrl?.trim(),
      id: payload.id,
      orderId: payload.orderId,
      reportNo: payload.reportNo?.trim(),
      sampleName: payload.sampleName?.trim(),
      status: payload.status,
      testResult: payload.testResult?.trim(),
      title: payload.title?.trim(),
    },
    method: 'POST',
    path: '/api/trade/report/upload',
  })

  return resolveUploadReportId(result)
}

export async function verifyByReportNo(reportNo: string) {
  const normalizedReportNo = reportNo.trim()

  if (!normalizedReportNo) {
    return createVerifyResult(undefined, '请输入报告编号', false)
  }

  try {
    const raw = await authRequest<ApiRecord>({
      method: 'GET',
      path: '/api/trade/report/verify/{reportNo}',
      pathParams: { reportNo: normalizedReportNo },
    })

    const report = normalizeReport(raw, { reportNo: normalizedReportNo })

    if (!report) {
      return createVerifyResult(undefined, '未查询到该报告编号，请核对后重试', false)
    }

    if (report.status === 'void') {
      return createVerifyResult(report, '报告已作废，请联系平台确认最新版本', false)
    }

    return createVerifyResult(report, '报告有效，可正常使用', true)
  } catch (error) {
    return createVerifyResult(undefined, getErrorMessage(error, '未查询到该报告编号，请核对后重试'), false)
  }
}

export function getReportStatusLabel(status: ReportRecord['status']) {
  return status === 'valid' ? '有效' : '已作废'
}

export function getReportStageLabel(stage: ReportRecord['reportStage']) {
  if (stage === 'draft') {
    return '草稿'
  }

  if (stage === 'submitted') {
    return '已提交'
  }

  if (stage === 'confirmed') {
    return '已确认'
  }

  if (stage === 'void') {
    return '已作废'
  }

  return '状态未知'
}
