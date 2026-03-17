import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const items = cartItems || [];

  // ── Quantity & remove ───────────────────────────────────────────────────
  const updateQuantity = (id, delta) => {
    const updatedItems = items.map((item) => {
      if (item.productVariantId === id) {
        const newQuantity = (item.quantity || 1) + delta;
        if (newQuantity < 1) return item;
        if (newQuantity > item.stock) {
          alert(`Solo hay ${item.stock} disponibles.`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  const removeItem = (id) => {
    const filtered = items.filter((item) => item.productVariantId !== id);
    setCartItems(filtered);
  };

  // ── Price calculations (mirrors backend logic for display) ──────────────
  const totalUnits = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.price) * (item.quantity || 1),
    0
  );
  const freeShipping = totalUnits >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = freeShipping ? 0 : SHIPPING_COST;

  // ── Wompi ready check ───────────────────────────────────────────────────
  const waitForWompi = () =>
    new Promise((resolve, reject) => {
      if (window.WidgetCheckout) return resolve();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.WidgetCheckout) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 20) {
          clearInterval(interval);
          reject(new Error("Wompi script did not load in time."));
        }
      }, 250);
    });

  // ── Main checkout handler — receives full form including paymentMethod ───
  const handleCreateOrder = async (customerData) => {
    if (!items.length) return;

    try {
      setLoading(true);

      // 1. Create order — send paymentMethod from the modal form
      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerData.customerName,
          customerEmail: customerData.customerEmail,
          customerPhone: customerData.customerPhone,
          shippingAddress: customerData.shippingAddress,
          shippingCity: customerData.shippingCity,
          shippingPostalCode: customerData.shippingPostalCode,
          paymentMethod: customerData.paymentMethod, // ✅ dynamic now
          items: items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Error creando la orden");
        return;
      }

      const paymentData = result.data?.checkout;

      if (!paymentData) {
        console.error("Respuesta del servidor:", result);
        alert("Error: El servidor no envió la información de pago.");
        return;
      }

      const amountToPay =
        paymentData.amountInCents || paymentData.amount_in_cents;

      if (!amountToPay || !paymentData.signature) {
        console.error("Datos incompletos:", paymentData);
        alert("Error: Datos de pago incompletos (monto o firma ausentes).");
        return;
      }

      // 2. Wait for Wompi widget
      await waitForWompi();

      // 3. Launch Wompi widget with the final amount (already includes surcharge if credit card)
      const widgetConfig = {
        currency: paymentData.currency || "COP",
        amountInCents: Number(amountToPay),
        reference: paymentData.reference,
        publicKey: paymentData.publicKey,
        "signature:integrity": paymentData.signature,
      };

      if (
        paymentData.redirectUrl &&
        !paymentData.redirectUrl.includes("localhost")
      ) {
        widgetConfig.redirectUrl = paymentData.redirectUrl;
      }

      const handler = new window.WidgetCheckout(widgetConfig);

      // 4. Handle Wompi response
      handler.open(async (res) => {
        console.log("Wompi callback:", res);
        const transaction = res.transaction;

        if (!transaction) return;

        if (
          transaction.status === "APPROVED" ||
          transaction.status === "PENDING"
        ) {
          setCartItems([]);
          navigate(
            `/thank-you?id=${transaction.id}&status=${transaction.status}&reference=${transaction.reference}`
          );
        } else if (transaction.status === "DECLINED") {
          alert("El pago fue rechazado.");
        }
      });
    } catch (error) {
      console.error("Error en handleCreateOrder:", error);
      alert("Hubo un error de conexión.");
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

  // ── Surcharge is shown only when user has toggled credit card in the modal
  // We derive it from a local state passed up from the modal if needed,
  // but for the summary we show a note instead (modal handles the toggle live)

  return (
    <>
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(customerData) => {
          setIsModalOpen(false);
          handleCreateOrder(customerData);
        }}
        loading={loading}
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
                  <div className="cart-qty-selector">
                    <button
                      onClick={() => updateQuantity(item.productVariantId, -1)}
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
                </div>
                <div className="cart-card-price">
                  <p>
                    $
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "es-CO"
                    )}{" "}
                    COP
                  </p>
                  <button
                    onClick={() => removeItem(item.productVariantId)}
                    className="delete-icon-btn"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ─────────────────────────────────────────────── */}
          <div className="cart-summary">
            <h3>Resumen</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-CO")} COP</span>
            </div>

            <div className="summary-row">
              <span>Envío</span>
              <span>
                {freeShipping ? (
                  <span className="free-shipping-badge">¡Gratis! 🎉</span>
                ) : (
                  `$${shippingCost.toLocaleString("es-CO")} COP`
                )}
              </span>
            </div>

            {freeShipping && (
              <div className="free-shipping-msg">
                🎉 ¡Llevas {totalUnits} productos, el envío es gratis!
              </div>
            )}

            <div className="summary-row summary-note">
              <span>Recargo tarjeta de crédito</span>
              <span>5% (si aplica)</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total estimado</span>
              <span>
                ${(subtotal + shippingCost).toLocaleString("es-CO")} COP
              </span>
            </div>

            <p className="summary-disclaimer">
              * El recargo del 5% se aplicará si pagas con tarjeta de crédito.
              El total final se calculará al confirmar.
            </p>

            <button
              className="checkout-btn"
              disabled={loading}
              onClick={() => setIsModalOpen(true)}
            >
              {loading ? "Procesando..." : "Finalizar Compra"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
