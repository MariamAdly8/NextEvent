import express from "express";
import * as userController from "../controllers/userController.js";
import { authentication, authorization } from "../middlewares/authMW.js"; // (ملاحظة: خدي بالك إن authorization مكتوبة من غير h عندك، لو هي كده في الفايل سيبيها)
import { 
    updateProfileValidator, 
    changePasswordValidator, 
    updateUserRoleValidator 
} from "../validations/userValidator.js";
import { idParamValidator } from "../validations/mongoIdValidator.js"
import { validateResults } from "../validations/validateResults.js";
import { paginationValidator } from "../validations/paginationValidator.js";

const router = express.Router();

router.get("/profile", authentication, userController.getProfile); 

router.put(
    "/update-profile",
    authentication,
    updateProfileValidator,
    validateResults,
    userController.updateProfile
);

router.put(
    "/change-password",
    authentication,
    changePasswordValidator,
    validateResults,
    userController.changePassword
);

router.delete(
    "/delete-account",
    authentication,
    userController.deleteAccount
);

// admin routes 

router.get(
    "/admin/all",
    authentication,
    authorization("admin"),
    paginationValidator,
    validateResults,
    userController.getAllUsers
);

router.put(
    "/admin/:id/role", 
    authentication,
    authorization("admin"),
    idParamValidator,
    updateUserRoleValidator,
    validateResults,
    userController.updateUserRole
);


router.delete(
    "/admin/:id",
    authentication,
    authorization("admin"),
    idParamValidator,
    validateResults,
    userController.deleteUser 
);


router.get(
    "/:id",
    idParamValidator,
    validateResults,
    userController.getUserById
);

export default router;