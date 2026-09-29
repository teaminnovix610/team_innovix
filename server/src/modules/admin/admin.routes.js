import { Router } from "express";
import adminController from "./admin.controller.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.patch("/teachers/:teacherId/approve", adminController.approveTeacher);
router.delete("/teachers/:teacherId", adminController.deleteTeacher);
router.delete("/students/:studentId", adminController.deleteStudent);

// CAPACITY CONNECT Admin Management Endpoints
router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/approve", adminController.approveUser);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.get("/stats", adminController.getCapacityStats);

export default router;