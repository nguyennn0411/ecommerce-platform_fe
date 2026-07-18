import { apiGet } from './client'

export function fetchProducts({ q, categoryId, status = 'ACTIVE' } = {}) {
  return apiGet('/v1/products', { q, categoryId, status })
}

export function fetchProductById(productId) {
  return apiGet(`/v1/products/${productId}`)
}
