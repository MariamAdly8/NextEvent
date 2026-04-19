import express from "express";
import * as eventController from "../controllers/eventController.js";
import { authentication } from "../middlewares/authMW.js";
import { 
    createEventValidator, 
    getAllEventsValidator, 
    updateEventValidator 
} from "../validations/eventValidator.js";
import { idParamValidator } from "../validations/mongoIdValidator.js";
import { validateResults } from "../validations/validateResults.js";
import { paginationValidator } from "../validations/paginationValidator.js";
import { uploadEventImage } from "../middlewares/uploadMW.js";

const router = express.Router();

router.get(
    "/",
    paginationValidator,
    getAllEventsValidator, 
    validateResults,
    eventController.getAllEvents
);

router.get("/top-registered", eventController.getTopRegisteredEvents);

router.get(
    "/:id",
    idParamValidator,
    validateResults,
    eventController.getEventById
);

router.use(authentication);

router.post(
    "/",
    uploadEventImage,
    createEventValidator,
    validateResults,
    eventController.createEvent
);


router.put(
    "/:id",
    uploadEventImage,
    idParamValidator,
    updateEventValidator,
    validateResults,
    eventController.updateEvent
);

router.delete(
    "/:id",
    idParamValidator,
    validateResults,
    eventController.deleteEvent
);

export default router;