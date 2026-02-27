import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const isExhausted = product.stock === 0;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;

  // Gather all variant images into a flat array
  const images =
    product.variants?.flatMap(variant =>
      variant.images?.map(img => img.imageUrl)
    ) || ["/default-product.png"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Carousel effect on hover
  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImageIndex(1); // start cycling after first image
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0); // reset to first image
  };

  // Optional auto-cycle every 1.5s on hover
  useEffect(() => {
    let interval;
    if (images.length > 1 && currentImageIndex > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [currentImageIndex, images.length]);

  return (
    <Link to={`/product/${product.id}`} className="product-link">
      <div
        className="product-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="image-wrapper">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="product-image"
          />

          {isExhausted && <span className="badge exhausted">EXHAUSTED</span>}

          {hasDiscount && !isExhausted && (
            <span className="badge offer">OFFER</span>
          )}
        </div>

        <h3 className="product-name">{product.name.toUpperCase()}</h3>

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