import adminDashboardService from "./adminDashboard.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class AdminDashboardController {

    async dashboard(req, res) {

        const data =
            await adminDashboardService.dashboard();

        return res.status(HttpStatus.OK).json(

            new ApiResponse(

                HttpStatus.OK,

                "Dashboard fetched successfully",

                data

            )

        );

    }

}

export default new AdminDashboardController();