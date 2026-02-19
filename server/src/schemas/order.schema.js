import Joi from "joi";

export const createOrderSchema = Joi.object({
  userId: Joi.number().integer().positive().optional().allow(null),

  customerName: Joi.string().trim().min(2).max(100).required(),

  customerEmail: Joi.string().email().required(),

  customerPhone: Joi.string()
    .pattern(/^[0-9+\-\s()]*$/)
    .max(30)
    .optional()
    .allow(null, ""),

  shippingAddress: Joi.string().trim().min(5).max(255).required(),

  shippingCity: Joi.string().trim().min(2).max(100).required(),

  shippingPostalCode: Joi.string().trim().min(3).max(20).required(),

  paymentMethod: Joi.string()
    .valid("cash_on_delivery", "card", "paypal")
    .required(),

  items: Joi.array()
    .items(
      Joi.object({
        productVariantId: Joi.number()
          .integer()
          .positive()
          .required(),

        quantity: Joi.number()
          .integer()
          .min(1)
          .required(),
      })
    )
    .min(1)
    .required(),
});
