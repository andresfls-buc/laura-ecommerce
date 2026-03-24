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

// ─── Email de formulario de contacto ─────────────────────────────────────
export const sendContactFormEmail = async ({ firstName, lastName, email, phone, subject, orderNumber, message }) => {
  const subjectLabels = {
    order: "Estado y Seguimiento de Pedido",
    product: "Información de Producto",
    return: "Devoluciones y Reembolsos",
    shipping: "Envío y Entrega",
    technical: "Soporte Técnico",
    billing: "Facturación y Pagos",
    partnership: "Negocios y Asociaciones",
    other: "Otro",
  };

  const subjectLabel = subjectLabels[subject] || subject;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
        📬 Nuevo mensaje de contacto
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold; color: #555; width: 160px;">Nombre:</td><td style="padding: 8px;">${firstName} ${lastName}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #555;">Teléfono:</td><td style="padding: 8px;">${phone || "No proporcionado"}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #555;">Asunto:</td><td style="padding: 8px;">${subjectLabel}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #555;">Nº de Pedido:</td><td style="padding: 8px;">${orderNumber || "No aplica"}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #333; border-radius: 4px;">
        <strong style="color: #555;">Mensaje:</strong>
        <p style="margin-top: 8px; color: #333; white-space: pre-wrap;">${message}</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Este mensaje fue enviado desde el formulario de contacto de ${process.env.STORE_NAME}.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.STORE_NAME}" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `📬 Nuevo contacto: ${subjectLabel} — ${firstName} ${lastName}`,
      html,
    });
    console.log(`📧 Email de contacto enviado al admin — ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error enviando email de contacto:", error.message);
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