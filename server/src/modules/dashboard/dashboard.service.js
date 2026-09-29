import dashboardRepository from "./dashboard.repository.js";

import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class DashboardService {

    async getDashboard(user) {

        switch (user.role) {

            case "ADMIN":
                return this.adminDashboard();

            case "TEACHER":
                return this.teacherDashboard(user._id);

            case "STUDENT":
                return this.studentDashboard(user._id);

            case "PARENT":
                return this.parentDashboard(user._id);

            default:
                throw new ApiError(
                    HttpStatus.BAD_REQUEST,
                    "Invalid role"
                );
        }
    }

    async adminDashboard() {

        return {

            teachers: await dashboardRepository.countTeachers(),

            students: await dashboardRepository.countStudents(),

            parents: await dashboardRepository.countParents(),

            batches: await dashboardRepository.countBatches(),

            liveClasses: await dashboardRepository.countLiveClasses(),

        };

    }

    async teacherDashboard(userId) {

        const teacher = await Teacher.findOne({
            userId,
        });

        if (!teacher) {
            return {
                totalBatches: 0,
                totalStudents: 0,
                todayClasses: [],
                upcomingClasses: [],
            };
        }

        const batches =
            await dashboardRepository.teacherBatches(
                teacher._id
            );

        const batchIds = batches.map(
            batch => batch._id
        );

        return {

            totalBatches: batches.length,

            totalStudents:
                await dashboardRepository.teacherStudents(
                    batchIds
                ),

            todayClasses:
                await dashboardRepository.teacherTodayClasses(
                    teacher._id
                ),

            upcomingClasses:
                await dashboardRepository.teacherUpcomingClasses(
                    teacher._id
                ),

        };

    }

    async studentDashboard(userId) {

        const student = await Student.findOne({
            userId,
        });

        if (!student) {
            return {
                batches: [],
                todayClasses: [],
                upcomingClasses: [],
            };
        }

        if (!student.batchIds || student.batchIds.length === 0) {
            return {
                batches: [],
                todayClasses: [],
                upcomingClasses: [],
            };
        }

        return {

            batches:
                await dashboardRepository.studentBatches(
                    student.batchIds
                ),

            todayClasses:
                await dashboardRepository.studentTodayClasses(
                    student.batchIds
                ),

            upcomingClasses:
                await dashboardRepository.studentUpcomingClasses(
                    student.batchIds
                ),

        };

    }

    async parentDashboard() {

        return {
            children: [],
            todayClasses: [],
            upcomingClasses: [],
        };

    }

}

export default new DashboardService();