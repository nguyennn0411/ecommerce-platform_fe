import { NavLink } from 'react-router-dom'

function DashboardSidebar() {
  return (
    <div
      className="d-flex flex-column p-3 bg-light"
      style={{ width: '250px', minHeight: '100vh' }}
    >
      <p className="d-flex align-items-center mb-3 text-dark text-decoration-none fs-4 fw-bold">
        Dashboard
      </p>
      <hr />
      <nav className="flex-column nav nav-pills">
        <NavLink to="/staff/products" className="nav-link text-dark">
          Sản phẩm
        </NavLink>
        <NavLink to="/staff/orders" className="nav-link text-dark">
          Đơn hàng
        </NavLink>
        <NavLink to="/" className="nav-link text-dark">
          Về trang chủ
        </NavLink>
      </nav>
    </div>
  )
}

export default DashboardSidebar
