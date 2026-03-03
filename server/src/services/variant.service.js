import Boom from "@hapi/boom";
import fs from "fs";
import path from "path";
import { ProductVariant, ProductImage, sequelize } from "../models/index.js";

class VariantService {

  // 🔹 Adjust stock safely using transaction
  static async adjustStock(id, quantity) {
    const transaction = await sequelize.transaction();

    try {
      const variant = await ProductVariant.findByPk(id, { transaction });

      if (!variant) {
        throw Boom.notFound("Variant not found");
      }

      const newStock = variant.stock + quantity;

      if (newStock < 0) {
        throw Boom.badRequest("Stock cannot be negative");
      }

      await variant.update(
        { stock: newStock },
        { transaction }
      );

      await transaction.commit();

      return variant;

    } catch (error) {
      await transaction.rollback();

      if (error.isBoom) throw error;

      throw Boom.badImplementation("Failed to adjust stock");
    }
  }

  // 🔹 Delete a variant image (DB + local file)
  static async deleteImage(imageId) {
    try {
      const image = await ProductImage.findByPk(imageId);

      if (!image) {
        throw Boom.notFound("Image not found");
      }

      // Delete local file if stored in /uploads
      if (
        image.imageUrl &&
        image.imageUrl.includes("/uploads/") &&
        image.publicId
      ) {
        const filePath = path.resolve("uploads", image.publicId);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await image.destroy();

      return { message: "Image deleted successfully" };

    } catch (error) {
      if (error.isBoom) throw error;

      throw Boom.badImplementation("Failed to delete image");
    }
  }
}

export default VariantService;