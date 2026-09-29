import studentRepository from "./student.repository.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class StudentService {

    async getAll() {
        return studentRepository.findAll();
    }

    async getAllByTeacher(teacherId) {
        return studentRepository.findAllByTeacher(teacherId);
    }

    async getById(id) {
        const student = await studentRepository.findById(id);

        if (!student) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Student not found");
        }

        return student;
    }

    async getAllByBatch(batchId) {
        return studentRepository.findAllByBatch(batchId);
    }

}

export default new StudentService();