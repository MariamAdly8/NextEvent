import express from "express";
import * as registrationController from "../controllers/registrationController.js";
import { authentication } from "../middlewares/authMW.js";
import { idParamValidator } from "../validations/mongoIdValidator.js";
import { validateResults } from "../validations/validateResults.js";

const router = express.Router();

router.use(authentication);

router.post(
    "/:id/register",
    idParamValidator,
    validateResults,
    registrationController.registerForEvent
);

router.delete(
    "/:id/cancel",
    idParamValidator,
    validateResults,
    registrationController.cancelRegistration
);

router.get(
    "/:id/attendees",
    idParamValidator,
    validateResults,
    registrationController.getEventAttendees
);

export default router;