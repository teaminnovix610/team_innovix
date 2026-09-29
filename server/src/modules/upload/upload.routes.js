import { Router } from "express";
import multer from "multer";

import uploadController from "./upload.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});

const router = Router();

router.post(
    "/image",
    authenticate,
    authorize("TEACHER"),
    upload.single("image"),
    uploadController.uploadImage
);

export default router;