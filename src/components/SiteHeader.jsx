import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi'
import { useCart } from '../cart/CartContext.jsx'
import { getCurrentProfile } from '../keycloak.jsx'

let NAV_ITEMS = [
  { label: 'Mới về', to: '/' },
  { label: 'Thương hiệu', to: '/products' },
  { label: 'Nam', to: '/products' },
  { label: 'Nữ', to: '/products' },
  { label: 'Trẻ em', to: '/products' },
  { label: 'Bài viết', to: '/products' },
  { label: 'Dashboard', to: '/dashboard'}
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const profile = getCurrentProfile();
  if (!profile.roles.includes('ADMIN')) {
    NAV_ITEMS = NAV_ITEMS.filter((item) => item.label !== 'Dashboard');
  }
  

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
          <Link to="/checkout" className="sz-icon-btn" aria-label={`Giỏ hàng (${cartCount})`}>
            <FiShoppingBag />
            {cartCount ? <span className="sz-cart-count">{cartCount}</span> : null}
          </Link>
          <Link to="/orders" className="sz-icon-btn" aria-label="Tài khoản và đơn hàng">
            <FiUser />
          </Link>
        </div>
      </div>
    </header>
  )
}
