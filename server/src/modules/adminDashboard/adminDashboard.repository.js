import User from "../../models/User.model.js";
import Batch from "../../models/Batch.model.js";
import LiveClass from "../../models/LiveClass.model.js";

class AdminDashboardRepository {

    async totalStudents() {
        return User.countDocuments({
            role: "STUDENT",
        });
    }

    async totalTeachers() {
        return User.countDocuments({
            role: "TEACHER",
        });
    }

    async totalParents() {
        return User.countDocuments({
            role: "PARENT",
        });
    }

    async totalAdmins() {
        return User.countDocuments({
            role: "ADMIN",
        });
    }

    async totalBatches() {
        return Batch.countDocuments();
    }

    async totalLiveClasses() {
        return LiveClass.countDocuments();
    }

    async activeLiveClasses() {
        return LiveClass.countDocuments({
            status: "LIVE",
        });
    }

}

export default new AdminDashboardRepository();