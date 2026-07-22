import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import OrdersHistoryPage from './pages/OrdersHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import StaffOrdersPage from './pages/StaffOrdersPage'
import AdminProductListPage from './pages/AdminProductListPage'
import AdminProductFormPage from './pages/AdminProductFormPage'
import { getCurrentProfile, logout } from './keycloak.jsx'
import { CartProvider } from './cart/CartContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import UserProfile from './pages/UserProfile.jsx'

function hasStaffAccess(auth) {
  const roles = auth?.roles || []
  return roles.includes('STAFF') || roles.includes('ADMIN')
}

function CustomerOnlyRoute({ auth, children }) {
  if (hasStaffAccess(auth)) {
    return <Navigate to="/staff/orders" replace />
  }

  return children
}

function CheckoutRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }
  if (hasStaffAccess(auth)) {
    return <Navigate to="/staff/orders" replace />
  }

  return <CheckoutPage auth={auth} onLogout={logout} />
}

function OrdersRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }
  if (hasStaffAccess(auth)) {
    return <Navigate to="/staff/orders" replace />
  }

  return <OrdersHistoryPage auth={auth} onLogout={logout} />
}

function OrderDetailRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }
  if (hasStaffAccess(auth)) {
    return <Navigate to="/staff/orders" replace />
  }

  return <OrderDetailPage auth={auth} />
}

function StaffOrdersRoute({ auth }) {
  if (!auth?.authenticated) return <Navigate to="/login" replace />
  if (!hasStaffAccess(auth)) {
    return <Navigate to="/orders" replace />
  }

  return <StaffOrdersPage auth={auth} onLogout={logout} />
}

function StaffProductsRoute({ auth }) {
  if (!auth?.authenticated) return <Navigate to="/login" replace />
  if (!hasStaffAccess(auth)) {
    return <Navigate to="/orders" replace />
  }

  return <AdminProductListPage auth={auth} onLogout={logout} />
}

function StaffProductFormRoute({ auth }) {
  if (!auth?.authenticated) return <Navigate to="/login" replace />
  if (!hasStaffAccess(auth)) {
    return <Navigate to="/orders" replace />
  }

  return <AdminProductFormPage auth={auth} onLogout={logout} />
}

function UserProfileRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }
  return <UserProfile />
}

function App({ initialAuth }) {
  const [auth, setAuth] = useState(initialAuth)

  function handleAuthSuccess() {
    setAuth(getCurrentProfile())
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="staff/orders" element={<StaffOrdersRoute auth={auth} />} />
          <Route path="staff/products" element={<StaffProductsRoute auth={auth} />} />
          <Route path="staff/products/new" element={<StaffProductFormRoute auth={auth} />} />
          <Route path="staff/products/:productId/edit" element={<StaffProductFormRoute auth={auth} />} />
          <Route element={<MainLayout />}>
            <Route index element={<CustomerOnlyRoute auth={auth}><HomePage /></CustomerOnlyRoute>} />
            <Route path="products" element={<CustomerOnlyRoute auth={auth}><ProductListPage /></CustomerOnlyRoute>} />
            <Route path="products/:productId" element={<CustomerOnlyRoute auth={auth}><ProductDetailPage /></CustomerOnlyRoute>} />
            <Route path="orders" element={<OrdersRoute auth={auth} />} />
            <Route path="orders/:orderId" element={<OrderDetailRoute auth={auth} />} />
            <Route path="profile" element={<UserProfileRoute auth={auth} />} />
          </Route>
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="login"
            element={
              auth?.authenticated ? (
                <Navigate to={hasStaffAccess(auth) ? '/staff/orders' : '/'} replace />
              ) : (
                <LoginPage onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route path="checkout" element={<CheckoutRoute auth={auth} />} />
          <Route path="payment/success" element={<PaymentSuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
