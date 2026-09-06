import Joi, { ValidationResult } from "joi";
import { ProductCategory } from "../models/Product.js";

export interface IProductInput {
  name: string;
  description: string;
  category: ProductCategory;
  new_price: number;
  old_price?: number;
  image: string;
  stock?: number;
  isFeatured?: boolean;
}

export type IUpdateProductInput = Partial<IProductInput> & {
  available?: boolean;
};

const categoryValues: ProductCategory[] = ["men", "women", "kids", "accessories"];

export const validateProduct = (data: unknown): ValidationResult<IProductInput> => {
  const schema = Joi.object<IProductInput>({
    name: Joi.string().min(2).max(100).required().messages({
      "string.empty": "Product name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be at most 100 characters",
      "any.required": "Product name is required",
    }),
    description: Joi.string().min(10).required().messages({
      "string.empty": "Product description is required",
      "string.min": "Description must be at least 10 characters",
      "any.required": "Product description is required",
    }),
    category: Joi.string()
      .valid(...categoryValues)
      .required()
      .messages({
        "any.only": `Category must be one of: ${categoryValues.join(", ")}`,
        "string.empty": "Product category is required",
        "any.required": "Product category is required",
      }),
    new_price: Joi.number().min(0).required().messages({
      "number.base": "New price must be a number",
      "number.min": "New price must be at least 0",
      "any.required": "New price is required",
    }),
    old_price: Joi.number().min(0).optional().messages({
      "number.base": "Old price must be a number",
      "number.min": "Old price must be at least 0",
    }),
    image: Joi.string().required().messages({
      "string.empty": "Product image is required",
      "any.required": "Product image is required",
    }),
    stock: Joi.number().integer().min(0).default(0).messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock must be at least 0",
    }),
    isFeatured: Joi.boolean().default(false),
  });

  return schema.validate(data, { abortEarly: true });
};

export const validateUpdateProduct = (
  data: unknown
): ValidationResult<IUpdateProductInput> => {
  const schema = Joi.object<IUpdateProductInput>({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().min(10).optional(),
    category: Joi.string()
      .valid(...categoryValues)
      .optional(),
    new_price: Joi.number().min(0).optional(),
    old_price: Joi.number().min(0).optional(),
    image: Joi.string().optional(),
    stock: Joi.number().integer().min(0).optional(),
    isFeatured: Joi.boolean().optional(),
    available: Joi.boolean().optional(),
  });

  return schema.validate(data, { abortEarly: true });
};