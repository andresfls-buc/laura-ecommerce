import crypto from "crypto";
import sequelize from "../config/sequelize.js";
import { Order, Order_items, ProductVariant } from "../models/index.js";
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

    console.log("=== WOMPI WEBHOOK RECIBIDO ===");
    console.log("Event type:", event?.event);
    console.log("Transaction status:", event?.data?.transaction?.status);
    console.log("Reference:", event?.data?.transaction?.reference);
    console.log("================================");

    if (!verifyWompiWebhook(event)) {
      console.warn("Webhook rechazado — firma invalida");
      return res.status(401).json({ message: "Firma invalida" });
    }

    res.status(200).json({ received: true });

    if (event?.event !== "transaction.updated") {
      console.log(`Evento ignorado: ${event?.event}`);
      return;
    }

    const transaction = event?.data?.transaction;
    if (!transaction) {
      console.warn("Webhook sin datos de transaccion");
      return;
    }

    const reference = transaction.reference;
    const wompiStatus = transaction.status;

    console.log(
      `🔄 Procesando webhook — Referencia: ${reference} | Estado: ${wompiStatus}`
    );

    const order = await Order.findOne({ where: { reference } });

    if (!order) {
      console.error(`No se encontro orden con referencia: ${reference}`);
      return;
    }

    if (order.paymentStatus === "paid" && wompiStatus === "APPROVED") {
      console.log(`Orden #${reference} ya procesada`);
      return;
    }

    if (
      order.status === "cancelled" &&
      ["DECLINED", "VOIDED", "ERROR"].includes(wompiStatus)
    ) {
      console.log(`Orden #${reference} ya cancelada`);
      return;
    }

    if (wompiStatus === "APPROVED") {
      await handleApprovedPayment(order, transaction, reference);
      return;
    }

    if (["DECLINED", "VOIDED", "ERROR"].includes(wompiStatus)) {
      await handleFailedPayment(order, transaction, reference, wompiStatus);
      return;
    }

    if (wompiStatus === "PENDING") {
      console.log(`Orden #${reference} pendiente`);
      return;
    }

    console.warn(`Estado desconocido: ${wompiStatus}`);
  } catch (error) {
    console.error("Error en webhook de Wompi:", error);
  }
};

// ── HANDLE APPROVED PAYMENT ──────────────────────────────────────────────────
async function handleApprovedPayment(order, transaction, reference) {
  const wompiPaymentType = transaction.payment_method_type;
  const isCardPayment = wompiPaymentType === "CARD";

  const subtotal = parseFloat(order.subtotal);
  const shippingCost = parseFloat(order.shippingCost) || 0;
  const existingSurcharge = parseFloat(order.creditCardSurcharge) || 0;

  let creditCardSurcharge = existingSurcharge;
  let totalAmount = parseFloat(order.totalAmount);

  const baseAmount = subtotal + shippingCost;

  if (isCardPayment && existingSurcharge === 0) {
    creditCardSurcharge = Number((baseAmount * SURCHARGE_RATE).toFixed(2));

    totalAmount = Number((baseAmount + creditCardSurcharge).toFixed(2));

    console.log(
      `⚠️ Recargo aplicado — Orden #${reference}: +$${creditCardSurcharge}`
    );
  } else if (!isCardPayment) {
    creditCardSurcharge = 0;
    totalAmount = Number(baseAmount.toFixed(2));
  }

  // ✅ NEW: Validate Wompi amount
  const wompiAmount = transaction.amount_in_cents / 100;

  if (Math.abs(wompiAmount - totalAmount) > 1) {
    console.error(`❌ Monto inconsistente en orden #${reference}`);
    console.error(`Esperado: ${totalAmount} | Pagado: ${wompiAmount}`);
    return;
  }

  // ── Decrement stock now that payment is confirmed ──────────────────────
  const dbTransaction = await sequelize.transaction();
  try {
    const itemsToDecrement = await Order_items.findAll({
      where: { orderId: order.id },
      include: [{ model: ProductVariant, as: "productVariant" }],
      transaction: dbTransaction,
    });

    for (const item of itemsToDecrement) {
      if (item.productVariant) {
        item.productVariant.stock = Math.max(
          0,
          item.productVariant.stock - item.quantity
        );
        await item.productVariant.save({ transaction: dbTransaction });
      }
    }

    await order.update(
      {
        paymentStatus: "paid",
        status: "paid",
        wompiTransactionId: transaction.id,
        paymentMethod: isCardPayment
          ? "credit_card"
          : mapPaymentMethod(wompiPaymentType),
        creditCardSurcharge,
        totalAmount,
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();
  } catch (err) {
    await dbTransaction.rollback();
    console.error(`❌ Error actualizando stock/orden #${reference}:`, err.message);
    return;
  }

  console.log(`✅ Orden #${reference} PAGADA | Total: $${totalAmount}`);

  const orderItems = await Order_items.findAll({
    where: { orderId: order.id },
    include: [
      {
        association: "productVariant",
        include: [{ association: "product", attributes: ["name", "image"] }],
      },
    ],
  });

  const formattedItems = orderItems.map((item) => ({
    productName: item.productVariant?.product?.name || "Producto",
    variantInfo: item.productVariant
      ? `${item.productVariant.color || ""} ${item.productVariant.size || ""}`.trim()
      : null,
    quantity: item.quantity,
    priceAtPurchase: parseFloat(item.priceAtPurchase),
  }));

  await sendPostPaymentEmails(order, formattedItems);
}

// ── HANDLE FAILED PAYMENT ────────────────────────────────────────────────────
async function handleFailedPayment(order, transaction, reference, wompiStatus) {
  console.log(`❌ Pago fallido — Orden #${reference} | Estado: ${wompiStatus}`);

  // Stock was never decremented (only decremented on APPROVED), so no restore needed
  await order.update({
    paymentStatus: "unpaid",
    status: "cancelled",
    wompiTransactionId: transaction.id,
  });

  console.log(`❌ Orden #${reference} cancelada`);
}

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
