import { Product, ProductVariant, sequelize } from "../models/index.js";
import Boom from "@hapi/boom";

class ProductService {

  // Create product + variants (merge stock if variant exists)
  static async createProduct(data) {
    if (!data || !data.name) {
      throw Boom.badRequest("Product name is required");
    }

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.create(
        {
          name: data.name,
          description: data.description ?? null,
          image: data.image ?? null,
        },
        { transaction }
      );

      // Create or merge variants
      if (data.variants && Array.isArray(data.variants)) {
        for (const variantData of data.variants) {
          if (!variantData.size || !variantData.color || variantData.price === undefined || variantData.stock === undefined) {
            throw Boom.badRequest("Each variant must have size, color, price, and stock");
          }

          const existingVariant = await ProductVariant.findOne({
            where: { productId: product.id, size: variantData.size, color: variantData.color },
            transaction
          });

          if (existingVariant) {
            existingVariant.stock += variantData.stock;
            existingVariant.price = variantData.price; // update to latest price
            await existingVariant.save({ transaction });
          } else {
            await ProductVariant.create(
              {
                productId: product.id,
                size: variantData.size,
                color: variantData.color,
                price: variantData.price,
                stock: variantData.stock,
              },
              { transaction }
            );
          }
        }
      }

      await transaction.commit();

      return await Product.findByPk(product.id, { include: { model: ProductVariant, as: "variants" } });

    } catch (error) {
      await transaction.rollback();
      throw Boom.badImplementation(error.message);
    }
  }

  // Update product + variants
  static async updateProduct(id, data) {
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(id, { transaction });
    if (!product) throw Boom.notFound("Product not found");

    await product.update(
      {
        name: data.name ?? product.name,
        description: data.description ?? product.description,
        image: data.image ?? product.image,
      },
      { transaction }
    );

    if (data.variants && Array.isArray(data.variants)) {
      for (const variantData of data.variants) {

        const existingVariant = await ProductVariant.findOne({
          where: { id: variantData.id, productId: product.id },
          transaction
        });

        if (!existingVariant) {
          throw Boom.notFound(`Variant with id ${variantData.id} not found`);
        }

        await existingVariant.update(
          {
            size: variantData.size ?? existingVariant.size,
            color: variantData.color ?? existingVariant.color,
            price: variantData.price ?? existingVariant.price,
            stock: variantData.stock ?? existingVariant.stock,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return await Product.findByPk(product.id, {
      include: { model: ProductVariant, as: "variants" }
    });

  } catch (error) {
    await transaction.rollback();

    if (error.isBoom) throw error;

    throw Boom.badImplementation("Failed to update product");
  }
}


  // Delete product
  static async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) throw Boom.notFound("Product not found");

    await product.destroy();
    return { message: "Product deleted successfully" };
  }

  // Get product by ID (with variants)
  static async getProductById(id) {
    const product = await Product.findByPk(id, { include: { model: ProductVariant, as: "variants" } });
    if (!product) throw Boom.notFound("Product not found");
    return product;
  }

  // Get all products (with variants)
  static async getAllProducts() {
    return await Product.findAll({
      include: { model: ProductVariant, as: "variants" },
      order: [["createdAt", "DESC"]],
    });
  }
}

export default ProductService;
