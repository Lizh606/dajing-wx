import type {
  ContactInfo,
  EnterpriseProfile,
  EntrustOrder,
  InvoiceInfo,
  ProviderCodeInfo,
  ReportRecord,
  SampleAddress,
  SampleRecord,
} from '@/types/business'

export const mockOrders: EntrustOrder[] = [
  {
    amount: 2600,
    canDownloadReport: false,
    createdAt: '2026-04-10',
    id: 'order-001',
    institution: '湖南质量检测研究院',
    orderNo: 'WT20260410001',
    progressText: '已提交咨询，待机构正式报价',
    projectName: '锂电池安全性能检测',
    quoteItems: [
      { label: '检测费用', amount: 2200 },
      { label: '样品处理费', amount: 400 },
    ],
    serviceStandard: 'GB 38031-2020 / UN38.3',
    status: 'pending_quote',
  },
  {
    amount: 4200,
    canDownloadReport: false,
    createdAt: '2026-04-11',
    id: 'order-002',
    institution: '广州检验检测认证集团',
    orderNo: 'WT20260411002',
    progressText: '报价已确认，请尽快完成付款',
    projectName: '电子电气安规检测',
    quoteItems: [
      { label: '检测费用', amount: 3900 },
      { label: '加急服务费', amount: 300 },
    ],
    serviceStandard: 'GB 4943.1-2022',
    status: 'pending_payment',
  },
  {
    amount: 1780,
    canDownloadReport: false,
    createdAt: '2026-04-12',
    id: 'order-003',
    institution: '株洲市质量检测中心',
    orderNo: 'WT20260412003',
    progressText: '订单已生效，请按指引寄送样品',
    projectName: '金属材料成分检测',
    quoteItems: [
      { label: '检测费用', amount: 1680 },
      { label: '物流服务费', amount: 100 },
    ],
    serviceStandard: 'GB/T 4336-2016',
    status: 'pending_sample',
  },
  {
    amount: 3200,
    canDownloadReport: false,
    createdAt: '2026-04-13',
    id: 'order-004',
    institution: '中汽研汽车检验中心',
    orderNo: 'WT20260413004',
    progressText: '样品已签收，准备进入检测环节',
    projectName: '汽车零部件可靠性测试',
    quoteItems: [
      { label: '检测费用', amount: 2900 },
      { label: '样品管理费', amount: 300 },
    ],
    serviceStandard: 'QC/T 1129-2019',
    status: 'sample_received',
  },
  {
    amount: 5800,
    canDownloadReport: false,
    createdAt: '2026-04-14',
    id: 'order-005',
    institution: '深圳华检技术服务',
    orderNo: 'WT20260414005',
    progressText: '检测进行中，预计 2 天内出报告',
    projectName: 'EMC 电磁兼容测试',
    quoteItems: [
      { label: '检测费用', amount: 5400 },
      { label: '报告加盖章费', amount: 400 },
    ],
    serviceStandard: 'CISPR 32:2015',
    status: 'testing',
  },
  {
    amount: 6100,
    canDownloadReport: true,
    createdAt: '2026-04-08',
    id: 'order-006',
    institution: '湖南省环境监测中心',
    orderNo: 'WT20260408006',
    progressText: '报告已生成，可下载并查验真伪',
    projectName: '土壤污染物检测',
    quoteItems: [
      { label: '检测费用', amount: 5600 },
      { label: '报告服务费', amount: 500 },
    ],
    reportId: 'report-001',
    serviceStandard: 'HJ 803-2016',
    status: 'reported',
  },
  {
    amount: 2500,
    canDownloadReport: true,
    createdAt: '2026-04-05',
    id: 'order-007',
    institution: '北京华质认证中心',
    orderNo: 'WT20260405007',
    progressText: '订单已完成，报告已归档',
    projectName: 'ISO 9001 体系诊断',
    quoteItems: [
      { label: '服务费用', amount: 2500 },
    ],
    reportId: 'report-002',
    serviceStandard: 'GB/T 19001-2016',
    status: 'completed',
  },
]

