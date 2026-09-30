import { Router } from "express";
import skillGapController from "./skillGap.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/my-gaps", authorize("TRAINEE", "STUDENT"), skillGapController.getMySkillGaps);
router.get("/my-roadmap", authorize("TRAINEE", "STUDENT"), skillGapController.getMyRoadmap);
router.post("/complete-step", authorize("TRAINEE", "STUDENT"), skillGapController.completeStep);
router.post("/recompute", authorize("TRAINEE", "STUDENT"), skillGapController.triggerRecompute);

export default router;
