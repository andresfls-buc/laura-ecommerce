// src/Home.jsx
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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

// Fisher-Yates shuffle
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const SLIDE_INTERVAL = 6000; // 6 seconds

const Home = () => {
  const { products, loading } = useProducts();
  const [sliderImages, setSliderImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  // Pick up to 3 products with unique images for the collections section
  const collectionProducts = products
    .filter((p, i, arr) => {
      const img = getProductImage(p);
      return img !== "/default-product.png" && arr.findIndex((x) => getProductImage(x) === img) === i;
    })
    .slice(0, 3);

  // Build shuffled image list once products load
  useEffect(() => {
    if (products.length === 0) return;
    const allImages = products.flatMap((p) => {
      const img = getProductImage(p);
      return img !== "/default-product.png" ? [img] : [];
    });
    setSliderImages(shuffleArray(allImages));
    setCurrentIndex(0);
  }, [products]);

  // Auto-advance slider
  useEffect(() => {
    if (sliderImages.length < 2) return;
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
        setFade(true);
      }, 500);
    }, SLIDE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [sliderImages]);

  const bannerImage =
    sliderImages.length > 0
      ? sliderImages[currentIndex]
      : "/banner-default.jpg";

  return (
    <div className="home-container">
      {/* Promo bar — envío gratis */}
      <div className="promo-bar">
        <FiTruck
          size={15}
          style={{ marginRight: "0.4rem", verticalAlign: "middle" }}
        />
        <span>¡Envío gratis comprando 3 o más productos!</span>
      </div>

      {/* Banner principal con imagen de fondo */}
      <section className="banner-section">
        <div
          className={`banner-background${fade ? "" : " banner-fade-out"}`}
          style={{
            backgroundImage: `url(${bannerImage})`,
          }}
        />
        <div className="banner-content">
          <h1 className="banner-title">Descubre la nueva colección</h1>
          <p className="banner-subtitle">Viste con estilo cada día</p>
          <Link to="/catalogue" className="banner-btn">
            Ver productos
          </Link>
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
          {loading ? (
            <p>Cargando colecciones...</p>
          ) : (
            collectionProducts.map((product) => (
              <div key={product.id} className="collection-card">
                <div
                  className="collection-img"
                  style={{
                    backgroundImage: `url(${getProductImage(product)})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#f4f4f4",
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
