import { Link } from 'react-router-dom'
import { formatVnd, getMainImage } from '../data/mockProducts'

export default function ProductCard({ product }) {
  const image = getMainImage(product)
  const soldOut =
    product.soldOut ||
    product.stocks?.every((s) => s.available <= 0)

  return (
    <Link to={`/products/${product.id}`} className="sz-product-card">
      <div className="sz-product-media">
        {soldOut ? (
          <span className="sz-badge sz-badge-dark">Sold Out</span>
        ) : product.badge ? (
          <span className="sz-badge">{product.badge}</span>
        ) : null}
        <img src={image} alt={product.name} />
      </div>
      <div className="sz-product-row">
        <h3>{product.name}</h3>
        <span>{formatVnd(product.basePrice)}</span>
      </div>
      <p className="sz-product-collection">
        {product.brand}
        {product.collection ? ` · ${product.collection}` : ''}
      </p>
    </Link>
  )
}
