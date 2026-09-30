import { Router } from "express";
import competencyController from "./competency.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/domains", competencyController.getDomains);
router.get("/framework", competencyController.getFramework);
router.get("/match", competencyController.matchTrainers);
router.post("/match-requirement", competencyController.matchRequirement);

export default router;
