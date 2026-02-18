import Boom from "@hapi/boom";
import { ProductVariant } from "../models/index.js";
import { sequelize } from "../models/index.js";

class VariantService {
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
}

export default VariantService;
