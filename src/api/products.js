import { apiGet, apiSend } from './client'

export function fetchProducts({ q, categoryId, status, token } = {}) {
  return apiGet('/v1/products', { q, categoryId, status }, { token })
}

export function fetchProductById(productId, { token } = {}) {
  return apiGet(`/v1/products/${productId}`, undefined, { token })
}

export function createProduct(payload, { token } = {}) {
  return apiSend('/v1/products', { method: 'POST', body: payload, token })
}

export function updateProduct(productId, payload, { token } = {}) {
  return apiSend(`/v1/products/${productId}`, { method: 'PUT', body: payload, token })
}

export function discontinueProduct(productId, { token } = {}) {
  return apiSend(`/v1/products/${productId}`, { method: 'DELETE', token })
}
