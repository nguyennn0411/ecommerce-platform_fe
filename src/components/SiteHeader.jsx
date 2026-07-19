import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi'

const NAV_ITEMS = [
  { label: 'Mới về', to: '/' },
  { label: 'Thương hiệu', to: '/products' },
  { label: 'Nam', to: '/products' },
  { label: 'Nữ', to: '/products' },
  { label: 'Trẻ em', to: '/products' },
  { label: 'Bài viết', to: '/products' },
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  return (
    <header className="sz-header">
      <div className="sz-header-inner">
        <Link to="/" className="sz-logo">
          StepZone
        </Link>

        <button
          type="button"
          className="sz-icon-btn sz-menu-toggle"
          aria-label="Mở menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`sz-nav ${menuOpen ? 'is-open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                item.to === '/' ? (isActive ? 'is-active' : undefined) : undefined
              }
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sz-header-actions">
          <form className="sz-search" onSubmit={onSearch}>
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm sản phẩm"
            />
          </form>
          <button type="button" className="sz-icon-btn" aria-label="Yêu thích">
            <FiHeart />
          </button>
          <button type="button" className="sz-icon-btn" aria-label="Giỏ hàng">
            <FiShoppingBag />
          </button>
          <Link to="/login" className="sz-icon-btn" aria-label="Tài khoản">
            <FiUser />
          </Link>
        </div>
      </div>
    </header>
  )
}
