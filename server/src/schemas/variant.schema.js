import Joi from "joi";

export const adjustStockSchema = Joi.object({
  quantity: Joi.number().integer().required()
});
