const DEFAULT_BASE = '/api'

export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, '')
  }
  return DEFAULT_BASE
}

/**
 * GET JSON và unwrap ApiResponse { success, data, message }.
 */
export async function apiGet(path, params) {
  const base = getApiBaseUrl()
  const suffix = path.startsWith('/') ? path : `/${path}`
  const fullPath = `${base}${suffix}`

  // base tương đối (/api) hoặc tuyệt đối (http://localhost:8080/api)
  const url = fullPath.startsWith('http')
    ? new URL(fullPath)
    : new URL(fullPath, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    let message = `Lỗi HTTP ${response.status}`
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      /* ignore */
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  const body = await response.json()

  // Một số endpoint có thể trả raw; ưu tiên unwrap ApiResponse
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      throw new Error(body.message || 'Yêu cầu thất bại')
    }
    return body.data
  }

  return body
}
