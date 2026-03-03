import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext"; 
import "./ProductDetail.css";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart(); 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        const fetchedProduct = res.data;
        setProduct(fetchedProduct);

        if (fetchedProduct.variants?.length > 0) {
          const firstVariant = fetchedProduct.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedImage(firstVariant.images?.[0]?.imageUrl || fetchedProduct.image);
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

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(variant.images?.[0]?.imageUrl || product.image);
  };

  const handleAddToCart = () => {
    // 1. Check if variant is needed and selected
    if (product.variants?.length > 0 && !selectedVariant) {
      alert("Por favor selecciona una variante");
      return;
    }

    // 2. Identify current stock limit
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

    // 3. Attempt to add to cart and capture the result
    // We update addToCart in Context to return true/false based on stock
    const wasAdded = addToCart({
      id: product.id,
      productVariantId: selectedVariant?.id || product.id, 
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: selectedImage,
      quantity: 1,
      color: selectedVariant?.color,
      size: selectedVariant?.size,
      stock: currentStock // ✅ Send stock value to Context
    });

    // 4. ✅ Only alert success if the Context actually added it
    if (wasAdded) {
      alert("Producto agregado al carrito 🛒");
    }
  };

  if (loading) return <p className="loading-text">Cargando...</p>;
  if (!product) return <p className="error-text">Producto no encontrado</p>;

  return (
    <div className="product-detail">
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
            ${Number(selectedVariant?.price || product.price).toLocaleString("es-CO")} COP
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

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;