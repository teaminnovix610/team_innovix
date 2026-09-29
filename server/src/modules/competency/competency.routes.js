import { Router } from "express";
import competencyController from "./competency.controller.js";

const router = Router();

router.get("/domains", competencyController.getDomains);
router.get("/framework", competencyController.getFramework);
router.get("/match", competencyController.matchTrainers);
router.post("/match-requirement", competencyController.matchRequirement);

export default router;
