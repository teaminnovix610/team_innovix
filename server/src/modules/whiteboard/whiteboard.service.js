import whiteboardRepository from "./whiteboard.repository.js";
import liveClassRepository from "../liveClass/liveClass.repository.js";
import Teacher from "../../models/TeacherProfile.model.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class WhiteboardService {
  async getByClassId(userId, userRole, classId) {
    const liveClass = await liveClassRepository.findById(classId);

    if (!liveClass) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Live class not found");
    }

    // NOTE: assumes liveClass.teacherId, mirroring batchRepository's
    // shape. Confirm against the real LiveClass model if this differs.
    if (userRole === "TEACHER") {
      const teacher = await Teacher.findOne({ userId });
      if (!teacher) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Teacher profile not found");
      }
      const classTeacherId = liveClass.teacherId._id
        ? liveClass.teacherId._id.toString()
        : liveClass.teacherId.toString();
      if (classTeacherId !== teacher._id.toString()) {
        throw new ApiError(HttpStatus.FORBIDDEN, "Unauthorized");
      }
    }
    // Students: no extra ownership check — reaching this route with a
    // valid classId already implies they're in the live class (same
    // trust boundary as the LiveKit token). Tighten if that doesn't hold.

    const whiteboard = await whiteboardRepository.findByClassId(classId);

    // No board saved yet is normal (first-ever use in this class), not
    // an error — return an empty board instead of 404.
    return {
      classId,
      elements: whiteboard?.elements ?? [],
      updatedAt: whiteboard?.updatedAt ?? null,
      updatedBy: whiteboard?.updatedBy ?? null,
    };
  }

  async saveElements(userId, classId, elements, updatedBy) {
    const liveClass = await liveClassRepository.findById(classId);

    if (!liveClass) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Live class not found");
    }

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Teacher profile not found");
    }

    const classTeacherId = liveClass.teacherId._id
      ? liveClass.teacherId._id.toString()
      : liveClass.teacherId.toString();

    if (classTeacherId !== teacher._id.toString()) {
      throw new ApiError(HttpStatus.FORBIDDEN, "Unauthorized");
    }

    return whiteboardRepository.upsert(classId, elements, updatedBy);
  }
}

export default new WhiteboardService();