import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { authentication, authorization } from "../middlewares/authMW.js";
import { 
    createCategoryValidator, 
    updateCategoryValidator 
} from "../validations/categoryValidator.js";
import { idParamValidator } from "../validations/mongoIdValidator.js";
import { validateResults } from "../validations/validateResults.js";

const router = express.Router();


router.get(
    "/",
    categoryController.getAllCategories
);

router.get(
    "/:id",
    idParamValidator,
    validateResults,
    categoryController.getCategoryById
);


// admin Only Routes 
router.use(authentication, authorization("admin"));

router.post(
    "/",
    createCategoryValidator,
    validateResults,
    categoryController.createCategory
);

router.put(
    "/:id",
    idParamValidator,
    updateCategoryValidator, 
    validateResults, 
    categoryController.updateCategory
);

router.delete(
    "/:id",
    idParamValidator,
    validateResults,
    categoryController.deleteCategory
);

export default router;