import Batch from "../../models/Batch.model.js";
import Student from "../../models/Student.model.js";

class BatchRepository {

    async create(data) {
        return Batch.create(data);
    }

    async findByTeacher(teacherId) {
        return Batch.find({ teacherId })
            .populate({
                path: "students",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone",
                },
            })
            .sort({ createdAt: -1 });
    }

    async findAll() {
        return Batch.find()
            .populate({
                path: "teacherId",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone organization role",
                },
            })
            .populate({
                path: "students",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone",
                },
            })
            .sort({ createdAt: -1 });
    }

    async findById(batchId) {
        return Batch.findById(batchId)
            .populate({
                path: "teacherId",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone organization role",
                },
            })
            .populate({
                path: "students",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone",
                },
            });
    }

    async update(id, data) {
        return Batch.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
            }
        );
    }

    async delete(id) {
        return Batch.findByIdAndDelete(id);
    }

    async assignStudent(batchId, studentId) {

        await Student.findByIdAndUpdate(
            studentId,
            {
                $addToSet: {
                    batchIds: batchId,
                },
            }
        );

        return Batch.findByIdAndUpdate(
            batchId,
            {
                $addToSet: {
                    students: studentId,
                },
            },
            {
                new: true,
            }
        )
            .populate({
                path: "students",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone",
                },
            });

    }

    async findByTeacherAndBatch(
        teacherId,
        batchId
    ) {

        return Batch.findOne({
            _id: batchId,
            teacherId,
        })
            .populate({
                path: "teacherId",
                populate: {
                    path: "userId",
                    select: "firstName lastName email",
                },
            })
            .populate({
                path: "students",
                populate: {
                    path: "userId",
                    select: "firstName lastName email phone",
                },
            });

    }

}

export default new BatchRepository();