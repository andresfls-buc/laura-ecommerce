// src/Home.jsx
import ProductCard from "../../components/ProductCard"; // el componente que creamos
import { useProducts } from "../../hooks/useProducts"; // el hook que creamos
import "./Home.css"; // CSS que vamos a crear abajo

const Home = () => {
  const { products, loading } = useProducts();

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
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Sección de colecciones */}
      <section className="collections-section">
        <h2 className="section-title">Colecciones</h2>
        <div className="collections-grid">
          <div className="collection-card">
            <div className="collection-img women"></div>
            <span>Uniforme Rojo</span>
          </div>
          <div className="collection-card">
            <div className="collection-img tops"></div>
            <span>Uniforme verde</span>
          </div>
          <div className="collection-card">
            <div className="collection-img accessories"></div>
            <span>Uniforme azul</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;