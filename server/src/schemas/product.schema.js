import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  image: Joi.string().uri().allow(null, ''),
  variants: Joi.array().items(
    Joi.object({
      size: Joi.string().required(),
      color: Joi.string().required(),
      price: Joi.number().precision(2).required(),
      stock: Joi.number().integer().min(0).required(),
    })
  ).required()
});

export const updateProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(''),
  image: Joi.string().uri().allow(null, ''),
  variants: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().required(), // require id for updates to identify which variant to update
      size: Joi.string(),
      color: Joi.string(),
      price: Joi.number().precision(2),
      stock: Joi.number().integer().min(0),
    }).min(2)
  ) 
}).min(1); // require at least one field to update