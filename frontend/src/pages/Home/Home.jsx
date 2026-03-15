// src/Home.jsx
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
  // You can replace this with specific product IDs later if needed
  const collectionProducts = products.slice(0, 3);

  return (
    <div className="home-container">
      {/* Banner principal */}
      <section className="banner-section">
        <div className="banner-content">
          <h1 className="banner-title">Descubre la nueva colección</h1>
          <p className="banner-subtitle">Viste con estilo cada día</p>
          <button className="banner-btn">Ver productos</button>
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