export const mockSamples: SampleRecord[] = [
  {
    currentStatus: 'in_transit',
    id: 'sample-001',
    latestNote: '顺丰运单 SF1234567890，预计明日到达',
    orderId: 'order-003',
    retained: false,
    sampleName: '铝合金样品 A-3',
    sampleNo: 'YP20260412003',
    tracks: [
      { status: 'pending_dispatch', time: '2026-04-12 09:32', note: '待寄样' },
      { status: 'in_transit', time: '2026-04-12 16:02', note: '已寄出，物流运输中' },
    ],
  },
  {
    currentStatus: 'testing',
    id: 'sample-002',
    latestNote: '样品已进入实验室检测流程',
    orderId: 'order-005',
    retained: true,
    sampleName: 'EMC 设备样品 B-8',
    sampleNo: 'YP20260414005',
    tracks: [
      { status: 'received', time: '2026-04-14 11:20', note: '样品已签收' },
      { status: 'testing', time: '2026-04-14 14:08', note: '检测中' },
    ],
  },
  {
    currentStatus: 'abnormal',
    id: 'sample-003',
    latestNote: '外包装破损，待需求方确认处理方案',
    orderId: 'order-004',
    retained: false,
    sampleName: '刹车片样品 C-2',
    sampleNo: 'YP20260413004',
    tracks: [
      { status: 'received', time: '2026-04-13 10:03', note: '样品已签收' },
      { status: 'abnormal', time: '2026-04-13 10:21', note: '发现运输异常，已记录' },
    ],
  },
]

export const mockReports: ReportRecord[] = [
  {
    antiFakeCode: 'AF202604080001',
    antiFakeQr: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=AF202604080001',
    createdAt: '2026-04-10 10:18',
    id: 'report-001',
    institution: '湖南省环境监测中心',
    orderId: 'order-006',
    orderNo: 'WT20260408006',
    reportName: '土壤污染物检测报告',
    reportNo: 'BG-HN-2026-0001',
    status: 'valid',
    version: 'V1.1',
    versionRecords: [
      { action: 'create', actor: '系统', note: '初版报告生成', time: '2026-04-09 19:30', version: 'V1.0' },
      { action: 'reissue', actor: '检测机构', note: '补充说明页后重发', time: '2026-04-10 10:18', version: 'V1.1' },
    ],
  },
  {
    antiFakeCode: 'AF202604050002',
    antiFakeQr: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=AF202604050002',
    createdAt: '2026-04-07 16:45',
    id: 'report-002',
    institution: '北京华质认证中心',
    orderId: 'order-007',
    orderNo: 'WT20260405007',
    reportName: 'ISO 9001 体系诊断报告',
    reportNo: 'BG-BJ-2026-0032',
    status: 'void',
    version: 'V2.0',
    versionRecords: [
      { action: 'create', actor: '系统', note: '初版报告生成', time: '2026-04-06 12:02', version: 'V1.0' },
      { action: 'void', actor: '平台管理员', note: '客户申请作废，等待重发', time: '2026-04-07 09:18', version: 'V1.0' },
      { action: 'reissue', actor: '检测机构', note: '修订后重发', time: '2026-04-07 16:45', version: 'V2.0' },
    ],
  },
]

export const mockContacts: ContactInfo[] = [
  { id: 'contact-1', name: '李明', mobile: '13800000001', role: '项目负责人' },
  { id: 'contact-2', name: '王芳', mobile: '13800000002', role: '财务对接' },
]

export const mockInvoices: InvoiceInfo[] = [
  { id: 'invoice-1', title: '株洲大京科技有限公司', taxNo: '91430200MA00000001', invoiceType: '增值税专票' },
]

export const mockSampleAddresses: SampleAddress[] = [
  {
    id: 'addr-1',
    address: '湖南省株洲市天元区天台路 123 号创新中心 2 栋 501',
    contact: '李明',
    mobile: '13800000001',
    tag: '默认',
  },
]

export const mockEnterpriseProfile: EnterpriseProfile = {
  contactName: '李明',
  contactPhone: '13800000001',
  creditCode: '91430200MA00000001',
  enterpriseName: '株洲大京科技有限公司',
  legalPerson: '赵强',
  region: '湖南省株洲市',
}

export let mockProviderCode: ProviderCodeInfo = {
  code: 'SP-430200-0001',
  enterpriseId: 'ep-001',
  enterpriseName: '株洲大京科技有限公司',
  updatedAt: '2026-04-14 09:20',
}
