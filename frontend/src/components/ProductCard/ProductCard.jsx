import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  // First variant (for displaying main price)
  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;

  // Total stock from variants
  const totalStock =
    product.variants?.reduce(
      (acc, variant) => acc + (variant.stock || 0),
      0
    ) || 0;

  const isExhausted = totalStock === 0;

  const displayPrice = firstVariant?.price || 0;
  const displayOldPrice = firstVariant?.oldPrice || null;

  const hasDiscount =
    displayOldPrice && displayOldPrice > displayPrice;

  // Gather all variant images
  const images =
    product.variants?.flatMap((variant) =>
      variant.images?.map((img) => img.imageUrl)
    ) || [];

  const finalImages =
    images.length > 0 ? images : ["/default-product.png"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMouseEnter = () => {
    if (finalImages.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    let interval;
    if (finalImages.length > 1 && currentImageIndex > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex(
          (prev) => (prev + 1) % finalImages.length
        );
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [currentImageIndex, finalImages.length]);

  return (
    <Link to={`/product/${product.id}`} className="product-link">
      <div
        className="product-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="image-wrapper">
          <img
            src={finalImages[currentImageIndex]}
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
            ${Number(displayPrice).toLocaleString("es-CO")} COP
          </span>

          {hasDiscount && (
            <span className="old-price">
              ${Number(displayOldPrice).toLocaleString(
                "es-CO"
              )}{" "}
              COP
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;