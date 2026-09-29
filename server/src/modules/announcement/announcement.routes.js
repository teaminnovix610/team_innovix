import { Router } from "express";
import announcementController from "./announcement.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";

const router = Router();

router.get("/public", announcementController.getPublicAnnouncements);
router.get("/", authenticate, announcementController.getAllAnnouncements);
router.post("/", authenticate, announcementController.createAnnouncement);
router.put("/:id", authenticate, announcementController.updateAnnouncement);
router.delete("/:id", authenticate, announcementController.deleteAnnouncement);

export default router;
