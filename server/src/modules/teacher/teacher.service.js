import teacherRepository from "./teacher.repository.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class TeacherService {

    async getAll() {
        return teacherRepository.findAll();
    }

    async getById(id) {
        const teacher = await teacherRepository.findById(id);

        if (!teacher) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Teacher not found");
        }

        return teacher;
    }

}

export default new TeacherService();