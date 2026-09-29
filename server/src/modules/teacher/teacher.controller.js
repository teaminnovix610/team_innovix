import teacherService from "./teacher.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class TeacherController {

    async getAll(req, res) {
        const teachers = await teacherService.getAll();

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Teachers fetched successfully", teachers)
        );
    }

    async getById(req, res) {
        const teacher = await teacherService.getById(req.params.id);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Teacher fetched successfully", teacher)
        );
    }

}

export default new TeacherController();