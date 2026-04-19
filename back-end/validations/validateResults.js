import { validationResult } from "express-validator";
import HTTPError from "../utils/HTTPError.js";
export const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        const errorMessage = firstError.msg?.message || firstError.msg;
        
        return next(new HTTPError(400, errorMessage));
    }
    next();
};
