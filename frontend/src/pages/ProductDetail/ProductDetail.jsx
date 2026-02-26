import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(res.data);

        // default first variant if exists
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      <p>
        Precio: $
        {Number(selectedVariant?.price || product.price).toLocaleString("es-CO")} COP
      </p>

      {product.variants && product.variants.length > 0 && (
        <div>
          <h4>Seleccione variante:</h4>
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v)}
              style={{
                margin: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: selectedVariant?.id === v.id ? "#333" : "#eee",
                color: selectedVariant?.id === v.id ? "#fff" : "#000",
              }}
            >
              {v.color} - {v.size}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <img
          src={selectedVariant?.image || product.image || "https://via.placeholder.com/150"}
          alt={product.name}
          style={{ width: "300px", height: "300px", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

export default ProductDetail;