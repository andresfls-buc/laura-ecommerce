import express from "express";
import ProductController from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = express.Router();

router.post(
  "/",
  validate(createProductSchema),
  ProductController.create
);

router.get("/", ProductController.getAll);

router.get(
  "/:id",
  validate(idParamSchema, "params"),
  ProductController.getById
);

router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  ProductController.delete
);

export default router;
