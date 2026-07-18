import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { fetchProducts } from '../api/products'
import {
  formatVnd,
  getMainImage,
  PLACEHOLDER_IMAGE,
} from '../utils/productUtils'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await fetchProducts({ status: 'ACTIVE' })
        if (!cancelled) setProducts(Array.isArray(list) ? list : [])
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setError(
            err?.message ||
              'Không tải được sản phẩm. Kiểm tra Gateway (:8080).',
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
  }, [])

  const featured = products[0]
  const sideTrends = products.slice(1, 3)
  const arrivals = products.slice(0, 4)

  return (
    <>
      <section className="sz-hero" aria-label="Bộ sưu tập mới">
        <div className="sz-hero-stage" aria-hidden />
        <img
          className="sz-hero-img"
          src="https://images.unsplash.com/photo-1608667508764-33cf0726b13a?auto=format&fit=crop&w=1200&q=80"
          alt="Giày nổi bật StepZone"
        />
        <div className="sz-hero-copy">
          <p className="sz-hero-kicker">Bộ sưu tập độc quyền</p>
          <h1 className="sz-hero-title">Hàng mới về</h1>
          <p className="sz-hero-text">
            Khám phá những mẫu giày mới nhất cho đường phố — số lượng giới hạn,
            chất liệu cao cấp, không thỏa hiệp.
          </p>
          <Link to="/products" className="sz-btn sz-btn-light">
            Xem bộ sưu tập
          </Link>
        </div>
      </section>

      <section className="sz-section" aria-labelledby="trending-heading">
        <div className="sz-section-head">
          <h2 id="trending-heading" className="sz-section-title">
            Đang thịnh hành
          </h2>
          <Link to="/products" className="sz-link">
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <div className="sz-empty">
            <h2>Đang tải...</h2>
          </div>
        ) : error ? (
          <div className="sz-empty">
            <h2>Không kết nối Backend</h2>
            <p>{error}</p>
            <Link to="/products" className="sz-btn sz-btn-outline">
              Thử trang sản phẩm
            </Link>
          </div>
        ) : !featured ? (
          <div className="sz-empty">
            <h2>Chưa có sản phẩm</h2>
            <p>Catalog đang trống hoặc chưa seed dữ liệu.</p>
          </div>
        ) : (
          <div className="sz-trending-grid">
            <Link to={`/products/${featured.id}`} className="sz-trend-card">
              <img
                src={getMainImage(featured)}
                alt={featured.name}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE
                }}
              />
              <div className="sz-trend-meta">
                <h3>{featured.name}</h3>
                <p>{formatVnd(featured.basePrice)}</p>
              </div>
            </Link>

            <div className="sz-trending-side">
              {sideTrends.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="sz-trend-card"
                >
                  <img
                    src={getMainImage(item)}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE
                    }}
                  />
                  <div className="sz-trend-meta">
                    <h3>{item.name}</h3>
                    <p>{formatVnd(item.basePrice)}</p>
                  </div>
                </Link>
              ))}
              {sideTrends.length === 0 ? (
                <Link to="/products" className="sz-trend-card">
                  <img src={PLACEHOLDER_IMAGE} alt="" />
                  <div className="sz-trend-meta">
                    <h3>Xem thêm sản phẩm</h3>
                    <p>Catalog StepZone</p>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="sz-section" aria-labelledby="arrivals-heading">
        <h2 id="arrivals-heading" className="sz-section-title center">
          Sản phẩm mới
        </h2>

        {!loading && !error && arrivals.length > 0 ? (
          <>
            <div className="sz-arrivals-grid">
              {arrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="sz-section-cta">
              <Link to="/products" className="sz-btn sz-btn-outline">
                Xem thêm sản phẩm
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </>
  )
}
