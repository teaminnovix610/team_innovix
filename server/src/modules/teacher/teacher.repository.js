import Teacher from "../../models/TeacherProfile.model.js";

class TeacherRepository {

    async findAll() {
        return Teacher.find()
            .populate("userId", "firstName lastName email phone isActive isApproved role")
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return Teacher.findById(id)
            .populate("userId", "firstName lastName email phone isActive");
    }

}

export default new TeacherRepository();
