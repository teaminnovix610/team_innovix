import { Router } from "express";
import feedbackController from "./feedback.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";

const router = Router();

router.post("/", authenticate, feedbackController.createFeedback);
router.get("/", feedbackController.getFeedback);

export default router;
