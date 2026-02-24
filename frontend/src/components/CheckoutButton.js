import React from "react";

const CheckoutButton = ({ orderId }) => {
  const handlePayment = async () => {
    try {
      console.log("🔹 Botón de pago clickeado");

      const response = await fetch("http://localhost:3000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      console.log("🔹 Datos recibidos del backend:", data);

      if (data.checkoutUrl) {
        // Redirige al usuario a Wompi
        window.location.href = data.checkoutUrl;
      } else {
        alert("Error al generar el pago. Revisa la consola");
      }
    } catch (error) {
      console.error("Error frontend:", error);
      alert("Ocurrió un error, revisa la consola");
    }
  };

  return <button onClick={handlePayment}>Pagar con Wompi</button>;
};

export default CheckoutButton;