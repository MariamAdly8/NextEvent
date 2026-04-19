import { body } from "express-validator";

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .escape() 
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),
    
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Not a valid email format")
    .normalizeEmail(), 
];

export const changePasswordValidator = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required"),
    
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/)
    .withMessage("New password must contain at least one uppercase, lowercase, number, and special character"),
];

export const updateUserRoleValidator = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(['user', 'admin']) 
    .withMessage("Role must be either 'user' or 'admin'"),
];