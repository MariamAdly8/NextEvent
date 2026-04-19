import { body, query } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Category name must be between 3 and 32 characters"),
];

export const updateCategoryValidator = [
  body("name")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ min: 3, max: 32 })
    .withMessage("Category name must be between 3 and 32 characters"),
];
