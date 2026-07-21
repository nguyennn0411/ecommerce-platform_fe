import { useEffect, useState } from 'react'
import {
  FiArrowLeft,
  FiArrowRight,
  FiBox,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'

const ORDER_API_BASE = '/api/v1/orders'

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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getStatus(status) {
  if (status === 'CONFIRMED') return { label: 'Đã xác nhận', tone: 'confirmed', icon: FiCheckCircle }
  if (status === 'FAILED' || status === 'CANCELLED') return { label: status === 'CANCELLED' ? 'Đã hủy' : 'Thanh toán thất bại', tone: 'failed', icon: FiXCircle }
  return { label: 'Chờ thanh toán', tone: 'pending', icon: FiClock }
}

function getAddress(description) {
  if (!description) return 'Chưa có địa chỉ giao hàng.'
  const address = description.split('| shipping=')[0].trim()
  return address || 'Chưa có địa chỉ giao hàng.'
}

export default function OrderDetailPage({ auth }) {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true
    async function loadOrder() {
      setLoading(true)
      try {
        const response = await fetch(`${ORDER_API_BASE}/${orderId}`)
        const body = await response.json()
        if (!response.ok || !body?.success) {
          throw new Error(body?.message || 'Không tìm thấy đơn hàng.')
        }
        if (active) {
          setOrder(body.data)
          setError('')
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Không tải được chi tiết đơn hàng.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrder()
    return () => { active = false }
  }, [orderId])

  async function cancelOrder() {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return

    setCancelling(true)
    try {
      const response = await fetch(`${ORDER_API_BASE}/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth?.userId || order.userId,
          reason: 'Cancelled by customer from My Orders',
        }),
      })
      const body = await response.json()
      if (!response.ok || !body?.success) {
        throw new Error(body?.message || 'Không thể hủy đơn hàng.')
      }
      setOrder(body.data)
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Không thể hủy đơn hàng.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <section className="order-detail-state">Đang tải chi tiết đơn hàng...</section>
  if (error || !order) {
    return (
      <section className="order-detail-state order-detail-state--error">
        <p>{error || 'Không tìm thấy đơn hàng.'}</p>
        <Link to="/orders">Quay lại My Orders</Link>
      </section>
    )
  }

  const status = getStatus(order.status)
  const StatusIcon = status.icon
  const isConfirmed = order.status === 'CONFIRMED'
  const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED'
  const isPending = !isConfirmed && !isFailed
  const totalItems = (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0)

  return (
    <section className="order-detail-page">
      <Link to="/orders" className="order-detail-back"><FiArrowLeft /> Quay lại My Orders</Link>

      <header className="order-detail-heading">
        <div>
          <p>Chi tiết đơn hàng</p>
          <h1>#{order.orderId.slice(0, 8).toUpperCase()}</h1>
          <small>Đặt lúc {formatDate(order.createdAt)}</small>
        </div>
        <span className={`order-status order-status--${status.tone}`}><StatusIcon /> {status.label}</span>
      </header>

      <section className="order-detail-progress" aria-label="Tiến trình đơn hàng">
        <article className="is-done">
          <span><FiCheck /></span>
          <strong>Đặt đơn</strong>
          <small>{formatDate(order.createdAt)}</small>
        </article>
        <article className={isConfirmed ? 'is-done' : isFailed ? 'is-failed' : 'is-current'}>
          <span>{isFailed ? <FiXCircle /> : isConfirmed ? <FiCheck /> : <FiCreditCard />}</span>
          <strong>Thanh toán</strong>
          <small>{isConfirmed ? 'Đã xác nhận' : isFailed ? 'Không thành công' : 'Đang chờ xử lý'}</small>
        </article>
        <article className={isConfirmed ? 'is-current' : ''}>
          <span><FiPackage /></span>
          <strong>Chuẩn bị hàng</strong>
          <small>{isConfirmed ? 'Đơn đang được chuẩn bị' : 'Sau khi thanh toán'}</small>
        </article>
        <article>
          <span><FiTruck /></span>
          <strong>Giao hàng</strong>
          <small>Đang chờ cập nhật</small>
        </article>
      </section>

      <div className="order-detail-grid">
        <div className="order-detail-main">
          <section className="order-detail-panel">
            <div className="order-detail-panel__head">
              <div><FiBox /><h2>Sản phẩm đã đặt</h2></div>
              <span>{totalItems} sản phẩm</span>
            </div>
            <div className="order-detail-items">
              {(order.items || []).map((item) => (
                <article className="order-detail-item" key={item.id || `${item.productId}-${item.size}-${item.color}`}>
                  <div className="order-detail-item__image"><FiBox /></div>
                  <div>
                    <h3>{item.productName || 'Sản phẩm StepZone'}</h3>
                    <p>{[item.color, item.size ? `Size ${item.size}` : ''].filter(Boolean).join(' · ') || 'Phiên bản tiêu chuẩn'}</p>
                    <small>Số lượng: {item.quantity}</small>
                  </div>
                  <div className="order-detail-item__price">
                    <strong>{formatVnd(item.lineTotal ?? Number(item.unitPrice || 0) * Number(item.quantity || 0))}</strong>
                    <small>{formatVnd(item.unitPrice)} / sản phẩm</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="order-detail-panel order-detail-address">
            <div className="order-detail-panel__head"><div><FiMapPin /><h2>Địa chỉ nhận hàng</h2></div></div>
            <strong>{order.buyerName || 'Khách hàng StepZone'}</strong>
            <p>{order.buyerEmail || 'Chưa có email'}</p>
            <p>{getAddress(order.description)}</p>
          </section>
        </div>

        <aside className="order-detail-side">
          <section className="order-payment-card">
            <p>Thanh toán</p>
            <h2>{isConfirmed ? 'Thanh toán thành công' : isFailed ? 'Thanh toán chưa hoàn tất' : 'Đang chờ thanh toán'}</h2>
            <span><FiCreditCard /> PayOS · {order.currency || 'VND'}</span>
            {isFailed && order.failureReason ? <small>{order.failureReason}</small> : null}
            {isPending && order.checkoutUrl ? <a href={order.checkoutUrl} target="_blank" rel="noreferrer">Tiếp tục thanh toán <FiArrowRight /></a> : null}
            {isPending ? <button type="button" onClick={cancelOrder} disabled={cancelling}>{cancelling ? 'Đang hủy đơn...' : 'Hủy đơn hàng'}</button> : null}
          </section>

          <section className="order-total-card">
            <div><span>Tạm tính</span><strong>{formatVnd(order.totalAmount)}</strong></div>
            <div><span>Vận chuyển</span><strong>Miễn phí</strong></div>
            <footer><span>Tổng thanh toán</span><strong>{formatVnd(order.totalAmount)}</strong></footer>
          </section>
        </aside>
      </div>
    </section>
  )
}
