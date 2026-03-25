// src/Home.jsx
import { Link } from "react-router-dom";
import { FiTruck } from "react-icons/fi";
import ProductCard from "../../components/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import "./Home.css";

// Helper — get the first available image from a product
const getProductImage = (product) => {
  const fromVariants = product.variants
    ?.flatMap((v) => v.images?.map((img) => img.imageUrl) || [])
    .filter(Boolean)[0];
  return fromVariants || product.image || "/default-product.png";
};

const Home = () => {
  const { products, loading } = useProducts();

  // Pick the first 3 products for the collections section
  const collectionProducts = products.slice(0, 3);

  // Get a featured product image for the banner background
  // You can change this to use a specific product or a static image
  const bannerImage =
    products.length > 0 ? getProductImage(products[0]) : "/banner-default.jpg"; // Fallback image

  return (
    <div className="home-container">
      {/* Promo bar — envío gratis */}
      <div className="promo-bar">
        <FiTruck size={15} style={{ marginRight: "0.4rem", verticalAlign: "middle" }} />
        <span>¡Envío gratis comprando 3 o más productos!</span>
      </div>

      {/* Banner principal con imagen de fondo */}
      <section className="banner-section">
        <div
          className="banner-background"
          style={{
            backgroundImage: `url(${bannerImage})`,
          }}
        />
        <div className="banner-content">
          <h1 className="banner-title">Descubre la nueva colección</h1>
          <p className="banner-subtitle">Viste con estilo cada día</p>
          <Link to="/catalogue" className="banner-btn">Ver productos</Link>
        </div>
      </section>

      {/* Sección de productos */}
      <section className="products-section">
        <h2 className="section-title">Productos destacados</h2>
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Sección de colecciones */}
      <section className="collections-section">
        <h2 className="section-title">Colecciones</h2>
        <div className="collections-grid">
          {loading ? (
            <p>Cargando colecciones...</p>
          ) : (
            collectionProducts.map((product) => (
              <div key={product.id} className="collection-card">
                <div
                  className="collection-img"
                  style={{
                    backgroundImage: `url(${getProductImage(product)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
