import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi'
import StaffShell from '../components/StaffShell'
import { createProduct, fetchProductById, updateProduct } from '../api/products'
import { createCategory, fetchCategories } from '../api/categories'
import { fetchVariantStocks, upsertBulkStock } from '../api/inventory'
import { findStock } from '../utils/productUtils'

const STATUSES = [
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Tạm ẩn' },
  { value: 'DISCONTINUED', label: 'Ngưng bán' },
]

function emptyVariant() {
  return { size: '', color: '', sku: '', quantity: '0' }
}

function emptyImage() {
  return { imageUrl: '', main: false }
}

/** Format số tiền VND khi gõ: 3200000 → 3.200.000 */
function formatPriceInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('vi-VN').format(Number(digits))
}

function parsePriceInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return NaN
  return Number(digits)
}

function parseQuantity(value) {
  const raw = String(value ?? '').trim()
  if (raw === '') return 0
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return NaN
  return Math.floor(n)
}

function toCatalogPayload(form) {
  const variants = (form.variants || [])
    .filter((v) => String(v.size || '').trim())
    .map((v) => ({
      size: String(v.size).trim(),
      color: String(v.color || '').trim() || null,
      sku: String(v.sku || '').trim() || null,
    }))

  const images = (form.images || [])
    .filter((img) => String(img.imageUrl || '').trim())
    .map((img, index) => ({
      imageUrl: String(img.imageUrl).trim(),
      main: Boolean(img.main) || index === 0,
    }))

  if (images.length > 0 && !images.some((img) => img.main)) {
    images[0].main = true
  }

  return {
    name: form.name.trim(),
    brand: form.brand.trim() || null,
    description: form.description.trim() || null,
    categoryId: form.categoryId || null,
    basePrice: parsePriceInput(form.basePrice),
    status: form.status || 'ACTIVE',
    variants,
    images,
  }
}

function toStockBulkPayload(productId, formVariants) {
  const items = (formVariants || [])
    .filter((v) => String(v.size || '').trim())
    .map((v) => ({
      size: String(v.size).trim(),
      color: String(v.color || '').trim() || null,
      quantity: parseQuantity(v.quantity),
    }))

  return { productId, items }
}

function normalizeCatalogForCompare(payload) {
  return JSON.stringify({
    name: payload.name || '',
    brand: payload.brand || null,
    description: payload.description || null,
    categoryId: payload.categoryId || null,
    basePrice: Number(payload.basePrice),
    status: payload.status || 'ACTIVE',
    variants: (payload.variants || []).map((v) => ({
      size: v.size,
      color: v.color || null,
      sku: v.sku || null,
    })),
    images: (payload.images || []).map((img) => ({
      imageUrl: img.imageUrl,
      main: Boolean(img.main),
    })),
  })
}

function mergeVariantsWithStock(productVariants, stockVariants) {
  if (!productVariants?.length) return [emptyVariant()]

  return productVariants.map((v) => {
    const stock = findStock(stockVariants, v.size, v.color)
    return {
      size: v.size || '',
      color: v.color || '',
      sku: v.sku || '',
      quantity: stock ? String(stock.quantity ?? 0) : '0',
    }
  })
}

