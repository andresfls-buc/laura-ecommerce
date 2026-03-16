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
   */
  static async updateProduct(id, data) {
    console.log("--- STARTING UPDATE ---");
    console.log("Incoming Data:", JSON.stringify(data, null, 2));

    try {
      await sequelize.transaction(async (t) => {
        const product = await Product.findByPk(id, { transaction: t });
        if (!product) throw Boom.notFound("Product not found");

        // 1. Update basic product info
        await product.update(
          {
            name: data.name ?? product.name,
            description: data.description ?? product.description,
          },
          { transaction: t }
        );

        // 2. Handle variants
        if (data.variants && Array.isArray(data.variants)) {
          const incomingIds = data.variants
            .filter((v) => v.id)
            .map((v) => v.id);

          // 🗑️ Delete variants removed in the form
          await ProductVariant.destroy({
            where: {
              productId: id,
              id: { [sequelize.Sequelize.Op.notIn]: incomingIds },
            },
            transaction: t,
          });

          for (const vData of data.variants) {
            if (vData.id) {
              // ✏️ Update existing variant
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
            } else {
              // 🆕 Create new variant
              await ProductVariant.create(
                {
                  productId: id,
                  size: vData.size,
                  color: vData.color,
                  price: vData.price,
                  stock: vData.stock,
                },
                { transaction: t }
              );
            }
          }
        }
      });

      console.log("Transaction committed successfully!");
      return await this.getProductById(id);
    } catch (error) {
      console.error("!!! REAL ERROR DETECTED !!!");
      console.error("Message:", error.message);
      console.error("Stack Trace:", error.stack);
      if (error.isBoom) throw error;
      throw Boom.badImplementation(error.message);
    }
  }

  /**
   * GET PRODUCT BY ID
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

    if (!product) return null;

    const plain = product.get({ plain: true });
    // ✅ Sort variants numerically by size
    plain.variants = plain.variants.sort(
      (a, b) => Number(a.size) - Number(b.size)
    );

    return plain;
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

    return products.map((p) => {
      const plain = p.get({ plain: true });
      // ✅ Sort variants numerically by size
      plain.variants = plain.variants.sort(
        (a, b) => Number(a.size) - Number(b.size)
      );
      return plain;
    });
  }

  static async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) throw Boom.notFound("Product not found");
    await product.destroy();
    return { message: "Product deleted successfully" };
  }

  /**
   * GET PRODUCT VARIANTS (with filters)
   */
  static async getProductVariants(productId, filters = {}) {
    const { size, color } = filters;
    const whereClause = { productId };
    if (size) whereClause.size = size;
    if (color) whereClause.color = color;

    const variants = await ProductVariant.findAll({
      where: whereClause,
      include: [{ model: ProductImage, as: "images" }],
    });

    // ✅ Sort variants numerically by size
    return variants
      .map((v) => v.get({ plain: true }))
      .sort((a, b) => Number(a.size) - Number(b.size));
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
