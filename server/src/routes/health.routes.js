import { Router } from "express";

import ApiResponse from "../shared/responses/ApiResponse.js";
import HttpStatus from "../shared/constants/HttpStatus.js";

const router = Router();

router.get("/", (req, res) => {

    res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Server is healthy"
        )
    );

});

export default router;