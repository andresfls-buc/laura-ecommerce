import {
  Product,
  ProductVariant,
  ProductImage,
  sequelize,
} from "../models/index.js";
import Boom from "@hapi/boom";

class ProductService {
  /**
   * CREATE PRODUCT + VARIANTS
   */
  static async createProduct(data) {
    if (!data || !data.name) throw Boom.badRequest("Product name is required");

    const newId = await sequelize.transaction(async (t) => {
      const product = await Product.create(
        {
          name: data.name,
          description: data.description ?? null,
        },
        { transaction: t }
      );

      if (data.variants && Array.isArray(data.variants)) {
        for (const v of data.variants) {
          await ProductVariant.create(
            {
              productId: product.id,
              size: v.size,
              color: v.color,
              price: v.price,
              stock: v.stock,
            },
            { transaction: t }
          );
        }
      }
      return product.id;
    });

    return await this.getProductById(newId);
  }

  /**
   * UPDATE PRODUCT + VARIANTS
   * FIXED: Separated transaction from the final fetch to prevent 500 post-commit errors.
   */
  static async updateProduct(id, data) {
    console.log("--- STARTING UPDATE ---");
    console.log("Incoming Data:", JSON.stringify(data, null, 2));

    try {
      const result = await sequelize.transaction(async (t) => {
        const product = await Product.findByPk(id, { transaction: t });
        if (!product) throw Boom.notFound("Product not found");

        console.log("Product found. Updating basic info...");

        // Update basic info
        await product.update(
          {
            name: data.name ?? product.name,
            description: data.description ?? product.description,
          },
          { transaction: t }
        );

        if (data.variants && Array.isArray(data.variants)) {
          console.log(`Updating ${data.variants.length} variants...`);
          for (const vData of data.variants) {
            if (!vData.id) continue;

            const variant = await ProductVariant.findOne({
              where: { id: vData.id, productId: id },
              transaction: t,
            });

            if (variant) {
              await variant.update(
                {
                  size: vData.size ?? variant.size,
                  color: vData.color ?? variant.color,
                  price: vData.price ?? variant.price,
                  stock: vData.stock ?? variant.stock,
                },
                { transaction: t }
              );
            }
          }
        }

        console.log(
          "Updates finished. Attempting final fetch inside transaction..."
        );

        // This is likely where it crashes
        return await Product.findByPk(id, {
          include: [
            {
              model: ProductVariant,
              as: "variants",
              include: [{ model: ProductImage, as: "images" }],
            },
          ],
          transaction: t,
        });
      });

      console.log("Transaction committed successfully!");
      return result;
    } catch (error) {
      console.error("!!! REAL ERROR DETECTED !!!");
      console.error("Message:", error.message);
      console.error("Stack Trace:", error.stack);

      // Re-throw so the controller knows it failed
      if (error.isBoom) throw error;
      throw Boom.badImplementation(error.message);
    }
  }

  /**
   * GET PRODUCT BY ID (Centralized fetch logic)
   */
  static async getProductById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    const product = await Product.findByPk(numericId, {
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [{ model: ProductImage, as: "images" }],
        },
      ],
    });

    // Use .get({ plain: true }) to prevent circular JSON 500 errors
    return product ? product.get({ plain: true }) : null;
  }

  /**
   * GET ALL PRODUCTS
   */
  static async getAllProducts() {
    const products = await Product.findAll({
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [{ model: ProductImage, as: "images" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return products.map((p) => p.get({ plain: true }));
  }

  static async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) throw Boom.notFound("Product not found");
    await product.destroy();
    return { message: "Product deleted successfully" };
  }

  static async getProductVariants(productId, filters = {}) {
    const { size, color } = filters;
    const whereClause = { productId };
    if (size) whereClause.size = size;
    if (color) whereClause.color = color;
    const variants = await ProductVariant.findAll({
      where: whereClause,
      include: [{ model: ProductImage, as: "images" }],
    });
    return variants.map((v) => v.get({ plain: true }));
  }

  static async addImageToVariant(variantId, data, productId) {
    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) throw Boom.notFound("Variant not found");

    const existingImagesCount = await ProductImage.count({
      where: { productVariantId: variantId },
    });

    const image = await ProductImage.create({
      imageUrl: data.imageUrl,
      publicId: data.publicId,
      order: existingImagesCount + 1,
      productVariantId: variantId,
    });
    return image.get({ plain: true });
  }

  static async updateVariantImage(imageId, data) {
    const image = await ProductImage.findByPk(imageId);
    if (!image) throw Boom.notFound("Image not found");
    await image.update(data);
    return image.get({ plain: true });
  }
}

export default ProductService;