export default function AdminProductFormPage({ auth, onLogout }) {
  const { productId } = useParams()
  const isEdit = Boolean(productId)
  const navigate = useNavigate()
  const token = auth?.token || ''

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [initialCatalogKey, setInitialCatalogKey] = useState('')

  const [form, setForm] = useState({
    name: '',
    brand: '',
    description: '',
    categoryId: '',
    basePrice: '',
    status: 'ACTIVE',
    variants: [emptyVariant()],
    images: [{ ...emptyImage(), main: true }],
  })

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const categoryList = await fetchCategories({ token })
        if (cancelled) return
        setCategories(Array.isArray(categoryList) ? categoryList : [])

        if (!isEdit) {
          setLoading(false)
          return
        }

        const [product, stockData] = await Promise.all([
          fetchProductById(productId, { token }),
          fetchVariantStocks(productId, { token }).catch(() => ({ variants: [] })),
        ])
        if (cancelled) return

        const stockVariants = stockData?.variants || []

        const nextForm = {
          name: product.name || '',
          brand: product.brand || '',
          description: product.description || '',
          categoryId: product.categoryId || '',
          basePrice: product.basePrice != null ? formatPriceInput(product.basePrice) : '',
          status: product.status || 'ACTIVE',
          variants: mergeVariantsWithStock(product.variants, stockVariants),
          images:
            product.images?.length > 0
              ? product.images.map((img) => ({
                  imageUrl: img.imageUrl || '',
                  main: Boolean(img.main),
                }))
              : [{ ...emptyImage(), main: true }],
        }
        setForm(nextForm)
        setInitialCatalogKey(normalizeCatalogForCompare(toCatalogPayload(nextForm)))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không tải được dữ liệu form.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [isEdit, productId, token])

  const previewUrl = useMemo(() => {
    const main = form.images.find((img) => img.main) || form.images[0]
    return main?.imageUrl?.trim() || ''
  }, [form.images])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateVariant(index, key, value) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  function updateImage(index, key, value) {
    setForm((prev) => {
      let images = prev.images.map((item, i) => (i === index ? { ...item, [key]: value } : item))
      if (key === 'main' && value) {
        images = images.map((item, i) => ({ ...item, main: i === index }))
      }
      return { ...prev, images }
    })
  }

  async function syncStock(savedProductId) {
    const stockPayload = toStockBulkPayload(savedProductId, form.variants)
    if (stockPayload.items.length === 0) return

    const invalid = stockPayload.items.find((item) => Number.isNaN(item.quantity))
    if (invalid) {
      throw new Error(`Số lượng kho không hợp lệ cho size ${invalid.size}.`)
    }

    await upsertBulkStock(stockPayload, { token })
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    try {
      const created = await createCategory({ name, description: null }, { token })
      setCategories((prev) => [...prev, created])
      updateField('categoryId', created.id)
      setNewCategoryName('')
      setInfo(`Đã tạo danh mục "${created.name}".`)
    } catch (err) {
      setError(err.message || 'Không tạo được danh mục.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setInfo('')

    const payload = toCatalogPayload(form)
    if (!payload.name) {
      setError('Vui lòng nhập tên sản phẩm.')
      return
    }
    if (!payload.basePrice || Number.isNaN(payload.basePrice) || payload.basePrice <= 0) {
      setError('Giá sản phẩm phải lớn hơn 0.')
      return
    }
    if (payload.variants.length === 0) {
      setError('Cần ít nhất 1 variant (size).')
      return
    }

    const stockCheck = toStockBulkPayload('temp', form.variants)
    if (stockCheck.items.some((item) => Number.isNaN(item.quantity))) {
      setError('Số lượng kho phải là số ≥ 0.')
      return
    }

    setSaving(true)
    try {
      let savedId = productId
      const catalogChanged =
        !isEdit || normalizeCatalogForCompare(payload) !== initialCatalogKey

      if (!isEdit) {
        const created = await createProduct(payload, { token })
        savedId = created.id
        setInitialCatalogKey(normalizeCatalogForCompare(payload))
      } else if (catalogChanged) {
        await updateProduct(productId, payload, { token })
        setInitialCatalogKey(normalizeCatalogForCompare(payload))
      }

      try {
        await syncStock(savedId)
        if (!isEdit) {
          setInfo('Đã tạo sản phẩm và đồng bộ tồn kho.')
        } else if (catalogChanged) {
          setInfo('Đã cập nhật sản phẩm và đồng bộ tồn kho.')
        } else {
          setInfo('Đã cập nhật tồn kho.')
        }
      } catch (stockErr) {
        setError(
          `Sản phẩm đã lưu nhưng đồng bộ kho thất bại: ${stockErr.message || 'lỗi không rõ'}. Hãy mở lại form và lưu lại số lượng.`,
        )
      }

      if (!isEdit) {
        navigate(`/staff/products/${savedId}/edit`, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Không lưu được sản phẩm.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <StaffShell auth={auth} onLogout={onLogout} roleLabel="Quản lý sản phẩm">
      <div className="staff-content staff-content--orders-only">
        <div className="admin-form-header">
          <div>
            <Link className="admin-back-link" to="/staff/products">
              <FiArrowLeft /> Quay lại danh sách
            </Link>
            <h2>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <p>Ảnh dùng URL công khai. Số lượng kho đồng bộ qua API inventory sau khi lưu.</p>
          </div>
          {previewUrl ? (
            <img className="admin-form-preview" src={previewUrl} alt="Preview" />
          ) : (
            <div className="admin-form-preview admin-form-preview--empty">Chưa có ảnh</div>
          )}
        </div>

        {loading ? <p>Đang tải...</p> : null}
        {error ? <p className="staff-inline-error">{error}</p> : null}
        {info ? <p className="admin-inline-info">{info}</p> : null}

        {!loading ? (
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <section className="admin-form-card">
              <h3>Thông tin cơ bản</h3>
              <div className="admin-form-grid">
                <label>
                  Tên sản phẩm *
                  <input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Brand
                  <input
                    value={form.brand}
                    onChange={(e) => updateField('brand', e.target.value)}
                    placeholder="Nike, Adidas..."
                  />
                </label>
                <label>
                  Giá (VND) *
                  <div className="admin-price-field">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="vd. 3.200.000"
                      value={form.basePrice}
                      onChange={(e) => updateField('basePrice', formatPriceInput(e.target.value))}
                      required
                    />
                    <span>₫</span>
                  </div>
                </label>
                <label>
                  Trạng thái
                  <select
                    value={form.status}
                    onChange={(e) => updateField('status', e.target.value)}
                  >
                    {STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-form-span-2">
                  Mô tả
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="admin-form-card">
              <h3>Danh mục</h3>
              <div className="admin-form-grid">
                <label>
                  Chọn danh mục
                  <select
                    value={form.categoryId}
                    onChange={(e) => updateField('categoryId', e.target.value)}
                  >
                    <option value="">— Không chọn —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tạo danh mục mới
                  <div className="admin-inline-row">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Tên danh mục"
                    />
                    <button type="button" onClick={handleCreateCategory}>
                      Tạo
                    </button>
                  </div>
                </label>
              </div>
            </section>

            <section className="admin-form-card">
              <div className="admin-form-card-head">
                <h3>Variants + tồn kho</h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))
                  }
                >
                  <FiPlus /> Thêm variant
                </button>
              </div>
              <div className="admin-variant-list">
                {form.variants.map((variant, index) => (
                  <div className="admin-variant-row" key={`variant-${index}`}>
                    <input
                      placeholder="Size *"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      required
                    />
                    <input
                      placeholder="Màu"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    />
                    <input
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="SL kho"
                      value={variant.quantity}
                      onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                      title="Số lượng tồn kho (absolute)"
                    />
                    <button
                      type="button"
                      aria-label="Xóa variant"
                      disabled={form.variants.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          variants: prev.variants.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-form-card">
              <div className="admin-form-card-head">
                <h3>Ảnh sản phẩm (URL)</h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, images: [...prev.images, emptyImage()] }))
                  }
                >
                  <FiPlus /> Thêm ảnh
                </button>
              </div>
              <div className="admin-image-list">
                {form.images.map((image, index) => (
                  <div className="admin-image-row" key={`image-${index}`}>
                    <input
                      placeholder="https://..."
                      value={image.imageUrl}
                      onChange={(e) => updateImage(index, 'imageUrl', e.target.value)}
                    />
                    <label className="admin-main-check">
                      <input
                        type="radio"
                        name="main-image"
                        checked={Boolean(image.main)}
                        onChange={() => updateImage(index, 'main', true)}
                      />
                      Ảnh chính
                    </label>
                    <button
                      type="button"
                      aria-label="Xóa ảnh"
                      disabled={form.images.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="admin-form-actions">
              <Link to="/staff/products">Hủy</Link>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </StaffShell>
  )
}
