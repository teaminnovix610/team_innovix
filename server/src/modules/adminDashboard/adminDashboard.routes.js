import { Router } from "express";

import adminDashboardController from "./adminDashboard.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    adminDashboardController.dashboard
);

export default router;