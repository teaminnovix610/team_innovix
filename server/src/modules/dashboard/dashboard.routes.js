import { Router } from "express";

import dashboardController from "./dashboard.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    dashboardController.getDashboard
);

export default router;