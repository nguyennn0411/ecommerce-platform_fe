import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  formatVnd,
  getProductById,
  getStock,
  products,
  uniqueColors,
  uniqueSizes,
} from '../data/mockProducts'
import ProductCard from '../components/ProductCard'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const product = getProductById(productId)

  if (!product) {
    return (
      <div className="sz-placeholder">
        <h1>Product not found</h1>
        <p style={{ color: '#6b6b6b', marginBottom: '1.5rem' }}>
          Không tìm thấy sản phẩm <code>{productId}</code> trong mock data.
        </p>
        <Link to="/products" className="sz-btn sz-btn-outline">
          Back to Products
        </Link>
      </div>
    )
  }

  return <ProductDetailView product={product} />
}

function ProductDetailView({ product }) {
  const sizes = useMemo(() => uniqueSizes(product), [product])
  const colors = useMemo(() => uniqueColors(product), [product])
  const hasColors = colors.length > 0

  const [activeImage, setActiveImage] = useState(
    product.images.find((i) => i.main)?.imageUrl || product.images[0]?.imageUrl,
  )
  const [size, setSize] = useState(sizes[0] || '')
  const [color, setColor] = useState(hasColors ? colors[0] : null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setActiveImage(
      product.images.find((i) => i.main)?.imageUrl || product.images[0]?.imageUrl,
    )
    setSize(uniqueSizes(product)[0] || '')
    const nextColors = uniqueColors(product)
    setColor(nextColors.length ? nextColors[0] : null)
    setToast('')
  }, [product])

  const stock = getStock(product, size, color)
  const available = stock?.available ?? 0
  const inStock = available > 0

  const related = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4)

  const showComingSoon = (action) => {
    setToast(`${action} — Coming soon (chưa nối cart/order)`)
    window.setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="sz-detail">
      <nav className="sz-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="sz-detail-grid">
        <div className="sz-gallery">
          <div className="sz-gallery-main">
            {product.soldOut || !inStock ? (
              <span className="sz-badge sz-badge-dark">
                {product.soldOut ? 'Sold Out' : 'Out of Stock'}
              </span>
            ) : product.badge ? (
              <span className="sz-badge">{product.badge}</span>
            ) : null}
            <img src={activeImage} alt={product.name} />
          </div>
          {product.images.length > 1 ? (
            <div className="sz-gallery-thumbs">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className={`sz-thumb ${activeImage === img.imageUrl ? 'is-active' : ''}`}
                  onClick={() => setActiveImage(img.imageUrl)}
                >
                  <img src={img.imageUrl} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="sz-detail-info">
          <p className="sz-detail-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="sz-detail-price">{formatVnd(product.basePrice)}</p>
          <p className="sz-detail-desc">{product.description}</p>

          {hasColors ? (
            <div className="sz-option-block">
              <div className="sz-option-label">
                Color <span>{color}</span>
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
              Size <span>{size || '—'}</span>
            </div>
            <div className="sz-option-row">
              {sizes.map((s) => {
                const st = getStock(product, s, color)
                const disabled = !st || st.available <= 0
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
            {inStock
              ? `Còn ${available} đôi · ${stock?.status || 'IN_STOCK'}`
              : 'Hết hàng cho size/màu này'}
          </p>

          <div className="sz-detail-actions">
            <button
              type="button"
              className="sz-btn"
              disabled={!inStock}
              onClick={() => showComingSoon('Add to cart')}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="sz-btn sz-btn-outline"
              disabled={!inStock}
              onClick={() => showComingSoon('Buy now')}
            >
              Buy Now
            </button>
          </div>

          {toast ? <p className="sz-toast">{toast}</p> : null}

          <dl className="sz-meta">
            <div>
              <dt>Category</dt>
              <dd>
                <Link to={`/products?categoryId=${product.categoryId}`}>
                  {product.categoryName}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Collection</dt>
              <dd>{product.collection || '—'}</dd>
            </div>
            <div>
              <dt>SKU (selected)</dt>
              <dd>
                {product.variants.find(
                  (v) =>
                    v.size === size && (v.color ?? null) === (color ?? null),
                )?.sku || '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="sz-related">
          <div className="sz-section-head">
            <h2 className="sz-section-title">You may also like</h2>
            <Link to="/products" className="sz-link">
              View All
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
