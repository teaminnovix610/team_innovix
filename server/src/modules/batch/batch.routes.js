import { Router } from "express";

import batchController from "./batch.controller.js";
import { createBatchSchema, assignCourseToTrainerSchema, assignStudentSchema } from "./batch.validation.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";


const router = Router();

router.get(
    "/catalog",
    authenticate,
    batchController.getCatalog
);

router.post(
    "/:batchId/enroll",
    authenticate,
    authorize("TRAINEE", "STUDENT"),
    batchController.enroll
);

router.get(
    "/my-enrollments",
    authenticate,
    authorize("TRAINEE", "STUDENT"),
    batchController.getMyEnrollments
);

router.post(
    "/",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    validate(createBatchSchema),
    batchController.create
);

router.post(
    "/assigned-course",
    authenticate,
    authorize("ADMIN"),
    validate(assignCourseToTrainerSchema),
    batchController.assignCourseToTrainer
);

router.get(
    "/my",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    batchController.myBatches
);

router.get(
    "/student",
    authenticate,
    authorize("STUDENT", "TRAINEE"),
    batchController.getStudentBatches
);

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    batchController.getAll
);

router.patch(
    "/:batchId/assign",
    authenticate,
    authorize("ADMIN"),
    validate(assignStudentSchema),
    batchController.assignStudent
);

router.get(
    "/:batchId",
    authenticate,
    authorize("TEACHER", "TRAINER", "ADMIN"),
    batchController.getBatchById
);

router.get(
    "/:batchId/students",
    authenticate,
    authorize("TEACHER", "TRAINER", "ADMIN"),
    batchController.getBatchStudents
);

router.delete(
    "/:batchId",
    authenticate,
    authorize("TEACHER", "TRAINER", "ADMIN"),
    batchController.deleteBatch
);

export default router;
