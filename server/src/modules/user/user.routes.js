import { Router } from "express";

import userController from "./user.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

import {
    updateUserSchema,
} from "./user.validation.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    userController.getAll
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.getOne
);

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    validate(updateUserSchema),
    userController.update
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.delete
);

export default router;