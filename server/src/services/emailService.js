import nodemailer from "nodemailer";
import { orderConfirmationTemplate } from "../templates/orderConfirmationTemplate.js";
import { adminNotificationTemplate } from "../templates/adminNotificationTemplate.js";

// ─── Transporter (Gmail) ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (no tu contraseña normal)
  },
});

// ─── Verificar conexión al iniciar ────────────────────────────────────────
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Servicio de correo conectado correctamente");
  } catch (error) {
    console.error("❌ Error conectando el servicio de correo:", error.message);
  }
};

// ─── Email al cliente ─────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (order, orderItems) => {
  try {
    const mailOptions = {
      from: `"${process.env.STORE_NAME}" <${process.env.GMAIL_USER}>`,
      to: order.customerEmail,
      subject: `✅ Confirmación de tu pedido #${order.reference}`,
      html: orderConfirmationTemplate(order, orderItems, process.env.GMAIL_USER, process.env.STORE_NAME),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmación enviado a ${order.customerEmail} — ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error enviando email al cliente:", error.message);
    return { success: false, error: error.message };
  }
};

// ─── Email al admin ───────────────────────────────────────────────────────
export const sendAdminNotificationEmail = async (order, orderItems) => {
  try {
    const mailOptions = {
      from: `"${process.env.STORE_NAME}" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 Nueva venta — Pedido #${order.reference} | ${order.customerName}`,
      html: adminNotificationTemplate(order, orderItems, process.env.STORE_NAME),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email de notificación enviado al admin — ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error enviando email al admin:", error.message);
    return { success: false, error: error.message };
  }
};

// ─── Enviar ambos emails en paralelo ─────────────────────────────────────
export const sendPostPaymentEmails = async (order, orderItems) => {
  const [customerResult, adminResult] = await Promise.allSettled([
    sendOrderConfirmationEmail(order, orderItems),
    sendAdminNotificationEmail(order, orderItems),
  ]);

  return {
    customerEmail: customerResult.status === "fulfilled" ? customerResult.value : { success: false },
    adminEmail: adminResult.status === "fulfilled" ? adminResult.value : { success: false },
  };
};