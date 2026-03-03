import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Cart hydration failed:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Updated addToCart to return a boolean result
  const addToCart = (newItem) => {
    let success = true;

    setCartItems((prevCart) => {
      const existingItem = prevCart.find(
        (i) => i.productVariantId === newItem.productVariantId
      );

      if (existingItem) {
        // STOCK CHECK
        if (existingItem.quantity >= newItem.stock) {
          alert(`Lo sentimos, solo hay ${newItem.stock} unidades disponibles.`);
          success = false; // ❌ Mark as failed
          return prevCart;
        }

        return prevCart.map((i) =>
          i.productVariantId === newItem.productVariantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prevCart, { ...newItem, quantity: 1 }];
    });

    return success; // ✅ Return the result back to ProductDetail.jsx
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);