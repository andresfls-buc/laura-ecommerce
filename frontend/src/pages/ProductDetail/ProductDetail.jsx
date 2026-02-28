import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/products/${id}`
        );

        const fetchedProduct = res.data;
        setProduct(fetchedProduct);

        if (fetchedProduct.variants?.length > 0) {
          const firstVariant = fetchedProduct.variants[0];
          setSelectedVariant(firstVariant);

          const firstImage =
            firstVariant.images?.length > 0
              ? firstVariant.images[0].imageUrl
              : fetchedProduct.image;

          setSelectedImage(firstImage);
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

    const firstImage =
      variant.images?.length > 0
        ? variant.images[0].imageUrl
        : product.image;

    setSelectedImage(firstImage);
  };

  if (loading) return <p>Cargando...</p>;
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      <p>
        Precio: $
        {Number(selectedVariant?.price || product.price).toLocaleString(
          "es-CO"
        )}{" "}
        COP
      </p>

      {/* Variant Selector */}
      {product.variants?.length > 0 && (
        <div>
          <h4>Seleccione variante:</h4>
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleVariantChange(variant)}
              style={{
                margin: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor:
                  selectedVariant?.id === variant.id ? "#333" : "#eee",
                color:
                  selectedVariant?.id === variant.id ? "#fff" : "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              {variant.color} - {variant.size}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div style={{ marginTop: "1.5rem" }}>
        <img
          src={
            selectedImage ||
            product.image ||
            "https://via.placeholder.com/300"
          }
          alt={product.name}
          style={{
            width: "300px",
            height: "300px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />

        {/* Thumbnails */}
        {selectedVariant?.images?.length > 0 && (
          <div
            style={{
              display: "flex",
              marginTop: "0.8rem",
              gap: "0.5rem",
            }}
          >
            {selectedVariant.images.map((img) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt="thumbnail"
                onClick={() => setSelectedImage(img.imageUrl)}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    selectedImage === img.imageUrl
                      ? "2px solid black"
                      : "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;