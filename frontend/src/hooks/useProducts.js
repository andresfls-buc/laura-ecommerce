import { useState, useEffect } from "react";
import { api } from "../api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("http://localhost:3000/api/products");

        // map each product to add flat images array
        const productsWithImages = res.data.map(product => {
          const images = product.variants
            ?.flatMap(variant => variant.images.map(img => img.imageUrl))
            || ["/default-product.png"];
          return { ...product, images };
        });

        setProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading };
}