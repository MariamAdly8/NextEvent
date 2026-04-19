import { body } from "express-validator";

export const signupValidator = [
  body("name")
    .trim()
    .escape() 
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/)
    .withMessage("Password must contain at least one uppercase, lowercase, number, and special character")
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
];