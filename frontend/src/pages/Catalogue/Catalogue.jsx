import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/ProductCard";
import "./Catalogue.css";

const Catalogue = () => {
  const { products, loading } = useProducts();

  return (
    <div className="catalogue-container">
      <h1 className="catalogue-title">Catálogo</h1>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogue;
