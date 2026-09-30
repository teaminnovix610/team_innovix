import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import profileRoutes from "../modules/profile/profile.routes.js";
import batchRoutes from "../modules/batch/batch.routes.js";
import liveClassRoutes from "../modules/liveClass/liveClass.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import teacherRoutes from "../modules/teacher/teacher.routes.js";
import studentRoutes from "../modules/student/student.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import assessmentRoutes from "../modules/assessment/assessment.routes.js";
import attemptRoutes from "../modules/attempt/attempt.routes.js";
import uploadRoutes from "../modules/upload/upload.routes.js";

import recordingRoutes from "../modules/recording/recording.routes.js";
import playlistRoutes from "../modules/playlist/playlist.routes.js";
import whiteboardRoutes from "../modules/whiteboard/index.js";
import announcementRoutes from "../modules/announcement/announcement.routes.js";
import competencyRoutes from "../modules/competency/competency.routes.js";
import feedbackRoutes from "../modules/feedback/feedback.routes.js";
import certificateRoutes from "../modules/certificate/certificate.routes.js";
import skillGapRoutes from "../modules/skillGap/skillGap.routes.js";

import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/batches", batchRoutes);
router.use("/live-classes", liveClassRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/admin", adminRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/attempts", attemptRoutes);
router.use("/upload", uploadRoutes);
router.use("/recordings", recordingRoutes);
router.use("/playlists", playlistRoutes);
router.use("/whiteboard", whiteboardRoutes);
router.use("/announcements", announcementRoutes);
router.use("/competency", competencyRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/certificates", certificateRoutes);
router.use("/skill-gap", skillGapRoutes);
router.use("/users", userRoutes);
router.use("/health", healthRoutes);

export default router;