import { apiGet } from './client'

export function fetchCategories() {
  return apiGet('/v1/categories')
}
