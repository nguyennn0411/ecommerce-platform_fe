import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { fetchCategories } from '../api/categories'
import { fetchProducts } from '../api/products'
import { getBrandsFromProducts } from '../utils/productUtils'

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const brand = searchParams.get('brand') || ''

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const [cats, list] = await Promise.all([
          fetchCategories(),
          fetchProducts({ q, categoryId, status: 'ACTIVE' }),
        ])
        if (cancelled) return
        setCategories(Array.isArray(cats) ? cats : [])
        setProducts(Array.isArray(list) ? list : [])
      } catch (err) {
        if (cancelled) return
        setCategories([])
        setProducts([])
        setError(
          err?.message ||
            'Không tải được sản phẩm. Kiểm tra Gateway (:8080) và product-catalog.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, q ? 300 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [q, categoryId, reloadKey])

  const brands = useMemo(() => getBrandsFromProducts(products), [products])
  const filtered = useMemo(() => {
    if (!brand) return products
    return products.filter((p) => p.brand === brand)
  }, [products, brand])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value) next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({})

  return (
    <div className="sz-catalog">
      <div className="sz-catalog-hero">
        <p className="sz-hero-kicker" style={{ color: 'inherit', opacity: 0.55 }}>
          Danh mục StepZone
        </p>
        <h1>Tất cả sản phẩm</h1>
        <p>
          {loading ? 'Đang tải...' : `${filtered.length} sản phẩm`}
          {q ? ` khớp với “${q}”` : ''}
        </p>
      </div>

      <div className="sz-catalog-layout">
        <aside className="sz-filters" aria-label="Bộ lọc">
          <div className="sz-filter-block">
            <h2>Tìm kiếm</h2>
            <input
              className="sz-filter-input"
              type="search"
              placeholder="Tên, thương hiệu..."
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
            />
          </div>

          <div className="sz-filter-block">
            <h2>Danh mục</h2>
            <button
              type="button"
              className={`sz-filter-chip ${!categoryId ? 'is-active' : ''}`}
              onClick={() => updateParam('categoryId', '')}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`sz-filter-chip ${categoryId === cat.id ? 'is-active' : ''}`}
                onClick={() => updateParam('categoryId', cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="sz-filter-block">
            <h2>Thương hiệu</h2>
            <button
              type="button"
              className={`sz-filter-chip ${!brand ? 'is-active' : ''}`}
              onClick={() => updateParam('brand', '')}
            >
              Tất cả
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                className={`sz-filter-chip ${brand === b ? 'is-active' : ''}`}
                onClick={() => updateParam('brand', b)}
              >
                {b}
              </button>
            ))}
          </div>

          {(q || categoryId || brand) && (
            <button
              type="button"
              className="sz-link sz-clear-filters"
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </button>
          )}
        </aside>

        <section className="sz-catalog-grid-wrap">
          {loading ? (
            <div className="sz-empty">
              <h2>Đang tải sản phẩm...</h2>
              <p>Đang gọi API catalog qua Gateway.</p>
            </div>
          ) : error ? (
            <div className="sz-empty">
              <h2>Không kết nối được Backend</h2>
              <p>{error}</p>
              <button
                type="button"
                className="sz-btn sz-btn-outline"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Thử lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="sz-empty">
              <h2>Không tìm thấy sản phẩm</h2>
              <p>Thử đổi từ khóa hoặc bỏ bộ lọc.</p>
              <button
                type="button"
                className="sz-btn sz-btn-outline"
                onClick={clearFilters}
              >
                Đặt lại
              </button>
            </div>
          ) : (
            <div className="sz-arrivals-grid sz-catalog-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="sz-catalog-note">
            <Link to="/">← Về trang chủ</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
