import { apiGet, apiSend } from './client'

export function fetchVariantStocks(productId, { token } = {}) {
  return apiGet(`/v1/inventory/stocks/${productId}/variants`, undefined, { token })
}

export function upsertStock(payload, { token } = {}) {
  return apiSend('/v1/inventory/stocks', { method: 'PUT', body: payload, token })
}

/** Upsert nhiều variant một lần — dùng sau create/update product. */
export function upsertBulkStock(payload, { token } = {}) {
  return apiSend('/v1/inventory/stocks/bulk', { method: 'PUT', body: payload, token })
}
