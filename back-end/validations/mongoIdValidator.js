import { param } from "express-validator";


export const idParamValidator = [
    param("id").notEmpty().withMessage("missing param").isMongoId().withMessage("Invalid ID format"),
];