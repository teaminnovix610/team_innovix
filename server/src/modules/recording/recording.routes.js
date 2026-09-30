import { Router } from "express";
import recordingController from "./recording.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";
import { createRecordingSchema, updateRecordingSchema } from "./recording.validation.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("TEACHER", "TRAINER", "STUDENT", "TRAINEE", "PARENT", "ADMIN"),
  recordingController.getAll
);

router.post(
  "/",
  authenticate,
  authorize("TEACHER", "TRAINER", "ADMIN"),
  validate(createRecordingSchema),
  recordingController.create
);

router.get(
  "/student",
  authenticate,
  authorize("STUDENT", "TRAINEE", "PARENT"),
  recordingController.studentRecordings
);

router.get(
  "/batch/:batchId",
  authenticate,
  authorize("TEACHER", "TRAINER", "STUDENT", "TRAINEE", "PARENT", "ADMIN"),
  recordingController.batchRecordings
);

router.get(
  "/:id",
  authenticate,
  authorize("TEACHER", "TRAINER", "STUDENT", "TRAINEE", "PARENT", "ADMIN"),
  recordingController.getById
);

router.patch(
  "/:id",
  authenticate,
  authorize("TEACHER", "TRAINER", "ADMIN"),
  validate(updateRecordingSchema),
  recordingController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("TEACHER", "TRAINER", "ADMIN"),
  recordingController.remove
);

export default router;
