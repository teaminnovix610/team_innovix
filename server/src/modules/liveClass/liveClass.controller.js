import liveClassService from "./liveClass.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class LiveClassController {

    async create(req, res) {

        const liveClass =
            await liveClassService.create(
                req.user._id,
                req.validated.body
            );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(
                HttpStatus.CREATED,
                "Live class created successfully",
                liveClass
            )
        );

    }

    async myClasses(req, res) {

        const classes =
            await liveClassService.getMyClasses(
                req.user._id
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Classes fetched successfully",
                classes
            )
        );

    }

    async getAll(req, res) {

        const classes =
            await liveClassService.getAll();

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Classes fetched successfully",
                classes
            )
        );

    }

    async studentClasses(req, res) {

    const classes =
        await liveClassService.getStudentClasses(
            req.user._id
        );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Classes fetched successfully",
            classes
        )
    );

}

async batchClasses(req, res) {

    const classes =
        await liveClassService.getBatchClasses(
            req.user._id,
            req.user.role,
            req.params.batchId
        );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Batch classes fetched successfully",
            classes
        )
    );

}

async join(req, res) {

    const result =
        await liveClassService.join(
            req.user._id,
            req.user.role,
            req.params.id,
            req.query.device || "main"   // added
        );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Join token generated",
            result
        )
    );

}
async end(req, res) {

    const result =
        await liveClassService.endClass(
            req.user._id,
            req.params.id
        );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Class ended",
            result
        )
    );

}

}

export default new LiveClassController();