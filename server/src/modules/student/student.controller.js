import studentService from "./student.service.js";
import Teacher from "../../models/TeacherProfile.model.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class StudentController {

    async getAll(req, res) {

        if (req.user.role === "TEACHER") {
            const teacher = await Teacher.findOne({ userId: req.user._id });

            if (!teacher) {
                throw new ApiError(HttpStatus.NOT_FOUND, "Teacher profile not found");
            }

            const students = await studentService.getAllByTeacher(teacher._id);

            return res.status(HttpStatus.OK).json(
                new ApiResponse(HttpStatus.OK, "Students fetched successfully", students)
            );
        }

        const students = await studentService.getAll();

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Students fetched successfully", students)
        );
    }

    async getById(req, res) {
        const student = await studentService.getById(req.params.id);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Student fetched successfully", student)
        );
    }

}

export default new StudentController();