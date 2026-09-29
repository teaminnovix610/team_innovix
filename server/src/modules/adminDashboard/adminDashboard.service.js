import adminDashboardRepository from "./adminDashboard.repository.js";

class AdminDashboardService {

    async dashboard() {

        const totalStudents =
            await adminDashboardRepository.totalStudents();

        const totalTeachers =
            await adminDashboardRepository.totalTeachers();

        const totalParents =
            await adminDashboardRepository.totalParents();

        const totalAdmins =
            await adminDashboardRepository.totalAdmins();

        const totalBatches =
            await adminDashboardRepository.totalBatches();

        const totalLiveClasses =
            await adminDashboardRepository.totalLiveClasses();

        const activeLiveClasses =
            await adminDashboardRepository.activeLiveClasses();

        return {

            totalStudents,

            totalTeachers,

            totalParents,

            totalAdmins,

            totalBatches,

            totalLiveClasses,

            activeLiveClasses,

        };

    }

}

export default new AdminDashboardService();