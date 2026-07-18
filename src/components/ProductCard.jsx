import { Link } from 'react-router-dom'
import { formatVnd, getMainImage, PLACEHOLDER_IMAGE } from '../utils/productUtils'

export default function ProductCard({ product }) {
  const image = getMainImage(product)

  return (
    <Link to={`/products/${product.id}`} className="sz-product-card">
      <div className="sz-product-media">
        {product.badge ? <span className="sz-badge">{product.badge}</span> : null}
        <img
          src={image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
      </div>
      <div className="sz-product-row">
        <h3>{product.name}</h3>
        <span>{formatVnd(product.basePrice)}</span>
      </div>
      <p className="sz-product-collection">
        {product.brand}
        {product.categoryName ? ` · ${product.categoryName}` : ''}
      </p>
    </Link>
  )
}
