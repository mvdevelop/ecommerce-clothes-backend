import Joi, { ValidationResult } from "joi";

export interface ISignupInput {
  name: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export const validateSignup = (data: unknown): ValidationResult<ISignupInput> => {
  const schema = Joi.object<ISignupInput>({
    name: Joi.string().min(2).max(50).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be at most 50 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().lowercase().trim().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,128}$/)
      .messages({
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password must be at most 128 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase, one lowercase, and one number",
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
  });

  return schema.validate(data, { abortEarly: true });
};

export const validateLogin = (data: unknown): ValidationResult<ILoginInput> => {
  const schema = Joi.object<ILoginInput>({
    email: Joi.string().email().required().lowercase().trim().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  });

  return schema.validate(data, { abortEarly: true });
};