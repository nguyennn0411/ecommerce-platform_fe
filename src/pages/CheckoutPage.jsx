import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiChevronDown,
  FiLock,
  FiLogOut,
  FiPackage,
  FiUser,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { useCart } from '../cart/CartContext.jsx';
import { fetchVietnamProvinces, fetchVietnamWards } from '../api/vietnamAdministrative.js';
import './CheckoutPage.css';

const ORDER_API_URL = '/api/v1/orders';

const initialForm = {
  userId: '22222222-2222-2222-2222-222222222222',
  firstName: 'Hong',
  lastName: 'Phuc',
  email: 'phuc@example.com',
  address1: '',
  address2: '',
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  zipCode: '',
  phone: '',
  shippingMethod: 'standard',
};

const shippingOptions = {
  standard: {
    label: 'Standard Delivery',
    description: '3-5 business days',
    fee: 0,
  },
  express: {
    label: 'Express Delivery',
    description: '1-2 business days',
    fee: 50000,
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

function ProgressSteps({ isSubmitted }) {
  return (
    <div className="checkout-progress" aria-label="Checkout progress">
      {['Shipping', 'Payment', 'Review'].map((label, index) => (
        <div className="checkout-progress__step" key={label}>
          <span className={index === 0 || isSubmitted ? 'is-active' : ''}>{index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

function CheckoutHero({ activeItems, totalAmount, auth, onLogout }) {
  return (
    <section className="checkout-hero">
      <div className="checkout-hero__copy">
        <p className="checkout-kicker">Secure checkout</p>
        <h1>Complete your order.</h1>
        <p className="checkout-hero__text">
          Add your delivery details, choose a shipping method, then continue to payment.
        </p>
        <div className="checkout-userbar">
          <span>
            <FiUser aria-hidden="true" />
            {auth.fullName || auth.username || auth.email}
          </span>
          <small>{auth.email}</small>
          <button type="button" className="checkout-logout" onClick={onLogout}>
            <FiLogOut aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
      <div className="checkout-hero__stats">
        <article>
          <span>Active items</span>
          <strong>{activeItems}</strong>
        </article>
        <article>
          <span>Estimated charge</span>
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
  vatAmount,
  totalAmount,
}) {
  return (
    <aside className="order-summary" aria-label="Order summary">
      <h2>Order Summary</h2>
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
              {item.color ? <p>Color: {item.color}</p> : null}
              <div className="summary-edit-row">
                <label className="summary-edit">
                  <span>Qty</span>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(event) => onQuantityChange(item.key, event.target.value)}
                  />
                </label>
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
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
        <span>Shipping</span>
        <strong>{formatCurrency(shippingFee)}</strong>
        <span>VAT (10%)</span>
        <strong>{formatCurrency(vatAmount)}</strong>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <strong>{formatCurrency(totalAmount)}</strong>
      </div>
    </aside>
  );
}

function PaymentSummary({ subtotal, shippingFee, vatAmount, totalAmount }) {
  return (
    <section className="payment-summary" aria-label="Payment summary">
      <h2>Payment Summary</h2>
      <div>
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      <div>
        <span>Shipping</span>
        <strong>{formatCurrency(shippingFee)}</strong>
      </div>
      <div>
        <span>VAT (10%)</span>
        <strong>{formatCurrency(vatAmount)}</strong>
      </div>
      <footer>
        <span>Total</span>
        <strong>{formatCurrency(totalAmount)}</strong>
      </footer>
    </section>
  );
}

function SubmissionCard({ submitState }) {
  if (submitState.status === 'idle') return null;

  if (submitState.status === 'submitting') {
    return (
      <section className="submission-card submission-card--loading">
        <div className="submission-card__heading">
          <h2>Creating your order</h2>
        </div>
        <p>Please wait while we prepare your payment.</p>
      </section>
    );
  }

  if (submitState.status === 'error') {
    return (
      <section className="submission-card submission-card--error">
        <div className="submission-card__heading">
          <h2>We couldn't place your order</h2>
        </div>
        <p>{submitState.message}</p>
      </section>
    );
  }

  const { order } = submitState;

  return (
    <section className="submission-card submission-card--success">
      <div className="submission-card__heading">
        <FiCheck aria-hidden="true" />
        <h2>Order placed</h2>
      </div>
      <p>Your order is ready. Continue to payment to finish your purchase.</p>
      {order.checkoutUrl ? (
        <a className="checkout-link" href={order.checkoutUrl} target="_blank" rel="noreferrer">
          Continue to payment
        </a>
      ) : null}
    </section>
  );
}

function CheckoutPage({ auth, onLogout }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const { items: cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
    order: null,
  });

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
  const vatAmount = Math.round((subtotal + shippingFee) * 0.1);
  const totalAmount = subtotal + shippingFee + vatAmount;
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
      items: activeItems.map((item) => ({
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

      setSubmitState({
        status: 'success',
        message: parsed.message ?? 'OK',
        order: parsed.data,
      });
      window.sessionStorage.setItem('stepzone-last-order-id', parsed.data.orderId);
      clearCart();
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to place your order. Please try again.',
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
            Continue shopping
          </Link>
          <span className="checkout-secure">
            <FiLock aria-hidden="true" />
            Secure Checkout
          </span>
        </div>
      </header>

      <section className="checkout-main">
        <CheckoutHero
          activeItems={activeItemCount}
          totalAmount={totalAmount}
          auth={auth}
          onLogout={onLogout}
        />
        <ProgressSteps isSubmitted={submitState.status === 'success'} />
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-section checkout-section--panel">
              <div className="checkout-section__head">
                <div>
                  <p className="checkout-section__eyebrow">Step 01</p>
                  <h1>Shipping Address</h1>
                </div>
                <span className="checkout-section__badge">
                  <FiShield aria-hidden="true" />
                  Customer details
                </span>
              </div>
              <div className="shipping-grid">
                <CheckoutField label="First Name" name="firstName" value={form.firstName} onChange={handleFieldChange} />
                <CheckoutField label="Last Name" name="lastName" value={form.lastName} onChange={handleFieldChange} />
                <CheckoutField label="Email" name="email" type="email" value={form.email} onChange={handleFieldChange} wide />
                <CheckoutField label="Street Address" name="address1" value={form.address1} onChange={handleFieldChange} wide />
                <CheckoutField label="Apartment, suite, etc. (optional)" name="address2" value={form.address2} onChange={handleFieldChange} wide />
                <VietnamAdministrativeFields form={form} setForm={setForm} />
                <CheckoutField label="Postal Code" name="zipCode" value={form.zipCode} onChange={handleFieldChange} />
                <CheckoutField label="Phone Number" name="phone" value={form.phone} onChange={handleFieldChange} />
              </div>
            </section>

            <section className="checkout-section checkout-section--panel">
              <div className="checkout-section__head">
                <div>
                  <p className="checkout-section__eyebrow">Step 02</p>
                  <h2>Shipping Method</h2>
                </div>
                <span className="checkout-section__badge">
                  <FiTruck aria-hidden="true" />
                  Delivery options
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
                  <b>{option.fee === 0 ? 'Free' : formatCurrency(option.fee)}</b>
                </label>
              ))}
            </section>

            <section className="checkout-section checkout-section--panel">
              <div className="checkout-section__head">
                <div>
                  <p className="checkout-section__eyebrow">Step 03</p>
                  <h2>Review & Pay</h2>
                </div>
                <span className="checkout-section__badge">
                  <FiPackage aria-hidden="true" />
                  Secure payment
                </span>
              </div>
              <p className="checkout-hint">Review your details and continue to a secure payment page.</p>
            </section>

            <div className="checkout-actions">
              <div className="checkout-actions__summary">
                <span>Ready to checkout</span>
                <strong>{activeItemCount} items selected</strong>
              </div>
              <button className="checkout-button" type="submit" disabled={submitState.status === 'submitting'}>
                {submitState.status === 'submitting' ? 'Creating order...' : 'Continue to Payment'}
              </button>
            </div>
          </form>

          <div className="checkout-sidebar">
            <OrderSummary
              cartItems={cartItems}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
              subtotal={subtotal}
              shippingFee={shippingFee}
              vatAmount={vatAmount}
              totalAmount={totalAmount}
            />
            <PaymentSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              vatAmount={vatAmount}
              totalAmount={totalAmount}
            />
            <SubmissionCard submitState={submitState} />
          </div>
        </div>
      </section>

      <footer className="checkout-footer">
        <div>
          <h2>StepZone</h2>
          <p>Elevating streetwear through curated design and high-performance aesthetics.</p>
        </div>
        <nav aria-label="Footer">
          <a href="/">Support</a>
          <a href="/">Shipping</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Contact</a>
          <a href="/">Returns</a>
          <a href="/">Terms of Service</a>
        </nav>
        <small>© 2026 STEPZONE ALL RIGHTS RESERVED.</small>
      </footer>
    </main>
  );
}

export default CheckoutPage;
