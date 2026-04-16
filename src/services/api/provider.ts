import type { ProviderCodeInfo } from '@/types/business'
import { mockProviderCode } from './mockBusiness'

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 120)
  })
}

function nowText() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export async function getProviderCodeInfo() {
  return wait({ ...mockProviderCode })
}

export async function checkProviderCodeUnique(code: string) {
  const normalized = code.trim().toUpperCase()

  if (!normalized) {
    return wait({ message: '编号不能为空', unique: false })
  }

  if (normalized === mockProviderCode.code) {
    return wait({ message: '该编号已绑定当前企业', unique: true })
  }

  if (normalized.endsWith('0001')) {
    return wait({ message: '编号已存在，请更换后重试', unique: false })
  }

  return wait({ message: '编号可用', unique: true })
}

export async function bindProviderCode(payload: Omit<ProviderCodeInfo, 'updatedAt'>) {
  mockProviderCode.code = payload.code.trim().toUpperCase()
  mockProviderCode.enterpriseId = payload.enterpriseId
  mockProviderCode.enterpriseName = payload.enterpriseName
  mockProviderCode.updatedAt = nowText()

  return wait({ ...mockProviderCode })
}
