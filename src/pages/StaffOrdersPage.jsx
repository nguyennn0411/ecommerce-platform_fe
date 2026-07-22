import { useEffect, useMemo, useState } from 'react'
import {
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi'
import StaffShell from '../components/StaffShell'

const ORDER_API_BASE = '/api/v1/orders'
const ORDERS_PER_PAGE = 8

const FILTERS = [
  { value: '', label: 'Tất cả đơn' },
  { value: 'PAYMENT_PENDING', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã thanh toán' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'RETURNED', label: 'Hoàn về' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

const STATUS_META = {
  PAYMENT_PENDING: { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock },
  CONFIRMED: { label: 'Đã thanh toán', tone: 'paid', icon: FiCheckCircle },
  SHIPPING: { label: 'Đang giao', tone: 'shipping', icon: FiTruck },
  COMPLETED: { label: 'Hoàn thành', tone: 'completed', icon: FiCheckCircle },
  RETURNED: { label: 'Hoàn về', tone: 'returned', icon: FiRefreshCw },
  FAILED: { label: 'Thất bại', tone: 'failed', icon: FiXCircle },
  CANCELLED: { label: 'Đã hủy', tone: 'failed', icon: FiXCircle },
}

function formatDate(value) {
  if (!value) return 'Chưa có thời gian'
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatMoney(value, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getStatusMeta(status) {
  return STATUS_META[status] || { label: status || 'Không rõ', tone: 'neutral', icon: FiClock }
}

function getShippingAddress(description) {
  if (!description) return 'Chưa có địa chỉ giao hàng'
  return description.split('| shipping=')[0].trim() || 'Chưa có địa chỉ giao hàng'
}

function getShippingMethod(description) {
  if (!description?.includes('| shipping=')) return 'Giao hàng tiêu chuẩn'
  return description.split('| shipping=')[1]?.trim() || 'Giao hàng tiêu chuẩn'
}

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function StaffOrdersPage({ auth, onLogout }) {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  async function loadOrders() {
    setLoading(true)
    try {
      const query = status ? `?status=${status}` : ''
      const response = await fetch(`${ORDER_API_BASE}/admin${query}`)
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không tải được danh sách đơn.')

      const nextOrders = body.data || []
      setOrders(nextOrders)
      setSelectedOrder((current) => nextOrders.find((order) => order.orderId === current?.orderId) || null)
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Không tải được danh sách đơn.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [status])

  useEffect(() => {
    setPage(1)
  }, [status, search])

  const filteredOrders = useMemo(() => {
    const keyword = normalizeSearch(search.trim())
    if (!keyword) return orders

    return orders.filter((order) => {
      const statusLabel = getStatusMeta(order.status).label
      const itemValues = (order.items || []).flatMap((item) => [
        item.productName,
        item.productId,
        item.size,
        item.color,
      ])

      return [
        order.orderId,
        order.buyerName,
        order.buyerEmail,
        order.description,
        order.status,
        statusLabel,
        order.paymentOrderCode,
        order.totalAmount,
        ...itemValues,
      ].some((value) => normalizeSearch(value).includes(keyword))
    })
  }, [orders, search])

  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'PAYMENT_PENDING').length,
    paid: orders.filter((order) => order.status === 'CONFIRMED').length,
    shipping: orders.filter((order) => order.status === 'SHIPPING').length,
    completed: orders.filter((order) => order.status === 'COMPLETED').length,
    issue: orders.filter((order) => ['RETURNED', 'FAILED', 'CANCELLED'].includes(order.status)).length,
  }), [orders])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * ORDERS_PER_PAGE
  const pageEnd = pageStart + ORDERS_PER_PAGE
  const paginatedOrders = filteredOrders.slice(pageStart, pageEnd)

  async function cancelByStaff() {
    if (!selectedOrder || selectedOrder.status !== 'PAYMENT_PENDING') return
    if (!window.confirm('Hủy đơn đang chờ thanh toán này?')) return

    try {
      const response = await fetch(`${ORDER_API_BASE}/admin/${selectedOrder.orderId}/cancel?reason=Cancelled%20by%20staff`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không hủy được đơn.')
      setSelectedOrder(body.data)
      await loadOrders()
    } catch (requestError) {
      setError(requestError.message || 'Không hủy được đơn.')
    }
  }

  async function completeByStaff() {
    if (!selectedOrder || selectedOrder.status !== 'SHIPPING') return
    if (!window.confirm('Xác nhận đơn đã giao thành công và hoàn thành?')) return

    try {
      const response = await fetch(`${ORDER_API_BASE}/admin/${selectedOrder.orderId}/complete`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không chốt hoàn thành được đơn.')
      setSelectedOrder(body.data)
      await loadOrders()
    } catch (requestError) {
      setError(requestError.message || 'Không chốt hoàn thành được đơn.')
    }
  }

  async function shipByStaff() {
    if (!selectedOrder || selectedOrder.status !== 'CONFIRMED') return
    if (!window.confirm('Chuyển đơn này sang trạng thái đang giao?')) return

    try {
      const response = await fetch(`${ORDER_API_BASE}/admin/${selectedOrder.orderId}/ship`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không chuyển đơn sang đang giao được.')
      setSelectedOrder(body.data)
      await loadOrders()
    } catch (requestError) {
      setError(requestError.message || 'Không chuyển đơn sang đang giao được.')
    }
  }

  async function returnByStaff() {
    if (!selectedOrder || selectedOrder.status !== 'SHIPPING') return
    const reason = window.prompt('Lý do đơn hoàn về?', 'Giao không thành công')
    if (reason === null) return

    try {
      const encodedReason = encodeURIComponent(reason.trim() || 'Giao không thành công')
      const response = await fetch(`${ORDER_API_BASE}/admin/${selectedOrder.orderId}/return?reason=${encodedReason}`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không cập nhật đơn hoàn về được.')
      setSelectedOrder(body.data)
      await loadOrders()
    } catch (requestError) {
      setError(requestError.message || 'Không cập nhật đơn hoàn về được.')
    }
  }

  const selectedStatus = getStatusMeta(selectedOrder?.status)
  const StatusIcon = selectedStatus.icon
  const items = selectedOrder?.items || []

  return (
    <StaffShell
      auth={auth}
      onLogout={onLogout}
      roleLabel="Nhân viên đơn hàng"
      topbarExtra={
        <label className="staff-topbar-search">
          <FiSearch aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, tên/email, sản phẩm, size, màu..."
          />
          {search ? (
            <button type="button" onClick={() => setSearch('')} aria-label="Xóa tìm kiếm">
              <FiXCircle />
            </button>
          ) : null}
        </label>
      }
    >
        <div className="staff-content staff-content--orders-only">
          <section className="staff-order-main">
            <section className="staff-queue-summary" aria-label="Tổng quan đơn hàng">
              <article>
                <span>Tổng đơn</span>
                <strong>{orderStats.total}</strong>
              </article>
              <article>
                <span>Chờ thanh toán</span>
                <strong>{orderStats.pending}</strong>
              </article>
              <article>
                <span>Đã thanh toán</span>
                <strong>{orderStats.paid}</strong>
              </article>
              <article>
                <span>Đang giao</span>
                <strong>{orderStats.shipping}</strong>
              </article>
              <article>
                <span>Hoàn thành</span>
                <strong>{orderStats.completed}</strong>
              </article>
              <article>
                <span>Cần kiểm tra</span>
                <strong>{orderStats.issue}</strong>
              </article>
            </section>

            <div className="staff-filter-row">
              {FILTERS.map((item) => (
                <button
                  key={item.value || 'all'}
                  className={status === item.value ? 'is-active' : ''}
                  type="button"
                  onClick={() => setStatus(item.value)}
                >
                  {item.label}
                </button>
              ))}
              <button type="button" onClick={loadOrders}><FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới</button>
            </div>

            {error ? <p className="staff-inline-error">{error}</p> : null}

            <section className="staff-order-list">
              <header>
                <h2>Danh sách đơn hàng</h2>
                <span>
                  {filteredOrders.length
                    ? `Hiển thị ${pageStart + 1}-${Math.min(pageEnd, filteredOrders.length)} / ${filteredOrders.length} đơn`
                    : '0 đơn'}
                </span>
              </header>
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Trạng thái</th>
                    <th>Số sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => {
                    const meta = getStatusMeta(order.status)
                    const Icon = meta.icon
                    const totalItems = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                    return (
                      <tr key={order.orderId} className={selectedOrder?.orderId === order.orderId ? 'is-active' : ''}>
                        <td><strong>#{order.orderId.slice(0, 8).toUpperCase()}</strong></td>
                        <td>
                          <b>{order.buyerName || 'Khách StepZone'}</b>
                          <small>{order.buyerEmail || 'Chưa có email'}</small>
                        </td>
                        <td><span className={`staff-pill staff-pill--${meta.tone}`}><Icon /> {meta.label}</span></td>
                        <td>{totalItems}</td>
                        <td>{formatMoney(order.totalAmount, order.currency || 'VND')}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <button type="button" onClick={() => setSelectedOrder(order)}>
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!loading && filteredOrders.length === 0 ? <p className="staff-order-list__empty">Không có đơn nào trong danh sách này.</p> : null}
              {filteredOrders.length > 0 ? (
                <footer className="staff-pagination">
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
                </footer>
              ) : null}
            </section>

            {selectedOrder ? (
              <>
                <header className="staff-order-title">
                  <div>
                    <h2>Đơn #{selectedOrder.orderId.slice(0, 8).toUpperCase()}</h2>
                    <p>Tạo lúc {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="staff-order-title__actions">
                    <span className={`staff-pill staff-pill--${selectedStatus.tone}`}><StatusIcon /> {selectedStatus.label}</span>
                    <button type="button" disabled={selectedOrder.status !== 'CONFIRMED'} onClick={shipByStaff}>Bắt đầu giao</button>
                    <button type="button" disabled={selectedOrder.status !== 'SHIPPING'} onClick={completeByStaff}>Chốt hoàn thành</button>
                    <button type="button" disabled={selectedOrder.status !== 'SHIPPING'} onClick={returnByStaff}>Đơn hoàn về</button>
                    <button type="button" disabled={selectedOrder.status !== 'PAYMENT_PENDING'} onClick={cancelByStaff}>Hủy đơn chờ</button>
                  </div>
                </header>

                <section className="staff-info-grid">
                  <article>
                    <h3><FiUser /> Thông tin khách hàng</h3>
                    <dl>
                      <dt>Tên</dt>
                      <dd>{selectedOrder.buyerName || 'Khách StepZone'}</dd>
                      <dt>Email</dt>
                      <dd>{selectedOrder.buyerEmail || 'Chưa có email'}</dd>
                    </dl>
                  </article>
                  <article>
                    <h3><FiTruck /> Địa chỉ giao hàng</h3>
                    <dl>
                      <dt>Địa chỉ</dt>
                      <dd>{getShippingAddress(selectedOrder.description)}</dd>
                      <dt>Phương thức</dt>
                      <dd>{getShippingMethod(selectedOrder.description)}</dd>
                    </dl>
                  </article>
                </section>

                <section className="staff-items-card">
                  <div>
                    <h3>Sản phẩm trong đơn</h3>
                    <span>{items.length} dòng sản phẩm</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Phân loại</th>
                        <th>SL</th>
                        <th>Giá</th>
                        <th>Tạm tính</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id || `${item.productId}-${item.size}-${item.color}`}>
                          <td>
                            <span className="staff-product-thumb"><FiBox /></span>
                            <div>
                              <strong>{item.productName || 'Giày StepZone'}</strong>
                              <small>SKU: {String(item.productId || '').slice(0, 8).toUpperCase()}</small>
                            </div>
                          </td>
                          <td>{[item.color, item.size ? `Size ${item.size}` : ''].filter(Boolean).join(' / ') || 'Mặc định'}</td>
                          <td>{item.quantity}</td>
                          <td>{formatMoney(item.unitPrice, selectedOrder.currency || 'VND')}</td>
                          <td><strong>{formatMoney(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 0), selectedOrder.currency || 'VND')}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </>
            ) : (
              <section className="staff-empty-state">
                <FiShoppingBag />
                <h2>Chưa chọn đơn</h2>
                <p>{error ? 'Hiện chưa lấy được dữ liệu đơn.' : 'Bấm Xem chi tiết ở một đơn trong danh sách để xử lý.'}</p>
              </section>
            )}
          </section>

        </div>
    </StaffShell>
  )
}
