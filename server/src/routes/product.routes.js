import express from "express";
import ProductController from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  createVariantImageSchema,
  updateVariantImageSchema,
  imageIdParamSchema,
  productVariantParamsSchema,
} from "../schemas/product.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create product
router.post(
  "/",
  protectAdmin,
  validate(createProductSchema, "body"),
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
  validate(updateProductSchema, "body"),
  ProductController.update
);

// Delete product by ID
router.delete(
  "/:id",
  protectAdmin,
  validate(idParamSchema, "params"),
  ProductController.delete
);

// Get variants for a specific product
router.get(
  "/:id/variants",
  validate(idParamSchema, "params"),
  ProductController.getVariants
);

// Add image to a specific variant
router.post(
  "/:productId/variants/:variantId/images",
  protectAdmin,
  validate(productVariantParamsSchema, "params"), // ✅ validate both at once
  validate(createVariantImageSchema, "body"),
  ProductController.addVariantImage
);

// Update a specific variant image
router.patch(
  "/variants/images/:imageId",
  protectAdmin,
  validate(imageIdParamSchema, "params"),
  validate(updateVariantImageSchema, "body"),
  ProductController.updateVariantImage
);

export default router;