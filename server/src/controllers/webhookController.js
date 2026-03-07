import crypto from "crypto";
import { Order, Order_items } from "../models/index.js";
import { sendPostPaymentEmails } from "../services/emailService.js";

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

    console.log("String a hashear:", concatenated);

    const computedChecksum = crypto
      .createHash("sha256")
      .update(concatenated)
      .digest("hex");

    console.log("Checksum esperado: ", checksum);
    console.log("Checksum calculado:", computedChecksum);
    console.log("Match:", computedChecksum === checksum);

    return computedChecksum === checksum;
  } catch (error) {
    console.error("Error verificando firma Wompi:", error.message);
    return false;
  }
};

export const handleWompiWebhook = async (req, res) => {
  try {
    const event = req.body;

    // 1. Verificar que la solicitud viene realmente de Wompi
    if (!verifyWompiWebhook(event)) {
      console.warn("Webhook rechazado — firma invalida");
      return res.status(401).json({ message: "Firma invalida" });
    }

    // 2. Responder 200 a Wompi INMEDIATAMENTE (evita re-intentos)
    res.status(200).json({ received: true });

    // 3. Validar que sea un evento de transaccion
    if (event?.event !== "transaction.updated") {
      console.log(`Evento Wompi ignorado: ${event?.event}`);
      return;
    }

    const transaction = event?.data?.transaction;
    if (!transaction) {
      console.warn("Webhook sin datos de transaccion");
      return;
    }

    // 4. Solo procesar transacciones APROBADAS
    if (transaction.status !== "APPROVED") {
      console.log(`Transaccion ${transaction.id} con estado: ${transaction.status} — sin accion`);
      return;
    }

    const reference = transaction.reference;
    console.log(`Pago aprobado — Referencia: ${reference} | ID Wompi: ${transaction.id}`);

    // 5. Buscar la orden en la DB por referencia
    const order = await Order.findOne({ where: { reference } });

    if (!order) {
      console.error(`No se encontro orden con referencia: ${reference}`);
      return;
    }

    // 6. Evitar procesar el mismo pago dos veces
    if (order.paymentStatus === "paid") {
      console.log(`Orden #${reference} ya fue procesada — ignorando duplicado`);
      return;
    }

    // 7. Actualizar la orden en la DB
    await order.update({
      paymentStatus: "paid",
      status: "paid",
      wompiTransactionId: transaction.id,
      paymentMethod: mapPaymentMethod(transaction.payment_method_type),
    });

    console.log(`Orden #${reference} actualizada a "paid"`);

    // 8. Obtener los items con nombre del producto
    const orderItems = await Order_items.findAll({
      where: { orderId: order.id },
      include: [
        {
          association: "productVariant",
          include: [{ association: "product", attributes: ["name", "image"] }],
        },
      ],
    });

    // 9. Formatear items para las plantillas de email
    const formattedItems = orderItems.map((item) => ({
      productName: item.productVariant?.product?.name || "Producto",
      variantInfo: item.productVariant
        ? `${item.productVariant.color || ""} ${item.productVariant.size || ""}`.trim()
        : null,
      quantity: item.quantity,
      priceAtPurchase: parseFloat(item.priceAtPurchase),
    }));

    // 10. Enviar ambos emails en paralelo
    const emailResults = await sendPostPaymentEmails(order, formattedItems);

    console.log("Resultado emails:", {
      cliente: emailResults.customerEmail.success ? "Enviado" : "Fallo",
      admin: emailResults.adminEmail.success ? "Enviado" : "Fallo",
    });

  } catch (error) {
    console.error("Error en webhook de Wompi:", error);
  }
};

const mapPaymentMethod = (wompiMethod) => {
  const map = {
    CARD: "wompi",
    NEQUI: "nequi",
    PSE: "bank_transfer",
    BANCOLOMBIA_TRANSFER: "bank_transfer",
    DAVIPLATA: "daviplata",
  };
  return map[wompiMethod] || "wompi";
};