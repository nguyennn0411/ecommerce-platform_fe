import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { fetchProductById, fetchProducts } from '../api/products'
import { fetchVariantStocks } from '../api/inventory'
import {
  findStock,
  formatVnd,
  getMainImage,
  normalizeColor,
  PLACEHOLDER_IMAGE,
  uniqueColors,
  uniqueSizes,
} from '../utils/productUtils'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [stockVariants, setStockVariants] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      setNotFound(false)
      setProduct(null)
      setStockVariants([])
      setRelated([])

      try {
        const detail = await fetchProductById(productId)
        if (cancelled) return
        setProduct(detail)

        const [stocksRes, allActive] = await Promise.all([
          fetchVariantStocks(productId).catch(() => ({ variants: [] })),
          fetchProducts({
            status: 'ACTIVE',
            categoryId: detail.categoryId,
          }).catch(() => []),
        ])

        if (cancelled) return
        setStockVariants(
          Array.isArray(stocksRes?.variants) ? stocksRes.variants : [],
        )
        setRelated(
          (Array.isArray(allActive) ? allActive : [])
            .filter((p) => p.id !== detail.id)
            .slice(0, 4),
        )
      } catch (err) {
        if (cancelled) return
        if (err?.status === 404) {
          setNotFound(true)
        } else {
          setError(
            err?.message ||
              'Không tải được chi tiết sản phẩm. Kiểm tra Gateway và các service.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [productId])

  if (loading) {
    return (
      <div className="sz-placeholder">
        <h1>Đang tải...</h1>
        <p style={{ color: '#6b6b6b' }}>Đang lấy catalog và tồn kho.</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="sz-placeholder">
        <h1>Không tìm thấy sản phẩm</h1>
        <p style={{ color: '#6b6b6b', marginBottom: '1.5rem' }}>
          Không có sản phẩm <code>{productId}</code> trên catalog.
        </p>
        <Link to="/products" className="sz-btn sz-btn-outline">
          Về danh sách sản phẩm
        </Link>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="sz-placeholder">
        <h1>Lỗi tải sản phẩm</h1>
        <p style={{ color: '#6b6b6b', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/products" className="sz-btn sz-btn-outline">
          Về danh sách sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <ProductDetailView
      product={product}
      stockVariants={stockVariants}
      related={related}
    />
  )
}

function ProductDetailView({ product, stockVariants, related }) {
  const sizes = useMemo(() => uniqueSizes(product), [product])
  const colors = useMemo(() => uniqueColors(product), [product])
  const hasColors = colors.length > 0

  const [activeImage, setActiveImage] = useState(getMainImage(product))
  const [size, setSize] = useState(sizes[0] || '')
  const [color, setColor] = useState(hasColors ? colors[0] : null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setActiveImage(getMainImage(product))
    const nextSizes = uniqueSizes(product)
    const nextColors = uniqueColors(product)
    setSize(nextSizes[0] || '')
    setColor(nextColors.length ? nextColors[0] : null)
    setToast('')
  }, [product])

  const stock = findStock(stockVariants, size, color)
  const available = stock?.availableQuantity ?? 0
  const inStock = Boolean(stock?.inStock) || available > 0

  const showComingSoon = (action) => {
    setToast(`${action} — Sắp ra mắt (chưa nối giỏ hàng/đơn hàng)`)
    window.setTimeout(() => setToast(''), 2800)
  }

  const selectedSku =
    product.variants?.find(
      (v) =>
        v.size === size && normalizeColor(v.color) === normalizeColor(color),
    )?.sku || '—'

  return (
    <div className="sz-detail">
      <nav className="sz-breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="sz-detail-grid">
        <div className="sz-gallery">
          <div className="sz-gallery-main">
            {!inStock ? (
              <span className="sz-badge sz-badge-dark">Hết hàng</span>
            ) : null}
            <img
              src={activeImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE
              }}
            />
          </div>
          {product.images?.length > 1 ? (
            <div className="sz-gallery-thumbs">
              {product.images.map((img) => {
                const url =
                  !img.imageUrl || img.imageUrl.includes('example.com')
                    ? PLACEHOLDER_IMAGE
                    : img.imageUrl
                return (
                  <button
                    key={img.id}
                    type="button"
                    className={`sz-thumb ${activeImage === url ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(url)}
                  >
                    <img src={url} alt="" />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="sz-detail-info">
          <p className="sz-detail-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="sz-detail-price">{formatVnd(product.basePrice)}</p>
          <p className="sz-detail-desc">
            {product.description || 'Chưa có mô tả.'}
          </p>

          {hasColors ? (
            <div className="sz-option-block">
              <div className="sz-option-label">
                Màu <span>{color}</span>
              </div>
              <div className="sz-option-row">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`sz-option-btn ${color === c ? 'is-active' : ''}`}
                    onClick={() => setColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="sz-option-block">
            <div className="sz-option-label">
              Cỡ <span>{size || '—'}</span>
            </div>
            <div className="sz-option-row">
              {sizes.map((s) => {
                const st = findStock(stockVariants, s, color)
                const disabled = stockVariants.length
                  ? !(st?.inStock || (st?.availableQuantity ?? 0) > 0)
                  : false
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    className={`sz-option-btn ${size === s ? 'is-active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <p className={`sz-stock ${inStock ? 'is-ok' : 'is-out'}`}>
            {stockVariants.length === 0
              ? 'Chưa có dữ liệu tồn kho (inventory)'
              : inStock
                ? `Còn ${available} đôi`
                : 'Hết hàng cho size/màu này'}
          </p>

          <div className="sz-detail-actions">
            <button
              type="button"
              className="sz-btn"
              disabled={!inStock}
              onClick={() => showComingSoon('Thêm vào giỏ')}
            >
              Thêm vào giỏ
            </button>
            <button
              type="button"
              className="sz-btn sz-btn-outline"
              disabled={!inStock}
              onClick={() => showComingSoon('Mua ngay')}
            >
              Mua ngay
            </button>
          </div>

          {toast ? <p className="sz-toast">{toast}</p> : null}

          <dl className="sz-meta">
            <div>
              <dt>Danh mục</dt>
              <dd>
                {product.categoryId ? (
                  <Link to={`/products?categoryId=${product.categoryId}`}>
                    {product.categoryName || '—'}
                  </Link>
                ) : (
                  product.categoryName || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Thương hiệu</dt>
              <dd>{product.brand || '—'}</dd>
            </div>
            <div>
              <dt>Mã SKU</dt>
              <dd>{selectedSku}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="sz-related">
          <div className="sz-section-head">
            <h2 className="sz-section-title">Có thể bạn cũng thích</h2>
            <Link to="/products" className="sz-link">
              Xem tất cả
            </Link>
          </div>
          <div className="sz-arrivals-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
