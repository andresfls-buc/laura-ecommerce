import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/ProductCard";
import "./Catalogue.css";

const Catalogue = () => {
  const { products, loading } = useProducts();

  return (
    <div className="catalogue-page">
      {/* Hero Section */}
      <section className="catalogue-hero">
        <div className="hero-content">
          <h1 className="catalogue-title">Catálogo</h1>
          <p className="catalogue-subtitle">
            Descubre nuestra colección completa de productos
          </p>
        </div>
      </section>

      {/* Products Section */}
      <div className="catalogue-container">
        {loading ? (
          <div className="loading-state">
            <p>Cargando productos...</p>
          </div>
        ) : (
          <>
            <div className="products-count">
              <span>{products.length} productos</span>
            </div>
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalogue;
