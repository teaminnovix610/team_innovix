import { Router } from "express";
import recordingController from "./recording.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.get("/", authenticate, recordingController.getAll);

router.post(
  "/",
  authenticate,
  authorize("TEACHER", "TRAINER", "ADMIN"),
  recordingController.create
);

router.get(
  "/student",
  authenticate,
  recordingController.studentRecordings
);

router.get(
  "/batch/:batchId",
  authenticate,
  recordingController.batchRecordings
);

router.get(
  "/:id",
  authenticate,
  recordingController.getById
);

router.patch(
  "/:id",
  authenticate,
  authorize("TEACHER", "TRAINER", "ADMIN"),
  recordingController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("TEACHER", "TRAINER", "ADMIN"),
  recordingController.remove
);

export default router;