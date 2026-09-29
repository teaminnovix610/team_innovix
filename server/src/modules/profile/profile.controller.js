import profileService from "./profile.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class ProfileController {

    async getProfile(req, res) {

        const profile =
            await profileService.getProfile(
                req.user._id
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Profile fetched successfully",
                profile
            )
        );

    }

    async updateProfile(req, res) {

        const profile =
            await profileService.updateProfile(
                req.user._id,
                req.validated.body
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Profile updated successfully",
                profile
            )
        );

    }

}

export default new ProfileController();