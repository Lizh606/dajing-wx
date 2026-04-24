import type { SampleRecord, SampleStatus } from '@/types/business'
import { mockSamples } from './mockBusiness'

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
}

function stamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export async function getList() {
  return wait(mockSamples.map((item) => ({ ...item, tracks: item.tracks.map((track) => ({ ...track })) })))
}

export async function getByOrder(orderId: string) {
  return wait(mockSamples.filter((item) => item.orderId === orderId).map((item) => ({ ...item })))
}

export async function reportException(sampleId: string, note: string) {
  const target = mockSamples.find((item) => item.id === sampleId)

  if (!target) {
    throw new Error('样品不存在')
  }

  target.currentStatus = 'abnormal'
  target.latestNote = note
  target.tracks.unshift({ status: 'abnormal', time: stamp(), note })

  return wait({ ...target })
}

export async function toggleRetain(sampleId: string, retained: boolean) {
  const target = mockSamples.find((item) => item.id === sampleId)

  if (!target) {
    throw new Error('样品不存在')
  }

  if (target.currentStatus === 'returned') {
    throw new Error('样品已登记退样，不可重复操作')
  }

  if (target.currentStatus === 'retained' && retained) {
    throw new Error('样品已登记留样，无需重复操作')
  }

  target.retained = retained
  target.currentStatus = retained ? 'retained' : 'returned'
  target.latestNote = retained ? '样品已登记留样' : '样品已登记退样'
  target.tracks.unshift({
    status: retained ? 'retained' : 'returned',
    time: stamp(),
    note: target.latestNote,
  })

  return wait({ ...target })
}

export function getSampleStatusLabel(status: SampleStatus) {
  const map: Record<SampleStatus, string> = {
    pending_dispatch: '待寄样',
    in_transit: '运输中',
    received: '已收样',
    testing: '检测中',
    retained: '已留样',
    returned: '已退样',
    abnormal: '异常待处理',
  }

  return map[status]
}
