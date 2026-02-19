import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

// Public (guest + authenticated)
router.post("/", orderController.createOrder);

// For now keep everything public until auth is properly wired
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);
router.patch("/:id/cancel", orderController.cancelOrder);

export default router;
