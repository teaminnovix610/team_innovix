import authService from "./auth.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";
import Teacher from "../../models/TeacherProfile.model.js";

class AuthController {

    async register(req, res) {

        const result = await authService.register(req.validated.body);

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000, // 15 minutes — match login/refresh
        });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(
                HttpStatus.CREATED,
                "Registration Successful",
                {
                    user: result.user,
                }
            )
        );
    }


    async login(req, res) {

        const result = await authService.login(req.validated.body);

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000, // 15 minutes — match login/refresh
        });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });


        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Login Successful",
                {
                    user: result.user,
                }
            )
        );
    }


    async me(req, res) {

        const safeUser = req.user.toObject();

        delete safeUser.password;
        delete safeUser.refreshTokens;

        if (req.user.role === "TEACHER") {
            const teacher = await Teacher.findOne({ userId: req.user._id }).select("isApproved");
            safeUser.isApproved = teacher ? teacher.isApproved : false;
        }

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "User fetched successfully",
                safeUser
            )
        );

    }

    async logout(req, res) {
        try {
            const refreshTokenFromCookie = req.cookies?.refreshToken;

            await authService.logout(refreshTokenFromCookie);

            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };

            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);

            return res.status(HttpStatus.OK).json(
                new ApiResponse(
                    HttpStatus.OK,
                    "Logout Successful",
                    null
                )
            );

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    error.message,
                    null
                )
            );
        }
    }

    async refresh(req, res) {
        const refreshTokenFromCookie = req.cookies?.refreshToken;

        const result = await authService.refresh(refreshTokenFromCookie);

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Token refreshed successfully", null)
        );
    }

    async forgotPassword(req, res) {
        const { email } = req.validated.body;

        await authService.forgotPassword(email);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "If an account exists for this email, an OTP has been sent", null)
        );
    }

    async verifyOtp(req, res) {
        const { email, otp } = req.validated.body;

        const resetToken = await authService.verifyOtp(email, otp);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "OTP verified", { resetToken })
        );
    }

    async resetPassword(req, res) {
        const { resetToken, newPassword } = req.validated.body;

        await authService.resetPassword(resetToken, newPassword);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Password reset successful", null)
        );
    }
}

export default new AuthController();