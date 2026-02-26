import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const isExhausted = product.stock === 0;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;

  return (
    <Link to={`/product/${product.id}`} className="product-link">
      <div className="product-card">

        <div className="image-wrapper">
          <img
            src={product.image || "/default-product.png"}
            alt={product.name}
            className="product-image"
          />

          {isExhausted && (
            <span className="badge exhausted">EXHAUSTED</span>
          )}

          {hasDiscount && !isExhausted && (
            <span className="badge offer">OFFER</span>
          )}
        </div>

        <h3 className="product-name">
          {product.name.toUpperCase()}
        </h3>

        <div className="price-container">
          <span className="current-price">
            ${Number(product.price).toLocaleString("es-CO")} COP
          </span>

          {hasDiscount && (
            <span className="old-price">
              ${Number(product.oldPrice).toLocaleString("es-CO")} COP
            </span>
          )}
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;