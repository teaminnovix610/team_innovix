import { Router } from "express";

import liveClassController from "./liveClass.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

import { createLiveClassSchema } from "./liveClass.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("TEACHER"),
  validate(createLiveClassSchema),
  liveClassController.create
);

router.get(
  "/my",
  authenticate,
  authorize("TEACHER"),
  liveClassController.myClasses
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  liveClassController.getAll
);

router.get(
  "/batch/:batchId",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  liveClassController.batchClasses
);

router.get(
  "/student",
  authenticate,
  authorize("STUDENT"),
  liveClassController.studentClasses
);

// End a live class
router.post(
  "/:id/end",
  authenticate,
  authorize("TEACHER"),
  liveClassController.end
);

router.get(
  "/:id/join",
  authenticate,
  authorize("TEACHER", "STUDENT", "ADMIN"),
  liveClassController.join
);

export default router;