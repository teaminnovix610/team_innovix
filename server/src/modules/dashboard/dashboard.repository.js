import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import Parent from "../../models/ParentProfile.model.js";
import Batch from "../../models/Batch.model.js";
import LiveClass from "../../models/LiveClass.model.js";

class DashboardRepository {
    async countTeachers() {
        return Teacher.countDocuments();
    }

    async countStudents() {
        return Student.countDocuments();
    }

    async countParents() {
        return Parent.countDocuments();
    }

    async countBatches() {
        return Batch.countDocuments();
    }

    async countLiveClasses() {
        return LiveClass.countDocuments();
    }

    async teacherBatches(teacherId) {
        return Batch.find({ teacherId });
    }

    async teacherStudents(batchIds) {
        return Student.countDocuments({
            batchIds: { $in: batchIds },
        });
    }

    async teacherTodayClasses(teacherId) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const now = new Date();

        return LiveClass.find({
            teacherId,
            scheduledAt: { $lte: end },
            $expr: {
                $gte: [
                    { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
                    now,
                ],
            },
        }).sort({ scheduledAt: 1 });
    }

    async teacherUpcomingClasses(teacherId) {
        return LiveClass.find({
            teacherId,
            scheduledAt: {
                $gt: new Date(),
            },
        }).sort({
            scheduledAt: 1,
        });
    }

    async studentBatches(batchIds) {
        return Batch.find({ _id: { $in: batchIds } }).populate("teacherId");
    }

    async studentTodayClasses(batchIds) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const now = new Date();

        return LiveClass.find({
            batchId: { $in: batchIds },
            scheduledAt: { $lte: end },
            $expr: {
                $gte: [
                    { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
                    now,
                ],
            },
        }).sort({ scheduledAt: 1 });
    }

    async studentUpcomingClasses(batchIds) {
        return LiveClass.find({
            batchId: { $in: batchIds },
            scheduledAt: {
                $gt: new Date(),
            },
        }).sort({
            scheduledAt: 1,
        });
    }
}

export default new DashboardRepository();