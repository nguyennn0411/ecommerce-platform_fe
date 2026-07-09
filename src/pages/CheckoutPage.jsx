import {
  FiCheck,
  FiChevronDown,
  FiClock,
  FiLock,
  FiRotateCcw,
} from 'react-icons/fi';
import sneakerBlack from '../assets/sneaker-black.png';
import sneakerWhite from '../assets/sneaker-white.png';
import './CheckoutPage.css';

const shippingFields = [
  { label: 'First Name', value: 'John' },
  { label: 'Last Name', value: 'Doe' },
  { label: 'Address Line 1', value: '123 Sneaker St', wide: true },
  { label: 'Address Line 2 (Optional)', value: 'Apt 4B', wide: true },
  { label: 'City', value: 'New York' },
  { label: 'State / Province', value: 'Select State', select: true },
  { label: 'ZIP Code', value: '10001' },
  { label: 'Phone Number', value: '(555) 123-4567' },
];

const cartItems = [
  {
    name: 'AERO RUNNER V2',
    size: '10.5 US',
    quantity: 1,
    price: '$240.00',
    image: sneakerBlack,
  },
  {
    name: 'CANVAS MINIMALIST',
    size: '9 US',
    quantity: 1,
    price: '$180.00',
    image: sneakerWhite,
  },
];

const sagaSteps = [
  {
    status: 'COMPLETED',
    title: 'Inventory Reserved',
    service: 'inventory-service',
    time: 'Oct 24, 14:32:01',
    tone: 'done',
  },
  {
    status: 'COMPLETED',
    title: 'Payment Processed',
    service: 'payment-service',
    time: 'Oct 24, 14:32:45',
    tone: 'done',
  },
  {
    status: 'PENDING',
    title: 'Shipping Label Created',
    service: 'shipping-service',
    time: 'Awaiting external API response...',
    tone: 'pending',
  },
  {
    status: 'QUEUED',
    title: 'Email Dispatcher',
    service: 'notification-service',
    time: 'Waiting for order completion event',
    tone: 'queued',
  },
];

function CheckoutField({ label, value, wide, select }) {
  return (
    <label className={`checkout-field ${wide ? 'checkout-field--wide' : ''}`}>
      <span>{label}</span>
      <div className={`checkout-input ${select ? 'checkout-input--select' : ''}`}>
        {value}
        {select && <FiChevronDown aria-hidden="true" />}
      </div>
    </label>
  );
}

function ProgressSteps() {
  return (
    <div className="checkout-progress" aria-label="Checkout progress">
      {['Shipping', 'Payment', 'Review'].map((label, index) => (
        <div className="checkout-progress__step" key={label}>
          <span className={index === 0 ? 'is-active' : ''}>{index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

function OrderSummary() {
  return (
    <aside className="order-summary" aria-label="Order summary">
      <h2>Order Summary</h2>
      <div className="order-summary__items">
        {cartItems.map((item) => (
          <article className="summary-item" key={item.name}>
            <div className="summary-item__image">
              <img src={item.image} alt={item.name} />
            </div>
            <div>
              <h3>{item.name}</h3>
              <p>Size: {item.size}</p>
              <p>Qty: {item.quantity}</p>
              <strong>{item.price}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="summary-lines">
        <span>Subtotal</span>
        <strong>$420.00</strong>
        <span>Shipping</span>
        <strong>Calculated next step</strong>
        <span>Estimated Tax</span>
        <strong>$35.70</strong>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <strong>$455.70</strong>
      </div>
    </aside>
  );
}

function PaymentSummary() {
  return (
    <section className="payment-summary" aria-label="Payment summary">
      <h2>Payment Summary</h2>
      <div>
        <span>Subtotal</span>
        <strong>8,750,000đ</strong>
      </div>
      <div>
        <span>Shipping</span>
        <strong>50,000đ</strong>
      </div>
      <div>
        <span>VAT (10%)</span>
        <strong>880,000đ</strong>
      </div>
      <footer>
        <span>Total</span>
        <strong>9,680,000đ</strong>
      </footer>
    </section>
  );
}

function SagaTimeline() {
  return (
    <section className="saga-card" aria-label="Saga transaction log">
      <div className="saga-card__heading">
        <FiRotateCcw aria-hidden="true" />
        <h2>SAGA Transaction Log</h2>
      </div>
      <div className="saga-timeline">
        {sagaSteps.map((step) => (
          <article className={`saga-step saga-step--${step.tone}`} key={step.title}>
            <span className="saga-step__marker">
              {step.tone === 'done' ? <FiCheck aria-hidden="true" /> : <FiClock aria-hidden="true" />}
            </span>
            <div>
              <strong className="saga-step__status">{step.status}</strong>
              <h3>{step.title}</h3>
              <p>Microservice: {step.service}</p>
              <small>{step.time}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CheckoutPage() {
  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <a className="checkout-brand" href="/">StepZone</a>
        <span className="checkout-secure">
          <FiLock aria-hidden="true" />
          Secure Checkout
        </span>
      </header>

      <section className="checkout-main">
        <ProgressSteps />
        <div className="checkout-layout">
          <div className="checkout-form">
            <section className="checkout-section">
              <h1>1. Shipping Address</h1>
              <div className="shipping-grid">
                {shippingFields.map((field) => (
                  <CheckoutField key={field.label} {...field} />
                ))}
              </div>
            </section>

            <section className="checkout-section checkout-section--bordered">
              <h2>2. Shipping Method</h2>
              <label className="shipping-method shipping-method--selected">
                <input type="radio" name="shipping" defaultChecked />
                <span>
                  <strong>Standard Delivery</strong>
                  <small>3-5 Business Days</small>
                </span>
                <b>Free</b>
              </label>
              <label className="shipping-method">
                <input type="radio" name="shipping" />
                <span>
                  <strong>Express Delivery</strong>
                  <small>1-2 Business Days</small>
                </span>
                <b>$25.00</b>
              </label>
            </section>

            <section className="checkout-section checkout-section--muted">
              <h2>3. Payment</h2>
              <p>Please complete shipping details to proceed to payment.</p>
            </section>

            <button className="checkout-button" type="button">Continue to Payment</button>
          </div>

          <div className="checkout-sidebar">
            <OrderSummary />
            <PaymentSummary />
            <SagaTimeline />
            <section className="system-alert">
              <h2>System Alert</h2>
              <p>Fraud check passed (Score: 0.12). Transaction ID: 5592-882-991-X. User verified via 2FA.</p>
            </section>
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
