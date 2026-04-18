export const apiConfig = {
  basePath: '',
  device: 'WEB',
  host: 'qip.hauchet.cn',
  port: '',
  protocol: 'https',
  timeout: 15000,
} as const

export const AUTH_DEVICE = apiConfig.device

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

export function getApiBaseUrl() {
  const origin = `${apiConfig.protocol}://${apiConfig.host}${apiConfig.port ? `:${apiConfig.port}` : ''}`
  const trimmedBasePath = trimSlashes(apiConfig.basePath)

  if (!trimmedBasePath) {
    return origin
  }

  return `${origin}/${trimmedBasePath}`
}
