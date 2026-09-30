import teacherRepository from "./teacher.repository.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";
import User from "../../models/User.model.js";
import Teacher from "../../models/TeacherProfile.model.js";

class TeacherService {

    async getAll() {
        const trainerUsers = await User.find({ role: { $in: ["TRAINER", "TEACHER"] } });
        for (const u of trainerUsers) {
            let t = await Teacher.findOne({ userId: u._id });
            if (!t) {
                try {
                    await Teacher.create({
                        userId: u._id,
                        isApproved: u.isApproved !== false,
                        qualification: "Subject Matter Expert",
                    });
                } catch {
                    // Ignore duplicate key collision
                }
            } else if (u.isApproved && !t.isApproved) {
                await Teacher.findByIdAndUpdate(t._id, { isApproved: true });
            }
        }

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