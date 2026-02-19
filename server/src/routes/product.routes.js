import express from "express";
import ProductController from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create product
router.post(
  "/",
  protectAdmin,
  validate(createProductSchema),
  ProductController.create
);

// Get all products
router.get("/", ProductController.getAll);

// Get product by ID
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  ProductController.getById
);

// Update product by ID
router.put(
  "/:id",
  protectAdmin,
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  ProductController.update
);

// Delete product by ID
router.delete(
  "/:id",
  protectAdmin,
  validate(idParamSchema, "params"),
  ProductController.delete
);

// ✅ NEW ROUTE: Get variants for a specific product, optional filters: size, color
router.get(
  "/:id/variants",
  validate(idParamSchema, "params"),
  ProductController.getVariants
);

export default router;
