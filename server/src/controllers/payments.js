import crypto from "crypto";
import { Order } from "../models/index.js";

export const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);
    
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });

    // 1. Valores limpios
    const reference = String(order.reference);
    const amount_in_cents = Math.round(Number(order.totalAmount) * 100);
    const currency = "COP";
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    // 2. CADENA (Concatenación forzada a String)
    // El monto debe ir como string en la concatenación
    const stringToSign = reference + amount_in_cents.toString() + currency + integritySecret;
    
    // 3. Generar Hash
    const signature = crypto
      .createHash("sha256")
      .update(stringToSign)
      .digest("hex");

    // 4. RESPUESTA (Estructura exacta que tu Cart.jsx espera)
    res.json({ 
      success: true,
      data: {
        checkout: {
          signature: signature,
          amount_in_cents: amount_in_cents,
          reference: reference,
          currency: currency,
          publicKey: process.env.WOMPI_PUBLIC_KEY
        }
      }
    });

  } catch (error) {
    console.error("Error en payments.js:", error);
    res.status(500).json({ message: "Error interno" });
  }
};