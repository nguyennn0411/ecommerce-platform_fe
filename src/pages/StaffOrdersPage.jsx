import { useEffect, useMemo, useState } from 'react'
import {
  FiBell,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi'

const ORDER_API_BASE = '/api/v1/orders'

const FILTERS = [
  { value: '', label: 'Tất cả đơn' },
  { value: 'PAYMENT_PENDING', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

const STATUS_META = {
  PAYMENT_PENDING: { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock },
  CONFIRMED: { label: 'Đã thanh toán', tone: 'paid', icon: FiCheckCircle },
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

export default function StaffOrdersPage({ auth, onLogout }) {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (!selectedOrder?.orderId) {
      setLogs([])
      return
    }

    let active = true
    async function loadSagaLogs() {
      try {
        const response = await fetch(`${ORDER_API_BASE}/${selectedOrder.orderId}/saga-logs`)
        const body = await response.json()
        if (!response.ok || !body?.success) throw new Error(body?.message || 'Không tải được nhật ký Saga.')
        if (active) {
          setLogs(body.data || [])
          setError('')
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Không tải được nhật ký Saga.')
      }
    }

    loadSagaLogs()
    return () => { active = false }
  }, [selectedOrder?.orderId])

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return orders

    return orders.filter((order) => [
      order.orderId,
      order.buyerName,
      order.buyerEmail,
      order.status,
    ].some((value) => String(value || '').toLowerCase().includes(keyword)))
  }, [orders, search])

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

  const selectedStatus = getStatusMeta(selectedOrder?.status)
  const StatusIcon = selectedStatus.icon
  const items = selectedOrder?.items || []
  const subtotal = Number(selectedOrder?.totalAmount || 0)

  return (
    <main className="staff-shell">
      <aside className="staff-sidebar">
        <div>
          <h1>Trang nhân viên</h1>
          <p>Quản lý vận hành</p>
        </div>
        <nav aria-label="Staff navigation">
          <span><FiHome /> Tổng quan</span>
          <span><FiPackage /> Sản phẩm</span>
          <span><FiBox /> Tồn kho</span>
          <strong><FiShoppingBag /> Đơn hàng</strong>
          <span><FiUsers /> Khách hàng</span>
          <span><FiSettings /> Cài đặt</span>
        </nav>
        <button type="button" onClick={onLogout}><FiLogOut /> Đăng xuất</button>
      </aside>

      <section className="staff-workspace">
        <header className="staff-topbar">
          <label>
            <FiSearch aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã đơn, email khách hàng..."
            />
          </label>
          <div>
            <button type="button" aria-label="Notifications"><FiBell /></button>
            <button type="button" aria-label="Help"><FiHelpCircle /></button>
            <span>{auth?.fullName || auth?.email || 'Nhân viên'}<small>Nhân viên đơn hàng</small></span>
            <FiUser />
          </div>
        </header>

        <div className="staff-content">
          <section className="staff-order-main">
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
                <span>{filteredOrders.length} đơn</span>
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
                  {filteredOrders.map((order) => {
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
                    <button type="button" onClick={loadOrders}>Cập nhật</button>
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

          <aside className="staff-side-panel">
            <section className="staff-order-snapshot">
              <p>Tóm tắt đơn</p>
              <h3>{selectedOrder ? `#${selectedOrder.orderId.slice(0, 8).toUpperCase()}` : 'Chưa chọn đơn'}</h3>
              <div><span>Trạng thái</span><strong>{selectedStatus.label}</strong></div>
              <div><span>Khách hàng</span><strong>{selectedOrder?.buyerName || '---'}</strong></div>
              <div><span>Email</span><strong>{selectedOrder?.buyerEmail || '---'}</strong></div>
              <div><span>Số lượng</span><strong>{items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</strong></div>
              <div><span>Tổng tiền</span><strong>{formatMoney(subtotal, selectedOrder?.currency || 'VND')}</strong></div>
              <footer>
                <span>Địa chỉ</span>
                <strong>{selectedOrder ? getShippingAddress(selectedOrder.description) : '---'}</strong>
              </footer>
            </section>

            <section className="staff-actions-card">
              <button type="button" onClick={loadOrders}>Làm mới đơn</button>
              <button type="button" disabled={selectedOrder?.status !== 'PAYMENT_PENDING'} onClick={cancelByStaff}>Hủy đơn chờ thanh toán</button>
            </section>

            <section className="staff-log-card">
              <h3><FiRefreshCw /> Nhật ký Saga</h3>
              <div className="staff-log-timeline">
                {logs.map((log) => (
                  <article key={log.logId}>
                    <b>{log.status}</b>
                    <strong>{log.step}</strong>
                    <span>{log.message}</span>
                    <small>{formatDate(log.createdAt)}</small>
                  </article>
                ))}
                {selectedOrder && logs.length === 0 ? <p>Chưa có nhật ký Saga.</p> : null}
                {!selectedOrder ? <p>Chọn một đơn để xem quá trình xử lý Saga.</p> : null}
              </div>
            </section>

            <section className="staff-system-alert">
              <h3>Ghi chú hệ thống</h3>
              <p>Màn nhân viên này chỉ xử lý nghiệp vụ thuộc Order Service.</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}
