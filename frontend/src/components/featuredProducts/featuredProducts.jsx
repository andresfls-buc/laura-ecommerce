import { useEffect, useState } from "react";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 4)));
  }, []);

  return (
    <section className="featured">
      <h2>Featured Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.basePrice}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;