import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
    product.variants?.reduce(
      (acc, variant) => acc + (variant.stock || 0),
      0
    ) || 0;

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
     4️⃣ COLLECT ALL VARIANT IMAGES
     We extract imageUrl from every variant
  ========================== */
  const images =
    product.variants?.flatMap((variant) =>
      variant.images?.map((img) => img.imageUrl) || []
    ) || [];


  /* =========================
     5️⃣ FALLBACK IMAGE
     If no variant images exist,
     use product.image or default image
  ========================== */
  const finalImages =
    images.length > 0
      ? images
      : [product.image || "/default-product.png"];


  /* =========================
     6️⃣ IMAGE STATE
     Controls which image is shown
  ========================== */
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  /* =========================
     7️⃣ HOVER LOGIC
     On hover → show second image
  ========================== */
  const handleMouseEnter = () => {
    if (finalImages.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  // When mouse leaves → go back to first image
  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };


  /* =========================
     8️⃣ AUTO SLIDE EFFECT
     If hovering and multiple images exist,
     rotate images every 1.5 seconds
  ========================== */
  useEffect(() => {
    let interval;

    if (finalImages.length > 1 && currentImageIndex > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex(
          (prev) => (prev + 1) % finalImages.length
        );
      }, 1500);
    }

    // Clean up interval when component updates
    return () => clearInterval(interval);

  }, [currentImageIndex, finalImages.length]);


  /* =========================
     9️⃣ RENDER COMPONENT
  ========================== */
  return (
    <Link to={`/product/${product.id}`} className="product-link">
      <div
        className="product-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        {/* IMAGE SECTION */}
        <div className="image-wrapper">
          <img
            src={finalImages[currentImageIndex]}
            alt={product.name}
            className="product-image"
          />

          {/* EXHAUSTED BADGE */}
          {isExhausted && (
            <span className="badge exhausted">EXHAUSTED</span>
          )}

          {/* OFFER BADGE */}
          {hasDiscount && !isExhausted && (
            <span className="badge offer">OFFER</span>
          )}
        </div>


        {/* PRODUCT NAME */}
        <h3 className="product-name">
          {product.name.toUpperCase()}
        </h3>


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