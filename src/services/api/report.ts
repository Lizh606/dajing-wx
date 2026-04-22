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

function normalizeStatus(value: unknown): ReportRecord['status'] {
  const num = toNumber(value)
  if (num !== undefined) {
    return num === 3 ? 'void' : 'valid'
  }

  const text = toText(value).toLowerCase()
  return text.includes('void') || text.includes('作废') ? 'void' : 'valid'
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
  const createTime = normalizeDateTime(raw.createTime || fallback.createdAt)
  const version = toText(raw.version) || toText(raw.fileHash).slice(0, 8) || fallback.version || 'v1'

  const normalized: ReportRecord = {
    antiFakeCode: toText(raw.fileHash || raw.antiFakeCode || reportNo) || '-',
    antiFakeQr: toText(raw.qrCodeContent || raw.antiFakeQr),
    createdAt: createTime,
    id: id || reportNo,
    institution: toText(raw.institutionName || raw.institution || fallback.institution) || '机构信息待同步',
    orderId: orderId || '-',
    orderNo: toText(raw.orderNo || orderId) || '-',
    reportName: toText(raw.title || raw.reportName || fallback.reportName) || '检测报告',
    reportNo: reportNo || toText(raw.id),
    status: normalizeStatus(raw.status ?? fallback.status),
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
