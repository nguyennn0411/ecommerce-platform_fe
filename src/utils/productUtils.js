export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'

export const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export const getMainImage = (product) => {
  const images = product?.images
  if (!Array.isArray(images) || images.length === 0) return PLACEHOLDER_IMAGE
  const main = images.find((img) => img.main) || images[0]
  const url = main?.imageUrl
  if (!url || url.includes('example.com')) return PLACEHOLDER_IMAGE
  return url
}

export const uniqueSizes = (product) => [
  ...new Set((product?.variants || []).map((v) => v.size).filter(Boolean)),
]

export const uniqueColors = (product) => {
  const colors = (product?.variants || [])
    .map((v) => v.color)
    .filter((c) => c != null && String(c).trim() !== '')
  return [...new Set(colors)]
}

/** Normalize color for matching catalog ↔ inventory (null / empty = no color). */
export const normalizeColor = (color) => {
  if (color == null) return null
  const trimmed = String(color).trim()
  return trimmed === '' ? null : trimmed
}

export const findStock = (stockVariants, size, color) => {
  if (!Array.isArray(stockVariants)) return null
  const targetColor = normalizeColor(color)
  return (
    stockVariants.find(
      (s) =>
        s.size === size && normalizeColor(s.color) === targetColor,
    ) || null
  )
}

export const getBrandsFromProducts = (products) =>
  [...new Set((products || []).map((p) => p.brand).filter(Boolean))].sort()
