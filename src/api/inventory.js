import { apiGet } from './client'

export function fetchVariantStocks(productId) {
  return apiGet(`/v1/inventory/stocks/${productId}/variants`)
}
