import { authRequest, authUploadFile } from '@/services/http'

type ApiRecord = Record<string, any>

export interface ChangePasswordPayload {
  newPassword: string
  oldPassword?: string
}

export interface ChangePhonePayload {
  newPhone: string
  smsCode: string
}

export interface ChangeEmailPayload {
  newEmail: string
  password: string
}

export interface RealNameAuthPayload {
  idCardBack: string
  idCardFront: string
  idCardNo: string
  realName: string
}

export interface RealNameAuthInfo {
  idCardNo?: string
  realName?: string
  realNameStatus?: number
  userId?: string
}

export interface FileUploadResult {
  fileKey?: string
  fileName?: string
  fileType?: string
  objectName?: string
  size?: number
  url?: string
}

export function setUsername(username: string) {
  return authRequest<void>({
    method: 'PUT',
    path: '/api/user/account/username',
    query: { username },
  })
}

export function changePassword(payload: ChangePasswordPayload) {
  return authRequest<void>({
    body: payload,
    method: 'PUT',
    path: '/api/user/account/password',
  })
}

export function changePhone(payload: ChangePhonePayload) {
  return authRequest<void>({
    body: payload,
    method: 'PUT',
    path: '/api/user/account/phone',
  })
}

export function changeEmail(payload: ChangeEmailPayload) {
  return authRequest<void>({
    body: payload,
    method: 'PUT',
    path: '/api/user/account/email',
  })
}

export function getRealNameStatus() {
  return authRequest<ApiRecord>({
    method: 'GET',
    path: '/api/user/account/real-name',
  })
}

export function submitRealName(payload: RealNameAuthPayload) {
  return authRequest<void>({
    body: payload,
    method: 'POST',
    path: '/api/user/account/real-name',
  })
}

export function uploadIdCard(filePath: string) {
  return authUploadFile<FileUploadResult>({
    filePath,
    path: '/api/user/file/upload/id-card',
  })
}
