import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiRefreshCw, FiSearch, FiXCircle } from 'react-icons/fi'
import StaffShell from '../components/StaffShell'
import { fetchProducts, discontinueProduct } from '../api/products'
import { fetchCategories } from '../api/categories'
import { formatVnd, getMainImage } from '../utils/productUtils'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Tạm ẩn' },
  { value: 'DISCONTINUED', label: 'Ngưng bán' },
]

const STATUS_LABEL = {
  ACTIVE: 'Đang bán',
  INACTIVE: 'Tạm ẩn',
  DISCONTINUED: 'Ngưng bán',
}

export default function AdminProductListPage({ auth, onLogout }) {
  const navigate = useNavigate()
  const token = auth?.token || ''
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [productList, categoryList] = await Promise.all([
        fetchProducts({
          q: search.trim() || undefined,
          categoryId: categoryId || undefined,
          status: status || undefined,
          token,
        }),
        fetchCategories({ token }),
      ])
      setProducts(Array.isArray(productList) ? productList : [])
      setCategories(Array.isArray(categoryList) ? categoryList : [])
      setError('')
    } catch (err) {
      setError(err.message || 'Không tải được danh sách sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, categoryId])

  const stats = useMemo(() => {
    const list = products
    return {
      total: list.length,
      active: list.filter((p) => p.status === 'ACTIVE').length,
      inactive: list.filter((p) => p.status === 'INACTIVE').length,
      discontinued: list.filter((p) => p.status === 'DISCONTINUED').length,
    }
  }, [products])

  async function handleSearch(event) {
    event.preventDefault()
    await loadData()
  }

  async function handleDiscontinue(product) {
    if (!product?.id || product.status === 'DISCONTINUED') return
    const ok = window.confirm(`Ngưng bán sản phẩm "${product.name}"?`)
    if (!ok) return

    setBusyId(product.id)
    try {
      await discontinueProduct(product.id, { token })
      await loadData()
    } catch (err) {
      setError(err.message || 'Không ngưng bán được sản phẩm.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <StaffShell
      auth={auth}
      onLogout={onLogout}
      roleLabel="Quản lý sản phẩm"
      topbarExtra={
        <form className="staff-topbar-search" onSubmit={handleSearch}>
          <FiSearch aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên, brand sản phẩm..."
          />
          {search ? (
            <button
              type="button"
              onClick={async () => {
                setSearch('')
                setLoading(true)
                try {
                  const productList = await fetchProducts({
                    categoryId: categoryId || undefined,
                    status: status || undefined,
                    token,
                  })
                  setProducts(Array.isArray(productList) ? productList : [])
                  setError('')
                } catch (err) {
                  setError(err.message || 'Không tải được danh sách sản phẩm.')
                } finally {
                  setLoading(false)
                }
              }}
              aria-label="Xóa tìm kiếm"
            >
              <FiXCircle />
            </button>
          ) : null}
        </form>
      }
    >
      <div className="staff-content staff-content--orders-only">
        <section className="staff-queue-summary staff-queue-summary--4">
          <article>
            <span>Tổng SP</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>Đang bán</span>
            <strong>{stats.active}</strong>
          </article>
          <article>
            <span>Tạm ẩn</span>
            <strong>{stats.inactive}</strong>
          </article>
          <article>
            <span>Ngưng bán</span>
            <strong>{stats.discontinued}</strong>
          </article>
        </section>

        <div className="staff-filter-row admin-product-toolbar">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.value || 'all'}
              type="button"
              className={status === item.value ? 'is-active' : ''}
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </button>
          ))}

          <select
            className="admin-product-select"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Lọc danh mục"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="button" onClick={loadData}>
            <FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới
          </button>
          <Link className="admin-product-primary-link" to="/staff/products/new">
            <FiPlus /> Thêm sản phẩm
          </Link>
        </div>

        {error ? <p className="staff-inline-error">{error}</p> : null}

        <section className="staff-order-list">
          <header>
            <h2>Danh sách sản phẩm</h2>
            <span>{loading ? 'Đang tải...' : `${products.length} sản phẩm`}</span>
          </header>

          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Variant</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      className="admin-product-thumb"
                      src={getMainImage(product)}
                      alt={product.name}
                    />
                  </td>
                  <td>
                    <b>{product.name}</b>
                    <small>{product.brand || 'Không brand'}</small>
                  </td>
                  <td>{product.categoryName || '—'}</td>
                  <td>{formatVnd(product.basePrice)}</td>
                  <td>{(product.variants || []).length}</td>
                  <td>
                    <span className={`admin-status admin-status--${String(product.status || '').toLowerCase()}`}>
                      {STATUS_LABEL[product.status] || product.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-product-actions">
                      <button type="button" onClick={() => navigate(`/staff/products/${product.id}/edit`)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={product.status === 'DISCONTINUED' || busyId === product.id}
                        onClick={() => handleDiscontinue(product)}
                      >
                        Ngưng bán
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7}>Chưa có sản phẩm nào.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <p className="admin-product-note">
          Tạo/sửa sản phẩm sẽ đồng bộ tồn kho qua API inventory (bulk upsert).
        </p>
      </div>
    </StaffShell>
  )
}
