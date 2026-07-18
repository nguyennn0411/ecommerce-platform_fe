import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="sz-footer">
      <div className="sz-footer-inner">
        <div>
          <p className="sz-footer-brand">StepZone</p>
          <p className="sz-footer-desc">
            Elevating streetwear through curated design and high-performance
            aesthetics.
          </p>
        </div>
        <div className="sz-footer-col">
          <h4>Support</h4>
          <Link to="/products">Contact</Link>
          <Link to="/products">Shipping</Link>
          <Link to="/products">Returns</Link>
        </div>
        <div className="sz-footer-col">
          <h4>Legal</h4>
          <Link to="/products">Privacy Policy</Link>
          <Link to="/products">Terms of Service</Link>
        </div>
      </div>
      <div className="sz-footer-bottom">
        © {new Date().getFullYear()} StepZone. All rights reserved.
      </div>
    </footer>
  )
}
