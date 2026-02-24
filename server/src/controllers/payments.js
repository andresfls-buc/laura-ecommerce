import fetch from "node-fetch";
import { Order } from "../models/index.js";

export const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // 1️⃣ Buscar la orden
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // 2️⃣ Crear payload para Wompi
    const payload = {
      name: `Pago Orden ${order.reference}`,
      description: "Pago de prueba",
      single_use: true,
      collect_shipping: false,
      currency: "COP",
      amount_in_cents: Math.round(Number(order.totalAmount) * 100),
    };

    // 3️⃣ Llamar a Wompi sandbox
    const wompiResponse = await fetch(
      "https://sandbox.wompi.co/v1/payment_links",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const wompiData = await wompiResponse.json();

    console.log("Respuesta Wompi Payment Link:", wompiData);

    // 4️⃣ Verificar que exista el ID del link
    const paymentLinkId = wompiData?.data?.id;

    if (!paymentLinkId) {
      return res.status(500).json({
        message: "No se pudo generar payment link",
        wompiData,
      });
    }

    // 5️⃣ Construir URL manualmente
    const checkoutUrl = `https://checkout.wompi.co/l/${paymentLinkId}`;

    // 6️⃣ Enviar URL al frontend
    res.json({
      checkoutUrl,
    });

  } catch (error) {
    console.error("Error creando payment link:", error);
    res.status(500).json({
      message: "Error creando el pago",
      error: error.message,
    });
  }
};