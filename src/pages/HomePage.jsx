import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import {
  formatVnd,
  getMainImage,
  newArrivals,
  trendingProducts,
} from '../data/mockProducts'

export default function HomePage() {
  const [featured, ...sideTrends] = trendingProducts

  return (
    <>
      <section className="sz-hero" aria-label="New drops">
        <div className="sz-hero-stage" aria-hidden />
        <img
          className="sz-hero-img"
          src="https://images.unsplash.com/photo-1608667508764-33cf0726b13a?auto=format&fit=crop&w=1200&q=80"
          alt="Featured StepZone sneaker"
        />
        <div className="sz-hero-copy">
          <p className="sz-hero-kicker">Fire Lab Exclusive</p>
          <h1 className="sz-hero-title">New Drops</h1>
          <p className="sz-hero-text">
            Discover the latest silhouettes engineered for the street — limited
            pairs, premium materials, zero compromise.
          </p>
          <Link to="/products" className="sz-btn sz-btn-light">
            Shop the Collection
          </Link>
        </div>
      </section>

      <section className="sz-section" aria-labelledby="trending-heading">
        <div className="sz-section-head">
          <h2 id="trending-heading" className="sz-section-title">
            Trending Now
          </h2>
          <Link to="/products" className="sz-link">
            View All
          </Link>
        </div>

        <div className="sz-trending-grid">
          <Link to={`/products/${featured.id}`} className="sz-trend-card">
            {featured.badge ? (
              <span className="sz-badge">{featured.badge}</span>
            ) : null}
            <img src={getMainImage(featured)} alt={featured.name} />
            <div className="sz-trend-meta">
              <h3>{featured.name}</h3>
              <p>{formatVnd(featured.basePrice)}</p>
            </div>
          </Link>

          <div className="sz-trending-side">
            {sideTrends.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="sz-trend-card"
              >
                <img src={getMainImage(item)} alt={item.name} />
                <div className="sz-trend-meta">
                  <h3>{item.name}</h3>
                  <p>{formatVnd(item.basePrice)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sz-section" aria-labelledby="arrivals-heading">
        <h2 id="arrivals-heading" className="sz-section-title center">
          New Arrivals
        </h2>

        <div className="sz-arrivals-grid">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="sz-section-cta">
          <Link to="/products" className="sz-btn sz-btn-outline">
            Load More Silhouettes
          </Link>
        </div>
      </section>
    </>
  )
}
