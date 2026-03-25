import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { FiTrash2 } from "react-icons/fi";
import CheckoutModal from "./CheckoutModal";
import "./Cart.css";

const SHIPPING_COST = 18000;
const FREE_SHIPPING_THRESHOLD = 3;

const Cart = () => {
  const { cartItems, setCartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = cartItems || [];

  // ✅ AUTO-CLEAN CART
  useEffect(() => {
    const syncCart = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000/api"}/products`);
        if (!res.ok) return;

        const products = await res.json();
        if (Array.isArray(products)) {
          const allVariants = products.flatMap(
            (p) => p.Variants || p.variants || []
          );
          const validItems = items.filter((item) => {
            const realVariant = allVariants.find(
              (v) => v.id === item.productVariantId
            );
            return realVariant && realVariant.stock > 0;
          });
          if (validItems.length !== items.length) setCartItems(validItems);
        }
      } catch (error) {
        console.error("Error syncing cart:", error);
      }
    };
    if (items.length > 0) syncCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateQuantity = (id, delta) => {
    const updatedItems = items.map((item) => {
      if (item.productVariantId === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1 || (item.stock && newQuantity > item.stock))
          return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  const removeItem = (id) => {
    setCartItems(items.filter((i) => i.productVariantId !== id));
  };

  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce(
    (acc, i) => acc + Number(i.price) * i.quantity,
    0
  );
  const freeShipping = totalUnits >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = freeShipping ? 0 : SHIPPING_COST;

  // ✅ HANDLE CHECKOUT
  const handleCheckout = async (formData) => {
    try {
      setLoading(true);

      // 1. Validar stock
      const resProducts = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000/api"}/products`);
      const products = await resProducts.json();
      const allVariants = products.flatMap(
        (p) => p.Variants || p.variants || []
      );

      const invalidItem = items.find((item) => {
        const realVariant = allVariants.find(
          (v) => v.id === item.productVariantId
        );
        return !realVariant || realVariant.stock < item.quantity;
      });

      if (invalidItem) {
        alert("Uno de los productos ya no tiene stock disponible.");
        setLoading(false);
        return;
      }

      // 2. Crear la orden — el backend crea el payment link con Wompi
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000/api"}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
        }),
      });

      const responseBody = await res.json();
      const checkoutData =
        responseBody.checkout ||
        (responseBody.data && responseBody.data.checkout);

      if (!checkoutData?.paymentUrl) {
        throw new Error("No se recibió el link de pago del servidor.");
      }

      // 3. Redirigir al link de pago de Wompi (restricción de método aplicada server-side)
      setIsModalOpen(false);
      window.location.href = checkoutData.paymentUrl;
    } catch (error) {
      console.error("Checkout error:", error.message);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length)
    return (
      <div className="cart-empty">
        <h2>Tu carrito está vacío 🛒</h2>
      </div>
    );

  return (
    <>
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCheckout}
        loading={loading}
        subtotal={subtotal}
        shippingCost={shippingCost}
      />

      <div className="cart-page">
        <h1 className="cart-title">Tu Carrito</h1>
        <div className="cart-container">
          <div className="cart-items-section">
            {items.map((item) => (
              <div key={item.productVariantId} className="cart-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-card-img"
                />
                <div className="cart-card-info">
                  <h3>{item.name}</h3>
                  <p>
                    {item.color} / {item.size}
                  </p>
                </div>
                <div className="cart-card-price">
                  <p>
                    $
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "es-CO"
                    )}{" "}
                    COP
                  </p>
                  <div className="cart-actions">
                    <div className="cart-qty-selector">
                      <button
                        onClick={() =>
                          updateQuantity(item.productVariantId, -1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productVariantId, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productVariantId)}
                      className="delete-icon-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Resumen</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-CO")} COP</span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span>
                {freeShipping
                  ? "Gratis"
                  : `$${shippingCost.toLocaleString("es-CO")} COP`}
              </span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${(subtotal + shippingCost).toLocaleString("es-CO")} COP</span>
            </div>
            <button
              className="checkout-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
