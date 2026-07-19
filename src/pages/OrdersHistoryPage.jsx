import { useEffect, useState } from 'react'
import { FiArrowRight, FiBox, FiCheckCircle, FiClock, FiCreditCard, FiRefreshCw, FiXCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const ORDER_API_BASE = '/api/v1/orders'

const FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'FAILED', label: 'Không thành công' },
]

const STATUS_META = {
  PENDING: { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock },
  PAYMENT_PENDING: { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'confirmed', icon: FiCheckCircle },
  FAILED: { label: 'Thanh toán thất bại', tone: 'failed', icon: FiXCircle },
  CANCELLED: { label: 'Đã hủy', tone: 'failed', icon: FiXCircle },
}

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return 'Chưa có thời gian'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getStatusMeta(status) {
  return STATUS_META[status] || { label: status || 'Đang xử lý', tone: 'pending', icon: FiClock }
}

export default function OrdersHistoryPage({ auth }) {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadOrders() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${ORDER_API_BASE}?userId=${encodeURIComponent(auth.userId)}`)
      const body = await response.json()
      if (!response.ok || !body?.success) {
        throw new Error(body?.message || 'Không tải được danh sách đơn hàng.')
      }
      setOrders(Array.isArray(body.data) ? body.data : [])
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối Order Service.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [auth.userId])

  const displayedOrders = filter === 'ALL'
    ? orders
    : orders.filter((order) => (
      order.status === filter ||
      (filter === 'PENDING' && order.status === 'PAYMENT_PENDING') ||
      (filter === 'FAILED' && order.status === 'CANCELLED')
    ))

  return (
    <section className="orders-page">
      <header className="orders-hero">
        <div>
          <p className="orders-eyebrow">Tài khoản / Đơn hàng</p>
          <h1>My Orders</h1>
          <p>Theo dõi thanh toán và trạng thái đơn hàng của bạn tại StepZone.</p>
        </div>
        <div className="orders-hero__meta">
          <FiBox aria-hidden />
          <span>{orders.length}</span>
          <small>đơn hàng</small>
        </div>
      </header>

      <div className="orders-toolbar">
        <div className="orders-tabs" role="tablist" aria-label="Lọc đơn hàng">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? 'is-active' : ''}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="orders-reload" onClick={loadOrders} disabled={loading}>
          <FiRefreshCw className={loading ? 'spin' : ''} />
          Làm mới
        </button>
      </div>

      {loading ? <div className="orders-state">Đang tải lịch sử đơn hàng...</div> : null}
      {!loading && error ? <div className="orders-state orders-state--error">{error}</div> : null}
      {!loading && !error && displayedOrders.length === 0 ? (
        <div className="orders-empty">
          <FiBox aria-hidden />
          <h2>Chưa có đơn hàng nào</h2>
          <p>{filter === 'ALL' ? 'Chọn một đôi giày để bắt đầu đơn hàng đầu tiên.' : 'Không có đơn phù hợp với trạng thái này.'}</p>
          <Link to="/products">Khám phá sản phẩm <FiArrowRight /></Link>
        </div>
      ) : null}

      {!loading && !error && displayedOrders.length ? (
        <div className="orders-list">
          {displayedOrders.map((order) => {
            const meta = getStatusMeta(order.status)
            const StatusIcon = meta.icon
            const totalItems = (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0)

            return (
              <article className="order-card" key={order.orderId}>
                <div className="order-card__top">
                  <div>
                    <p>Đơn hàng</p>
                    <h2>#{order.orderId?.slice(0, 8).toUpperCase()}</h2>
                    <small>{formatDate(order.createdAt)}</small>
                  </div>
                  <span className={`order-status order-status--${meta.tone}`}>
                    <StatusIcon aria-hidden /> {meta.label}
                  </span>
                </div>

                <div className="order-card__items">
                  {(order.items || []).slice(0, 2).map((item) => (
                    <div className="order-item" key={item.id || `${item.productId}-${item.size}-${item.color}`}>
                      <div className="order-item__thumbnail"><FiBox aria-hidden /></div>
                      <div>
                        <h3>{item.productName || 'Sản phẩm StepZone'}</h3>
                        <p>{[item.color, item.size ? `Size ${item.size}` : ''].filter(Boolean).join(' · ') || 'Phiên bản tiêu chuẩn'}</p>
                        <small>SL {item.quantity}</small>
                      </div>
                      <strong>{formatVnd(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 0))}</strong>
                    </div>
                  ))}
                  {(order.items || []).length > 2 ? <p className="order-card__more">+{order.items.length - 2} sản phẩm khác</p> : null}
                </div>

                <footer className="order-card__footer">
                  <span><FiCreditCard aria-hidden /> {totalItems} sản phẩm</span>
                  <div>
                    <small>Tổng thanh toán</small>
                    <strong>{formatVnd(order.totalAmount)}</strong>
                  </div>
                  <Link to={`/orders/${order.orderId}`}>Xem chi tiết <FiArrowRight /></Link>
                </footer>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
