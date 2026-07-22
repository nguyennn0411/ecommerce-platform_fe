import { NavLink } from 'react-router-dom'
import {
  FiBox,
  FiHome,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiUser,
  FiUsers,
} from 'react-icons/fi'

const NAV_ITEMS = [
  { to: '/staff/orders', label: 'Đơn hàng', icon: FiShoppingBag, end: true },
  { to: '/staff/products', label: 'Sản phẩm', icon: FiPackage },
  { to: null, label: 'Tồn kho', icon: FiBox, soon: true },
  { to: null, label: 'Khách hàng', icon: FiUsers, soon: true },
  { to: null, label: 'Cài đặt', icon: FiSettings, soon: true },
]

export default function StaffShell({
  auth,
  onLogout,
  title = 'Trang nhân viên',
  subtitle = 'Quản lý vận hành',
  roleLabel = 'Nhân viên',
  topbarExtra = null,
  children,
}) {
  const isAdmin = (auth?.roles || []).includes('ADMIN')

  return (
    <main className="staff-shell">
      <aside className="staff-sidebar">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <nav aria-label="Staff navigation">
          <span className="staff-nav-muted">
            <FiHome /> Tổng quan
          </span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            if (item.soon || !item.to) {
              return (
                <span key={item.label} className="staff-nav-muted" title="Sắp có">
                  <Icon /> {item.label}
                </span>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={Boolean(item.end)}
                className={({ isActive }) => (isActive ? 'staff-nav-active' : undefined)}
              >
                <Icon /> {item.label}
              </NavLink>
            )
          })}
          {isAdmin ? (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'staff-nav-active' : undefined)}
            >
              <FiHome /> Dashboard
            </NavLink>
          ) : null}
        </nav>
        <button type="button" onClick={onLogout}>
          <FiLogOut /> Đăng xuất
        </button>
      </aside>

      <section className="staff-workspace">
        <header className="staff-topbar">
          {topbarExtra || <div />}
          <div>
            <span>
              {auth?.fullName || auth?.email || 'Nhân viên'}
              <small>{roleLabel}</small>
            </span>
            <FiUser />
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}
