import { defineStore } from 'pinia'

export interface Order {
  id: string
  title: string
  status: 'unpaid' | 'pending_sample' | 'testing' | 'completed' | 'after_sale'
  statusText: string
  statusColor: string
  progress: number
  progressText: string
  institution: string
  amount: number
  orderNo: string
  createdAt: string
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [
      {
        id: '1',
        title: '金属材料成分检测',
        status: 'unpaid',
        statusText: '未支付',
        statusColor: '#e11d48',
        progress: 12,
        progressText: '机构已报价，待确认并支付',
        institution: '湖南质量检测研究院',
        amount: 1000,
        orderNo: 'DD20260418001',
        createdAt: '2026-04-18'
      },
      {
        id: '2',
        title: '电子产品安规认证',
        status: 'testing',
        statusText: '检测中',
        statusColor: '#2563eb',
        progress: 60,
        progressText: '样品检测中，预计3天完成',
        institution: '广州检验检测认证集团',
        amount: 3200,
        orderNo: 'DD20260415003',
        createdAt: '2026-04-15'
      },
      {
        id: '3',
        title: 'CE认证咨询服务',
        status: 'completed',
        statusText: '已完成',
        statusColor: '#059669',
        progress: 100,
        progressText: '已完成，报告已上传',
        institution: '深圳华检技术服务有限公司',
        amount: 5800,
        orderNo: 'DD20260410007',
        createdAt: '2026-04-10'
      }
    ] as Order[]
  })
})
