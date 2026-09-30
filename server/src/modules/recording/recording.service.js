import recordingRepository from "./recording.repository.js";
import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import Batch from "../../models/Batch.model.js";
import LiveClass from "../../models/LiveClass.model.js";
import Parent from "../../models/ParentProfile.model.js";
import mongoose from "mongoose";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

function extractYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function assertBatchAccess(userId, userRole, batchId) {
  if (!batchId) {
    throw new ApiError(HttpStatus.FORBIDDEN, "This material is not assigned to an accessible course");
  }
  if (!mongoose.isValidObjectId(batchId)) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
  }
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
  }

  if (userRole === "ADMIN") return true;
  if (["TEACHER", "TRAINER"].includes(userRole)) {
    const teacher = await Teacher.findOne({ userId });
    if (teacher && batch.teacherId.toString() === teacher._id.toString()) return true;
  }
  if (["STUDENT", "TRAINEE", "PARENT"].includes(userRole)) {
    const students = userRole === "PARENT"
      ? (await Parent.findOne({ userId }).select("children"))?.children || []
      : [(await Student.findOne({ userId }).select("_id"))?._id].filter(Boolean);
    const enrolled = await Student.exists({ _id: { $in: students }, batchIds: batch._id });
    if (enrolled) return true;
  }
  throw new ApiError(HttpStatus.FORBIDDEN, "You do not have access to this recording");
}

class RecordingService {
  async create(userId, userRole, data) {
    let teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      teacher = await Teacher.create({ userId });
    }

    if (userRole !== "ADMIN" && !teacher.isApproved) {
      throw new ApiError(HttpStatus.FORBIDDEN, "Your account is pending admin approval");
    }

    if (!data.batchId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Select an assigned course for this material");
    }

    const videoUrl = data.videoUrl || data.youtubeUrl || "";
    const videoId = extractYoutubeId(videoUrl);

    const batch = await Batch.findById(data.batchId);
    if (!batch) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assigned subject/course not found");
    }

    // Normal trainers can publish only to courses assigned to their profile.
    if (userRole !== "ADMIN" && batch.teacherId.toString() !== teacher._id.toString()) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "You are not authorized to upload material for this unassigned subject"
      );
    }

    const finalSubject = data.subject?.trim() || batch.name || batch.classLevel || batch.category || "General";

    let order = 0;
    if (data.playlistId) {
      order = await recordingRepository.countByPlaylist(data.playlistId);
    }

    return await recordingRepository.create({
      batchId: batch._id,
      playlistId: data.playlistId ?? null,
      teacherId: teacher._id,
      title: data.title,
      description: data.description || "",
      type: data.type || "RECORDED_LECTURE",
      subject: finalSubject,
      topic: data.topic || "",
      videoUrl,
      youtubeUrl: videoUrl,
      youtubeVideoId: videoId,
      order,
    });
  }

  async update(userId, userRole, id, data) {
    const recording = await recordingRepository.findById(id);

    if (!recording) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
    }

    if (userRole !== "ADMIN") {
      const teacher = await Teacher.findOne({ userId });
      const recordingTeacherId = recording.teacherId?._id
        ? recording.teacherId._id.toString()
        : recording.teacherId?.toString();

      if (!teacher || recordingTeacherId !== teacher._id.toString()) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this resource");
      }
    }

    const updateData = { ...data };

    if (data.youtubeUrl || data.videoUrl) {
      const url = data.youtubeUrl || data.videoUrl;
      const videoId = extractYoutubeId(url);
      updateData.youtubeVideoId = videoId;
      updateData.videoUrl = url;
      updateData.youtubeUrl = url;
    }

    return await recordingRepository.update(id, updateData);
  }

  async delete(userId, userRole, id) {
    const recording = await recordingRepository.findById(id);

    if (!recording) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
    }

    if (userRole !== "ADMIN") {
      const teacher = await Teacher.findOne({ userId });
      const recordingTeacherId = recording.teacherId?._id
        ? recording.teacherId._id.toString()
        : recording.teacherId?.toString();

      if (!teacher || recordingTeacherId !== teacher._id.toString()) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this resource");
      }
    }

    await recordingRepository.delete(id);

    return { deleted: true };
  }

  async getBatchRecordings(userId, userRole, batchId) {
    await assertBatchAccess(userId, userRole, batchId);
    return await recordingRepository.findByBatch(batchId);
  }

  async getById(userId, userRole, id) {
    const recording = await recordingRepository.findById(id);

    if (!recording) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
    }

    if (userRole === "ADMIN") return recording;
    if (["TEACHER", "TRAINER"].includes(userRole)) {
      const teacher = await Teacher.findOne({ userId });
      const recordingTeacherId = recording.teacherId?._id?.toString() || recording.teacherId?.toString();
      if (teacher && recordingTeacherId === teacher._id.toString()) return recording;
      throw new ApiError(HttpStatus.FORBIDDEN, "You do not have access to this recording");
    }
    await assertBatchAccess(userId, userRole, recording.batchId?._id?.toString() || recording.batchId?.toString() || null);

    return recording;
  }

  async getStudentRecordings(userId, userRole) {
    let studentIds = [];
    let batchIds = [];
    if (userRole === "PARENT") {
      const parent = await Parent.findOne({ userId }).select("children");
      studentIds = parent?.children || [];
    } else {
      const student = await Student.findOne({ userId }).select("_id batchIds");
      if (!student) throw new ApiError(HttpStatus.NOT_FOUND, "Student profile not found");
      studentIds = [student._id];
      batchIds = student.batchIds || [];
    }
    if (userRole === "PARENT" && studentIds.length) {
      const students = await Student.find({ _id: { $in: studentIds } }).select("batchIds");
      batchIds = students.flatMap((student) => student.batchIds || []);
    }
    return recordingRepository.findAvailableToBatches(batchIds);
  }

  async getAll(userId, userRole) {
    if (userRole === "ADMIN") return recordingRepository.findAll();
    if (["TEACHER", "TRAINER"].includes(userRole)) {
      const teacher = await Teacher.findOne({ userId });
      return teacher ? recordingRepository.findByTeacher(teacher._id) : [];
    }
    return this.getStudentRecordings(userId, userRole);
  }
}

export default new RecordingService();
