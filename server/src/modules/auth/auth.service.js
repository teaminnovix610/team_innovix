import authRepository from "./auth.repository.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

import passwordService from "./services/password.service.js";
import tokenService from "./services/token.service.js";

import sendEmail from "../../shared/utils/sendEmail.js";
import otpEmailTemplate from "../../shared/utils/otpEmailTemplate.js";
import generateOTP from "../../shared/utils/generateOTP.js";

import Student from "../../models/Student.model.js";
import Parent from "../../models/ParentProfile.model.js";
import Teacher from "../../models/TeacherProfile.model.js";
import Admin from "../../models/Admin.model.js";
import Batch from "../../models/Batch.model.js";
import batchRepository from "../batch/batch.repository.js";

class AuthService {
    async register(userData) {
        const existingEmail = await authRepository.findUserByEmail(userData.email);

        if (existingEmail) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "Email already exists"
            );
        }

        const existingPhone = await authRepository.findUserByPhone(userData.phone);

        if (existingPhone) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "Phone number already exists"
            );
        }

        const user = await authRepository.createUser(userData);

        let teacherIsApproved;

        switch (user.role) {
            case "TRAINEE":
            case "STUDENT": {
                const student = await Student.create({
                    userId: user._id,
                    classLevel: userData.classLevel || "Capacity Building",
                    phone: userData.phone,
                });

                const matchingBatches = await Batch.find({
                    isActive: true,
                });

                for (const batch of matchingBatches) {
                    await batchRepository.assignStudent(batch._id, student._id);
                }

                break;
            }

            case "PARENT":
                await Parent.create({
                    userId: user._id,
                });
                break;

            case "TRAINER":
            case "TEACHER": {
                const teacher = await Teacher.create({
                    userId: user._id,
                    qualification: userData.qualification,
                    experience: userData.experience,
                    specialization: userData.specialization,
                    bio: userData.bio,
                });

                teacherIsApproved = teacher.isApproved;
                break;
            }

            case "ADMIN":
                await Admin.create({
                    userId: user._id,
                });
                break;

            default:
                throw new ApiError(
                    HttpStatus.BAD_REQUEST,
                    "Invalid user role"
                );
        }

        const accessToken = tokenService.generateAccessToken(user);

        const refreshToken = tokenService.generateRefreshToken(user);

        const hashedRefreshToken = tokenService.hashToken(refreshToken);
        const expiresAt = tokenService.getRefreshTokenExpiry();

        await authRepository.addRefreshToken(user._id, hashedRefreshToken, expiresAt);

        const safeUser = user.toObject();

        delete safeUser.password;
        delete safeUser.refreshTokens;

        if (user.role === "TEACHER" || user.role === "TRAINER") {
            safeUser.isApproved = teacherIsApproved;
        }

        return {
            user: safeUser,
            accessToken,
            refreshToken,
        };
    }

    async login(loginData) {
        const user = await authRepository.findUserByEmail(loginData.email);

        if (!user) {
            throw new ApiError(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        const isPasswordCorrect = await passwordService.compare(
            loginData.password,
            user.password
        );

        if (!isPasswordCorrect) {
            throw new ApiError(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        if (!user.isActive) {
            throw new ApiError(
                HttpStatus.FORBIDDEN,
                "Account is disabled"
            );
        }

        const accessToken = tokenService.generateAccessToken(user);

        const refreshToken = tokenService.generateRefreshToken(user);

        const hashedRefreshToken = tokenService.hashToken(refreshToken);
        const expiresAt = tokenService.getRefreshTokenExpiry();

        await authRepository.addRefreshTokenAndUpdateLastLogin(
            user._id,
            hashedRefreshToken,
            expiresAt
        );

        const safeUser = user.toObject();

        delete safeUser.password;
        delete safeUser.refreshTokens;

        if (user.role === "TEACHER") {
            const teacher = await Teacher.findOne({ userId: user._id }).select("isApproved");
            safeUser.isApproved = teacher ? teacher.isApproved : false;
        }

        return {
            user: safeUser,
            accessToken,
            refreshToken,
        };
    }


    async refresh(refreshTokenFromCookie) {
        if (!refreshTokenFromCookie) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "No refresh token provided");
        }

        let decoded;
        try {
            decoded = tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        const user = await authRepository.findUserByIdWithRefreshTokens(decoded.userId);

        if (!user || !user.refreshTokens?.length) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Session no longer valid");
        }

        let matchedEntry = null;

        for (const entry of user.refreshTokens) {
            const isMatch = tokenService.compareToken(refreshTokenFromCookie, entry.tokenHash);

            if (isMatch) {
                matchedEntry = entry;
                break;
            }
        }

        if (!matchedEntry) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Session no longer valid");
        }

        if (matchedEntry.expiresAt < new Date()) {
            await authRepository.removeRefreshTokenById(user._id, matchedEntry._id);
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Session expired");
        }

        if (!user.isActive) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Account is disabled");
        }

        const newAccessToken = tokenService.generateAccessToken(user);
        const newRefreshToken = tokenService.generateRefreshToken(user);

        const newHashedRefreshToken = tokenService.hashToken(newRefreshToken);
        const newExpiresAt = tokenService.getRefreshTokenExpiry();

        await authRepository.removeRefreshTokenById(user._id, matchedEntry._id);
        await authRepository.addRefreshToken(user._id, newHashedRefreshToken, newExpiresAt);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);

        if (!user) {
            return;
        }

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const hashedOtp = await passwordService.hash(otp);

        await authRepository.updateUserResetOtp(user._id, hashedOtp, expiry);

        await sendEmail(
            user.email,
            "Your Password Reset OTP",
            `Your OTP is ${otp}. It expires in 10 minutes.`,
            otpEmailTemplate(otp)
        );
    }

    async verifyOtp(email, otp) {
        const user = await authRepository.findUserByEmailWithOtp(email);

        if (!user || !user.passwordResetOtp) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "OTP not requested or already used");
        }

        if (user.passwordResetOtpExpiry < new Date()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "OTP expired");
        }

        const isValid = await passwordService.compare(otp, user.passwordResetOtp);

        if (!isValid) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        await authRepository.clearUserResetOtp(user._id);

        return tokenService.generateResetToken(user);
    }

    async resetPassword(resetToken, newPassword) {
        let payload;

        try {
            payload = tokenService.verifyResetToken(resetToken);
        } catch {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Reset token invalid or expired");
        }

        const user = await authRepository.findUserById(payload.userId);

        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        }

        await authRepository.updateUserPassword(user._id, newPassword);
    }
    async logout(refreshTokenFromCookie) {
        if (!refreshTokenFromCookie) {
            return;
        }

        let decoded;
        try {
            decoded = tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch {
            return;
        }

        const user = await authRepository.findUserByIdWithRefreshTokens(decoded.userId);

        if (!user || !user.refreshTokens?.length) {
            return;
        }

        for (const entry of user.refreshTokens) {
            const isMatch = tokenService.compareToken(refreshTokenFromCookie, entry.tokenHash);

            if (isMatch) {
                await authRepository.removeRefreshTokenById(user._id, entry._id);
                break;
            }
        }
    }
}

export default new AuthService();