import { authUploadFile } from '@/services/http'

export interface CommonFileUploadResult {
  fileKey?: string
  fileName?: string
  fileType?: string
  objectName?: string
  size?: number
  url?: string
}

export interface CommonFileUploadOptions {
  dir?: string
  fieldName?: string
  headers?: Record<string, string>
}

export function uploadCommon(filePath: string, options: CommonFileUploadOptions = {}) {
  return authUploadFile<CommonFileUploadResult>({
    fieldName: options.fieldName,
    filePath,
    headers: options.headers,
    path: '/api/user/file/upload',
    query: {
      dir: options.dir,
    },
  })
}
