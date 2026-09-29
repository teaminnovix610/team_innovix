import { Router } from "express";

import teacherController from "./teacher.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), teacherController.getAll);
router.get("/:id", authenticate, authorize("ADMIN"), teacherController.getById);

export default router;