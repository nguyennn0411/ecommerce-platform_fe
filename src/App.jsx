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
import { getCurrentProfile, logout } from './keycloak.jsx'
import { CartProvider } from './cart/CartContext.jsx'

function CheckoutRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }

  return <CheckoutPage auth={auth} onLogout={logout} />
}

function OrdersRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }

  return <OrdersHistoryPage auth={auth} />
}

function OrderDetailRoute({ auth }) {
  if (!auth?.authenticated) {
    return <Navigate to="/login" replace />
  }

  return <OrderDetailPage />
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
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="orders" element={<OrdersRoute auth={auth} />} />
          <Route path="orders/:orderId" element={<OrderDetailRoute auth={auth} />} />
        </Route>
        <Route
          path="login"
          element={
            auth?.authenticated ? (
              <Navigate to="/" replace />
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
