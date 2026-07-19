import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const ORDER_API_BASE = '/api/v1/orders'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const orderId = searchParams.get('orderId') || window.sessionStorage.getItem('stepzone-last-order-id')

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

  return (
    <main className="payment-result">
      <p className="payment-result__eyebrow">STEPZONE PAYMENT</p>
      <h1>{confirmed ? 'Thanh toán thành công' : failed ? 'Thanh toán chưa hoàn tất' : 'Đang chờ thanh toán'}</h1>
      <p>
        {confirmed
          ? 'Đơn hàng đã được xác nhận và tồn kho đã được cập nhật.'
          : failed
            ? order?.failureReason || 'Đơn hàng đã bị hủy hoặc thanh toán thất bại.'
            : 'Hệ thống tự kiểm tra trạng thái thanh toán mỗi 5 giây.'}
      </p>
      <dl className="payment-result__details">
        <div><dt>Order ID</dt><dd>{orderId}</dd></div>
        <div><dt>Trạng thái</dt><dd>{status}</dd></div>
      </dl>
      <Link className="payment-result__link" to="/products">Tiếp tục mua hàng</Link>
    </main>
  )
}
