import { Router } from "express";

import attemptController from "./attempt.controller.js";
import {
  saveAnswerSchema,
  startGuestAttemptSchema,
} from "./attempt.validation.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

const router = Router();

// Guest (public) routes
router.post(
  "/public/assessments/:assessmentId/start",
  validate(startGuestAttemptSchema),
  attemptController.startGuest
);
router.get(
    "/public/assessments/:assessmentId/review-lookup",
    attemptController.lookupGuestReview
);
router.get(
    "/public/guest-results",
    attemptController.listGuestResults
);
router.get("/public/:attemptId", attemptController.getGuestById);
router.get(
    "/public/:attemptId/review",
    attemptController.guestReview
);

router.patch(
  "/public/:attemptId/answer",
  validate(saveAnswerSchema),
  attemptController.saveGuestAnswer
);

router.post("/public/:attemptId/submit", attemptController.submitGuest);



// Authenticated student routes
router.post(
  "/assessments/:assessmentId/start",
  authenticate,
  authorize("STUDENT"),
  attemptController.start
);
router.get(
  "/:attemptId",
  authenticate,
  authorize("STUDENT"),
  attemptController.getById
);
router.get(
    "/:attemptId/review",
    authenticate,
    authorize("STUDENT"),
    attemptController.review
);

router.patch(
  "/:attemptId/answer",
  authenticate,
  authorize("STUDENT"),
  validate(saveAnswerSchema),
  attemptController.saveAnswer
);

router.post(
  "/:attemptId/submit",
  authenticate,
  authorize("STUDENT"),
  attemptController.submit
);

// Teacher/admin routes
router.get(
  "/assessments/:assessmentId/analytics",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  attemptController.analytics
);

router.get(
  "/assessments/:assessmentId/leaderboard",
  authenticate,
  authorize("TEACHER", "STUDENT", "ADMIN"),
  attemptController.leaderboard
);


export default router;