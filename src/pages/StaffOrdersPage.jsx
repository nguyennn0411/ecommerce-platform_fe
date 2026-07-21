import { useEffect, useState } from 'react'
import { FiActivity, FiRefreshCw, FiXCircle } from 'react-icons/fi'

const ORDER_API_BASE = '/api/v1/orders'

const FILTERS = ['', 'PAYMENT_PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED']

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '---'
}

export default function StaffOrdersPage() {
  const [status, setStatus] = useState('')
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadOrders() {
    setLoading(true)
    try {
      const query = status ? `?status=${status}` : ''
      const response = await fetch(`${ORDER_API_BASE}/admin${query}`)
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không tải được đơn hàng.')
      setOrders(body.data || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Không tải được đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [status])

  async function showSagaLogs(orderId) {
    try {
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/saga-logs`)
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không tải được Saga log.')
      setSelectedOrderId(orderId)
      setLogs(body.data || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Không tải được Saga log.')
    }
  }

  async function cancelByStaff(orderId) {
    if (!window.confirm('Hủy đơn đang chờ thanh toán này?')) return
    try {
      const response = await fetch(`${ORDER_API_BASE}/admin/${orderId}/cancel?reason=Cancelled%20by%20staff`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok || !body?.success) throw new Error(body?.message || 'Không thể hủy đơn.')
      await loadOrders()
      if (selectedOrderId === orderId) await showSagaLogs(orderId)
    } catch (requestError) {
      setError(requestError.message || 'Không thể hủy đơn.')
    }
  }

  return (
    <section className="staff-orders-page">
      <header className="orders-hero">
        <div><p className="orders-eyebrow">Staff console / Order service</p><h1>Order Management</h1><p>Danh sách đơn và Saga log phục vụ demo vận hành.</p></div>
        <FiActivity aria-hidden />
      </header>
      <div className="staff-orders-toolbar">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {FILTERS.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button type="button" onClick={loadOrders} disabled={loading}><FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới</button>
      </div>
      {error ? <p className="staff-orders-error">{error}</p> : null}
      <div className="staff-orders-grid">
        <div className="staff-orders-table">
          {orders.map((order) => (
            <article key={order.orderId}>
              <div><strong>#{order.orderId.slice(0, 8).toUpperCase()}</strong><span>{order.buyerEmail}</span><small>{formatDate(order.createdAt)}</small></div>
              <div><b>{order.status}</b><span>{order.totalAmount} {order.currency}</span></div>
              <div className="staff-orders-actions">
                <button type="button" onClick={() => showSagaLogs(order.orderId)}>Saga log</button>
                {order.status === 'PAYMENT_PENDING' ? <button type="button" onClick={() => cancelByStaff(order.orderId)}><FiXCircle /> Hủy</button> : null}
              </div>
            </article>
          ))}
          {!loading && orders.length === 0 ? <p>Không có đơn phù hợp.</p> : null}
        </div>
        <aside className="staff-saga-log">
          <h2>Saga Transaction Log</h2>
          <p>{selectedOrderId ? `Đơn #${selectedOrderId.slice(0, 8).toUpperCase()}` : 'Chọn một đơn để xem log.'}</p>
          {logs.map((log) => <article key={log.logId}><b>{log.status}</b><strong>{log.step}</strong><span>{log.message}</span><small>{formatDate(log.createdAt)}</small></article>)}
        </aside>
      </div>
    </section>
  )
}
