import React from "react";

const TestPayment = ({ orderId }) => {

  const handlePayment = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("No se pudo generar el link de pago");
      }

    } catch (error) {
      console.error(error);
      alert("Error en el pago");
    }
  };

  return <button onClick={handlePayment}>Pagar con Wompi</button>;
};

export default TestPayment;