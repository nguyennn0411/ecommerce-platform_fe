import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiUser,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { useCart } from '../cart/CartContext.jsx';
import { fetchProductById } from '../api/products';
import { fetchVariantStocks } from '../api/inventory';
import { fetchVietnamProvinces, fetchVietnamWards } from '../api/vietnamAdministrative.js';
import { findStock } from '../utils/productUtils.js';
import './CheckoutPage.css';

const ORDER_API_URL = '/api/v1/orders';

const initialForm = {
  userId: '22222222-2222-2222-2222-222222222222',
  firstName: 'Hong',
  lastName: 'Phuc',
  email: 'phuc@example.com',
  address1: '123 Đường Lê Lợi',
  address2: '',
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  zipCode: '700000',
  phone: '0900000000',
  shippingMethod: 'standard',
};

const shippingOptions = {
  standard: {
    label: 'Giao hàng tiêu chuẩn',
    description: '3-5 ngày làm việc',
    fee: 0,
  },
  express: {
    label: 'Giao hàng hỏa tốc',
    description: '1-2 ngày làm việc',
    fee: 5000,
  },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function CheckoutField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  wide,
  placeholder,
  select,
}) {
  return (
    <label className={`checkout-field ${wide ? 'checkout-field--wide' : ''}`}>
      <span>{label}</span>
      <div className={`checkout-input ${select ? 'checkout-input--select' : ''}`}>
        {select ? (
          <>
            <select name={name} value={value} onChange={onChange}>
              <option value="Select Province">Select Province</option>
              <option value="Ho Chi Minh">Ho Chi Minh</option>
              <option value="Ha Noi">Ha Noi</option>
              <option value="Da Nang">Da Nang</option>
            </select>
            <FiChevronDown aria-hidden="true" />
          </>
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={name === 'userId' || name === 'email'}
          />
        )}
      </div>
    </label>
  );
}

