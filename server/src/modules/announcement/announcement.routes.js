import { Router } from "express";
import announcementController from "./announcement.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

// Public (no auth) — for landing page banners
router.get("/public", announcementController.getPublicAnnouncements);

// Any authenticated user can read
router.get("/", authenticate, announcementController.getAllAnnouncements);

// Only admin can create/update/delete
router.post("/", authenticate, authorize("ADMIN"), announcementController.createAnnouncement);
router.put("/:id", authenticate, authorize("ADMIN"), announcementController.updateAnnouncement);
router.delete("/:id", authenticate, authorize("ADMIN"), announcementController.deleteAnnouncement);

export default router;
