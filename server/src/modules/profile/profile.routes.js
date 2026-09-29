import { Router } from "express";

import profileController from "./profile.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

import {
    updateProfileSchema,
} from "./profile.validation.js";

const router = Router();
 
router.get(
    "/me",
    authenticate,
    profileController.getProfile
);

router.patch(
    "/",
    authenticate,
    validate(updateProfileSchema),
    profileController.updateProfile
);

export default router;