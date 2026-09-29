import { Router } from "express";

import assessmentController from "./assessment.controller.js";
import { createAssessmentSchema, addQuestionSchema, updateQuestionSchema } from "./assessment.validation.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

const router = Router();

router.get(
    "/public/weekly-test",
    assessmentController.getPublicWeeklyTest
);

router.get(
    "/public/weekly-tests",
    assessmentController.listPublicWeeklyTests
);

router.get(
    "/public/:assessmentId",
    assessmentController.getPublicById
);

router.get(
    "/mine",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    assessmentController.listMine
);

router.get(
    "/student",
    authenticate,
    authorize("STUDENT", "TRAINEE"),
    assessmentController.listForStudent
);

router.post(
    "/",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    validate(createAssessmentSchema),
    assessmentController.create
);

router.post(
    "/:assessmentId/questions",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    validate(addQuestionSchema),
    assessmentController.addQuestion
);

router.patch(
    "/:assessmentId/publish",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    assessmentController.publish
);

router.patch(
    "/:assessmentId/questions/:questionId",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    validate(updateQuestionSchema),
    assessmentController.updateQuestion
);

router.delete(
    "/:assessmentId/questions/:questionId",
    authenticate,
    authorize("TEACHER", "TRAINER"),
    assessmentController.deleteQuestion
);

router.get(
    "/batch/:batchId",
    authenticate,
    authorize("TEACHER", "TRAINER", "STUDENT", "TRAINEE", "ADMIN"),
    assessmentController.listForBatch
);

router.get(
    "/:assessmentId",
    authenticate,
    authorize("TEACHER", "TRAINER", "STUDENT", "TRAINEE", "ADMIN"),
    assessmentController.getById
);

export default router;