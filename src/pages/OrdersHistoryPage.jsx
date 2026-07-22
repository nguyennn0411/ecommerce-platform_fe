import { useEffect, useMemo, useState } from 'react'
import { FiArrowRight, FiBox, FiCheckCircle, FiClock, FiCreditCard, FiLogOut, FiRefreshCw, FiSearch, FiTruck, FiXCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { fetchProductById } from '../api/products'
import { getMainImage } from '../utils/productUtils'

const ORDER_API_BASE = '/api/v1/orders'
const ORDERS_PER_PAGE = 5

const FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã thanh toán' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'FAILED', label: 'Không thành công' },
]

const STATUS_META = {
  PENDING: { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock },
  PAYMENT_PENDING: { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock },
  CONFIRMED: { label: 'Đã thanh toán', tone: 'confirmed', icon: FiCheckCircle },
  SHIPPING: { label: 'Đang giao', tone: 'shipping', icon: FiTruck },
  COMPLETED: { label: 'Hoàn thành', tone: 'completed', icon: FiCheckCircle },
  RETURNED: { label: 'Hoàn về', tone: 'returned', icon: FiRefreshCw },
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

function getMemberRank(totalSpent) {
  if (totalSpent >= 50000000) return 'Kim cương'
  if (totalSpent >= 10000000) return 'Vàng'
  if (totalSpent >= 5000000) return 'Bạc'
  return 'Thành viên mới'
}

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function OrdersHistoryPage({ auth, onLogout }) {
  const [orders, setOrders] = useState([])
  const [productImages, setProductImages] = useState({})
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
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
      const orderData = Array.isArray(body.data) ? body.data : []
      setOrders(orderData)

      const productIds = [...new Set(orderData.flatMap((order) => (
        (order.items || []).map((item) => item.productId).filter(Boolean)
      )))]
      const products = await Promise.all(productIds.map(async (productId) => {
        try {
          return [productId, await fetchProductById(productId)]
        } catch {
          return [productId, null]
        }
      }))
      setProductImages(Object.fromEntries(products
        .filter(([, product]) => product)
        .map(([productId, product]) => [productId, getMainImage(product)])))
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

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  const displayedOrders = useMemo(() => {
    const byStatus = filter === 'ALL'
      ? orders
      : orders.filter((order) => (
        order.status === filter ||
        (filter === 'PENDING' && order.status === 'PAYMENT_PENDING') ||
        (filter === 'FAILED' && ['CANCELLED', 'RETURNED'].includes(order.status))
      ))

    const keyword = normalizeSearch(search.trim())
    if (!keyword) return byStatus

    return byStatus.filter((order) => {
      const statusLabel = getStatusMeta(order.status).label
      const itemValues = (order.items || []).flatMap((item) => [
        item.productName,
        item.productId,
        item.size,
        item.color,
      ])

      return [
        order.orderId,
        order.description,
        order.status,
        statusLabel,
        order.totalAmount,
        order.paymentOrderCode,
        ...itemValues,
      ].some((value) => normalizeSearch(value).includes(keyword))
    })
  }, [filter, orders, search])

  const totalPages = Math.max(1, Math.ceil(displayedOrders.length / ORDERS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * ORDERS_PER_PAGE
  const pageEnd = pageStart + ORDERS_PER_PAGE
  const paginatedOrders = displayedOrders.slice(pageStart, pageEnd)
  const totalSpent = orders
    .filter((order) => ['CONFIRMED', 'SHIPPING', 'COMPLETED'].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
  const memberRank = getMemberRank(totalSpent)
  const displayName = auth.fullName || auth.username || auth.email || 'Khách hàng'

  return (
    <section className="orders-page">
      <header className="orders-hero">
        <div>
          <p className="orders-eyebrow">Tài khoản / Đơn hàng</p>
          <h1>{displayName}</h1>
          <p>Theo dõi thanh toán và trạng thái đơn hàng của bạn tại StepZone.</p>
        </div>
        <div className="orders-hero__meta">
          <article>
            <FiBox aria-hidden />
            <span>{orders.length}</span>
            <small>đơn hàng</small>
          </article>
          <article>
            <FiCreditCard aria-hidden />
            <span>{formatVnd(totalSpent)}</span>
            <small>tổng tiền hàng</small>
          </article>
          <div className="orders-member-row">
            <p>Hạng thành viên: <strong>{memberRank}</strong></p>
            <button type="button" className="orders-logout" onClick={onLogout}>
              <FiLogOut />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="orders-toolbar">
        <label className="orders-search">
          <FiSearch aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, sản phẩm, size, màu..."
          />
          {search ? (
            <button type="button" onClick={() => setSearch('')} aria-label="Xóa tìm kiếm">
              <FiXCircle />
            </button>
          ) : null}
        </label>
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
        <>
          <div className="orders-list">
          {paginatedOrders.map((order) => {
            const meta = getStatusMeta(order.status)
            const StatusIcon = meta.icon
            const totalItems = (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0)

            return (
              <article className="order-card" key={order.orderId}>
                <div className="order-card__top">
                  <div className="order-card__identity">
                    <p>Đơn hàng</p>
                    <h2>#{order.orderId?.slice(0, 8).toUpperCase()}</h2>
                    <small>{formatDate(order.createdAt)}</small>
                  </div>
                  <div className="order-card__status">
                    <span className={`order-status order-status--${meta.tone}`}>
                      <StatusIcon aria-hidden /> {meta.label}
                    </span>
                  </div>
                </div>

                <div className="order-card__items">
                  {(order.items || []).slice(0, 2).map((item) => (
                    <div className="order-item" key={item.id || `${item.productId}-${item.size}-${item.color}`}>
                      <div className="order-item__thumbnail">
                        {productImages[item.productId]
                          ? <img src={productImages[item.productId]} alt={item.productName || 'Sản phẩm'} />
                          : <FiBox aria-hidden />}
                      </div>
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
                  {order.status === 'PAYMENT_PENDING' || order.status === 'PENDING' ? (
                    <small className="order-card__footer-note">Thanh toán trong 1 phút trước khi hủy đơn</small>
                  ) : null}
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
          <div className="orders-pagination">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trang trước
            </button>
            <span>Trang {safePage} / {totalPages}</span>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Trang sau
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
