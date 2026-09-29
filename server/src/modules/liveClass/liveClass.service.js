import liveClassRepository from "./liveClass.repository.js";

import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import Batch from "../../models/Batch.model.js";
import User from "../../models/User.model.js";

import meetingService from "../meeting/meeting.service.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";
import env from "../../config/env.js";
// add near the top, after imports:
const ACTIVE_PROVIDER = env.MEETING_PROVIDER || "JITSI"; // flip to "LIVEKIT" when ready to cut over
class LiveClassService {

    async create(userId, data) {

    const teacher = await Teacher.findOne({ userId });

    if (!teacher) {
        throw new ApiError(
            HttpStatus.NOT_FOUND,
            "Teacher profile not found"
        );
    }

    if (!teacher.isApproved) {
        throw new ApiError(
            HttpStatus.FORBIDDEN,
            "Your account is pending admin approval"
        );
    }

    const batch = await Batch.findById(data.batchId);

    if (!batch) {
        throw new ApiError(
            HttpStatus.NOT_FOUND,
            "Batch not found"
        );
    }

    if (batch.teacherId.toString() !== teacher._id.toString()) {
        throw new ApiError(
            HttpStatus.FORBIDDEN,
            "You do not own this batch"
        );
    }

    const meeting = meetingService.createMeeting(
        ACTIVE_PROVIDER,
        batch.name
    );

    return await liveClassRepository.create({
        batchId: data.batchId,
        teacherId: teacher._id,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        meeting: {
            provider: meeting.provider,
            roomName: meeting.roomName,
            joinUrl: meeting.meetingLink,
        },
    });
}

    async getMyClasses(userId) {

        const teacher = await Teacher.findOne({ userId });

        if (!teacher) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "Teacher profile not found"
            );
        }

        return await liveClassRepository.findByTeacher(
            teacher._id
        );
    }

    async getAll() {

        return await liveClassRepository.findAll();

    }

    async getStudentClasses(userId) {

    const student = await Student.findOne({ userId });

    if (!student) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Student profile not found");
    }

    if (!student.batchIds || student.batchIds.length === 0) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Student is not assigned to any batch");
    }

    // Permanently delete completed classes for this student's batches
    await liveClassRepository.deleteCompletedByBatches(student.batchIds);

    // Return only classes that are still live or upcoming
    return await liveClassRepository.findUpcomingByBatches(student.batchIds);
}



    async getBatchClasses(userId, userRole, batchId) {

    const batch = await Batch.findById(batchId);

    if (!batch) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Batch not found");
    }

    if (userRole !== "ADMIN") {
        const teacher = await Teacher.findOne({ userId });

        if (!teacher) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Teacher not found");
        }

        if (batch.teacherId.toString() !== teacher._id.toString()) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Unauthorized");
        }
    }

    return liveClassRepository.findByBatch(batchId);
}


// replace the whole join() method with:
async join(userId, userRole, liveClassId, device = "main") {

    const liveClass = await liveClassRepository.findById(liveClassId);

    if (!liveClass) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Class not found");
    }

    let isModerator = false;

    if (userRole === "TEACHER") {
    const teacher = await Teacher.findOne({ userId });

    if (!teacher || liveClass.teacherId._id.toString() !== teacher._id.toString()) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this class");
    }

    if (!teacher.isApproved) {
        throw new ApiError(HttpStatus.FORBIDDEN, "Your account is pending admin approval");
    }

    isModerator = true;

}else if (userRole === "STUDENT") {
        const student = await Student.findOne({ userId });

        const isEnrolled =
            student &&
            student.batchIds &&
            student.batchIds.some((id) => id.toString() === liveClass.batchId._id.toString());

        if (!isEnrolled) {
            throw new ApiError(HttpStatus.FORBIDDEN, "You are not enrolled in this batch");
        }

        isModerator = false;

    } else if (userRole === "ADMIN") {
    // Admins can join any class to monitor, without ownership/enrollment checks.
    isModerator = false;

} else {
        throw new ApiError(HttpStatus.FORBIDDEN, "Unauthorized role");
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }

    // Use the provider stored on THIS class — old scheduled Jitsi classes keep
    // working even after you flip ACTIVE_PROVIDER to LIVEKIT for new ones.
    const provider = liveClass.meeting.provider;

    const token = await meetingService.generateJoinToken(provider, {
        user: {
            _id: userId,
            name: `${currentUser.firstName} ${currentUser.lastName || ""}`.trim(),
            email: currentUser.email,
        },
        roomName: liveClass.meeting.roomName,
        isModerator,
        device,
    });

    const base = {
        token,
        roomName: liveClass.meeting.roomName,
        provider,
        isModerator,
    };

    if (provider === "LIVEKIT") {
        return {
            ...base,
            wsUrl: env.LIVEKIT_URL,
            device,
        };
    }

    return {
        ...base,
        appId: env.JAAS_APP_ID,
    };
}

async endClass(userId, liveClassId) {

    const liveClass = await liveClassRepository.findById(liveClassId);

    if (!liveClass) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Class not found");
    }

    const teacher = await Teacher.findOne({ userId });

    if (!teacher || liveClass.teacherId._id.toString() !== teacher._id.toString()) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this class");
    }

    await meetingService.endMeeting(
        liveClass.meeting.provider,
        liveClass.meeting.roomName
    );

    liveClass.status = "COMPLETED";
    await liveClass.save();

    return { status: liveClass.status };
}
}

export default new LiveClassService();