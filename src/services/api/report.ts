import type { ReportRecord, ReportVerifyResult } from '@/types/business'
import { mockReports } from './mockBusiness'

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
}

function cloneReports() {
  return mockReports.map((item) => ({ ...item, versionRecords: item.versionRecords.map((record) => ({ ...record })) }))
}

export async function getList() {
  return wait(cloneReports())
}

export async function getDetail(id: string) {
  const report = cloneReports().find((item) => item.id === id)
  return wait(report ?? null)
}

export async function verifyByReportNo(reportNo: string) {
  const report = cloneReports().find((item) => item.reportNo === reportNo.trim())

  if (!report) {
    return wait<ReportVerifyResult>({
      canView: false,
      message: '未查询到该报告编号，请核对后重试',
      verifiedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
  }

  return wait<ReportVerifyResult>({
    canView: true,
    message: report.status === 'void' ? '报告已作废，请联系平台确认最新版本' : '报告有效，可正常使用',
    report,
    verifiedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  })
}

export function getReportStatusLabel(status: ReportRecord['status']) {
  return status === 'valid' ? '有效' : '已作废'
}
