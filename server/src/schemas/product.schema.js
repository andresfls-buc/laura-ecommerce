import Joi from "joi";

// ----------------------------
// Product Schemas
// ----------------------------
export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  image: Joi.string().uri().allow(null, ""),
  variants: Joi.array()
    .items(
      Joi.object({
        size: Joi.string().required(),
        color: Joi.string().required(),
        price: Joi.number().precision(2).required(),
        stock: Joi.number().integer().min(0).required(),
      })
    )
    .required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(""),
  image: Joi.string().uri().allow(null, ""),
  variants: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().optional(), // require id for updates to identify which variant to update
        size: Joi.string(),
        color: Joi.string(),
        price: Joi.number().precision(2),
        stock: Joi.number().integer().min(0),
      })
    )
    .min(1),
}).min(1); // require at least one field to update

// ----------------------------
// Variant Image Schemas
// ----------------------------

// For adding images to variants
export const createVariantImageSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
  publicId: Joi.string().required(),
});

// For updating variant images
export const updateVariantImageSchema = Joi.object({
  imageUrl: Joi.string().uri(),
  publicId: Joi.string(),
  order: Joi.number().integer().min(0),
}).min(1);

// ----------------------------
// Param Schemas
// ----------------------------

export const productVariantParamsSchema = Joi.object({
  productId: Joi.number().integer().required(),
  variantId: Joi.number().integer().required(),
});

// For validating image ID in params
export const imageIdParamSchema = Joi.object({
  imageId: Joi.number().integer().required(),
});
