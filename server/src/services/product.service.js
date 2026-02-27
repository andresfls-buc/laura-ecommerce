import { Product, ProductVariant, ProductImage, sequelize } from "../models/index.js";
import Boom from "@hapi/boom";

class ProductService {

  // Create product + variants
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
        },
        { transaction }
      );

      // Create or merge variants
      if (data.variants && Array.isArray(data.variants)) {
        for (const variantData of data.variants) {
          if (
            !variantData.size ||
            !variantData.color ||
            variantData.price === undefined ||
            variantData.stock === undefined
          ) {
            throw Boom.badRequest(
              "Each variant must have size, color, price, and stock"
            );
          }

          const existingVariant = await ProductVariant.findOne({
            where: {
              productId: product.id,
              size: variantData.size,
              color: variantData.color,
            },
            transaction,
          });

          if (existingVariant) {
            existingVariant.stock += variantData.stock;
            existingVariant.price = variantData.price;
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

      return await Product.findByPk(product.id, {
        include: [
          { model: ProductVariant, as: "variants" },
          { model: ProductImage, as: "images" },   // ✅ Added
        ],
      });

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
        },
        { transaction }
      );

      if (data.variants && Array.isArray(data.variants)) {
        for (const variantData of data.variants) {
          const existingVariant = await ProductVariant.findOne({
            where: { id: variantData.id, productId: product.id },
            transaction,
          });

          if (!existingVariant) {
            throw Boom.notFound(
              `Variant with id ${variantData.id} not found`
            );
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
        include: [
          { model: ProductVariant, as: "variants" },
          { model: ProductImage, as: "images" },   // ✅ Added
        ],
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

    await product.destroy(); // images auto-delete because CASCADE
    return { message: "Product deleted successfully" };
  }

  // Get product by ID (with variants + images)
  static async getProductById(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const product = await Product.findByPk(numericId, {
    include: [
      {
        model: ProductVariant,
        as: "variants",
        include: [
          {
            model: ProductImage,
            as: "images",
          },
        ],
      },
    ],
  });

  return product;
}
  // Get all products
static async getAllProducts() {
  return await Product.findAll({
    include: [
      {
        model: ProductVariant,
        as: "variants",
        include: [
          {
            model: ProductImage,
            as: "images",
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}
  // Get variants only
  static async getProductVariants(productId, filters = {}) {
    const { size, color } = filters;

    const whereClause = { productId };
    if (size) whereClause.size = size;
    if (color) whereClause.color = color;

    return await ProductVariant.findAll({ where: whereClause });
  }
  // Add image to a specific variant of a specific product
static async addImageToVariant(variantId, data, productId) {
  const { imageUrl, publicId } = data;

  if (!imageUrl || !publicId) {
    throw Boom.badRequest("imageUrl and publicId are required");
  }

  // Find the variant and make sure it belongs to the specified product
  const variant = await ProductVariant.findOne({
    where: {
      id: variantId,
      productId: productId, // ✅ ensures variant belongs to the correct product
    },
  });

  if (!variant) {
    throw Boom.notFound(
      `Variant with ID ${variantId} not found for Product ID ${productId}`
    );
  }

  // Count existing images to set order automatically
  const existingImagesCount = await ProductImage.count({
    where: { productVariantId: variantId },
  });

  const image = await ProductImage.create({
    imageUrl,
    publicId,
    order: existingImagesCount + 1, // automatically assign next order
    productVariantId: variantId,
  });

  return image;
}
  // Update variant image
static async updateVariantImage(imageId, data) {
  const image = await ProductImage.findByPk(imageId);

  if (!image) {
    throw Boom.notFound("Image not found");
  }

  const updatedData = {
    imageUrl: data.imageUrl ?? image.imageUrl,
    publicId: data.publicId ?? image.publicId,
  };

  // Only handle order if client provides it
  if (data.order !== undefined && data.order !== image.order) {
    const newOrder = data.order;

    // Get all other images for the same variant
    const otherImages = await ProductImage.findAll({
      where: {
        productVariantId: image.productVariantId,
        id: { [sequelize.Op.ne]: imageId },
      },
    });

    // Shift orders to make room for newOrder
    for (const other of otherImages) {
      if (newOrder <= other.order) {
        await other.update({ order: other.order + 1 });
      }
    }

    updatedData.order = newOrder;
  }

  await image.update(updatedData);

  return image;
}
}

export default ProductService;