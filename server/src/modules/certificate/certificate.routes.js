import { Router } from "express";
import certificateController from "./certificate.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

// Public verification
router.get("/verify/:certificateNumber", certificateController.verifyCertificate);

// Protected routes
router.use(authenticate);

router.get("/my", certificateController.getMyCertificates);
router.get("/stats", authorize("ADMIN"), certificateController.getStats);
router.get("/", authorize("ADMIN", "TRAINER", "TEACHER"), certificateController.getAllCertificates);
router.get("/:id", certificateController.getCertificateById);
router.post("/issue", authorize("ADMIN", "TRAINER", "TEACHER"), certificateController.issueCertificate);

export default router;
