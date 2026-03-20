import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./ProductDetail.css";
import axios from "axios";
import { BsCartPlus } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import { FiCheckCircle, FiAlertTriangle, FiXCircle } from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [toast, setToast] = useState(null); // Toast notification state
  const [addingToCart, setAddingToCart] = useState(false); // Button loading state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        const fetchedProduct = res.data;
        setProduct(fetchedProduct);

        if (fetchedProduct.variants?.length > 0) {
          const firstVariant = fetchedProduct.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedImage(
            firstVariant.images?.[0]?.imageUrl || fetchedProduct.image
          );
        } else {
          setSelectedImage(fetchedProduct.image);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(variant.images?.[0]?.imageUrl || product.image);
  };

  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;
  const isOutOfStock = currentStock === 0;

  const handleAddToCart = () => {
    // Validate variant selection
    if (product.variants?.length > 0 && !selectedVariant) {
      showToast("Por favor selecciona una variante", "warning");
      return;
    }

    setAddingToCart(true);

    const wasAdded = addToCart({
      id: product.id,
      productVariantId: selectedVariant?.id || product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: selectedImage,
      quantity: 1,
      color: selectedVariant?.color,
      size: selectedVariant?.size,
      stock: currentStock,
    });

    setTimeout(() => {
      setAddingToCart(false);
      if (wasAdded) {
        showToast("✓ Producto agregado al carrito", "success");
      } else {
        showToast("No hay suficiente stock disponible", "error");
      }
    }, 300);
  };

  const handleIrAPagar = () => {
    // Navigate directly to cart (don't add again)
    navigate("/cart");
  };

  if (loading) return <p className="loading-text">Cargando...</p>;
  if (!product) return <p className="error-text">Producto no encontrado</p>;

  return (
    <div className="product-detail">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === "success" && <FiCheckCircle />}
            {toast.type === "warning" && <FiAlertTriangle />}
            {toast.type === "error" && <FiXCircle />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="product-detail-container">
        {/* LEFT SIDE: Images */}
        <div className="gallery">
          <img
            src={selectedImage || "https://via.placeholder.com/300"}
            alt={product.name}
            className="main-image"
          />

          {selectedVariant?.images?.length > 0 && (
            <div className="thumbnails">
              {selectedVariant.images.map((img) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt="thumbnail"
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`thumbnail ${selectedImage === img.imageUrl ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Info */}
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>

          <p className="price">
            $
            {Number(selectedVariant?.price || product.price).toLocaleString(
              "es-CO"
            )}{" "}
            COP
          </p>

          {product.variants?.length > 0 && (
            <div className="variant-section">
              <h4>Seleccione variante:</h4>
              <div className="variant-buttons">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    className={`variant-btn ${selectedVariant?.id === variant.id ? "selected" : ""}`}
                  >
                    {variant.color} - {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          <div className="stock-info">
            {isOutOfStock ? (
              <span className="stock-out">
                <FiXCircle /> Agotado
              </span>
            ) : currentStock <= 5 ? (
              <span className="stock-low">
                <FiAlertTriangle /> Solo quedan {currentStock} unidades
              </span>
            ) : (
              <span className="stock-available">
                <FiCheckCircle /> Stock disponible: {currentStock} unidades
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button
              className={`add-to-cart-btn ${addingToCart ? "adding" : ""}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
            >
              <BsCartPlus size={20} />
              {addingToCart ? "Agregando..." : "Agregar al carrito"}
            </button>

            <button
              className="buy-now-btn"
              onClick={handleIrAPagar}
              disabled={isOutOfStock}
            >
              <MdPayment size={20} /> Ir a pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
