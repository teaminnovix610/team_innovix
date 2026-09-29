import { Router } from "express";

import studentController from "./student.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "TEACHER"), studentController.getAll);
router.get("/:id", authenticate, authorize("ADMIN"), studentController.getById);

export default router;