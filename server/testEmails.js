// testEmails.js — Ejecutar desde la raiz de tu backend
// Comando: node testEmails.js

import "dotenv/config";
import { sendPostPaymentEmails } from "./src/services/emailService.js";

// Orden falsa que simula exactamente lo que vendria de tu DB
const fakeOrder = {
  id: 1,
  reference: "TEST-001",
  customerName: "Juan Perez",
  customerEmail: process.env.GMAIL_USER, // te llega a ti mismo
  customerPhone: "3001234567",
  shippingAddress: "Calle 123 # 45-67",
  shippingCity: "Bogota",
  shippingPostalCode: "110111",
  subtotal: 150000,
  shippingCost: 10000,
  totalAmount: 160000,
  paymentMethod: "wompi",
  wompiTransactionId: "wompi-test-txn-abc123",
  paymentStatus: "paid",
};

// Items falsos que simulan lo que vendria de Order_items + Product
const fakeItems = [
  {
    productName: "Camiseta Manga Larga",
    variantInfo: "Talla M - Color Negro",
    quantity: 2,
    priceAtPurchase: 55000,
  },
  {
    productName: "Pantalon Casual",
    variantInfo: "Talla 32 - Color Azul",
    quantity: 1,
    priceAtPurchase: 40000,
  },
];

console.log("Enviando emails de prueba...");
console.log(`Cliente: ${fakeOrder.customerEmail}`);
console.log(`Admin: ${process.env.ADMIN_EMAIL}`);
console.log("---");

const results = await sendPostPaymentEmails(fakeOrder, fakeItems);

console.log("Resultado:");
console.log("Email cliente:", results.customerEmail.success ? "ENVIADO" : `FALLO — ${results.customerEmail.error}`);
console.log("Email admin:", results.adminEmail.success ? "ENVIADO" : `FALLO — ${results.adminEmail.error}`);