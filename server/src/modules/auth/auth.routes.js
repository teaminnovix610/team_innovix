import { Router } from "express";

import validate from "../../shared/middleware/validate.middleware.js";
import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import {
    loginLimiter,
    loginIpLimiter,
    otpLimiter,
    otpIpLimiter,
    forgotPasswordLimiter,
    forgotPasswordIpLimiter,
    resetPasswordLimiter,
} from "../../shared/middleware/rateLimit.middleware.js";

import authController from "./auth.controller.js";

import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    authController.register
);

router.post(
    "/login",
    loginIpLimiter,
    loginLimiter,
    validate(loginSchema),
    authController.login
);

router.get(
    "/me",
    authenticate,
    authController.me
);

// Logout route
router.post(
    "/logout",
    authController.logout
);


router.post(
    "/refresh",
    authController.refresh
);

router.post(
    "/forgot-password",
    forgotPasswordIpLimiter,
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
);

router.post(
    "/verify-otp",
    otpIpLimiter,
    otpLimiter,
    validate(verifyOtpSchema),
    authController.verifyOtp
);

router.post(
    "/reset-password",
    resetPasswordLimiter,
    validate(resetPasswordSchema),
    authController.resetPassword
);

export default router;