function VietnamAdministrativeFields({ form, setForm }) {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchVietnamProvinces()
      .then((data) => { if (active) setProvinces(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoadingProvinces(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loadingProvinces || form.provinceCode || provinces.length === 0) {
      return;
    }

    const demoProvince = provinces[0];
    setForm((current) => ({
      ...current,
      provinceCode: String(demoProvince.code),
      provinceName: demoProvince.name,
    }));
  }, [form.provinceCode, loadingProvinces, provinces, setForm]);

  useEffect(() => {
    if (!form.provinceCode) {
      setWards([]);
      return undefined;
    }

    let active = true;
    setLoadingWards(true);
    fetchVietnamWards(form.provinceCode)
      .then((data) => { if (active) setWards(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoadingWards(false); });
    return () => { active = false; };
  }, [form.provinceCode]);

  useEffect(() => {
    if (loadingWards || form.wardCode || wards.length === 0) {
      return;
    }

    const demoWard = wards[0];
    setForm((current) => ({
      ...current,
      wardCode: String(demoWard.code),
      wardName: demoWard.name,
    }));
  }, [form.wardCode, loadingWards, setForm, wards]);

  function selectProvince(event) {
    const province = provinces.find((item) => String(item.code) === event.target.value);
    setForm((current) => ({
      ...current,
      provinceCode: event.target.value,
      provinceName: province?.name || '',
      wardCode: '',
      wardName: '',
    }));
  }

  function selectWard(event) {
    const ward = wards.find((item) => String(item.code) === event.target.value);
    setForm((current) => ({
      ...current,
      wardCode: event.target.value,
      wardName: ward?.name || '',
    }));
  }

  return (
    <>
      <label className="checkout-field">
        <span>Tỉnh / Thành phố</span>
        <div className="checkout-input checkout-input--select">
          <select value={form.provinceCode} onChange={selectProvince} required disabled={loadingProvinces}>
            <option value="">{loadingProvinces ? 'Đang tải tỉnh/thành...' : 'Chọn Tỉnh / Thành phố'}</option>
            {provinces.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}
          </select>
          <FiChevronDown aria-hidden="true" />
        </div>
      </label>
      <label className="checkout-field">
        <span>Phường / Xã</span>
        <div className="checkout-input checkout-input--select">
          <select value={form.wardCode} onChange={selectWard} required disabled={!form.provinceCode || loadingWards}>
            <option value="">{loadingWards ? 'Đang tải phường/xã...' : form.provinceCode ? 'Chọn Phường / Xã' : 'Chọn Tỉnh / Thành phố trước'}</option>
            {wards.map((ward) => <option key={ward.code} value={ward.code}>{ward.name}</option>)}
          </select>
          <FiChevronDown aria-hidden="true" />
        </div>
      </label>
      {error ? <p className="checkout-location-error">{error}</p> : null}
    </>
  );
}

function CheckoutHero({ activeItems, totalAmount, auth, onLogout }) {
  return (
    <section className="checkout-hero">
      <div className="checkout-hero__copy">
        <p className="checkout-kicker">Thanh toán an toàn</p>
        <h1>Hoàn tất đơn hàng.</h1>
        <p className="checkout-hero__text">
          Điền thông tin nhận hàng, chọn hình thức giao hàng rồi tiếp tục thanh toán.
        </p>
        <div className="checkout-userbar">
          <span>
            <FiUser aria-hidden="true" />
            {auth.fullName || auth.username || auth.email}
          </span>
          <small>{auth.email}</small>
          <button type="button" className="checkout-logout" onClick={onLogout}>
            <FiLogOut aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      </div>
      <div className="checkout-hero__stats">
        <article>
            <span>Sản phẩm đã chọn</span>
          <strong>{activeItems}</strong>
        </article>
        <article>
            <span>Tạm tính</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </article>
      </div>
    </section>
  );
}

function OrderSummary({
  cartItems,
  onQuantityChange,
  onRemove,
  subtotal,
  shippingFee,
  totalAmount,
  stockByItemKey,
  stockLoading,
}) {
  return (
    <aside className="order-summary" aria-label="Tóm tắt đơn hàng">
      <h2>Tóm tắt đơn hàng</h2>
      <div className="order-summary__items">
        {cartItems.length === 0 ? <p>Giỏ hàng đang trống. Hãy chọn sản phẩm rồi thêm vào giỏ.</p> : null}
        {cartItems.map((item) => (
          <article className="summary-item" key={item.key}>
            <div className="summary-item__image">
              <img src={item.image} alt={item.name} />
            </div>
            <div>
              <h3>{item.name}</h3>
              <p>Size: {item.size}</p>
              {item.color ? <p>Màu: {item.color}</p> : null}
              <div className="summary-edit-row">
                <div className="summary-edit">
                  <span>Số lượng</span>
                  <div className="summary-quantity-control">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item, Number(item.quantity) - 1)}
                      disabled={Number(item.quantity) <= 1}
                      aria-label={`Giảm số lượng ${item.name}`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={stockByItemKey[item.key]?.availableQuantity}
                      value={item.quantity}
                      onChange={(event) => onQuantityChange(item, event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item, Number(item.quantity) + 1)}
                      disabled={stockLoading || Number(item.quantity) >= Number(stockByItemKey[item.key]?.availableQuantity || 0)}
                      aria-label={`Tăng số lượng ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <small>
                    {stockLoading
                      ? 'Đang kiểm tra tồn kho...'
                      : stockByItemKey[item.key]
                        ? `Còn ${stockByItemKey[item.key].availableQuantity} sản phẩm`
                        : 'Không lấy được tồn kho'}
                  </small>
                </div>
                <button type="button" className="checkout-logout" onClick={() => onRemove(item.key)}>
                  Xóa
                </button>
              </div>
              <strong>{formatCurrency(item.unitPrice * item.quantity)}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="summary-lines">
        <span>Tạm tính</span>
        <strong>{formatCurrency(subtotal)}</strong>
        <span>Phí giao hàng</span>
        <strong>{formatCurrency(shippingFee)}</strong>
      </div>
      <div className="summary-total">
        <span>Tổng cộng</span>
        <strong>{formatCurrency(totalAmount)}</strong>
      </div>
    </aside>
  );
}

function PaymentSummary({ subtotal, shippingFee, totalAmount }) {
  return (
    <section className="payment-summary" aria-label="Tóm tắt thanh toán">
      <h2>Tóm tắt thanh toán</h2>
      <div>
        <span>Tạm tính</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      <div>
        <span>Phí giao hàng</span>
        <strong>{formatCurrency(shippingFee)}</strong>
      </div>
      <footer>
        <span>Tổng cộng</span>
        <strong>{formatCurrency(totalAmount)}</strong>
      </footer>
    </section>
  );
}

function SubmissionCard({ submitState }) {
  if (submitState.status !== 'error') return null;

  return (
    <section className="submission-card submission-card--error">
      <div className="submission-card__heading">
        <h2>Không thể tạo đơn hàng</h2>
      </div>
      <p>{submitState.message}</p>
    </section>
  );
}

function CheckoutPage({ auth, onLogout }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const { items: cartItems, updateQuantity, removeItem, updatePrices, clearCart } = useCart();
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
    order: null,
  });
  const [stockByItemKey, setStockByItemKey] = useState({});
  const [stockLoading, setStockLoading] = useState(false);

  const activeItems = useMemo(
    () => cartItems.filter((item) => Number(item.quantity) > 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      activeItems.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
        0
      ),
    [activeItems]
  );

  const shippingFee = shippingOptions[form.shippingMethod].fee;
  const totalAmount = subtotal + shippingFee;
  const activeItemCount = activeItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    if (!auth?.authenticated) {
      return;
    }

    const fullName = auth.fullName?.trim() || '';
    const nameParts = fullName ? fullName.split(' ') : [];

    setForm((current) => ({
      ...current,
      userId: auth.userId || current.userId,
      email: auth.email || current.email,
      firstName: auth.firstName || nameParts[0] || current.firstName,
      lastName:
        auth.lastName ||
        (nameParts.length > 1 ? nameParts.slice(1).join(' ') : current.lastName),
    }));
  }, [auth]);

  useEffect(() => {
    let active = true;
    const productIds = [...new Set(cartItems.map((item) => item.id).filter(Boolean))];

    if (productIds.length === 0) {
      setStockByItemKey({});
      return undefined;
    }

    setStockLoading(true);
    Promise.all(productIds.map(async (productId) => [productId, await fetchVariantStocks(productId)]))
      .then((responses) => {
        if (!active) return;
        const variantsByProductId = new Map(
          responses.map(([productId, response]) => [productId, response?.variants || []]),
        );
        const nextStocks = Object.fromEntries(cartItems.map((item) => {
          const stock = findStock(variantsByProductId.get(item.id), item.size, item.color);
          return [item.key, stock ? { availableQuantity: Number(stock.availableQuantity || 0) } : null];
        }));
        setStockByItemKey(nextStocks);
        cartItems.forEach((item) => {
          const available = Number(nextStocks[item.key]?.availableQuantity || 0);
          if (available > 0 && Number(item.quantity) > available) {
            updateQuantity(item.key, available);
          }
        });
      })
      .catch(() => {
        if (active) setStockByItemKey({});
      })
      .finally(() => {
        if (active) setStockLoading(false);
      });

    return () => { active = false; };
  }, [cartItems, updateQuantity]);

  useEffect(() => {
    const orderId = submitState.order?.orderId;
    if (submitState.status !== 'success' || !orderId) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/orders/${orderId}`);
        const body = await response.json();
        if (response.ok && body?.success && body.data?.status === 'CONFIRMED') {
          window.clearInterval(timer);
          navigate(`/payment/success?orderId=${orderId}`);
        }
      } catch {
        // Keep polling while the local services are restarting.
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [navigate, submitState]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleCartQuantityChange(item, value) {
    const available = Number(stockByItemKey[item.key]?.availableQuantity || 0);
    if (available <= 0) return;
    const requested = Number(value);
    const nextQuantity = Math.min(Math.max(1, Number.isFinite(requested) ? requested : 1), available);
    updateQuantity(item.key, nextQuantity);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (activeItems.length === 0) {
      setSubmitState({
        status: 'error',
        message: 'Phai co it nhat 1 san pham co so luong lon hon 0.',
        order: null,
      });
      return;
    }

    let verifiedItems;
    try {
      // Product Service remains the source of truth for current catalog prices.
      const latestProducts = await Promise.all(
        activeItems.map((item) => fetchProductById(item.id)),
      );
      const pricesByProductId = Object.fromEntries(
        latestProducts.map((product) => [product.id, Number(product.basePrice)]),
      );
      updatePrices(pricesByProductId);
      verifiedItems = activeItems.map((item) => ({
        ...item,
        unitPrice: pricesByProductId[item.id],
      }));
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: 'Khong lay duoc gia san pham moi nhat. Vui long thu lai.',
        order: null,
      });
      return;
    }

    const payload = {
      userId: form.userId,
      buyerName: `${form.firstName} ${form.lastName}`.trim(),
      buyerEmail: form.email,
      description: [
        form.address1,
        form.address2,
        form.wardName,
        form.provinceName,
        form.zipCode,
        form.phone,
        `shipping=${form.shippingMethod}`,
      ]
        .filter(Boolean)
        .join(' | '),
      currency: 'VND',
      shippingFee,
      items: verifiedItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        size: item.size,
        color: item.color,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    setSubmitState({
      status: 'submitting',
      message: '',
      order: null,
    });

    try {
      const response = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      const parsed = rawText ? JSON.parse(rawText) : null;

      if (!response.ok || !parsed?.success) {
        throw new Error(parsed?.message || `Request failed with status ${response.status}`);
      }

      const checkoutUrl = parsed.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('Không nhận được đường dẫn thanh toán. Vui lòng thử lại.');
      }
      window.sessionStorage.setItem('stepzone-last-order-id', parsed.data.orderId);
      clearCart();
      window.location.assign(checkoutUrl);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        order: null,
      });
    }
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <a className="checkout-brand" href="/">StepZone</a>
        <div className="checkout-header__meta">
          <Link className="checkout-back" to="/products">
            Tiếp tục mua sắm
          </Link>
        </div>
      </header>

      <section className="checkout-main">
        <CheckoutHero
          activeItems={activeItemCount}
          totalAmount={totalAmount}
          auth={auth}
          onLogout={onLogout}
        />
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-section checkout-section--panel">
              <div className="checkout-section__head">
                <div>
                  <p className="checkout-section__eyebrow">Bước 01</p>
                  <h1>Địa chỉ giao hàng</h1>
                </div>
                <span className="checkout-section__badge">
                  <FiShield aria-hidden="true" />
                  Thông tin người nhận
                </span>
              </div>
              <div className="shipping-grid">
                <CheckoutField label="Tên" name="firstName" value={form.firstName} onChange={handleFieldChange} />
                <CheckoutField label="Họ" name="lastName" value={form.lastName} onChange={handleFieldChange} />
                <CheckoutField label="Email" name="email" type="email" value={form.email} onChange={handleFieldChange} wide />
                <CheckoutField label="Địa chỉ" name="address1" value={form.address1} onChange={handleFieldChange} wide />
                <CheckoutField label="Căn hộ, tòa nhà... (không bắt buộc)" name="address2" value={form.address2} onChange={handleFieldChange} wide />
                <VietnamAdministrativeFields form={form} setForm={setForm} />
                <CheckoutField label="Mã bưu chính" name="zipCode" value={form.zipCode} onChange={handleFieldChange} />
                <CheckoutField label="Số điện thoại" name="phone" value={form.phone} onChange={handleFieldChange} />
              </div>
            </section>

            <section className="checkout-section checkout-section--panel">
              <div className="checkout-section__head">
                <div>
                  <p className="checkout-section__eyebrow">Bước 02</p>
                  <h2>Phương thức giao hàng</h2>
                </div>
                <span className="checkout-section__badge">
                  <FiTruck aria-hidden="true" />
                  Lựa chọn giao hàng
                </span>
              </div>
              {Object.entries(shippingOptions).map(([key, option]) => (
                <label
                  className={`shipping-method ${form.shippingMethod === key ? 'shipping-method--selected' : ''}`}
                  key={key}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={key}
                    checked={form.shippingMethod === key}
                    onChange={handleFieldChange}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  <b>{option.fee === 0 ? 'Miễn phí' : formatCurrency(option.fee)}</b>
                </label>
              ))}
            </section>

            <section className="checkout-section checkout-section--panel">
              <div className="checkout-section__head">
                <div>
                  <p className="checkout-section__eyebrow">Bước 03</p>
                  <h2>Xác nhận và thanh toán</h2>
                </div>
                <span className="checkout-section__badge">
                  <FiPackage aria-hidden="true" />
                  Thanh toán an toàn
                </span>
              </div>
              <p className="checkout-hint">Kiểm tra thông tin rồi tiếp tục đến trang thanh toán an toàn.</p>
            </section>

            <div className="checkout-actions">
              <div className="checkout-actions__summary">
                <span>Sẵn sàng thanh toán</span>
                <strong>{activeItemCount} sản phẩm đã chọn</strong>
              </div>
              <button className="checkout-button" type="submit" disabled={submitState.status === 'submitting'}>
                {submitState.status === 'submitting' ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
              </button>
            </div>
          </form>

          <div className="checkout-sidebar">
            <OrderSummary
              cartItems={cartItems}
              onRemove={removeItem}
              subtotal={subtotal}
              shippingFee={shippingFee}
              totalAmount={totalAmount}
              onQuantityChange={handleCartQuantityChange}
              stockByItemKey={stockByItemKey}
              stockLoading={stockLoading}
            />
            <PaymentSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              totalAmount={totalAmount}
            />
            <SubmissionCard submitState={submitState} />
          </div>
        </div>
      </section>

      <footer className="checkout-footer">
        <div>
          <h2>StepZone</h2>
          <p>Giày thể thao được chọn lọc cho phong cách năng động mỗi ngày.</p>
        </div>
        <nav aria-label="Footer">
          <a href="/">Hỗ trợ</a>
          <a href="/">Giao hàng</a>
          <a href="/">Chính sách bảo mật</a>
          <a href="/">Liên hệ</a>
          <a href="/">Đổi trả</a>
          <a href="/">Điều khoản sử dụng</a>
        </nav>
        <small>© 2026 STEPZONE ALL RIGHTS RESERVED.</small>
      </footer>
    </main>
  );
}

export default CheckoutPage;
