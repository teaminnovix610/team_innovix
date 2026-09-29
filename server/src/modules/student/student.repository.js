import Student from "../../models/Student.model.js";
import Batch from "../../models/Batch.model.js";

class StudentRepository {

    async findAll() {
        return Student.find()
            .populate("userId", "firstName lastName email phone isActive")
            .populate("batchIds", "name")
            .sort({ createdAt: -1 });
    }

    async findAllByTeacher(teacherId) {
        const batches = await Batch.find({ teacherId }).select("_id");
        const batchIds = batches.map((batch) => batch._id);

        return Student.find({ batchIds: { $in: batchIds } })
            .populate("userId", "firstName lastName email phone isActive")
            .populate("batchIds", "name")
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return Student.findById(id)
            .populate("userId", "firstName lastName email phone isActive")
            .populate("batchIds", "name");
    }

    async findAllByBatch(batchId) {
        return Student.find({ batchIds: batchId })
            .populate("userId", "firstName lastName email phone isActive")
            .sort({ createdAt: -1 });
    }

}

export default new StudentRepository();