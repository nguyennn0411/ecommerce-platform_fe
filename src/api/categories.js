import { apiGet, apiSend } from './client'

export function fetchCategories({ token } = {}) {
  return apiGet('/v1/categories', undefined, { token })
}

export function createCategory(payload, { token } = {}) {
  return apiSend('/v1/categories', { method: 'POST', body: payload, token })
}
