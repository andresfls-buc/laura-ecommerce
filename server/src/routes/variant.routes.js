import express from "express";
import VariantController from "../controllers/variant.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { adjustStockSchema } from "../schemas/variant.schema.js";

const router = express.Router();

router.patch("/:id/stock", validate(adjustStockSchema), VariantController.adjustStock);

export default router;
