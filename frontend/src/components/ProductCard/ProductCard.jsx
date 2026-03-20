import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  /* =========================
     1️⃣ GET FIRST VARIANT
     Used to display main price
  ========================== */
  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;

  /* =========================
     2️⃣ CALCULATE TOTAL STOCK
     Sum all variant stock values
  ========================== */
  const totalStock =
    product.variants?.reduce((acc, variant) => acc + (variant.stock || 0), 0) ||
    0;

  // If total stock is 0 → product is exhausted
  const isExhausted = totalStock === 0;

  /* =========================
     3️⃣ PRICE LOGIC
  ========================== */
  const displayPrice = firstVariant?.price || 0;
  const displayOldPrice = firstVariant?.oldPrice || null;

  // Check if product has discount
  const hasDiscount =
    displayOldPrice && Number(displayOldPrice) > Number(displayPrice);

  /* =========================
     4️⃣ GET FIRST IMAGE ONLY
     No more image cycling - just show first image
  ========================== */
  const images =
    product.variants?.flatMap(
      (variant) => variant.images?.map((img) => img.imageUrl) || []
    ) || [];

  // Use first variant image, or product.image, or default
  const displayImage = images[0] || product.image || "/default-product.png";

  /* =========================
     5️⃣ RENDER COMPONENT
  ========================== */
  return (
    <Link to={`/product/${product.id}`} className="product-link">
      <div className="product-card">
        {/* IMAGE SECTION */}
        <div className="image-wrapper">
          <img
            src={displayImage}
            alt={product.name}
            className="product-image"
          />

          {/* EXHAUSTED BADGE */}
          {isExhausted && <span className="badge exhausted">EXHAUSTED</span>}

          {/* OFFER BADGE */}
          {hasDiscount && !isExhausted && (
            <span className="badge offer">OFFER</span>
          )}
        </div>

        {/* PRODUCT NAME */}
        <h3 className="product-name">{product.name.toUpperCase()}</h3>

        {/* PRICE SECTION */}
        <div className="price-container">
          <span className="current-price">
            ${Number(displayPrice).toLocaleString("es-CO")} COP
          </span>

          {hasDiscount && (
            <span className="old-price">
              ${Number(displayOldPrice).toLocaleString("es-CO")} COP
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
