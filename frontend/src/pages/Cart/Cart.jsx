import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FiTrash2 } from "react-icons/fi";
import CheckoutModal from "./CheckoutModal";
import "./Cart.css";

const Cart = () => {
  const { cartItems, setCartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const items = cartItems || [];

  // Actualizar cantidad con validación de stock
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

  // Eliminar producto del carrito
  const removeItem = (id) => {
    const filtered = items.filter((item) => item.productVariantId !== id);
    setCartItems(filtered);
  };

  // Calcular total de la compra
  const total = items.reduce(
    (acc, item) => acc + Number(item.price) * (item.quantity || 1),
    0
  );

  // Esperar a que el script de Wompi esté listo
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

  // Función principal de Checkout — recibe los datos del formulario
  const handleCreateOrder = async (customerData) => {
    if (!items.length) return;

    try {
      setLoading(true);

      // 1. Crear la orden en el backend con los datos reales del cliente
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
          paymentMethod: "wompi",
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

      // 2. Extraer datos para el Widget
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

      // 3. Esperar a que Wompi esté listo
      await waitForWompi();

      // 4. Inicializar Widget de Wompi
      // redirectUrl is only included in production — Wompi blocks localhost URLs
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

      // 5. Abrir el modal de pago
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
      }); // ✅ closes handler.open()
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

  return (
    <>
      {/* Checkout Modal — appears before payment */}
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

          <div className="cart-summary">
            <h3>Resumen</h3>
            <div className="summary-row">
              <span>Total</span>
              <span>${total.toLocaleString("es-CO")}</span>
            </div>
            {/* Opens the checkout modal instead of calling the API directly */}
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
