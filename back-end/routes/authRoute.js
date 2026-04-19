import express from "express";
import * as authController from "../controllers/authController.js";
import { 
    signupValidator, 
    loginValidator 
} from "../validations/authValidator.js";
import { validateResults } from "../validations/validateResults.js";

const router = express.Router();

router.post(
    "/signup",
    signupValidator,
    validateResults,
    authController.signup
);

router.post(
    "/login",
    loginValidator,
    validateResults,
    authController.login
);

router.get(
    "/refresh",
    authController.refresh
);

router.delete(
    "/logout",
    authController.logout
);

export default router;