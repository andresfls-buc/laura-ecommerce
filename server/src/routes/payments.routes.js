import express from "express";
import { createPayment } from "../controllers/payments.js";

const router = express.Router();

// POST /api/payments
router.post("/", createPayment);

export default router;