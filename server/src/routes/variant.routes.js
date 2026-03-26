import express from "express";
import VariantController from "../controllers/variant.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { adjustStockSchema } from "../schemas/variant.schema.js";
import upload, { cloudinary } from "../middlewares/upload.middleware.js";
import ProductImage from "../models/productImage.model.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Adjust stock (Admin only)
router.patch(
  "/:id/stock",
  protectAdmin,
  validate(adjustStockSchema),
  VariantController.adjustStock
);

// Upload image (Admin only)
router.post(
  "/:variantId/upload",
  protectAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { variantId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const existingImages = await ProductImage.count({
        where: { productVariantId: variantId },
      });

      if (existingImages >= 3) {
        await cloudinary.uploader.destroy(req.file.filename);
        return res
          .status(400)
          .json({ message: "Maximum 3 images per variant allowed" });
      }

      const newImage = await ProductImage.create({
        imageUrl: req.file.path,
        publicId: req.file.filename,
        order: existingImages + 1,
        productVariantId: variantId,
      });

      res.status(201).json(newImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// Delete image (Admin only)
router.delete(
  "/:variantId/images/:imageId",
  protectAdmin,
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { imageId } = req.params;

      const image = await ProductImage.findByPk(imageId);

      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      await cloudinary.uploader.destroy(image.publicId);
      await image.destroy();

      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Deletion failed" });
    }
  }
);

export default router;
