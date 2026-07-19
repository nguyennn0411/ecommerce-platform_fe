const API_BASE = 'https://provinces.open-api.vn/api/v2'

let provincesCache = null
const wardsCache = new Map()

export async function fetchVietnamProvinces() {
  if (provincesCache) return provincesCache

  const response = await fetch(`${API_BASE}/p/`)
  if (!response.ok) throw new Error('Không tải được danh sách tỉnh/thành.')
  const data = await response.json()
  provincesCache = Array.isArray(data) ? data : []
  return provincesCache
}

export async function fetchVietnamWards(provinceCode) {
  if (!provinceCode) return []
  if (wardsCache.has(provinceCode)) return wardsCache.get(provinceCode)

  const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`)
  if (!response.ok) throw new Error('Không tải được danh sách phường/xã.')
  const data = await response.json()
  const wards = Array.isArray(data?.wards) ? data.wards : []
  wardsCache.set(provinceCode, wards)
  return wards
}
