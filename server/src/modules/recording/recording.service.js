import recordingRepository from "./recording.repository.js";
import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import Batch from "../../models/Batch.model.js";
import LiveClass from "../../models/LiveClass.model.js";

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
  if (!batchId) return null;
  const batch = await Batch.findById(batchId);

  if (!batch) {
    return null;
  }

  return batch;
}

class RecordingService {
  async create(userId, data) {
    let teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      teacher = await Teacher.create({ userId });
    }

    const videoUrl = data.videoUrl || data.youtubeUrl || "";
    const videoId = extractYoutubeId(videoUrl) || `res-${Date.now()}`;

    let batchId = data.batchId;
    if (!batchId) {
      const defaultBatch = await Batch.findOne({ isActive: true });
      if (defaultBatch) {
        batchId = defaultBatch._id;
      }
    }

    let order = 0;
    if (data.playlistId) {
      order = await recordingRepository.countByPlaylist(data.playlistId);
    }

    return await recordingRepository.create({
      batchId: batchId || teacher._id,
      playlistId: data.playlistId ?? null,
      teacherId: teacher._id,
      title: data.title,
      description: data.description || "",
      type: data.type || "RECORDED_LECTURE",
      subject: data.subject || "General",
      topic: data.topic || "",
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

    const updateData = { ...data };

    if (data.youtubeUrl || data.videoUrl) {
      const url = data.youtubeUrl || data.videoUrl;
      const videoId = extractYoutubeId(url) || `res-${Date.now()}`;
      updateData.youtubeVideoId = videoId;
      updateData.youtubeUrl = url;
    }

    return await recordingRepository.update(id, updateData);
  }

  async delete(userId, userRole, id) {
    const recording = await recordingRepository.findById(id);

    if (!recording) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
    }

    await recordingRepository.delete(id);

    return { deleted: true };
  }

  async getBatchRecordings(userId, userRole, batchId) {
    return await recordingRepository.findByBatch(batchId);
  }

  async getById(userId, userRole, id) {
    const recording = await recordingRepository.findById(id);

    if (!recording) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Recording not found");
    }

    return recording;
  }

  async getStudentRecordings(userId) {
    return await recordingRepository.findAll();
  }

  async getAll() {
    return await recordingRepository.findAll();
  }
}

export default new RecordingService();
