import Joi from "joi";

export const validateOrder = (data) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().hex().length(24).required().messages({
          "string.hex": "Product ID must be a valid MongoDB ObjectId",
          "string.length": "Product ID must be 24 characters",
          "any.required": "Product is required",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
      })
    ).min(1).required().messages({
      "array.min": "At least one item is required",
      "any.required": "Items are required",
    }),
    shippingAddress: Joi.object({
      street: Joi.string().required().messages({ "string.empty": "Street is required" }),
      city: Joi.string().required().messages({ "string.empty": "City is required" }),
      state: Joi.string().required().messages({ "string.empty": "State is required" }),
      zipCode: Joi.string().required().messages({ "string.empty": "Zip code is required" }),
      country: Joi.string().required().messages({ "string.empty": "Country is required" }),
    }).required(),
    paymentMethod: Joi.string()
      .valid("credit_card", "debit_card", "pix", "bank_slip")
      .required()
      .messages({
        "any.only": "Payment method must be one of: credit_card, debit_card, pix, bank_slip",
        "any.required": "Payment method is required",
      }),
    discount: Joi.number().min(0).default(0),
    shippingPrice: Joi.number().min(0).default(0),
  });

  return schema.validate(data, { abortEarly: true });
};