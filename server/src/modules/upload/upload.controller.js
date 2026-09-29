import uploadService from "./upload.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class UploadController {

    async uploadImage(req, res) {

        if (!req.file) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "No image file provided");
        }

        const result = await uploadService.uploadImage(req.file.buffer);

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, "Image uploaded successfully", {
                imageUrl: result.secure_url,
            })
        );

    }

}

export default new UploadController();