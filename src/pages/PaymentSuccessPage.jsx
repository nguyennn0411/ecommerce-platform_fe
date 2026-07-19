import { useEffect, useState } from 'react'
import { FiCheckCircle, FiClock, FiPackage, FiXCircle } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const ORDER_API_BASE = '/api/v1/orders'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const orderId = searchParams.get('orderId') || window.sessionStorage.getItem('stepzone-last-order-id')

  useEffect(() => {
    if (!order || (order.status !== 'CONFIRMED' && order.status !== 'FAILED' && order.status !== 'CANCELLED')) {
      return undefined
    }

    const timer = window.setTimeout(() => navigate('/orders', { replace: true }), 1800)
    return () => window.clearTimeout(timer)
  }, [navigate, order])

  useEffect(() => {
    if (!orderId) return undefined

    let active = true
    async function checkOrder() {
      try {
        const response = await fetch(`${ORDER_API_BASE}/${orderId}`)
        const body = await response.json()
        if (!response.ok || !body?.success) {
          throw new Error(body?.message || 'Không lấy được trạng thái đơn hàng.')
        }
        if (active) {
          setOrder(body.data)
          setError('')
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Không kiểm tra được đơn hàng.')
      }
    }

    checkOrder()
    const timer = window.setInterval(checkOrder, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [orderId])

  if (!orderId) {
    return (
      <main className="payment-result">
        <h1>Không tìm thấy đơn hàng</h1>
        <Link to="/products">Quay lại sản phẩm</Link>
      </main>
    )
  }

  const status = order?.status || 'PAYMENT_PENDING'
  const confirmed = status === 'CONFIRMED'
  const failed = status === 'FAILED' || status === 'CANCELLED'
  const StatusIcon = confirmed ? FiCheckCircle : failed ? FiXCircle : FiClock

  return (
    <main className="payment-result">
      <div className={`payment-result__icon ${confirmed ? 'is-confirmed' : failed ? 'is-failed' : ''}`}>
        <StatusIcon aria-hidden />
      </div>
      <p className="payment-result__eyebrow">STEPZONE PAYMENT</p>
      <h1>{confirmed ? 'Thanh toán thành công' : failed ? 'Thanh toán chưa hoàn tất' : 'Đang chờ thanh toán'}</h1>
      <p>
        {confirmed
          ? 'Đơn hàng đã được xác nhận và tồn kho đã được cập nhật.'
          : failed
            ? order?.failureReason || 'Đơn hàng đã bị hủy hoặc thanh toán thất bại.'
            : 'Hệ thống tự kiểm tra trạng thái thanh toán mỗi 5 giây.'}
      </p>
      {!failed ? (
        <div className="payment-result__progress" aria-label="Tiến trình thanh toán">
          <span className="is-done"><FiCheckCircle /> Đơn đã tạo</span>
          <span className={confirmed ? 'is-done' : 'is-current'}><FiClock /> {confirmed ? 'Đã nhận thanh toán' : 'Đang xác nhận PayOS'}</span>
          <span className={confirmed ? 'is-done' : ''}><FiPackage /> Đơn sẵn sàng xử lý</span>
        </div>
      ) : null}
      <dl className="payment-result__details">
        <div><dt>Order ID</dt><dd>{orderId}</dd></div>
        <div><dt>Trạng thái</dt><dd>{status}</dd></div>
      </dl>
      <div className="payment-result__actions">
        <Link className="payment-result__link payment-result__link--secondary" to="/orders">Xem đơn hàng</Link>
        <Link className="payment-result__link" to="/products">Tiếp tục mua hàng</Link>
      </div>
    </main>
  )
}
