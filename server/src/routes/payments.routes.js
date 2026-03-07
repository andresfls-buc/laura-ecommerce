import express from "express";
import { createPayment } from "../controllers/payments.js";
import { handleWompiWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// POST /api/payments — Generar link de pago Wompi
router.post("/", createPayment);

// POST /api/payments/webhook — Wompi notifica el resultado del pago
// El body debe llegar como JSON — asegurate de tener express.json() en tu app.js
router.post("/webhook", handleWompiWebhook);

export default router;