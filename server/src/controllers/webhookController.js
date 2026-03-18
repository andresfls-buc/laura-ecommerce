import crypto from "crypto";
import { Order, Order_items } from "../models/index.js";
import { sendPostPaymentEmails } from "../services/emailService.js";

const SURCHARGE_RATE = 0.05;

// ── WOMPI SIGNATURE VERIFICATION ────────────────────────────────────────────
const verifyWompiWebhook = (event) => {
  try {
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (!secret) return true;

    const { properties, checksum } = event.signature;
    const timestamp = event.timestamp;

    let concatenated = "";
    for (const prop of properties) {
      const keys = prop.split(".");
      let value = event.data;
      for (const key of keys) {
        value = value?.[key];
      }
      concatenated += String(value ?? "");
    }

    concatenated += String(timestamp);
    concatenated += secret;

    const computedChecksum = crypto
      .createHash("sha256")
      .update(concatenated)
      .digest("hex");

    return computedChecksum === checksum;
  } catch (error) {
    console.error("Error verificando firma Wompi:", error.message);
    return false;
  }
};

// ── MAIN WEBHOOK HANDLER ─────────────────────────────────────────────────────
export const handleWompiWebhook = async (req, res) => {
  try {
    const event = req.body;

    // 1. Verify the request genuinely comes from Wompi
    if (!verifyWompiWebhook(event)) {
      console.warn("Webhook rechazado — firma invalida");
      return res.status(401).json({ message: "Firma invalida" });
    }

    // 2. Respond 200 to Wompi IMMEDIATELY (prevents retries)
    res.status(200).json({ received: true });

    // 3. Only handle transaction events
    if (event?.event !== "transaction.updated") {
      console.log(`Evento ignorado: ${event?.event}`);
      return;
    }

    const transaction = event?.data?.transaction;
    if (!transaction) {
      console.warn("Webhook sin datos de transaccion");
      return;
    }

    // 4. Only process APPROVED transactions
    if (transaction.status !== "APPROVED") {
      console.log(
        `Transaccion ${transaction.id} — estado: ${transaction.status} — sin accion`
      );
      return;
    }

    const reference = transaction.reference;
    console.log(
      `Pago aprobado — Referencia: ${reference} | ID Wompi: ${transaction.id}`
    );

    // 5. Find the order in DB by reference
    const order = await Order.findOne({ where: { reference } });

    if (!order) {
      console.error(`No se encontro orden con referencia: ${reference}`);
      return;
    }

    // 6. Prevent processing the same payment twice
    if (order.paymentStatus === "paid") {
      console.log(`Orden #${reference} ya procesada — ignorando duplicado`);
      return;
    }

    // 7. ── SURCHARGE LOGIC ──────────────────────────────────────────────────
    const wompiPaymentType = transaction.payment_method_type; // "CARD", "PSE", etc.
    const isCardPayment = wompiPaymentType === "CARD";

    const subtotal = parseFloat(order.subtotal);
    const shippingCost = parseFloat(order.shippingCost) || 0;
    const existingSurcharge = parseFloat(order.creditCardSurcharge) || 0;

    let creditCardSurcharge = existingSurcharge;
    let totalAmount = parseFloat(order.totalAmount);

    if (isCardPayment && existingSurcharge === 0) {
      // Customer paid with CC via Wompi but did NOT tick CC on the form
      // → surcharge was never applied, apply it now retroactively
      creditCardSurcharge = parseFloat(
        (
          Math.round((subtotal + shippingCost) * SURCHARGE_RATE * 100) / 100
        ).toFixed(2)
      );
      totalAmount = parseFloat(
        (subtotal + shippingCost + creditCardSurcharge).toFixed(2)
      );
      console.log(
        `⚠️  Recargo CC aplicado retroactivamente — Orden #${reference}: +$${creditCardSurcharge}`
      );
    } else if (isCardPayment && existingSurcharge > 0) {
      // Surcharge already applied via the form — do NOT double charge
      console.log(
        `✅ Recargo CC ya aplicado en formulario — Orden #${reference} — sin cambio`
      );
    } else {
      // Not a card payment — ensure surcharge is zero
      creditCardSurcharge = 0;
      totalAmount = parseFloat((subtotal + shippingCost).toFixed(2));
      console.log(`Pago sin tarjeta — Orden #${reference} — sin recargo`);
    }
    // ──────────────────────────────────────────────────────────────────────────

    // 8. Update the order in DB
    await order.update({
      paymentStatus: "paid",
      status: "paid",
      wompiTransactionId: transaction.id,
      paymentMethod: isCardPayment
        ? "credit_card"
        : mapPaymentMethod(wompiPaymentType),
      creditCardSurcharge,
      totalAmount,
    });

    console.log(
      `Orden #${reference} → paid | Método: ${wompiPaymentType} | Recargo: $${creditCardSurcharge} | Total: $${totalAmount}`
    );

    // 9. Fetch items with product name for email
    const orderItems = await Order_items.findAll({
      where: { orderId: order.id },
      include: [
        {
          association: "productVariant",
          include: [{ association: "product", attributes: ["name", "image"] }],
        },
      ],
    });

    // 10. Format items for email templates
    const formattedItems = orderItems.map((item) => ({
      productName: item.productVariant?.product?.name || "Producto",
      variantInfo: item.productVariant
        ? `${item.productVariant.color || ""} ${
            item.productVariant.size || ""
          }`.trim()
        : null,
      quantity: item.quantity,
      priceAtPurchase: parseFloat(item.priceAtPurchase),
    }));

    // 11. Send both emails in parallel
    const emailResults = await sendPostPaymentEmails(order, formattedItems);

    console.log("Emails:", {
      cliente: emailResults.customerEmail.success ? "✅ Enviado" : "❌ Fallo",
      admin: emailResults.adminEmail.success ? "✅ Enviado" : "❌ Fallo",
    });
  } catch (error) {
    console.error("Error en webhook de Wompi:", error);
  }
};

// ── PAYMENT METHOD MAPPER ────────────────────────────────────────────────────
const mapPaymentMethod = (wompiMethod) => {
  const map = {
    NEQUI: "nequi",
    PSE: "bank_transfer",
    BANCOLOMBIA_TRANSFER: "bank_transfer",
    DAVIPLATA: "daviplata",
  };
  return map[wompiMethod] || "wompi";
};
