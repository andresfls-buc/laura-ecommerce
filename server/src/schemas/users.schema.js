import Joi from "joi";

// Create a new user (password required for admin)
export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(), // must exist for admin login
  isGuest: Joi.boolean().optional(),
  role: Joi.string().valid("customer", "admin").required(),
});

// Update user (all optional)
export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  isGuest: Joi.boolean().optional(),
  role: Joi.string().valid("customer", "admin").optional(),
});
