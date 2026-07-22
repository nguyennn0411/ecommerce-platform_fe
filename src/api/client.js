const DEFAULT_BASE = '/api'

export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, '')
  }
  return DEFAULT_BASE
}

function buildUrl(path, params) {
  const base = getApiBaseUrl()
  const suffix = path.startsWith('/') ? path : `/${path}`
  const fullPath = `${base}${suffix}`

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

  return url.toString()
}

async function parseApiResponse(response) {
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

  if (response.status === 204) return null

  const body = await response.json()

  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      throw new Error(body.message || 'Yêu cầu thất bại')
    }
    return body.data
  }

  return body
}

/**
 * GET JSON và unwrap ApiResponse { success, data, message }.
 */
export async function apiGet(path, params, { token } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(buildUrl(path, params), { headers })
  return parseApiResponse(response)
}

/**
 * POST / PUT / PATCH / DELETE với body JSON (optional) và Bearer token.
 */
export async function apiSend(path, { method = 'POST', body, token, params } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return parseApiResponse(response)
}
