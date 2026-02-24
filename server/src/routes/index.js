import express from "express";
import productRouter from "./product.routes.js";
import variantRouter from "./variant.routes.js";
import orderRouter from "./order.routes.js";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import paymentsRouter from "./payments.routes.js";

const router = express.Router();

router.use("/products", productRouter);
router.use("/variants", variantRouter);
router.use("/orders", orderRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/payments", paymentsRouter);



export default router;