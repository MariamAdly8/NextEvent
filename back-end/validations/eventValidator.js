import { body, query } from "express-validator";

export const createEventValidator = [
  body("title")
    .trim()
    .escape() 
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .escape() 
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 3}).withMessage("Description must be greater than 3 characters"),

  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Invalid date format")
    .toDate()
    .custom((val) => {
      if (new Date(val) < new Date()) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),

  body("capacity")
    .notEmpty().withMessage("Capacity is required")
    .isInt({ min: 1 }).withMessage("Capacity must be a number and at least 1")
    .toInt(),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price cannot be negative")
    .toFloat(),

  body("category")
    .optional()
    .isMongoId().withMessage("Invalid category ID format"),

  body("coordinates")
    .notEmpty().withMessage("Coordinates are required")
    .custom((value) => {
        let coords = value;
        if (typeof value === 'string') {
            try {
                coords = JSON.parse(value);
            } catch (err) {
                throw new Error('Coordinates must be a valid JSON array string (e.g., "[30.5, 31.5]")');
            }
        }
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new Error('Coordinates must be an array of exactly two numbers [longitude, latitude]');
        }
        if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
            throw new Error('Coordinates must contain numeric values only');
        }
        return true;
    }),

  body("address")
    .trim()
    .escape()
    .notEmpty().withMessage("Address is required")
];

export const getAllEventsValidator = [  
  query("search")
    .optional()
    .trim()
    .escape(), 
    
  query("category")
    .optional()
    .isMongoId().withMessage("Invalid category ID format")
];

export const updateEventValidator = [
  body("title").optional().trim().escape().isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 chars"),
  
  body("description").optional().trim().escape().notEmpty().withMessage("Description cannot be empty"),
  
  body("date")
    .optional()
    .isISO8601().withMessage("Invalid date format")
    .toDate()
    .custom((val) => {
      if (new Date(val) < new Date()) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),

  body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be at least 1").toInt(),
  
  body("price").optional().isFloat({ min: 0 }).withMessage("Price cannot be negative").toFloat(),
  
  body("category").optional().isMongoId().withMessage("Invalid category ID format"),
  
  body("coordinates")
    .optional()
    .custom((value) => {
        let coords = value;
        if (typeof value === 'string') {
            try {
                coords = JSON.parse(value);
            } catch (err) {
                throw new Error('Coordinates must be a valid JSON array string');
            }
        }
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new Error('Coordinates must be an array of exactly two numbers [longitude, latitude]');
        }
        if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
            throw new Error('Coordinates must contain numeric values only');
        }
        return true;
    }),

  body("address").optional().trim().escape().notEmpty().withMessage("Address cannot be empty")
];