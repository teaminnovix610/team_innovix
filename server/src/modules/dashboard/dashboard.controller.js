import dashboardService from "./dashboard.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";

import HttpStatus from "../../shared/constants/HttpStatus.js";

class DashboardController {

    async getDashboard(req, res) {

        const data =
            await dashboardService.getDashboard(
                req.user
            );

        return res.status(HttpStatus.OK).json(

            new ApiResponse(

                HttpStatus.OK,

                "Dashboard fetched successfully",

                data

            )

        );

    }

}

export default new DashboardController();