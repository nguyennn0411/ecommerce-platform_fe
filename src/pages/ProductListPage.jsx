import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import {
  categories,
  filterProducts,
  getBrands,
} from '../data/mockProducts'

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const brand = searchParams.get('brand') || ''

  const brands = useMemo(() => getBrands(), [])
  const filtered = useMemo(
    () => filterProducts({ q, categoryId, brand }),
    [q, categoryId, brand],
  )

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
          StepZone Catalog
        </p>
        <h1>All Products</h1>
        <p>
          {filtered.length} silhouette{filtered.length === 1 ? '' : 's'}
          {q ? ` matching “${q}”` : ''}
        </p>
      </div>

      <div className="sz-catalog-layout">
        <aside className="sz-filters" aria-label="Filters">
          <div className="sz-filter-block">
            <h2>Search</h2>
            <input
              className="sz-filter-input"
              type="search"
              placeholder="Name, brand..."
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
            />
          </div>

          <div className="sz-filter-block">
            <h2>Category</h2>
            <button
              type="button"
              className={`sz-filter-chip ${!categoryId ? 'is-active' : ''}`}
              onClick={() => updateParam('categoryId', '')}
            >
              All
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
            <h2>Brand</h2>
            <button
              type="button"
              className={`sz-filter-chip ${!brand ? 'is-active' : ''}`}
              onClick={() => updateParam('brand', '')}
            >
              All
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
            <button type="button" className="sz-link sz-clear-filters" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </aside>

        <section className="sz-catalog-grid-wrap">
          {filtered.length === 0 ? (
            <div className="sz-empty">
              <h2>No products found</h2>
              <p>Thử đổi từ khóa hoặc bỏ bộ lọc.</p>
              <button type="button" className="sz-btn sz-btn-outline" onClick={clearFilters}>
                Reset
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
            <Link to="/">← Back to Home</Link>
            <span>Mock data — chưa nối API</span>
          </div>
        </section>
      </div>
    </div>
  )
}
